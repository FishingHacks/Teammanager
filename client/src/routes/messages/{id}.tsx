import {
    Card,
    Text,
    Navbar,
    ScrollArea,
    Space,
    Title,
    Group,
    Avatar,
    ActionIcon,
    Textarea,
    Skeleton,
} from "@mantine/core";
import { IconSend } from "@tabler/icons";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { array, useFetch, User, Error, getUser } from "../../utils";

export default function Messages() {
    const [user] = useFetch<User>(
        `${window.location.origin}/api/user/${array.end(
            window.location.pathname.split("/")
        )}`
    );

    const [messages, setMessages] = useFetch<Array<Message>>(
        `${window.location.origin}/api/user/${array.end(
            window.location.pathname.split("/")
        )}/messages`
    );
    let lastFromYou = false;
    const [message, setMessage] = useState("");
    if (messages === "error")
        return <Navigate to="/messages" state={{ from: location.pathname }} />;
    if (user === "error")
        return <Navigate to="/messages" state={{ from: location.pathname }} />;

    if (array.end(window.location.pathname.split("/")) === getUser()?.id)
        return <Navigate to="/messages" />;

    const uid = getUser()?.id;
    const username = getUser()?.username || "You"

    return (
        <>
            <Navbar style={{ height: "calc(100vh - 10px)" }}>
                <Navbar.Section>
                    <Space mt={10} />
                </Navbar.Section>
                <Navbar.Section grow component={ScrollArea}>
                    {messages === "loading" && (
                        <Skeleton height="calc(100vh - 60px)" animate />
                    )}
                    {typeof messages === "object" &&
                        messages.map((el, i) => {
                            const r = (
                                <Group
                                    position={
                                        el.sender === uid ? "right" : "left"
                                    }
                                    key={i}
                                >
                                    <Card
                                        p={5}
                                        m={10}
                                        mt={
                                            lastFromYou === (el.sender === uid)
                                                ? 0
                                                : 15
                                        }
                                        style={{
                                            maxWidth: "70vw",
                                            width: "fit-content",
                                        }}
                                    >
                                        <Group
                                            position={
                                                el.sender === uid
                                                    ? "right"
                                                    : "left"
                                            }
                                        >
                                            <Title
                                                order={6}
                                                color={
                                                    el.sender === uid
                                                        ? "blue"
                                                        : "green"
                                                }
                                            >
                                                {el.sender === uid
                                                    ? username
                                                    : typeof user === "object"
                                                    ? user.username
                                                    : "undefined"}
                                            </Title>
                                        </Group>
                                        <Text>
                                            {el.text
                                                .split("\n")
                                                .map((el, i, arr) =>
                                                    el.startsWith("> ") ? (
                                                        <div
                                                            key={"a" + i}
                                                            style={{
                                                                borderLeft:
                                                                    "4px solid var(--mantine-color-gray-6)",
                                                                paddingLeft: 3,
                                                                color: "var(--mantine-color-gray-6)",
                                                            }}
                                                        >
                                                            {el.substring(2)}
                                                        </div>
                                                    ) : (
                                                        <div key={"a" + i}>
                                                            {el}
                                                            {arr.length - 1 <
                                                                2 && (
                                                                <br
                                                                    key={
                                                                        "a" + i
                                                                    }
                                                                />
                                                            )}
                                                        </div>
                                                    )
                                                )}
                                        </Text>
                                    </Card>
                                </Group>
                            );
                            lastFromYou = el.sender === uid;
                            return r;
                        })}
                </Navbar.Section>
                <Navbar.Section>
                    {(messages === "loading" || user === "loading") && (
                        <Skeleton height={50} animate />
                    )}
                    {typeof messages === "object" && typeof user === "object" && (
                        <Group mt={10}>
                            <Avatar src={null} radius="xl" alt={user.username}>
                                {user.username
                                    .split(" ")
                                    .map((el) => el[0])
                                    .join("")}
                            </Avatar>

                            <div style={{ flex: 1 }}>
                                <Text size="sm" weight={500}>
                                    {user.username}
                                </Text>

                                <Text color="dimmed" size="xs">
                                    {user.email}
                                </Text>
                            </div>
                            <Textarea
                                radius="lg"
                                autosize
                                style={{ width: "80%" }}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        if (
                                            message
                                                .replace(/\n+/g, "\n")
                                                .replace(/(^ +)|( +$)/g, "") !==
                                            ""
                                        ) {
                                            setMessages([
                                                {
                                                    sender: uid || "0",
                                                    text: message
                                                        .replace(/\n+/g, "\n")
                                                        .replace(
                                                            /(^ +)|( +$)/g,
                                                            ""
                                                        ),
                                                },
                                                ...messages,
                                            ]);
                                            setMessage("");
                                            fetch(
                                                `${
                                                    window.location.origin
                                                }/api/user/${array.end(
                                                    window.location.pathname.split(
                                                        "/"
                                                    )
                                                )}/messages/create`,
                                                {
                                                    body: JSON.stringify({
                                                        message: {
                                                            fromUs: true,
                                                            sender: "You",
                                                            text: message
                                                                .replace(
                                                                    /\n+/g,
                                                                    "\n"
                                                                )
                                                                .replace(
                                                                    /(^ +)|( +$)/g,
                                                                    ""
                                                                ),
                                                        },
                                                    }),
                                                    headers: {
                                                        "Content-Type":
                                                            "application/json",
                                                    },
                                                    method: "post",
                                                }
                                            );
                                        }
                                    }
                                }}
                                value={message}
                                rightSection={
                                    <ActionIcon radius="xl" p={4} size="lg">
                                        <IconSend />
                                    </ActionIcon>
                                }
                            />
                        </Group>
                    )}
                </Navbar.Section>
            </Navbar>
        </>
    );
}

interface Message {
    text: string;
    sender: string;
}
