import express, { NextFunction, Request, Response } from "express";
import path from "path";
import chalk from "chalk";
import { sign, verify } from "jsonwebtoken";
import cookieparser from "cookie-parser";
import bodyparser from "body-parser";
import { config } from "dotenv";
import { Octokit } from "octokit";

config();
const octokit = new Octokit({ auth: process.env.GH_TOKEN || undefined });

const app = express();

app.use(bodyparser.json());
app.use(cookieparser());
app.use(express.static(path.join(__dirname, "..", "client", "build")));
app.use(express.static("public"));

app.post("/api/login", (req, res) => {
    if (!req.body.email || !req.body.password)
        return res.status(400).json({ error: true });
    if (
        req.body.email !== "fishinghacks@proton.me" ||
        req.body.password !== "test"
    )
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

app.get("/api/users", apiNeedsLogin, (req, res) => {
    return res.json(users);
});

app.get("/api/user/:id", apiNeedsLogin, (req, res) => {
    const user = users.find((el) => el.id === req.params.id);
    if (!user) return res.status(404).json({ error: true });
    return res.status(200).json(user);
});

app.get("/api/user/:id/messages", apiNeedsLogin, (req, res) => {
    const _messages: Message[] = userMessages[req.params.id];
    if (!_messages) return res.status(404).json({ error: true });
    return res.status(200).json(_messages);
});

app.post("/api/user/:id/messages/create", apiNeedsLogin, (req, res) => {
    const message: Message | null = req.body.message;
    if (
        !message ||
        typeof message.fromUs !== "boolean" ||
        !message.sender ||
        !message.text
    )
        return res.status(400).json({ error: true });

    userMessages[req.params.id] = [message, ...userMessages[req.params.id]];
    res.json({ error: false });
});

app.post(
    "/api/user/:id/update",
    apiNeedsLogin,
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
            users = [...users.filter((el) => el.id !== req.params.id), _u];
            return res.status(200).json({ error: false });
        }
        res.status(400).json({ error: true });
    }
);

app.delete(
    "/api/user/:id",
    apiNeedsLogin,
    needsToBeRole("admin"),
    (req, res) => {
        users = [...users.filter((el) => el.id !== req.params.id)];
        return res.status(200).json({ error: false });
    }
);

app.get("/api/refreshtoken", apiNeedsLogin, (req, res) => {
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

app.get("/api/tasks", apiNeedsLogin, (req, res) => {
    return res.status(200).json(tasks);
});

app.get("/api/task/:id", apiNeedsLogin, (req, res) => {
    const task = tasks.find((t) => t.id.toString() === req.params.id);
    if (!task) return res.status(200).json({ error: true });
    res.status(200).json(task);
});

app.put("/api/task/:id", apiNeedsLogin, (req, res) => {
    if (
        req.body.name &&
        req.body.description &&
        req.body.completionDate &&
        typeof req.body.name === "string" &&
        typeof req.body.description === "string" &&
        typeof req.body.completionDate === "number"
    ) {
        const _id =
            tasks.reduce((a, b) => (a > b.id ? a : b.id), tasks[0].id) + 1;
        const _task: TaskGroup = {
            completionDate: req.body.completionDate,
            description: req.body.description,
            id: _id,
            name: req.body.name,
            tasks: [],
        };
        tasks.push(_task);
        res.json({ error: false, task: _task });
    }
    res.status(400).json({ error: true });
});

app.delete("/api/task/:id", apiNeedsLogin, (req, res) => {
    tasks = tasks.filter((el) => el.id.toString() !== req.params.id);
    return res.send("");
});

app.post("/api/task/:id", apiNeedsLogin, (req, res) => {
    tasks = tasks.map((el) =>
        el.id.toString() === req.params.id
            ? Object.assign(el, req.body, { id: req.params.id })
            : el
    );
    return res.status(200).json({ error: false });
});

app.post("/api/user/me/update", apiNeedsLogin, (req, res) => {
    if (!(req as any).jwt?.id) return res.status(401).json({ error: true });
    const id: string = (req as any).jwt?.id;
    if (!id || typeof id !== "string")
        return res.status(401).json({ error: true });

    users = users.map((el) =>
        el.id === id
            ? { ...el, username: req.body.username || el.username }
            : el
    );
    const newUser = users.find((el) => el.id === id);
    if (!newUser) return res.status(500).json({ error: true });
    const jwt = sign(
        newUser,
        process.env.SECRET ||
            'W0MuEaua:m9JbY}9pX!s?orO4PcsBxr"o^V?S1Dl`re{`.VIpO',
        { expiresIn: "1h", algorithm: "HS256" }
    );
    return res
        .cookie("user", jwt, { maxAge: 60000000 /* 1h */ })
        .status(200)
        .json({ error: false });
});

app.get("/api/issues", apiNeedsLogin, (req, res) => {
    const issueList: { comments: number; name: string; id: number }[] =
        issues.map((el) => ({
            comments: el.comments.length,
            id: el.id,
            name: el.name,
        }));
    return res.json(issueList);
});

app.get("/api/issue/:id", apiNeedsLogin, (req, res) => {
    const issue = issues.find((el) => el.id.toString() === req.params.id);
    if (!issue) return res.status(404).json({ error: true });
    return res.status(200).json(issue);
});

app.put("/api/issue/:id/comments", apiNeedsLogin, async (req, res) => {
    if (!req.body.message || typeof req.body.message !== "string")
        return res.status(400).json({ error: true });
    if (/[^ \n\r\t]/g.exec(req.body.message) === null)
        return res.status(400).json({ error: true });
    issues = issues.map((el) => ({
        ...el,
        comments: [
            ...el.comments,
            {
                author: (req as any).jwt?.username || "Unknown",
                date: Date.now(),
                message: req.body.message,
            },
        ],
    }));
    return res.status(200).json({ error: false });
});

app.delete("/api/issue/:id", apiNeedsLogin, async (req, res) => {
    const issue = issues.find((el) => el.id.toString() === req.params.id);
    if (!issue) return res.status(404).json({ error: true });
    const closer = (req as any).jwt?.username || "Unknown";
    issues = issues.filter((el) => el.id.toString() !== req.params.id);
    res.send("");
});

app.put("/api/issue/:id", apiNeedsLogin, (req, res) => {
    if (issues.find((el) => el.id.toString() === req.params.id) !== undefined)
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

    issues.push(issue);
    return res.status(200).json({ issue });
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

let issues: Issue[] = [];

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

const fishi: User = {
    username: "Fishi",
    role: "admin",
    bio: "No bio set",
    email: "fishinghacks@proton.me",
    status: "active",
    id: "129839s8dasd09asda90sdsadas",
};

let users: Array<User> = [
    fishi,
    {
        bio: "",
        email: "test@r07.dev",
        role: "admin",
        status: "active",
        username: "Test Alf R",
        id: "1",
    },
    {
        bio: "",
        email: "b@r07.dev",
        role: "admin",
        status: "active",
        username: "Frau B. Telefraniu",
        id: "2",
    },
    {
        bio: "",
        email: "red@r07.dev",
        role: "admin",
        status: "active",
        username: "Roter Support",
        id: "3",
    },
    {
        bio: "",
        email: "redi@r07.dev",
        role: "admin",
        status: "active",
        username: "RedCrafter07",
        id: "4",
    },
    {
        bio: "",
        email: "admin@r07.dev",
        role: "admin",
        status: "active",
        username: "Jonas Albeit",
        id: "5",
    },
];
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

let tasks: Array<TaskGroup> = [task1];

const userMessages: { [name: string]: Message[] } = {};

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