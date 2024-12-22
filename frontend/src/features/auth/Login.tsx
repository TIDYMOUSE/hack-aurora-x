import { Formik, Form } from "formik";
import * as yup from "yup";
import { useTheme } from "@mui/material";
import Box from "@mui/material/Box/Box";
import Button from "@mui/material/Button/Button";
import Container from "@mui/material/Container/Container";
import TextField from "@mui/material/TextField/TextField";
import { useNavigate } from "react-router-dom";
import {
  useAuthStatus,
  useLogin,
  useRegister,
} from "../../services/auth/authHooks.ts";
import { ROUTE_DASHBOARD } from "../../providers/RoutesProvider.tsx";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  AlertSeverity,
  useSnackbar,
} from '../../providers/SnackbarProvider.tsx';
import { useLoading } from '../../providers/LoadingProvider.tsx';
import { AxiosError } from 'axios';
import { useSpeech } from '../../providers/SpeechProvider.tsx';
// import { time } from 'console';
import { TIMEOUT } from 'dns';
import { use } from 'i18next';


const Login = () => {
  const speech = useSpeech()
  const navigate = useNavigate();
  const theme = useTheme();
  const loader = useLoading();
  const authStatus = useAuthStatus(true);
  const loginRequest = useLogin();
  const registerRequest = useRegister();
  const { t } = useTranslation();
  const snackbar = useSnackbar();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [voiceInputStep, setVoiceInputStep] = useState<'idle' | 'username' | 'confirmUsername' | 'password' | 'confirmPassword'>('idle');
  const [tempCredentials, setTempCredentials] = useState({ username: '', password: '' });
  const [voiceInputAttempts, setVoiceInputAttempts] = useState(0);
  const MAX_ATTEMPTS = 3;

  const handleVoiceInput = async (ev: React.MouseEvent) => {
    if (ev.button !== 1) return; // Only proceed on middle click
    ev.preventDefault();
    
    setVoiceInputStep('username');
    setVoiceInputAttempts(0);
    await startVoiceFlow();
  };

  const startVoiceFlow = async () => {
    try {
      // Username collection
      const username = await collectVoiceInput('username');
      if (!username) return;

      // Password collection
      const password = await collectVoiceInput('password');
      if (!password) return;

      // Set the final values
      setUsername(username);
      setPassword(password);
      
      speak("Credentials collected successfully. You can now sign in.");
      
    } catch (error) {
      console.error('Voice input error:', error);
      speak("Voice input cancelled. Please try again or use keyboard input.");
      setVoiceInputStep('idle');
    }
  };

  const collectVoiceInput = async (type: 'username' | 'password'): Promise<string | null> => {
    const maxAttempts = 3;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      try {
        // First attempt
        speak(`Please say your ${type}`);
        let firstInput
        await startListening(
          async () => {
            console.log(recognizedText.current);
            fetch("http://localhost:8000/api/talk", {
              method: "POST", // Specify GET method
              headers: {
                "Content-Type": "application/json", // Optional, for JSON payload
              },
              body: JSON.stringify({ "message": recognizedText.current}), // Include a body (not typical for GET)
              }).then(async (res)=> {
              // console.log(res);
              // console.log(await res.json());
              let data = await res.json();
              console.log(data);
              let func_name = data.command.substring(4);
              if(data.command.substring(0,3) == "Nav") {
                navigate("/" + func_name.toLowerCase())
              }
              else{
                window[func_name]();
              }
              console.log(func_name);
              // console.log(window);
              })
          }
        );
        // const firstInput = recognizedText.current;
        // stopListening();
        
        if (!firstInput) {
          speak(`No ${type} detected. Please try again.`);
          attempts++;
          continue;
        }

        // Confirmation
        await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause
        speak(`Please confirm your ${type}`);
        await startListening();
        const confirmInput = recognizedText.current;
        // stopListening();

        if (firstInput === confirmInput) {
          speak(`${type} confirmed`);
          return firstInput;
        } else {
          speak(`${type} mismatch. Please try again.`);
          attempts++;
        }
      } catch (error) {
        console.error(`Error collecting ${type}:`, error);
        attempts++;
      }
    }

    speak(`Failed to collect ${type} after ${maxAttempts} attempts. Please try again or use keyboard input.`);
    return null;
  };

  async function handleSubmit(
    username: string,
    password: string,
    email?: string
  ) {
    if (isLogin) loginRequest.mutate({ username, password });
    else registerRequest.mutate({ username, password, email: email ?? "" });
  }
    const { recognizedText, isListening, startListening, stopListening, speak } = useSpeech();

  const formValidationSchema = yup.object().shape({
    username: yup.string().min(3).required(t("login.fillAllFields")),
    password: yup.string().required(t("login.fillAllFields")),
    showEmail: yup.boolean(),
    email: yup
      .string()
      .email()
      .when("showEmail", (showEmail, schema) => {
        if (showEmail[0] == true)
          return schema.required(t("login.fillAllFields"));
        return schema;
      }),
  });

  useEffect(() => {
    if (loginRequest.isSuccess) {
      navigate(ROUTE_DASHBOARD);
    } else if (loginRequest.isError) {
      snackbar.showSnackbar(
        t("login.wrongCredentialsError"),
        AlertSeverity.ERROR
      );
    }
  }, [loginRequest.isSuccess, loginRequest.isError]);

  useEffect(() => {
    if (registerRequest.isSuccess) {
      snackbar.showSnackbar(
        t("login.userSuccessfullyAdded"),
        AlertSeverity.SUCCESS
      );
      setIsLogin(true);
    } else if (registerRequest.isError) {
      const error = registerRequest.error as AxiosError;
      if (error?.response?.status === 401) {
        snackbar.showSnackbar(
          t("login.addUserDisabledError"), // Add this to your translations
          AlertSeverity.ERROR
        );
      } else {
        snackbar.showSnackbar(
          t("common.somethingWentWrongTryAgain"),
          AlertSeverity.ERROR
        );
      }
    }
  }, [registerRequest.isSuccess, registerRequest.isError]);

  useEffect(() => {
    if (authStatus.isAuthenticated) {
      navigate(ROUTE_DASHBOARD);
    }
  }, [authStatus.isAuthenticated]);

  useEffect(() => {
    // Show loading indicator when isLoading is true
    if (loginRequest.isPending || registerRequest.isPending) {
      loader.showLoading();
    } else {
      loader.hideLoading();
    }
  }, [loginRequest.isPending, registerRequest.isPending]);

  return (
    <div>
      <div onMouseDown={handleVoiceInput}>
      <Container maxWidth="xs">
        <Box
          p={3}
          height="100vh"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
        >
          <img
            src={
              theme.palette.mode === "dark"
                ? "/res/logo_white_font_transparent_bg.png"
                : "/res/logo_transparent_bg_v2.png"
            }
            width="60%"
            style={{ marginBottom: 20 }}
          />
          <Formik
            initialValues={{
              username: "",
              password: "",
              email: "",
              showEmail: !isLogin, // Dynamically set based on isLogin
            }}
            validationSchema={formValidationSchema}
            onSubmit={(values) =>
              handleSubmit(values.username, values.password, values.email)
            }
          >
            {(props) => {
              return (
                <Form>
                  {!isLogin && ( // Show email field only when not in login mode
                    <TextField
                      id="email"
                      name="email"
                      label="Email"
                      margin="normal"
                      fullWidth
                      value={props.values.email}
                      onChange={props.handleChange}
                      onBlur={props.handleBlur}
                      error={props.touched.email && Boolean(props.errors.email)}
                      helperText={props.touched.email && props.errors.email}
                    />
                  )}
                  <TextField
                    id="username"
                    name="username"
                    label="Username"
                    margin="normal"
                    fullWidth
                    value={props.values.username}
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    error={
                      props.touched.username && Boolean(props.errors.username)
                    }
                    helperText={props.touched.username && props.errors.username}
                  />
                  <TextField
                    id="password"
                    name="password"
                    label="Password"
                    type="password"
                    margin="normal"
                    fullWidth
                    value={props.values.password}
                    onChange={props.handleChange}
                    onBlur={props.handleBlur}
                    error={
                      props.touched.password && Boolean(props.errors.password)
                    }
                    helperText={props.touched.password && props.errors.password}
                  />
                  <Button
                    variant="contained"
                    type="submit"
                    color="primary"
                    fullWidth
                    style={{ marginTop: "16px" }}
                  >
                    {t(isLogin ? "login.signIn" : "login.signUp")}
                  </Button>
                  <Button
                    variant="outlined"
                    color="primary"
                    fullWidth
                    onClick={() => {
                      props.values.showEmail = !props.values.showEmail;
                      setIsLogin(!isLogin);
                    }}
                    style={{ marginTop: "16px" }}
                  >
                    {isLogin
                      ? t("login.signUp")
                      : t("login.alreadyRegisteredQuestion")}
                  </Button>
                </Form>
              );
            }}
          </Formik>
        </Box>
      </Container>
    </div>
    </div>
  );
};

export default Login;

