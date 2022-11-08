import Navbar from "./components/navbar";
import { lazy } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Error, getUser } from "./utils";

const Home = lazy(() => import("./routes/home"));
const LHome = lazy(() => import("./routes/lHome"));
const Messages = lazy(() => import("./routes/messages"));
const MessagesId = lazy(() => import("./routes/messages/{id}"));
const Dashboard = lazy(() => import("./routes/dash"));
const Tasks = lazy(() => import("./routes/tasks"));
const TaskView = lazy(() => import("./routes/task/{id}"));
const AccessData = lazy(() => import("./routes/data"));
const Settings = lazy(() => import("./routes/settings"));
const Issues = lazy(() => import("./routes/issues"));
const IssueView = lazy(() => import("./routes/issues/{id}"));

function ErrorElement({ route }: { route: string }) {
    return (
        <Error
            text={"An error occurred whilst trying to render " + route}
            title="Error!"
        />
    );
}

export default function Router() {
    const location = useLocation();

    if (
        needLoginLocations.find(
            (el) =>
                el.startsWith(location.pathname) ||
                el.startsWith("/" + location.pathname)
        ) !== undefined &&
        location.pathname !== "/" &&
        !needLoginLocations.includes("/") &&
        !needLoginLocations.includes("")
    ) {
        if (getUser() === null)
            return <Navigate to="/" state={{ from: location }} />;
        fetch("/api/refreshtoken")
            .then(() => {})
            .catch(() => {});
    }

    return (
        <>
            <Routes location={location}>
                <Route path="/" element={<Navbar />}>
                    <Route path="/">
                        <Route
                            index
                            element={<Home />}
                            errorElement={<ErrorElement route="/" />}
                            hasErrorBoundary
                        />
                    </Route>
                    <Route path="/home">
                        <Route
                            index
                            element={<LHome />}
                            errorElement={<ErrorElement route="/home" />}
                            hasErrorBoundary
                        />
                    </Route>
                    <Route
                        path="/messages"
                        element={<Messages />}
                        errorElement={<ErrorElement route="/messages" />}
                        hasErrorBoundary
                    >
                        <Route
                            path="/messages/:id"
                            element={<MessagesId />}
                            errorElement={
                                <ErrorElement route="/messages/{id}" />
                            }
                            hasErrorBoundary
                        />
                    </Route>
                    <Route
                        path="/dash"
                        element={<Dashboard />}
                        errorElement={<ErrorElement route="/dash" />}
                        hasErrorBoundary
                    />
                    <Route
                        path="/tasks"
                        element={<Tasks />}
                        errorElement={<ErrorElement route="/tasks" />}
                        hasErrorBoundary
                    />
                    <Route
                        path="/task/:id"
                        element={<TaskView />}
                        errorElement={<ErrorElement route="/task/{id}" />}
                        hasErrorBoundary
                    />
                    <Route
                        path="/access"
                        element={<AccessData />}
                        errorElement={<ErrorElement route="/access" />}
                        hasErrorBoundary
                    />
                    <Route
                        path="/settings"
                        element={<Settings />}
                        errorElement={<ErrorElement route="/settings" />}
                        hasErrorBoundary
                    />
                    <Route
                        path="/issues"
                        element={<Issues />}
                        errorElement={<ErrorElement route="/issues" />}
                        hasErrorBoundary
                    />
                    <Route
                        path="/issues/:id"
                        element={<IssueView />}
                        errorElement={<ErrorElement route="/issues/:id" />}
                        hasErrorBoundary
                    />
                    <Route
                        path="/*"
                        element={
                            <h1>
                                Error: No route for {window.location.pathname}{" "}
                                found
                            </h1>
                        }
                    />
                </Route>
            </Routes>
        </>
    );
}

const needLoginLocations = [
    "/home",
    "/messages",
    "/dash",
    "/home",
    "/task",
    "/tasks",
    "/access",
    "/settings",
    "/issues"
];
