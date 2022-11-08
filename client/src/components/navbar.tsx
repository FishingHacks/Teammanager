import { useState } from "react";
import {
  Navbar,
  Center,
  Tooltip,
  UnstyledButton,
  createStyles,
  Stack,
  useMantineColorScheme,
  ScrollArea,
} from "@mantine/core";
import {
  TablerIcon,
  IconHome2,
  IconGauge,
  IconFingerprint,
  IconCircleDot,
  IconSettings,
  IconLogout,
  IconMessage,
  IconBrandFramer,
  IconChecklist,
  IconSun,
  IconMoon,
} from "@tabler/icons";
import { Outlet, useNavigate } from "react-router-dom";
import { getUser } from "../utils";

const useStyles = createStyles((theme) => ({
  link: {
    width: 50,
    height: 50,
    borderRadius: theme.radius.md,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color:
      theme.colorScheme === "dark"
        ? theme.colors.dark[0]
        : theme.colors.gray[7],

    "&:hover": {
      backgroundColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[5]
          : theme.colors.gray[0],
    },
  },

  active: {
    "&, &:hover": {
      backgroundColor: theme.fn.variant({
        variant: "light",
        color: theme.primaryColor,
      }).background,
      color: theme.fn.variant({ variant: "light", color: theme.primaryColor })
        .color,
    },
  },
}));

interface NavbarLinkProps {
  icon: TablerIcon;
  label: string;
  active?: boolean;
  onClick?(): void;
}

function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
  const { classes, cx } = useStyles();
  return (
    <Tooltip label={label} position="right" transitionDuration={0}>
      <UnstyledButton
        onClick={onClick}
        className={cx(classes.link, { [classes.active]: active })}
      >
        <Icon stroke={1.5} />
      </UnstyledButton>
    </Tooltip>
  );
}

const mockdata = [
    { icon: IconHome2, label: "Home", link: "/home" },
    { icon: IconGauge, label: "Dashboard", link: "/dash" },
    { icon: IconMessage, label: "Messages", link: "/messages" },
    { icon: IconChecklist, label: "Tasks", link: "/tasks" },
    { icon: IconCircleDot, label: "Issues", link: "/issues" },
    { icon: IconFingerprint, label: "Shared Access Data", link: "/access" },
    { icon: IconSettings, label: "Settings", link: "/settings" },
];

export default function navbar() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const navigate = useNavigate();
  const loggedIn = getUser() !== null;

  const links = mockdata.map((link, index) => (
    <NavbarLink
      {...link}
      key={link.label}
      active={location.pathname.startsWith(link.link)}
      onClick={() => navigate(link.link)}
    />
  ));

  return (
    <>
    <Navbar
      height="100vh"
      width={{ base: 80 }}
      p="md"
      style={{ position: "fixed", top: 0 }}
      >
      <Center>
        <IconBrandFramer size={30} />
      </Center>
      <Navbar.Section grow mt={50}>
        <Stack justify="center" spacing={0}>
          {loggedIn && links}
        </Stack>
      </Navbar.Section>
      <Navbar.Section>
        <Stack justify="center" spacing={0}>
          {loggedIn && (
            <NavbarLink
              icon={IconLogout}
              label="Logout"
              onClick={() => {
                document.cookie =
                "user= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
                navigate("/");
              }}
              />
              )}
          <NavbarLink
            icon={colorScheme === "light" ? IconMoon : IconSun}
            label={colorScheme === "light" ? "Dark mode" : "Light Mode"}
            onClick={toggleColorScheme}
            />
        </Stack>
      </Navbar.Section>
      </Navbar>
      <ScrollArea ml={85} style={{ width: "calc(100vw - 90px)", height: "calc(100vh - 10px)" }}>
        <Outlet />
      </ScrollArea>
            </>
  );
}
