import { Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons";
import React, { useEffect, useState } from "react";

export function exists(...values: any[]): boolean {
    if (values == null) return false;
    return !values.map((el) => el !== null).includes(false);
}

export function getUser(): User | null {
    const cookie = parseCookies(window.document.cookie).user;

    if (!cookie) return null;
    try {
        const _str = atob(cookie.split(".")[1] || "");
        const json = JSON.parse(_str);
        if (json === null) return null;
        if (exists(json.exp) && json.exp <= Date.now() / 1000) return null;
        if (exists(json.username, json.role, json.bio, json.email, json.status))
            return json;
    } catch {
        return null;
    }
    return null;
}

export function useUser() {
    return useState(getUser());
}

export interface User {
    username: string;
    role: UserRole;
    bio: string;
    email: string;
    status: "active" | "disabled"; // when called in getUser, it is active, because a disabled user should under no circumstances be logged in
    id: string;
}

export type UserRole =
    | "admin"
    | "collaborator"
    | "tester"
    | "programmer"
    | "supporter"
    | "moderator"
    | "user";

export function parseCookies(cookies: string): { [name: string]: string } {
    const _cookies: { [name: string]: string } = {};
    const cookieTokens = Object.values(cookies);
    let _name = "";
    let _tmp = "";
    if (cookieTokens.length < 1) return {};

    for (const t of cookieTokens) {
        if (t === "=") {
            _name = _tmp.replace(/( +$)|(^ +)/g, "");
            _tmp = "";
        } else if (t === ";") {
            _cookies[_name] = _tmp;
            _tmp = ""; // we don't need to set the name as the name get's overwritten. a=b;; will cause the last name to be overwritten with "".
        } else _tmp += t;
    }
    _cookies[_name] = _tmp;

    return _cookies;
}

export const array = {
    end: <T>(arr: Array<T>) => arr[arr.length - 1],
    start: <T>(arr: Array<T>) => arr[0],
    middle: <T>(arr: Array<T>) => arr[Math.floor(arr.length / 2)],
};

export function useFetch<T>(
    url: string,
    options?: {
        method: string;
        headers: { [name: string]: string };
        body: string;
    }
): [fetchAction<T>, React.Dispatch<React.SetStateAction<fetchAction<T>>>] {
    if (url.startsWith("/") && !url.startsWith("//"))
        url = window.location.origin + url;
    else if (!url.startsWith("/") && !url.startsWith(window.location.origin))
        url =
            window.location.origin +
            window.location.pathname +
            url +
            window.location.search +
            window.location.hash;
    const [state, setState] = useState<fetchAction<T>>("loading");

    useEffect(() => {
        try {
            fetch(new URL(url), options)
                .then((res) => {
                    if (!res.ok) return "error";
                    else return res.json();
                })
                .then(setState)
                .catch(() => setState("error"));
        } catch {
            setState("error");
        }
    }, [url]);

    return [state, setState];
}

type fetchAction<T> = T | "loading" | "error";

export function Error({ title, text }: { title: string; text: string }) {
    return React.createElement(
        Alert,
        {
            icon: React.createElement(IconAlertCircle, { size: 16 }),
            title,
            color: "red",
        } as any,
        text
    );
}
