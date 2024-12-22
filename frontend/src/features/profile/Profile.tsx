import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Link,
  PaletteMode,
  useTheme,
} from "@mui/material";
import Box from "@mui/material/Box/Box";
import FormControl from "@mui/material/FormControl/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel/FormControlLabel";
import Paper from "@mui/material/Paper/Paper";
import Radio from "@mui/material/Radio/Radio";
import RadioGroup from "@mui/material/RadioGroup/RadioGroup";
import Stack from "@mui/material/Stack/Stack";
import PageHeader from "../../components/PageHeader.tsx";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import React, { useContext, useEffect, useState } from "react";
import Typography from "@mui/material/Typography/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Grid from "@mui/material/Unstable_Grid2/Grid2";
import { ColorModeContext } from "../../providers/MyFinThemeProvider.tsx";
import UserStatList from "./UserStatList.tsx";
import Utilities from "./Utilities.tsx";
import ChangePasswordForm from "./ChangePasswordForm.tsx";
import { useSpeech } from "../../providers/SpeechProvider.tsx";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const theme = useTheme();
  const { t } = useTranslation();
  const colorMode = useContext(ColorModeContext);
  const [language, setLanguage] = useState(i18next.resolvedLanguage || "en");
  const [currentTheme, setTheme] = useState<PaletteMode>(
    theme.palette.mode || "dark"
  );

  useEffect(() => {
    colorMode.setColorMode(currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    i18next.changeLanguage(language);
  }, [language]);

  function handleLanguageChange(event: React.ChangeEvent<HTMLInputElement>) {
    setLanguage(event.currentTarget.value);
  }

  function handleThemeChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTheme(event.currentTarget.value as PaletteMode);
  }
  const { startListening, recognizedText, speak } = useSpeech();
  const navigate = useNavigate();

  return (
    <>
      <div
        onMouseDown={(ev) => {
          if (ev.button == 1) {
            ev.preventDefault();
            startListening(async () => {
              console.log(recognizedText.current);
              fetch("http://localhost:8000/api/talk", {
                method: "POST", // Specify GET method
                headers: {
                  "Content-Type": "application/json", // Optional, for JSON payload
                },
                body: JSON.stringify({ message: recognizedText.current }), // Include a body (not typical for GET)
              }).then(async (res) => {
                // console.log(res);
                // console.log(await res.json());
                let data = await res.json();
                console.log(data);
                let func_name = data.command.substring(4);
                speak(data.response);
                if (data.command.substring(0, 3) == "Nav") {
                  navigate("/" + func_name.toLowerCase());
                } 
                else if (func_name.includes(";")){ 
                
                  let [functionName, arg] = func_name.split(";").map((part:string) => part.trim()); 
                  console.log("Extracted function name:", functionName);
                  console.log("Extracted argument:", arg);
                  window[functionName](arg); 
                }
                else {
                  window[func_name]();
                }
                console.log(func_name);
                // console.log(window);
              });
            });
          }
        }}
      >
        <Paper elevation={0} sx={{ p: theme.spacing(2), m: theme.spacing(2) }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <PageHeader
              title={t("profile.profileManagement")}
              subtitle={t("profile.strapLine")}
            />
          </Box>
          <Stack spacing={2} alignItems="flex-start">
            {/* Change language */}
            <Accordion sx={{ width: "100%", maxWidth: "700px" }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="language-content"
                id="language-header"
              >
                <Grid container xs={12}>
                  <Grid xs={6} spacing={1}>
                    <Typography>{t("profile.changeLanguage")}</Typography>
                  </Grid>
                  <Grid xs={6}>
                    <Typography sx={{ color: "text.secondary" }}>
                      {t("profile.changeLanguageStrapLine")}
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl>
                  <RadioGroup
                    value={language}
                    name="radio-buttons-group"
                    onChange={handleLanguageChange}
                  >
                    <FormControlLabel
                      value="pt"
                      control={<Radio />}
                      label="Português (pt-PT)"
                    />
                    <FormControlLabel
                      value="en"
                      control={<Radio />}
                      label="English"
                    />
                  </RadioGroup>
                </FormControl>
              </AccordionDetails>
            </Accordion>
            {/* Change theme */}
            <Accordion sx={{ width: "100%", maxWidth: "700px" }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="theme-content"
                id="theme-header"
              >
                <Grid container xs={12}>
                  <Grid xs={6} spacing={1}>
                    <Typography>{t("profile.changeTheme")}</Typography>
                  </Grid>
                  <Grid xs={6}>
                    <Typography sx={{ color: "text.secondary" }}>
                      {t("profile.changeThemeStrapLine")}
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <FormControl>
                  <RadioGroup
                    value={currentTheme}
                    name="theme-radio-buttons-group"
                    onChange={handleThemeChange}
                  >
                    <FormControlLabel
                      value="light"
                      control={<Radio />}
                      label={t("profile.lightTheme")}
                    />
                    <FormControlLabel
                      value="dark"
                      control={<Radio />}
                      label={t("profile.darkTheme")}
                    />
                  </RadioGroup>
                </FormControl>
              </AccordionDetails>
            </Accordion>
            {/* Change password */}
            <Accordion sx={{ width: "100%", maxWidth: "700px" }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="password-content"
                id="password-header"
              >
                <Grid container xs={12}>
                  <Grid xs={6} spacing={1}>
                    <Typography>{t("profile.changePassword")}</Typography>
                  </Grid>
                  <Grid xs={6}>
                    <Typography sx={{ color: "text.secondary" }}>
                      {t("profile.changePasswordStrapLine")}
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <ChangePasswordForm />
              </AccordionDetails>
            </Accordion>
            {/* Utilities */}
            <Accordion sx={{ width: "100%", maxWidth: "700px" }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="tools-content"
                id="tools-header"
              >
                <Grid container xs={12}>
                  <Grid xs={6} spacing={1}>
                    <Typography>{t("profile.tools")}</Typography>
                  </Grid>
                  <Grid xs={6}>
                    <Typography sx={{ color: "text.secondary" }}>
                      {t("profile.toolsStrapLine")}
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <Utilities />
              </AccordionDetails>
            </Accordion>
            {/* Stats for nerds */}
            <Accordion sx={{ width: "100%", maxWidth: "700px" }}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="stats-content"
                id="stats-header"
              >
                <Grid container xs={12}>
                  <Grid xs={6} spacing={1}>
                    <Typography>{t("profile.statsForNerds")}</Typography>
                  </Grid>
                  <Grid xs={6}>
                    <Typography sx={{ color: "text.secondary" }}>
                      {t("profile.statsForNerdsStrapLine")}
                    </Typography>
                  </Grid>
                </Grid>
              </AccordionSummary>
              <AccordionDetails>
                <UserStatList />
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Paper>
        <Box display="flex" justifyContent="center">
          <Typography variant="caption">
            {t("profile.version")}:{" "}
            <Link
              href="https://github.com/afaneca/myfin/releases"
              target="_blank"
              rel="noopener"
            >
              {import.meta.env.PACKAGE_VERSION}
            </Link>
          </Typography>
        </Box>
      </div>
    </>
  );
};

export default Profile;
