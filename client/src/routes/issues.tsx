import {
    Anchor,
    Button,
    Card,
    Group,
    ScrollArea,
    Text,
    Textarea,
    TextInput,
    Title,
} from "@mantine/core";
import { closeModal, openModal } from "@mantine/modals";
import { useState } from "react";
import { useFetch } from "../utils";

export default function Issues() {
    const [issues, setIssues] =
        useFetch<{ comments: number; name: string; id: number }[]>(
            "/api/issues"
        );

    return (
        <>
            <Card style={{ width: "50vw" }} mt={"10vh"} ml={"25vw"}>
                <Group>
                    <Title order={3}>Issues</Title>
                    <Button
                        color="green"
                        size="xs"
                        mt={5}
                        onClick={() => {
                            if (typeof issues !== "object") return;
                            createIssueModal(
                                (issue) =>
                                    setIssues((i) =>
                                        typeof i === "object"
                                            ? [issue, ...i]
                                            : i
                                    ),
                                issues.reduce(
                                    (a, b) => (a > b.id ? a : b.id),
                                    issues[0]?.id
                                ) + 1
                            );
                        }}
                    >
                        New issue
                    </Button>
                </Group>
                <ScrollArea style={{ width: "45vw", maxHeight: "70vh" }}>
                    {typeof issues === "object" &&
                        issues.map((issue) => (
                            <Card mb={10} key={issue.id}>
                                <Text weight={500}>
                                    <Anchor
                                        href={"/issues/" + issue.id}
                                        style={{ color: "white" }}
                                    >
                                        Issue #{issue.id} - {issue.name} (
                                        {issue.comments} Comment
                                        {issue.comments === 1 ? "" : "s"})
                                    </Anchor>
                                </Text>
                            </Card>
                        ))}
                </ScrollArea>
            </Card>
        </>
    );
}

function createIssueModal(
    addissue: (issue: { comments: number; name: string; id: number }) => void,
    id: number
) {
    if (isNaN(id) || !isFinite(id)) id = 1;
    id = Math.floor(id);
    openModal({
        modalId: "issuesCreateIssue",
        title: <Text weight={500}>Create a new Issue</Text>,
        children: <CreateIssueModalComponent id={id} addissue={addissue} />,
    });
}

function CreateIssueModalComponent({
    addissue,
    id,
}: {
    addissue: (issue: { comments: number; name: string; id: number }) => void;
    id: number;
}) {
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    return (
        <>
            <TextInput
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={saving}
                mb={10}
            />
            <Textarea
                label="Description"
                autosize
                maxRows={10}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={saving}
                mb={10}
            />
            <Button
                mb={10}
                loading={saving}
                loaderProps={{ variant: "dots" }}
                onClick={() => {
                    if (!title) return;
                    setSaving(true);
                    fetch("/api/issue/" + id, {
                        method: "put",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            name: title,
                            ...(description ? { description } : {}),
                        }),
                    })
                        .then(() => {
                            addissue({ comments: 0, id, name: title });
                            closeModal("issuesCreateIssue");
                        })
                        .catch(() => {
                            setSaving(false);
                        });
                }}
            >
                Save
            </Button>
        </>
    );
}
