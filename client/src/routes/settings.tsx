import {
    Box,
    Center,
    SegmentedControl,
    useMantineColorScheme,
    Text,
    Button,
    Divider,
    Input,
    TextInput,
    Textarea,
} from "@mantine/core";
import { IconLogout, IconMoon, IconSun } from "@tabler/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../utils";

export default function Settings() {
    const { colorScheme, toggleColorScheme } = useMantineColorScheme();
    const navigate = useNavigate();
    const [user, setUser] = useUser();
    const [saving, setSaving] = useState(false);
    if (!user) return <></>;

    return (
        <>
            <Box>
                <Text weight={700} mr={10}>
                    Colorscheme
                </Text>
                <SegmentedControl
                    data={[
                        {
                            value: "light",
                            label: (
                                <Center>
                                    <IconSun size={16} />
                                    <Box ml={10}>Lightmode</Box>
                                </Center>
                            ),
                        },
                        {
                            value: "dark",
                            label: (
                                <Center>
                                    <IconMoon size={16} />
                                    <Box ml={10}>Darkmode</Box>
                                </Center>
                            ),
                        },
                    ]}
                    onChange={toggleColorScheme as any}
                    value={colorScheme}
                />
            </Box>
            <Divider />
            <Text weight={500}>Account</Text>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
                <TextInput
                    label="Username"
                    value={user.username}
                    onChange={(e) =>
                        setUser((_u) =>
                            _u !== null
                                ? { ..._u, username: e.target.value }
                                : _u
                        )
                    }
                />
                <TextInput
                    label="Email"
                    ml={10}
                    value={user.email}
                    onChange={(e) =>
                        setUser((_u) =>
                            _u !== null ? { ..._u, email: e.target.value } : _u
                        )
                    }
                />

                <Button
                    mt={25}
                    ml={7}
                    color="red"
                    leftIcon={<IconLogout />}
                    onClick={() => {
                        document.cookie =
                            "user= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
                        navigate("/");
                    }}
                >
                    Logout
                </Button>
            </div>
            <Textarea
                label="Description"
                value={user.bio}
                onChange={(e) =>
                    setUser((_u) =>
                        _u !== null ? { ..._u, bio: e.target.value } : _u
                    )
                }
            />

            <Button
                mt={7}
                loading={saving}
                loaderProps={{ variant: "dots" }}
                onClick={() => {
                    setSaving(true);
                    fetch("/api/user/" + user.id + "/update", {
                        method: "post",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(user),
                    })
                        .then(() => {
                            return fetch("/api/refreshtoken");
                        })
                        .then(() => setSaving(false))
                        .catch(() => setSaving(false));
                    setTimeout(() => setSaving(false), 1000);
                }}
            >
                Save
            </Button>
        </>
    );
}
