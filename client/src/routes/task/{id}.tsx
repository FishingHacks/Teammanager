import {
    ActionIcon,
    Anchor,
    Badge,
    Box,
    Button,
    Card,
    Checkbox,
    Divider,
    Group,
    Indicator,
    List,
    NumberInput,
    Progress,
    SimpleGrid,
    Text,
    Textarea,
    TextInput,
    Title,
} from "@mantine/core";
import { DatePicker, RangeCalendar } from "@mantine/dates";
import { closeModal, openConfirmModal, openModal } from "@mantine/modals";
import { showNotification, updateNotification } from "@mantine/notifications";
import {
    IconCircleMinus,
    IconSquarePlus,
    IconTrash,
    IconPencil,
} from "@tabler/icons";
import moment from "moment";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { array, Error, useFetch } from "../../utils";

export default function taskView() {
    const [task, setTask] = useFetch<TaskGroup>(
        `${window.location.origin}/api/task/${array.end(
            window.location.pathname.split("/")
        )}`
    );
    if (typeof task === "object") save(task);
    const navigate = useNavigate();

    return (
        <>
            {task === "loading" && <Text weight={500}>Loading...</Text>}
            {task === "error" && (
                <Error
                    title="Error"
                    text="Error whilst trying to load the Task"
                />
            )}
            {typeof task === "object" && (
                <>
                    <Group position="apart">
                        <div>
                            <Title>{task.name}</Title>
                            <Badge ml={10}>
                                {moment(
                                    task.completionDate / 1000,
                                    "X"
                                ).fromNow()}
                            </Badge>
                            <div>
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
                                            width: 150,
                                        })}
                                    >
                                        {
                                            task.tasks.filter(
                                                (el) => el.completed
                                            ).length
                                        }
                                        /{task.tasks.length}
                                    </Text>
                                </Text>

                                <Progress
                                    value={
                                        (task.tasks.filter((el) => el.completed)
                                            .length /
                                            task.tasks.length) *
                                        100
                                    }
                                    mt={5}
                                />
                            </div>
                        </div>
                        <div>
                            <Button
                                color="green"
                                onClick={() => editProject(setTask, task)}
                                mr={10}
                                leftIcon={<IconPencil />}
                            >
                                Edit Project
                            </Button>
                            <Button
                                mr={20}
                                leftIcon={<IconTrash />}
                                color="red"
                                onClick={() => {
                                    navigate("/tasks");
                                    fetch("/api/task/" + task.id, {
                                        method: "delete",
                                    })
                                        .catch(() => {})
                                        .then(() => {});
                                }}
                            >
                                Delete Project
                            </Button>
                        </div>
                    </Group>
                    <Text size="sm" mt="md">
                        {task.description}
                    </Text>
                    <Divider />
                    <SimpleGrid cols={3}>
                        {task.tasks
                            .sort((a, b) => a.importance - b.importance)
                            .sort((a, b) =>
                                a.completed && !b.completed ? 1 : -1
                            )
                            .map((el, i) => {
                                el = task.tasks[i];
                                return (
                                    <Card
                                        withBorder
                                        style={{
                                            width: "calc(33.33vw - 70px)",
                                        }}
                                        m={10}
                                        key={i}
                                    >
                                        <Text weight={700}>
                                            {el.name}{" "}
                                            <Badge
                                                color={
                                                    el.completed
                                                        ? "green"
                                                        : "red"
                                                }
                                                mr={7}
                                            >
                                                {el.completed
                                                    ? "Finished"
                                                    : "Unfinished"}
                                            </Badge>
                                            {getBadgeByWeight(el.importance)}
                                        </Text>
                                        <Text color="dimmed">
                                            {el.description}
                                        </Text>
                                        <Divider />
                                        {el.assignedUsers.length !== 0 && (
                                            <>
                                                <Text weight={500}>User</Text>
                                                <List
                                                    listStyleType="none"
                                                    withPadding
                                                >
                                                    {el.assignedUsers.map(
                                                        (el, i) => (
                                                            <List.Item
                                                                key={"u" + i}
                                                            >
                                                                {el}
                                                            </List.Item>
                                                        )
                                                    )}
                                                </List>
                                            </>
                                        )}
                                        {el.links.length !== 0 && (
                                            <>
                                                <Text weight={500}>Links</Text>
                                                <List
                                                    listStyleType="none"
                                                    withPadding
                                                >
                                                    {el.links.map((link, i) => (
                                                        <List.Item
                                                            key={"l" + i}
                                                        >
                                                            <Anchor<"a">
                                                                href={link}
                                                            >
                                                                {link}
                                                            </Anchor>
                                                        </List.Item>
                                                    ))}
                                                </List>
                                            </>
                                        )}
                                        <div
                                            style={{
                                                height: "calc(20px + 36px)",
                                            }}
                                        />
                                        <div
                                            style={{
                                                display: "flex",
                                                flexWrap: "wrap",

                                                position: "absolute",
                                                bottom: 10,
                                            }}
                                        >
                                            <ActionIcon
                                                color="blue"
                                                onClick={() => {
                                                    const _setTask = (
                                                        task: Task
                                                    ) =>
                                                        setTask((tasks) => {
                                                            if (
                                                                typeof tasks !==
                                                                "object"
                                                            )
                                                                return tasks;
                                                            tasks = {
                                                                ...tasks,
                                                            };
                                                            tasks.tasks[i] =
                                                                task;
                                                            return tasks;
                                                        });
                                                    editModal(el, _setTask);
                                                }}
                                                variant="filled"
                                                size={36}
                                            >
                                                <IconPencil />
                                            </ActionIcon>
                                            <ActionIcon
                                                ml={10}
                                                color="red"
                                                variant="filled"
                                                size={36}
                                                onClick={() => {
                                                    openConfirmModal({
                                                        onConfirm: () =>
                                                            setTask((_task) => {
                                                                if (
                                                                    typeof _task !==
                                                                    "object"
                                                                )
                                                                    return _task;
                                                                _task = {
                                                                    ..._task,
                                                                };
                                                                _task.tasks =
                                                                    _task.tasks.filter(
                                                                        (
                                                                            _,
                                                                            _i
                                                                        ) =>
                                                                            _i !==
                                                                            i
                                                                    );
                                                                return _task;
                                                            }),
                                                        title: "Confirm Delete",
                                                        children: (
                                                            <Text>
                                                                Do you really
                                                                want to delete "
                                                                {el.name}"? This
                                                                action is{" "}
                                                                <span
                                                                    style={{
                                                                        fontStyle:
                                                                            "italic",
                                                                        color: "var(--mantine-color-red-7)",
                                                                        textDecoration:
                                                                            "underline",
                                                                        fontWeight: 500,
                                                                    }}
                                                                >
                                                                    IRREVERSIBLE
                                                                </span>
                                                                .
                                                            </Text>
                                                        ),
                                                        labels: {
                                                            confirm: "Delete",
                                                            cancel: "Cancel",
                                                        },
                                                        confirmProps: {
                                                            color: "red",
                                                        },
                                                    });
                                                }}
                                            >
                                                <IconTrash />
                                            </ActionIcon>
                                            <Button
                                                ml={10}
                                                color={
                                                    el.completed
                                                        ? "red"
                                                        : "green"
                                                }
                                                onClick={() => {
                                                    setTask((_tasks) => {
                                                        if (
                                                            typeof _tasks !==
                                                            "object"
                                                        )
                                                            return _tasks;
                                                        _tasks = { ..._tasks };
                                                        _tasks.tasks[
                                                            i
                                                        ].completed =
                                                            !el.completed;
                                                        return _tasks;
                                                    });
                                                }}
                                            >
                                                {el.completed
                                                    ? "Uncomplete"
                                                    : "Complete"}
                                            </Button>
                                        </div>
                                    </Card>
                                );
                            })}
                    </SimpleGrid>
                    <Button
                        mb={20}
                        onClick={() => {
                            editModal(
                                {
                                    assignedUsers: ["Unknown"],
                                    completed: false,
                                    description: "No description set",
                                    importance: 0,
                                    links: ["https://"],
                                    name: "No name set",
                                },
                                (task) =>
                                    setTask((_tasks) =>
                                        typeof _tasks === "object"
                                            ? {
                                                  ..._tasks,
                                                  tasks: [
                                                      ..._tasks.tasks,
                                                      task,
                                                  ],
                                              }
                                            : _tasks
                                    )
                            );
                        }}
                        leftIcon={<IconSquarePlus />}
                    >
                        Create new Task
                    </Button>
                    <Title order={3}>Time left:</Title>
                    <RangeCalendar
                        value={[new Date(0), new Date(task.completionDate)]}
                        renderDay={(date) => {
                            const now = new Date();
                            return (
                                <Indicator
                                    size={6}
                                    color="green"
                                    offset={8}
                                    disabled={
                                        date.getDate() !== now.getDate() ||
                                        date.getMonth() !== now.getMonth() ||
                                        date.getFullYear() !== now.getFullYear()
                                    }
                                >
                                    <div>{date.getDate()}</div>
                                </Indicator>
                            );
                        }}
                        onChange={() => {}}
                    />
                </>
            )}
        </>
    );
}

function editModal(task: Task, setTask: (task: Task) => void) {
    const _setTask = (task: Task) => {
        setTask(task);
        closeModal("taskViewTaskEditModal");
    };

    openModal({
        modalId: "taskViewTaskEditModal",
        children: <EditModal task={task} setTask={_setTask} />,
        title: <Text weight={500}>Edit "{task.name}"</Text>,
    });
}

function EditModal({
    task,
    setTask,
}: {
    task: Task;
    setTask: (task: Task) => void;
}) {
    const [weight, setWeight] = useState<number>(task.importance);
    const [name, setName] = useState<string>(task.name);
    const [description, setDescription] = useState<string>(task.description);
    const [links, setLinks] = useState<string[]>(task.links);
    const [users, setUsers] = useState<string[]>(task.assignedUsers);
    const [completed, setCompleted] = useState<boolean>(task.completed);

    return (
        <>
            <TextInput
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                variant="unstyled"
            />
            <Divider />
            <Text weight={700} pb={10}>
                Description
            </Text>
            <Textarea
                sx={{ "& *": { padding: "0px !important" } }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                variant="unstyled"
                autosize
            />
            <Divider />
            <Text weight={700}>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                    Users
                    <ActionIcon ml={5}>
                        <IconSquarePlus
                            color="var(--mantine-color-gray-5)"
                            onClick={() =>
                                setUsers((_users) => [..._users, "Unknown"])
                            }
                        />
                    </ActionIcon>
                </div>
            </Text>
            {users.length !== 0 ? (
                users.map((el, i) => {
                    return (
                        <TextInput
                            key={"eu" + i}
                            value={el}
                            onChange={(e) =>
                                setUsers((_users) => {
                                    _users = [..._users];
                                    _users[i] = e.target.value;
                                    return _users;
                                })
                            }
                            variant="unstyled"
                            rightSection={
                                <IconCircleMinus
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                        setUsers((_users) => {
                                            return _users.filter(
                                                (_, _i) => _i !== i
                                            );
                                        })
                                    }
                                    color="var(--mantine-color-red-7)"
                                />
                            }
                        />
                    );
                })
            ) : (
                <Text color="dimmed" italic>
                    No Users are assigned to this Task
                </Text>
            )}
            <Divider />
            <Text weight={700}>
                <div style={{ display: "flex", flexWrap: "wrap" }}>
                    Links
                    <ActionIcon ml={5}>
                        <IconSquarePlus
                            color="var(--mantine-color-gray-5)"
                            onClick={() =>
                                setLinks((_links) => [..._links, "https://"])
                            }
                        />
                    </ActionIcon>
                </div>
            </Text>
            {links.length !== 0 ? (
                links.map((el, i) => {
                    return (
                        <TextInput
                            key={"el" + i}
                            value={el}
                            onChange={(e) =>
                                setLinks((_links) => {
                                    _links = [..._links];
                                    _links[i] = e.target.value;
                                    return _links;
                                })
                            }
                            sx={{
                                "& *": { color: "var(--mantine-color-blue-4)" },
                            }}
                            variant="unstyled"
                            rightSection={
                                <IconCircleMinus
                                    style={{ cursor: "pointer" }}
                                    onClick={() =>
                                        setLinks((_links) => {
                                            return _links.filter(
                                                (_, _i) => _i !== i
                                            );
                                        })
                                    }
                                    color="var(--mantine-color-red-7)"
                                />
                            }
                        />
                    );
                })
            ) : (
                <Text color="dimmed" italic>
                    No reference links defined
                </Text>
            )}
            <Divider />
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "flex-end",
                }}
            >
                <NumberInput
                    label="Weight"
                    value={weight}
                    onChange={(e) =>
                        setWeight(e !== null && e !== undefined ? e : weight)
                    }
                    variant="unstyled"
                />
                <Box mb={10}>{getBadgeByWeight(weight)}</Box>
            </div>
            <Checkbox
                checked={completed}
                onClick={() => setCompleted((c) => !c)}
                label="Completed"
            />
            <Button
                mt={7}
                onClick={() =>
                    setTask({
                        assignedUsers: users,
                        completed,
                        description,
                        importance: weight,
                        links,
                        name,
                    })
                }
            >
                Save
            </Button>
        </>
    );
}

function getBadgeByWeight(weight: number) {
    const _weight = Math.floor(weight);
    if (_weight < 1)
        return (
            <Badge color="gray" title={"Weight: " + weight}>
                Invalid Taskweight ({weight})
            </Badge>
        );
    if (_weight === 1)
        return (
            <Badge color="red" title={"Weight: " + weight}>
                Very Important
            </Badge>
        );
    if (_weight === 2)
        return (
            <Badge color="orange" title={"Weight: " + weight}>
                Important
            </Badge>
        );
    if (_weight === 3)
        return (
            <Badge color="yellow" title={"Weight: " + weight}>
                Fairly Important
            </Badge>
        );
    if (_weight === 4)
        return (
            <Badge color="yellow" title={"Weight: " + weight}>
                Moderately Important
            </Badge>
        );
    if (_weight === 5)
        return (
            <Badge color="green" title={"Weight: " + weight}>
                Fairly Unimportant
            </Badge>
        );
    if (_weight === 6)
        return (
            <Badge color="teal" title={"Weight: " + weight}>
                Unimportant
            </Badge>
        );
    if (_weight === 7)
        return (
            <Badge color="cyan" title={"Weight: " + weight}>
                Very Unimportant
            </Badge>
        );
    return (
        <Badge color="cyan" title={"Weight: " + weight}>
            Very Unimportant ({weight})
        </Badge>
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

function save(task: TaskGroup) {
    const id = crypto.randomUUID().replaceAll("-", "");

    showNotification({
        id: "taskViewSave" + id,
        message: "Saving...",
        title: "Saving",
        color: "violet",
        loading: true,
        disallowClose: true,
    });

    fetch(`${window.location.origin}/api/task/${task.id}`, {
        method: "post",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
    })
        .then((el) => {
            if (!el.ok) throw "";
            updateNotification({
                id: "taskViewSave" + id,
                loading: false,
                disallowClose: false,
                color: "green",
                title: "Saved!",
                message: "Task saved!",
            });
        })
        .catch(() =>
            updateNotification({
                id: "taskViewSave" + id,
                loading: false,
                disallowClose: false,
                color: "red",
                title: "Error!",
                message: "Task couldn't be saved!",
            })
        );
}

function editProject(setTask: (task: TaskGroup) => void, task: TaskGroup) {
    const _setTask = (task: TaskGroup) => {
        closeModal("taskViewEditProject");
        setTask(task);
    };

    openModal({
        title: <Text weight={500}>Edit Project</Text>,
        modalId: "taskViewEditProject",
        children: <ProjectEditor task={task} setTask={_setTask} />,
    });
}

function ProjectEditor({
    setTask,
    task,
}: {
    setTask: (task: TaskGroup) => void;
    task: TaskGroup;
}) {
    const [date, setDate] = useState(new Date(task.completionDate));
    const [name, setName] = useState(task.name);
    const [description, setDescription] = useState(task.description);
    const [error, setError] = useState("");

    return (
        <>
            {error && <Error title="Error!" text={error} />}
            <DatePicker
                placeholder="Pick Date"
                label="Finish Date"
                minDate={new Date()}
                value={date}
                onChange={setDate as any}
            />
            <TextInput
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="New Task"
            />
            <TextInput
                label="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description"
            />
            <Button
                onClick={() => {
                    if (!date) return setError("No date specified");
                    if (!name) return setError("No name specified");
                    if (!description)
                        return setError("No description specified");
                    setTask({
                        completionDate: date.getTime(),
                        description,
                        name,
                        id: task.id,
                        tasks: task.tasks,
                    });
                }}
            >
                Submit
            </Button>
        </>
    );
}
