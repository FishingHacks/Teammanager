import { Card, Title, Text, Code } from "@mantine/core";
import { Prism } from "@mantine/prism";

export default function Data() {
  return (
    <>
      <Title>Access Data for the Services</Title>
        {accessData.map((el, i) => {
          return (
            <Card key={i} withBorder m={10}>
              <Text weight={700}>{el.title}</Text>
              <Text color="dimmed">{el.description}</Text>
              <Text color="dimmed" weight={500}>
                File Path:
              </Text>
              <Code>{el.filePath}</Code>
              <Prism language={el.language as any}>{el.data}</Prism>
            </Card>
          );
        })}
    </>
  );
}

const accessData: Array<AccessData> = [
  {
    data: "TOKEN=2482038490238409812098342\nCLIENT_ID=12378932747234\nSECRET=sahdHD8)SDasd9(Asdasdhaoisjdu()SD",
    description: "The .env file for the teammanager",
    title: "teamman env",
    filePath: "/teammanager/.env",
    language: "env",
  },
  {
    data: '{\n  "language": "DE-de",\n  "adminId": "12843789",\n  "databaseService": "no-sql:enmap",\n  "implementation": "@featherframe/dbi-nsenmap"\n}',
    description: "The featherframe config file for the Eytron Teammanager",
    title: "teamman ff config",
    filePath: "/teammanager/.ffrc",
    language: "json",
  },
];

interface AccessData {
  description: string;
  data: string;
  title: string;
  filePath: string;
  language: string;
}
