import {
    Anchor,
    Button,
    Card,
    Divider,
    Group,
    Image,
    List,
    ScrollArea,
    Table,
    Text,
    Textarea,
    TextInput,
    Title,
} from "@mantine/core";
import { array, getUser, useFetch } from "../../utils";
import Markdown from "marked-react";
import { Prism } from "@mantine/prism";
import { lazy, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function IssueView() {
    const [issue, setIssue] = useFetch<Issue>(
        "/api/issue/" + array.end(window.location.pathname.split("/"))
    );
    const [issues] = useFetch<{ id: string }[]>("/api/issues");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    return (
        <>
            {typeof issue === "object" && typeof issues === "object" && (
                <Card withBorder style={{ maxWidth: "70vw" }}>
                    <ScrollArea style={{ width: "67vw", height: "60vh" }}>
                        <Title order={2}>
                            #{issue.id} - {issue.name}
                        </Title>
                        <Text italic color="dimmed">
                            {issue.description}
                        </Text>
                        <Divider />
                        {issue.comments
                            .sort((a, b) => b.date - a.date)
                            .map((el) => (
                                <Card key={el.date} withBorder m={10}>
                                    <Title
                                        order={6}
                                        color="blue"
                                        mt={-10}
                                        ml={-10}
                                    >
                                        {el.author}
                                    </Title>
                                    <Text italic weight={10} color="dimmed">
                                        {new Date(el.date).toLocaleString()}
                                    </Text>
                                    {renderMarkdown(
                                        el.message,
                                        issues.map((el) => el.id)
                                    )}
                                </Card>
                            ))}
                    </ScrollArea>
                    <Textarea
                        disabled={loading}
                        autosize
                        mt={7}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                setIssue({
                                    ...issue,
                                    comments: [
                                        ...issue.comments,
                                        {
                                            author:
                                                getUser()?.username ||
                                                "Unknown",
                                            date: Date.now(),
                                            message,
                                        },
                                    ],
                                });
                                fetch("/api/issue/" + issue.id + "/comments", {
                                    method: "put",
                                    headers: {
                                        "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({ message }),
                                })
                                    .then(() => {})
                                    .catch(() => {});
                                setMessage("");
                            }
                        }}
                    />
                    <Button color="red" mt={10} loading={loading} loaderProps={{variant:"dots"}} onClick={() => {
                        setLoading(true);
                        fetch("/api/issue/" + issue.id, { method: "delete" }).then(()=>navigate("/issues"));
                    }}>
                        Delete Issue
                    </Button>
                </Card>
            )}
        </>
    );
}

function renderMarkdown(body: string, issues: string[]) {
    try {
        issues.forEach((id) => {
            body = body.replaceAll("#" + id, `[#${id}](/issues/${id})`);
        });

        body = body.replaceAll(
            /((https?:\/\/)[^.\n \/]+(\.[^.\n \/]+)+(\/[^\/ ]*)*)/g,
            "[$1]($1)"
        );

        return (
            <Markdown
                renderer={{
                    code(code, lang) {
                        return (
                            <Prism language={lang as any}>{code as any}</Prism>
                        );
                    },
                    codespan(code, lang?) {
                        return (
                            <Prism language={(lang || "") as any}>
                                {code as any}
                            </Prism>
                        );
                    },
                    heading(children, level) {
                        return <Title order={level}>{children}</Title>;
                    },
                    link(href, text) {
                        return <Anchor href={href}>{text}</Anchor>;
                    },
                    hr: () => <Divider />,
                    image(src, alt, title) {
                        return <Image src={src} title={title} alt={alt} />;
                    },
                    list(children, ordered) {
                        return (
                            <List type={ordered ? "ordered" : "unordered"}>
                                {children}
                            </List>
                        );
                    },
                    listItem(children) {
                        return <List.Item>{children}</List.Item>;
                    },
                    table(children) {
                        return <Table>{children}</Table>;
                    },
                    text(text) {
                        return <Text>{text}</Text>;
                    },
                }}
            >
                {body}
            </Markdown>
        );
    } catch (e: any) {
        console.error(e);
        return (
            <Text>Error whilst trying to render the issues {e.toString()}</Text>
        );
    }
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
