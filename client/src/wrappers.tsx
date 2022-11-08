import Router from "./router";
import {
  MantineProvider,
  ColorSchemeProvider,
  ScrollArea,
} from "@mantine/core";
import { NotificationsProvider } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { useState } from "react";
import Navbar from "./components/navbar";

export default function Wrappers() {
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("dark");

  return (
    <>
      <MantineProvider
        theme={{ colorScheme }}
        withGlobalStyles
        withNormalizeCSS
        withCSSVariables
      >
        <ColorSchemeProvider
          colorScheme={colorScheme}
          toggleColorScheme={() =>
            setColorScheme((s) => (s === "dark" ? "light" : "dark"))
          }
        >
          <NotificationsProvider>
            <ModalsProvider>
                <Router />
            </ModalsProvider>
          </NotificationsProvider>
        </ColorSchemeProvider>
      </MantineProvider>
    </>
  );
}
