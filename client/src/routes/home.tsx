import {
  Anchor,
  Button,
  Checkbox,
  Container,
  Group,
  Paper,
  PasswordInput,
  TextInput,
  Title,
  Text,
  Box,
  Center,
  createStyles,
  Alert,
} from "@mantine/core";
import { IconAlertCircle, IconArrowLeft } from "@tabler/icons";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {

  const [resetPassword, changeResetPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string>("");
  const [loggingIn, setLoggingIn] = useState(false);
  const navigate = useNavigate();

  return !resetPassword ? (
    <Container size={420} my={40}>
      {error !== "" && (
        <Alert icon={<IconAlertCircle size={16} />} title="Error!" color="red">
          {error}
        </Alert>
      )}
      <Title
        align="center"
        sx={(theme) => ({
            fontFamily: `Greycliff CF, ${theme.fontFamily}`,
            fontWeight: 900,
          })
        }
      >
        Welcome back!
      </Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <TextInput
          label="Email"
          placeholder="mail@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loggingIn}
        />
        <PasswordInput
          label="Password"
          placeholder="Your password"
          required
          mt="md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loggingIn}
        />
        <Group position="apart" mt="md">
          <Checkbox label="Remember me" />
          <Anchor<"a">
            onClick={(event) => {
              event.preventDefault();
              changeResetPassword(true);
            }}
            href="#"
            size="sm"
          >
            Forgot password?
          </Anchor>
        </Group>
        <Button
          disabled={loggingIn}
          loading={loggingIn}
          fullWidth
          mt="xl"
          onClick={() => {
            if (email === "") return setError("The Email can't be empty");
            if (password === "") return setError("The Password can't be empty");
            if (!/^[^@]+@[^.]+\..+$/.test(email))
              return setError("The Email isn't valid!");
            setLoggingIn(true);
            fetch(window.location.origin + "/api/login", {
              method: "post",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ email, password }),
            })
              .then((r) => {
                if (r.status === 401) {
                  setLoggingIn(false);
                  setError("The Email and/or the password is wrong!");
                } else if (!r.ok) {
                  setLoggingIn(false);
                  setError("Something went wrong!");
                } else {
                  navigate("/home");
                }
              })
              .catch(() => {
                setLoggingIn(false);
                setError("Something went wrong!");
              });
          }}
        >
          <Text>Sign in</Text>
        </Button>
      </Paper>
    </Container>
  ) : (
    <ForgotPassword goback={() => changeResetPassword(false)}></ForgotPassword>
  );
}

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: 26,
    fontWeight: 900,
    fontFamily: `Greycliff CF, ${theme.fontFamily}`,
  },

  controls: {
    [theme.fn.smallerThan("xs")]: {
      flexDirection: "column-reverse",
    },
  },

  control: {
    [theme.fn.smallerThan("xs")]: {
      width: "100%",
      textAlign: "center",
    },
  },
}));

export function ForgotPassword({ goback }: { goback: () => void }) {
  const { classes } = useStyles();

  return (
    <Container size={460} my={30}>
      <Title className={classes.title} align="center">
        Forgot your password?
      </Title>
      <Text color="dimmed" size="sm" align="center">
        Enter your email to get a reset link
      </Text>

      <Paper withBorder shadow="md" p={30} radius="md" mt="xl">
        <TextInput label="Your email" placeholder="me@mantine.dev" required />
        <Group position="apart" mt="lg" className={classes.controls}>
          <Anchor color="dimmed" size="sm" className={classes.control}>
            <Center inline>
              <IconArrowLeft size={12} stroke={1.5} />
              <Box ml={5} onClick={goback}>
                Back to login page
              </Box>
            </Center>
          </Anchor>
          <Button className={classes.control}>Reset password</Button>
        </Group>
      </Paper>
    </Container>
  );
}
