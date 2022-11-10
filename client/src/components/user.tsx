import { createStyles, Avatar, Text, Group } from "@mantine/core";
import { IconAt } from "@tabler/icons";

const useStyles = createStyles((theme) => ({
    icon: {
        color:
            theme.colorScheme === "dark"
                ? theme.colors.dark[3]
                : theme.colors.gray[5],
    },

    name: {
        fontFamily: `Greycliff CF, ${theme.fontFamily}`,
    },
}));

interface UserInfoProps {
    avatar: string;
    name: string;
    title: string;
    contact: string;
    email: string;
}

export function UserInfo({
    avatar,
    name,
    title,
    contact,
    email,
}: UserInfoProps) {
    const { classes } = useStyles();
    return (
        <div>
            <Group noWrap>
                <Avatar
                    src={avatar ? avatar : null}
                    alt={name + "'s Avatar"}
                    size={94}
                    radius="md"
                >
                    {name
                        .split("")
                        .map((el) => (el.match(/[A-Z]/) ? el : ""))
                        .join("")}
                </Avatar>
                <div>
                    <Text
                        size="xs"
                        sx={{ textTransform: "uppercase" }}
                        weight={700}
                        color="dimmed"
                    >
                        {title}
                    </Text>

                    <Text size="lg" weight={500} className={classes.name}>
                        {name}
                    </Text>

                    <Group noWrap spacing={10} mt={3}>
                        <IconAt
                            stroke={1.5}
                            size={16}
                            className={classes.icon}
                        />
                        <Text size="xs" color="dimmed">
                            {email}
                        </Text>
                    </Group>

                    <Group noWrap spacing={10} mt={5}>
                        <Text size="xs" color="dimmed">
                            {contact}
                        </Text>
                    </Group>
                </div>
            </Group>
        </div>
    );
}
