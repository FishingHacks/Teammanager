import {
    Card,
    Title,
    Text,
    Code,
    TextInput,
    Textarea,
    Button,
} from "@mantine/core";
import { closeModal, openModal } from "@mantine/modals";
import { Prism } from "@mantine/prism";
import { IconPencil, IconSquarePlus, IconTrash } from "@tabler/icons";
import { useState } from "react";
import { useFetch } from "../utils";

export default function Data() {
    const [data, setData] = useFetch<AccessData[]>("/api/data");

    return (
        <>
            <Title>Access Data for the Services</Title>
            {typeof data === "object" &&
                data.map((el, i) => {
                    return (
                        <Card key={i} withBorder m={10}>
                            <Text weight={700}>{el.title}</Text>
                            <Text color="dimmed">{el.description}</Text>
                            <Text color="dimmed" weight={500}>
                                File Path:
                            </Text>
                            <Code>{el.filePath}</Code>
                            <Prism language={el.language as any}>
                                {el.data}
                            </Prism>
                            <Button
                                color="blue"
                                leftIcon={<IconPencil />}
                                onClick={() =>
                                    editDataModal(el, (data) =>
                                        setData((_d) =>
                                            typeof _d !== "object"
                                                ? _d
                                                : _d.map((_el) =>
                                                      _el.title === data.title
                                                          ? data
                                                          : _el
                                                  )
                                        )
                                    )
                                }
                            >
                                Edit
                            </Button>
                            <Button
                                ml={10}
                                mt={10}
                                color="red"
                                leftIcon={<IconTrash />}
                                onClick={() =>
                                    fetch(
                                        "/api/data/" +
                                            encodeURIComponent(el.title),
                                        { method: "delete" }
                                    )
                                        .then(() =>
                                            setData((_d) =>
                                                typeof _d === "object"
                                                    ? _d.filter(
                                                          (_el) =>
                                                              _el.title !==
                                                              el.title
                                                      )
                                                    : _d
                                            )
                                        )
                                        .catch(() => {})
                                }
                            >
                                Delete
                            </Button>
                        </Card>
                    );
                })}
            <Button
                ml={10}
                mt={20}
                color="green"
                onClick={() =>
                    createDataModal((data) =>
                        setData((_d) =>
                            typeof _d !== "object" ? _d : [data, ..._d]
                        )
                    )
                }
                leftIcon={<IconSquarePlus />}
            >
                Add AccessData
            </Button>
        </>
    );
}

function createDataModal(setData: (data: AccessData) => void) {
    openModal({
        modalId: "accessDataEditData",
        title: <Text weight={500}>Create new AccessData</Text>,
        children: (
            <AccessDataModal
                data={{
                    data: "",
                    description: "",
                    filePath: "",
                    language: "",
                    title: "",
                }}
                m="put"
                setData={setData}
            />
        ),
    });
}

function editDataModal(data: AccessData, setData: (data: AccessData) => void) {
    openModal({
        modalId: "accessDataEditData",
        title: <Text weight={500}>Edit AccessData</Text>,
        children: <AccessDataModal data={data} m="post" setData={setData} />,
    });
}

function AccessDataModal({
    data,
    setData,
    m,
}: {
    data: AccessData;
    setData: (data: AccessData) => void;
    m: "put" | "post";
}) {
    const [saving, setSaving] = useState(false);
    const [description, setDescription] = useState(data.description);
    const [title, setTitle] = useState(data.title);
    const [filePath, setFilePath] = useState(data.filePath);
    const [language, setLanguage] = useState(data.language);
    const [_data, _setData] = useState(data.data);

    return (
        <>
            <TextInput
                disabled={saving}
                value={title}
                label="Title"
                onChange={(e) => setTitle(e.target.value)}
                mb={10}
            />
            <TextInput
                disabled={saving}
                value={filePath}
                label="File path"
                onChange={(e) => setFilePath(e.target.value)}
                mb={10}
            />
            <TextInput
                disabled={saving}
                value={language}
                label="Language"
                onChange={(e) => setLanguage(e.target.value)}
                mb={10}
            />
            <Textarea
                disabled={saving}
                value={description}
                label="Description"
                onChange={(e) => setDescription(e.target.value)}
                mb={10}
                autosize
                maxRows={20}
            />
            <Textarea
                disabled={saving}
                value={_data}
                label="Data"
                onChange={(e) => _setData(e.target.value)}
                mb={10}
                autosize
                maxRows={20}
            />
            <Button
                color="green"
                loading={saving}
                loaderProps={{ variant: "dots" }}
                disabled={
                    !(_data && description && filePath && language && title) ||
                    saving
                }
                onClick={() => {
                    if (
                        !(_data && description && filePath && language && title)
                    )
                        return;
                    setSaving(true);
                    const newData: AccessData = {
                        data: _data,
                        description,
                        filePath,
                        language,
                        title,
                    };
                    fetch("/api/data/" + encodeURIComponent(data.title || newData.title), {
                        method: m,
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(newData),
                    })
                        .then((r) => {
                            if (!r.ok) throw "a";
                            setData(newData);
                            closeModal("accessDataEditData");
                        })
                        .catch(() => setSaving(false));
                }}
                mb={10}
            >
                Save
            </Button>
        </>
    );
}

interface AccessData {
    description: string;
    data: string;
    title: string;
    filePath: string;
    language: string;
}
