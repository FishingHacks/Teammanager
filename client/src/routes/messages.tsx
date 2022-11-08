import {
    UnstyledButton,
    UnstyledButtonProps,
    Group,
    Avatar,
    Text,
    createStyles,
    Grid,
    ScrollArea,
    Skeleton,
} from "@mantine/core";
import { IconChevronRight } from "@tabler/icons";
import { Outlet, useNavigate } from "react-router-dom";
import { Error, useFetch, User } from "../utils";
import { useMediaQuery } from "@mantine/hooks";

const useStyles = createStyles((theme) => ({
    user: {
        display: "block",
        width: "100%",
        minWidth: "20vw",
        padding: theme.spacing.md,
        color:
            theme.colorScheme === "dark" ? theme.colors.dark[0] : theme.black,

        "&:hover": {
            backgroundColor:
                theme.colorScheme === "dark"
                    ? theme.colors.dark[8]
                    : theme.colors.gray[0],
        },
    },
}));

interface UserButtonProps extends UnstyledButtonProps {
    name: string;
    email: string;
    id: string;
    onClick?: () => void;
}

export function UserButton({
    name,
    email,
    id,
    onClick,
    ...others
}: UserButtonProps) {
    const _id = /^\/messages\/([^\/])$/.exec(window.location.pathname)?.[1];

    const { classes } = useStyles();

    return (
        <UnstyledButton
            className={classes.user}
            {...others}
            onClick={onClick}
            style={
                _id === id
                    ? { backgroundColor: "var(--mantine-color-dark-8)" }
                    : {}
            }
        >
            <Group>
                <Avatar src={null} radius="xl" alt={name}>
                    {name
                        .split(" ")
                        .map((el) => el[0])
                        .join("")}
                </Avatar>

                <div style={{ flex: 1 }}>
                    <Text size="sm" weight={500}>
                        {name}
                    </Text>

                    <Text color="dimmed" size="xs">
                        {email}
                    </Text>
                </div>

                <IconChevronRight size={14} stroke={1.5} />
            </Group>
        </UnstyledButton>
    );
}

export default function Messages() {
    const navigate = useNavigate();
    const matches = useMediaQuery("(min-width: 1300px)");
    const [users, setUsers] = useFetch<User[]>("/api/users");

    return (
        <>
            <Grid
                style={{
                    width: "calc(100vw - 90px)",
                    height: "calc(100vh - 10px)",
                }}
            >
                <Grid.Col
                    span="content"
                    hidden={
                        /^\/messages\/([^\/])$/.exec(
                            window.location.pathname
                        ) !== null && !matches
                    }
                >
                    {typeof users === "object" && <ScrollArea style={{ height: "calc(100vh - 20px)" }}>
                        {users.map(({email, username, id}) => (
                        <UserButton
                            id={id}
                            email={email}
                            name={username}
                            key={id}
                            onClick={() => navigate("/messages/" + id)}
                        />
                        ))}
                    </ScrollArea>}
                    {users === "loading" && <Skeleton height="calc(100vh - 20px)" />}
                    {users === "error" && <Error text="Couldn't load the users!" title="Error!" />}
                </Grid.Col>
                <Grid.Col span="auto" p={0}>
                    <Outlet />
                </Grid.Col>
            </Grid>
        </>
    );
}
