// GOTO: index.ts:261:1 for debugging
import express, { NextFunction, Request, Response } from "express";
import path from "path";
import chalk from "chalk";
import { sign, verify } from "jsonwebtoken";
import cookieparser from "cookie-parser";
import bodyparser from "body-parser";
import { config } from "dotenv";
import { Octokit } from "octokit";
import Enmap from "enmap";

config();
const octokit = new Octokit({ auth: process.env.GH_TOKEN || undefined });

const app = express();

const { ADMIN_EMAIL: email, ADMIN_PASSWORD: pass } = process.env;

app.use(bodyparser.json());
app.use(cookieparser());
app.use(express.static(path.join(__dirname, "..", "client", "build")));
app.use(express.static("public"));

const PATH_PUBLIC = ["/api/login"];

app.use("/api", (req, res, next) => {
    if (PATH_PUBLIC.includes("/api" + req.path)) return next();

    apiNeedsLogin(req, res, next);
});

app.post("/api/login", (req, res) => {
    if (!req.body.email || !req.body.password)
        return res.status(400).json({ error: true });
    if (req.body.email !== email || req.body.password !== pass)
        return res.status(401).json({ error: true });
    const user = users.find((el) => el.id === fishi.id);
    if (!user) return res.status(500).json({ error: true });
    const jwt = sign(
        user,
        process.env.SECRET ||
            'W0MuEaua:m9JbY}9pX!s?orO4PcsBxr"o^V?S1Dl`re{`.VIpO',
        { expiresIn: "1h", algorithm: "HS256" }
    );
    res.cookie("user", jwt, { maxAge: 60000000 /* 1h */ })
        .status(200)
        .json({ error: false });
});

app.get("/api/users", (req, res) => {
    return res.json(users.array());
});

app.get("/api/user/:id", (req, res) => {
    const user = users.find((el) => el.id === req.params.id);
    if (!user) return res.status(404).json({ error: true });
    return res.status(200).json(user);
});

app.get("/api/user/:id/messages", (req, res) => {
    const _messages = userMessages.get(req.params.id);
    if (!_messages) return res.status(404).json({ error: true });
    return res.status(200).json(_messages);
});

app.post("/api/user/:id/messages/create", (req, res) => {
    const message: Message | null = req.body.message;
    if (
        !message ||
        typeof message.fromUs !== "boolean" ||
        !message.sender ||
        !message.text
    )
        return res.status(400).json({ error: true });

    userMessages.set(req.params.id, [
        message,
        ...(userMessages.get(req.params.id) || []),
    ]);
    res.json({ error: false });
});

app.post(
    "/api/user/:id/update",

    needsToBeRole("admin"),
    (req, res) => {
        const body = req.body;
        if (
            body.bio &&
            body.email &&
            body.role &&
            body.status &&
            body.username
        ) {
            if ((req as any).jwt?.role !== "admin") {
                if (body.role !== (req as any).jwt?.role) {
                    return res.status(403).json({ error: true });
                }
            }
            const _u: User = {
                bio: body.bio,
                email: body.email,
                id: req.params.id,
                role: body.role,
                status: body.status,
                username: body.username,
            };
            users.set(req.params.id, _u);
            return res.status(200).json({ error: false });
        }
        res.status(400).json({ error: true });
    }
);

app.delete(
    "/api/user/:id",

    needsToBeRole("admin"),
    (req, res) => {
        app.delete(req.params.id);
        return res.status(200).json({ error: false });
    }
);

app.get("/api/refreshtoken", (req, res) => {
    const id: string = (req as any).jwt?.id;
    if (!id || typeof id !== "string") return res.send("");
    const user = users.find((el) => el.id === id);
    if (!user) return res.send("");
    const _user = (req as any)._jwt;
    if (deepcompare(user, _user)) return res.status(200).send("");
    const jwt = sign(
        user,
        process.env.SECRET ||
            'W0MuEaua:m9JbY}9pX!s?orO4PcsBxr"o^V?S1Dl`re{`.VIpO',
        { expiresIn: "1h", algorithm: "HS256" }
    );
    return res.cookie("user", jwt, { maxAge: 60000000 }).send("");
});

app.get("/api/tasks", (req, res) => {
    return res.status(200).json(tasks);
});

app.get("/api/task/:id", (req, res) => {
    const task = tasks.find((t) => t.id.toString() === req.params.id);
    if (!task) return res.status(200).json({ error: true });
    res.status(200).json(task);
});

app.put("/api/task/:id", (req, res) => {
    if (
        req.body.name &&
        req.body.description &&
        req.body.completionDate &&
        typeof req.body.name === "string" &&
        typeof req.body.description === "string" &&
        typeof req.body.completionDate === "number"
    ) {
        let taskArray = tasks.array();
        const _id =
            taskArray.reduce(
                (a, b) => (a > b.id ? a : b.id),
                taskArray[0].id || 0
            ) + 1;
        const _task: TaskGroup = {
            completionDate: req.body.completionDate,
            description: req.body.description,
            id: _id,
            name: req.body.name,
            tasks: [],
        };
        tasks.set(_task.id.toString(), _task);
        res.json({ error: false, task: _task });
    }
    res.status(400).json({ error: true });
});

app.delete("/api/task/:id", (req, res) => {
    tasks = tasks.filter((el) => el.id.toString() !== req.params.id);
    return res.send("");
});

app.post("/api/task/:id", (req, res) => {
    const _task = tasks.get(req.params.id);
    if (!_task) return res.status(404).json({ error: true });
    tasks.set(
        req.params.id,
        Object.assign(_task, req.body, { id: req.params.id })
    );
    return res.status(200).json({ error: false });
});

app.get("/api/issues", (req, res) => {
    const issueList: { comments: number; name: string; id: number }[] = issues
        .array()
        .map((el) => ({
            comments: el.comments.length,
            id: el.id,
            name: el.name,
        }));
    return res.json(issueList);
});

app.get("/api/issue/:id", (req, res) => {
    const issue = issues.get(req.params.id);
    if (!issue) return res.status(404).json({ error: true });
    return res.status(200).json(issue);
});

app.put("/api/issue/:id/comments", async (req, res) => {
    if (!req.body.message || typeof req.body.message !== "string")
        return res.status(400).json({ error: true });
    if (/[^ \n\r\t]/g.exec(req.body.message) === null)
        return res.status(400).json({ error: true });
    const comment = {
        author: (req as any).jwt?.username || "Unknown",
        date: Date.now(),
        message: req.body.message,
    };

    const issue = issues.get(req.params.id);
    if (!!issue)
        issues.set(req.params.id, {
            ...issue,
            comments: [comment, ...issue.comments],
        });
    return res.status(200).json({ error: false });
});

app.delete("/api/issue/:id", async (req, res) => {
	issues.delete(req.params.id);
    res.json({error:false});
});

app.put("/api/issue/:id", (req, res) => {
    if (issues.has(req.params.id))
        return res.status(409).json({ error: true });
    const id = Number(req.params.id);
	if (
        isNaN(id) ||
        !isFinite(id) ||
        Math.floor(id) !== id ||
        !req.body.name ||
        typeof req.body.name !== "string" ||
        (req.body.description && typeof req.body.description !== "string")
    )
        return res.status(400).json({ error: true });
    const issue: Issue = {
        comments: [],
        id,
        description: req.body.description || "No description Provided",
        name: req.body.name,
    };

    issues.set(req.params.id, issue);
    return res.status(200).json({ issue });
});

// uncomment for debugging

// app.get(
//     "/api/eval/:command",
//     apiNeedsLogin,
//     needsToBeRole("admin", false),
//     async (req, res) => {
//         try {
// 			const result = await eval(req.params.command);
// 			console.log(result);
// 			return res.send((await import("util")).inspect(result))
//         } catch (e: any) {
//             res.send(e);
//         }
//     }
// );

app.get("/api/data", apiNeedsLogin, (req, res) => {
    res.status(200).json(accessData.get("data") || []);
});

app.put("/api/data/:title", apiNeedsLogin, (req, res) => {
    console.log(req.body);
    if (
        !req.body.data ||
        !req.body.description ||
        !req.body.filePath ||
        !req.body.language ||
        typeof req.body.data !== "string" ||
        typeof req.body.description !== "string" ||
        typeof req.body.filePath !== "string" ||
        typeof req.body.language !== "string"
    )
        return res.status(400).json({ error: true });
    const data: AccessData = {
        data: req.body.data,
        description: req.body.description,
        filePath: req.body.filePath,
        language: req.body.language,
        title: req.params.title,
    };
    accessData.set("data", [data, ...(accessData.get("data") || [])]);
    res.status(200).json({ error: false });
});

app.post("/api/data/:title", apiNeedsLogin, (req, res) => {
    let data = accessData.get("data");
    if (!data) return res.status(404).json({ error: true });
    data = data.map((el) =>
        el.title === req.params.title ? Object.assign(el, req.body) : el
    );
    accessData.set("data", data);

    res.status(200).json({ error: false });
});

app.delete("/api/data/:title", apiNeedsLogin, (req, res) => {
    accessData.set(
        "data",
        (accessData.get("data") || []).filter(
            (el) => el.title !== req.params.title
        )
    );
    return res.status(200).json({ error: false });
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

app.listen(3000, () => {
    console.log(chalk.green(`[SERVER]: Listening on port 3000`));
});

function needsToBeRole(role: UserRole, allowSelf: boolean = true) {
    return (req: Request, res: Response, next: NextFunction) => {
        const _role = users.find((el) => el.id === (req as any).jwt?.id)?.role;
        if (_role === role) return next();
        else if (
            req.params.id &&
            (req as any).jwt?.id === req.params.id &&
            allowSelf
        )
            return next();
        else return res.status(403).json({ error: true });
    };
}

function needsLogin(req: Request, res: Response, next: NextFunction) {
    try {
        const _u: any = verify(
            req.cookies.user || "",
            process.env.SECRET ||
                'W0MuEaua:m9JbY}9pX!s?orO4PcsBxr"o^V?S1Dl`re{`.VIpO'
        );
        if (!_u?.id) return res.status(401).json({ error: true });
        const _user = users.find((el) => el.id === _u?.id);
        if (!_user) return res.status(401).json({ error: true });
        (req as any).jwt = _user;
        (res as any).jwt = _user;
        (req as any)._jwt = _u;
        (res as any)._jwt = _u;
        next();
    } catch {
        return res.status(401).redirect("/");
    }
}

function apiNeedsLogin(req: Request, res: Response, next: NextFunction) {
    try {
        const _u: any = verify(
            req.cookies.user || "",
            process.env.SECRET ||
                'W0MuEaua:m9JbY}9pX!s?orO4PcsBxr"o^V?S1Dl`re{`.VIpO'
        );
        if (!_u?.id) return res.status(401).json({ error: true });
        const _user = users.find((el) => el.id === _u?.id);
        if (!_user) return res.status(401).json({ error: true });
        (req as any).jwt = _user;
        (res as any).jwt = _user;
        (req as any)._jwt = _u;
        (res as any)._jwt = _u;
        next();
    } catch (e) {
        return res.status(401).json({
            error: true,
        });
    }
}

function deepcompare(a: any, b: any): boolean {
    if (a === undefined || a === null || b === undefined || b === null)
        return false;
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    let same = true;
    for (const k of keys) {
        if (typeof a[k] === typeof b[k]) {
            if (typeof a[k] === "object") {
                if (!deepcompare(a[k], b[k])) same = false;
            } else if (a[k] !== b[k]) same = false;
        } else same = false;
    }
    return same;
}

let issues: Enmap<string, Issue> = new Enmap({ name: "Issues" });

const fishi: User = {
    username: "Fishi",
    role: "admin",
    bio: "No bio set",
    email: "fishinghacks@proton.me",
    status: "active",
    id: "129839s8dasd09asda90sdsadas",
};

let users: Enmap<string, User> = new Enmap({ name: "users" });

if (!users.has(fishi.id)) users.set(fishi.id, fishi);

const task1: TaskGroup = {
    name: "Eytron v3",
    completionDate: 1668639600000,
    description: "Complete Version 3 of eytron",
    id: 1,
    tasks: [
        {
            assignedUsers: ["KeksDev"],
            completed: false,
            description: "Create the eytron website",
            importance: 1,
            name: "Website",
            links: ["https://dev.eytron.ga", "https://github.com/Eytron/Web"],
        },
        {
            assignedUsers: ["KeksDev"],
            completed: true,
            description:
                "The halloween playlist for the Eytron Halloween update",
            importance: 0,
            links: ["https://github.com/Eytron/Eytron"],
            name: "Halloween Playlist",
        },
        {
            assignedUsers: ["KeksDev"],
            completed: true,
            description: "The update for Halloween 2022",
            importance: 0,
            links: ["https://github.com/Eytron/Eytron"],
            name: "Halloween Update 2022",
        },
        {
            assignedUsers: ["KeksDev"],
            completed: true,
            description:
                'The "new" Warn System is the old Warn System + weighing of warns. Example: A warn with a weight of 1, contributes 1 point to the warns, while a warn with a weight of 10 contributes 10 warns. This is supposed to fix the problem, that writing in the wrong chat is as wrong as using swear Words.',
            importance: 2,
            links: ["https://github.com/Eytron/Eytron"],
            name: "Warn System overhaul",
        },
    ],
};

let tasks: Enmap<string, TaskGroup> = new Enmap({ name: "tasks" });
if (!tasks.has(task1.id.toString())) tasks.set(task1.id.toString(), task1);

const userMessages: Enmap<string, Message[]> = new Enmap({
    name: "userMessages",
});
for (const u of users.keys()) {
    if (!userMessages.get(u)) userMessages.set(u, []);
}

let accessData: Enmap<string, AccessData[]> = new Enmap({ name: "accessdata" });

interface Message {
    text: string;
    fromUs: boolean;
    sender: string;
}

interface Issue {
    comments: IssueComment[];
    name: string;
    id: number;
    description: string;
}

interface IssueComment {
    author: string;
    message: string;
    date: number;
}

interface User {
    username: string;
    role: UserRole;
    bio: string;
    email: string;
    status: "active" | "disabled"; // when called in getUser, it is active, because a disabled user should under no circumstances be logged in
    id: string;
}

type UserRole =
    | "admin"
    | "collaborator"
    | "tester"
    | "programmer"
    | "supporter"
    | "moderator"
    | "user";

interface TaskGroup {
    name: string;
    completionDate: number;
    description: string;
    tasks: Array<Task>;
    id: number;
}

interface Task {
    completed: boolean;
    importance: number;
    name: string;
    description: string;
    links: Array<string>;
    assignedUsers: Array<string>;
}

interface AccessData {
    description: string;
    data: string;
    title: string;
    filePath: string;
    language: string;
}
