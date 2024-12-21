// import { Formik, Form } from "formik";
// import * as yup from "yup";
// import { useTheme } from "@mui/material";
// import Box from "@mui/material/Box/Box";
// import Button from "@mui/material/Button/Button";
// import Container from "@mui/material/Container/Container";
// import TextField from "@mui/material/TextField/TextField";
// import { useNavigate } from "react-router-dom";
// import {
//   useAuthStatus,
//   useLogin,
//   useRegister,
// } from "../../services/auth/authHooks.ts";
// import { ROUTE_DASHBOARD } from "../../providers/RoutesProvider.tsx";
// import { useEffect, useState } from "react";
// import { useTranslation } from "react-i18next";
// import {
//   AlertSeverity,
//   useSnackbar,
// } from "../../providers/SnackbarProvider.tsx";
// import { useLoading } from "../../providers/LoadingProvider.tsx";
// import { AxiosError } from "axios";
// import { useSpeech } from "../../providers/SpeechProvider.tsx";
// import { createUserWithEmailAndPassword } from "firebase/auth";
// import { app, auth } from "../../firebase.tsx";
// const Login = () => {
//   const navigate = useNavigate();
//   const theme = useTheme();
//   const loader = useLoading();
//   const authStatus = useAuthStatus(true);
//   const loginRequest = useLogin();
//   const registerRequest = useRegister();
//   const { t } = useTranslation();
//   const snackbar = useSnackbar();
//   const speech = useSpeech();
//   speech.speak("Enter your credentials");
//   useEffect(() => {
//     speech.startListening();
//   }, []);
//   setTimeout(() => {
//     speech.stopListening();
//     console.log(speech.recognizedText);
//   }, 5000);

//   const [isLogin, setIsLogin] = useState(true);
//   // useEffect(() => {
//   //   const speech = useSpeech();
//   //   // speech.speak("hello world this is advait yadav");
//   //   speech.startListening();
//   //   setTimeout(() => {
//   //     speech.stopListening();
//   //     console.log(speech.recognizedText);
//   //   }, 3000);
//   // }, []);

//

//   const formValidationSchema = yup.object().shape({
//     username: yup.string().min(3).required(t("login.fillAllFields")),
//     password: yup.string().required(t("login.fillAllFields")),
//     username: yup.string().min(3).required(t("login.fillAllFields")),
//     password: yup.string().required(t("login.fillAllFields")),
//     showEmail: yup.boolean(),
//     email: yup
//       .string()
//       .email()
//       .when("showEmail", (showEmail, schema) => {
//         if (showEmail[0] == true)
//           return schema.required(t("login.fillAllFields"));
//           return schema.required(t("login.fillAllFields"));
//         return schema;
//       }),
//   });

//   useEffect(() => {
//     if (loginRequest.isSuccess) {
//       navigate(ROUTE_DASHBOARD);
//     } else if (loginRequest.isError) {
//       snackbar.showSnackbar(
//         t("login.wrongCredentialsError"),
//         AlertSeverity.ERROR
//         t("login.wrongCredentialsError"),
//         AlertSeverity.ERROR
//       );
//     }
//   }, [loginRequest.isSuccess, loginRequest.isError]);

//   useEffect(() => {
//     if (registerRequest.isSuccess) {
//       snackbar.showSnackbar(
//         t("login.userSuccessfullyAdded"),
//         AlertSeverity.SUCCESS
//         t("login.userSuccessfullyAdded"),
//         AlertSeverity.SUCCESS
//       );
//       setIsLogin(true);
//     } else if (registerRequest.isError) {
//       const error = registerRequest.error as AxiosError;
//       if (error?.response?.status === 401) {
//         snackbar.showSnackbar(
//           t("login.addUserDisabledError"), // Add this to your translations
//           AlertSeverity.ERROR
//           t("login.addUserDisabledError"), // Add this to your translations
//           AlertSeverity.ERROR
//         );
//       } else {
//         snackbar.showSnackbar(
//           t("common.somethingWentWrongTryAgain"),
//           AlertSeverity.ERROR
//           t("common.somethingWentWrongTryAgain"),
//           AlertSeverity.ERROR
//         );
//       }
//     }
//   }, [registerRequest.isSuccess, registerRequest.isError]);

//   useEffect(() => {
//     if (authStatus.isAuthenticated) {
//       navigate(ROUTE_DASHBOARD);
//     }
//   }, [authStatus.isAuthenticated]);

//   useEffect(() => {
//     // Show loading indicator when isLoading is true
//     if (loginRequest.isPending || registerRequest.isPending) {
//       loader.showLoading();
//     } else {
//       loader.hideLoading();
//     }
//   }, [loginRequest.isPending, registerRequest.isPending]);

//   return (
//     <div>
//       <Container maxWidth="xs">
//         <Box
//           p={3}
//           height="100vh"
//           display="flex"
//           alignItems="center"
//           justifyContent="center"
//           flexDirection="column"
//         >
//           <img
//             src={
//               theme.palette.mode === "dark"
//                 ? "/res/logo_white_font_transparent_bg.png"
//                 : "/res/logo_transparent_bg_v2.png"
//               theme.palette.mode === "dark"
//                 ? "/res/logo_white_font_transparent_bg.png"
//                 : "/res/logo_transparent_bg_v2.png"
//             }
//             width="60%"
//             style={{ marginBottom: 20 }}
//           />
//           <Formik
//             initialValues={{
//               username: "",
//               password: "",
//               email: "",
//               username: "",
//               password: "",
//               email: "",
//               showEmail: !isLogin, // Dynamically set based on isLogin
//             }}
//             validationSchema={formValidationSchema}
//             onSubmit={(values) =>
//               handleSubmit(values.username, values.password, values.email)
//             }
//           >
//             {(props) => {
//               return (
//                 <Form>
//                   {!isLogin && ( // Show email field only when not in login mode
//                     <TextField
//                       id="email"
//                       name="email"
//                       label="Email"
//                       margin="normal"
//                       fullWidth
//                       value={props.values.email}
//                       onChange={props.handleChange}
//                       onBlur={props.handleBlur}
//                       error={props.touched.email && Boolean(props.errors.email)}
//                       helperText={props.touched.email && props.errors.email}
//                     />
//                   )}
//                   <TextField
//                     id="username"
//                     name="username"
//                     label="Username"
//                     margin="normal"
//                     fullWidth
//                     value={props.values.username}
//                     onChange={props.handleChange}
//                     onBlur={props.handleBlur}
//                     error={
//                       props.touched.username && Boolean(props.errors.username)
//                     }
//                     helperText={props.touched.username && props.errors.username}
//                   />
//                   <TextField
//                     id="password"
//                     name="password"
//                     label="Password"
//                     type="password"
//                     margin="normal"
//                     fullWidth
//                     value={props.values.password}
//                     onChange={props.handleChange}
//                     onBlur={props.handleBlur}
//                     error={
//                       props.touched.password && Boolean(props.errors.password)
//                     }
//                     helperText={props.touched.password && props.errors.password}
//                   />
//                   <Button
//                     variant="contained"
//                     type="submit"
//                     color="primary"
//                     fullWidth
//                     style={{ marginTop: "16px" }}
//                     style={{ marginTop: "16px" }}
//                   >
//                     {t(isLogin ? "login.signIn" : "login.signUp")}
//                     {t(isLogin ? "login.signIn" : "login.signUp")}
//                   </Button>
//                   <Button
//                     variant="outlined"
//                     color="primary"
//                     fullWidth
//                     onClick={() => {
//                       props.values.showEmail = !props.values.showEmail;
//                       setIsLogin(!isLogin);
//                     }}
//                     style={{ marginTop: "16px" }}
//                     style={{ marginTop: "16px" }}
//                   >
//                     {isLogin
//                       ? t("login.signUp")
//                       : t("login.alreadyRegisteredQuestion")}
//                       ? t("login.signUp")
//                       : t("login.alreadyRegisteredQuestion")}
//                   </Button>
//                 </Form>
//               );
//             }}
//           </Formik>
//         </Box>
//       </Container>
//     </div>
//   );
// };

// export default Login;

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
} from "../../providers/SnackbarProvider.tsx";
import { useLoading } from "../../providers/LoadingProvider.tsx";
import { AxiosError } from "axios";
import { useSpeech } from "../../providers/SpeechProvider.tsx";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase.tsx";

const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const loader = useLoading();
  const authStatus = useAuthStatus(true);
  const loginRequest = useLogin();
  const registerRequest = useRegister();
  const { t } = useTranslation();
  const snackbar = useSnackbar();
  const speech = useSpeech();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  useEffect(() => {
    const handleSpeechLogin = async () => {
      try {
        // Helper function to handle the speak-and-listen flow
        const speakAndListen = async (prompt: string): Promise<string> => {
          return new Promise((resolve) => {
            // First, speak the prompt
            speech.speak(prompt, () => {
              // After speaking, start listening
              speech.startListening(async () => {
                // Once listening is complete, resolve the promise with the recognized text
                const result = speech.recognizedText.trim();
                speech.stopListening();
                resolve(result);
              });
            });
          });
        };

        // Step 1: Speak and listen for the email
        const capturedEmail = await speakAndListen("Please say your email.");
        setEmail(capturedEmail);
        console.log("Captured Email:", capturedEmail);

        // Step 2: Speak and listen for the password
        const capturedPassword = await speakAndListen(
          "Please say your password."
        );
        setPassword(capturedPassword);
        console.log("Captured Password:", capturedPassword);

        // Register the user with the captured email and password
        await registerUser(capturedEmail, capturedPassword);
      } catch (error) {
        console.error("Error during speech workflow:", error);
      }
    };

    // Trigger the speech login flow
    handleSpeechLogin();
  }, []);

  // setEmail(speech.recognizedText);

  // useEffect(() => {
  //   speech.speak("Enter your password",
  //     speech.startListening()
  //   );

  // }, []);
  // setPassword(speech.recognizedText);

  const [isLogin, setIsLogin] = useState(true);

  async function handleSubmit() {
    // Generate email and password if not provided
    // Call registerUser with generated credentials
    // await registerUser(generatedEmail, password);
  }

  // const generatedEmail = `${email}@gmail.com`;
  // const generatedPassword = password;

  // Register user function
  const registerUser = async (
    email: string,
    password: string
  ): Promise<void> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        `${email}@gmail.com`,
        password
      );
      console.log("User signed up:", userCredential.user);
    } catch (error: any) {
      console.error("Error during registration:", error.message);
    }
  };

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
            onSubmit={(values) => {}}
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
  );
};

export default Login;
