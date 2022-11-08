import {
    Card,
    Avatar,
    Text,
    Progress,
    Badge,
    Group,
    Title,
    Button,
    TextInput,
} from "@mantine/core";
import { IconBrandFramer } from "@tabler/icons";
import { Navigate, useNavigate } from "react-router-dom";
import moment from "moment";
import { DatePicker } from "@mantine/dates";
import { useState } from "react";
import { closeModal, openModal } from "@mantine/modals";
import { Error, useFetch } from "../utils";
import { showNotification } from "@mantine/notifications";

const avatars = [
    "https://avatars.githubusercontent.com/u/10353856?s=460&u=88394dfd67727327c1f7670a1764dc38a8a24831&v=4",
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80",
    "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=255&q=80",
];

function TaskCard({ data }: { data: TaskGroup }) {
    const navigate = useNavigate();

    return (
        <Card
            withBorder
            radius="md"
            style={{ cursor: "pointer", width: 360 }}
            m={10}
            onClick={() => {
                navigate(`/task/${data.id}`);
            }}
        >
            <Group position="apart">
                <IconBrandFramer type="mark" size={28} />
                <Badge>
                    {moment(data.completionDate / 1000, "X").fromNow()}
                </Badge>
            </Group>

            <Text size="lg" weight={500} mt="md">
                {data.name}
            </Text>
            <Text size="sm" color="dimmed" mt={5}>
                {data.description}
            </Text>

            <Text color="dimmed" size="sm" mt="md">
                Tasks completed:{" "}
                <Text
                    span
                    weight={500}
                    sx={(theme) => ({
                        color:
                            theme.colorScheme === "dark"
                                ? theme.white
                                : theme.black,
                    })}
                >
                    {data.tasks.filter((el) => el.completed).length}/
                    {data.tasks.length}
                </Text>
            </Text>

            <Progress
                value={
                    (data.tasks.filter((el) => el.completed).length /
                        data.tasks.length) *
                    100
                }
                mt={5}
            />
        </Card>
    );
}

function TaskCreator({ addTask }: { addTask: (task: TaskGroup) => void }) {
    const [date, setDate] = useState(new Date());
    const [name, setName] = useState("New Task");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    return (
        <>
            {error && <Error title="Error!" text={error} />}
            <DatePicker
                disabled={saving}
                placeholder="Pick Date"
                label="Finish Date"
                minDate={new Date()}
                value={date}
                onChange={setDate as any}
            />
            <TextInput
                disabled={saving}
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="New Task"
            />
            <TextInput
                disabled={saving}
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
            />
            <Button
                loading={saving}
                disabled={saving}
                loaderProps={{ variant : "dots" }}
                onClick={() => {
                    if (!name) return setError("Name is not set");
                    if (!description) return setError("Description is not set");
                    setSaving(true);
                    fetch("/api/task/:id", {
                        method: "put",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            completionDate: date.getTime(),
                            description,
                            name,
                        }),
                    })
                        .then((r) => {
                            if (!r.ok) throw "a";
                            r.json()
                                .then((json) => addTask(json.task))
                                .catch(() => {});
                            showNotification({
                                message: "Task '" + name + "' created!",
                                title: "Task created",
                                color: "teal",
                            });
                        })
                        .catch(() => {
                            closeModal("modalEditTask");
                            showNotification({
                                message: "Task '" + name + "' wasn't created",
                                title: "Task couldn't be created",
                                color: "red",
                            });
                        });
                }}
            >
                Submit
            </Button>
        </>
    );
}

export default function Tasks() {
    function openCreateModal() {
        function addTask(task: TaskGroup) {
            setTasks((tasks) =>
                typeof tasks === "object" ? [...tasks, task] : tasks
            );
            closeModal("modalEditTask");
        }

        openModal({
            title: "Create new Project",
            modalId: "modalEditTask",
            children: <TaskCreator addTask={addTask} />,
        });
    }

    const [tasks, setTasks] = useFetch<Array<TaskGroup>>(
        `${window.location.origin}/api/tasks`
    );

    return (
        <>
            <Title ml={10}>Projects</Title>
            <Button mb={20} ml={10} color="green" onClick={openCreateModal}>
                Create a new Project
            </Button>
            {tasks === "error" && (
                <Error title="Error!" text="Couldn't load the tasks :<" />
            )}
            {tasks === "loading" && <Text weight={500}>Loading...</Text>}
            <div
                style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    justifyContent: "flex-start",
                }}
            >
                {typeof tasks === "object" &&
                    tasks.map((el, i) => <TaskCard data={el} key={i} />)}
            </div>
        </>
    );
}

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
