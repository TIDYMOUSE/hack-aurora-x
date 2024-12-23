import { Step, StepButton, Stepper, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import Box from "@mui/material/Box/Box";
import PageHeader from "../../../components/PageHeader.tsx";
import Paper from "@mui/material/Paper/Paper";
import ImportTrxStep0 from "./ImportTrxStep0.tsx";
import ImportTrxStep1, { ImportTrxStep1Result } from "./ImportTrxStep1.tsx";
import ImportTrxStep2, { ImportTrxStep2Result } from "./ImportTrxStep2.tsx";
import ImportTrxStep3 from "./ImportTrxStep3.tsx";
import { useNavigate } from "react-router-dom";
import { useSpeech } from "../../../providers/SpeechProvider.tsx";

const ImportTransactions = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  const steps = [
    t("importTransactions.step0Label"),
    t("importTransactions.step1Label"),
    t("importTransactions.step2Label"),
    t("importTransactions.step3Label"),
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [completed, _setCompleted] = useState<{
    [k: number]: boolean;
  }>({});
  const [clipboardText, setClipboardText] = useState("");
  const [step1Result, setStep1Result] = useState<ImportTrxStep1Result | null>(
    null
  );
  const [step2Result, setStep2Result] = useState<ImportTrxStep2Result | null>(
    null
  );
  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <ImportTrxStep0
            onNext={(clipboardText: string) => {
              setClipboardText(clipboardText);
              setCurrentStep(1);
            }}
          />
        );
      case 1:
        return (
          <ImportTrxStep1
            clipboardText={clipboardText}
            onNext={(result) => {
              setStep1Result(result);
              setCurrentStep(2);
            }}
          />
        );
      case 2:
        if (step1Result) {
          return (
            <ImportTrxStep2
              data={step1Result}
              onNext={(result) => {
                setStep2Result({
                  nrOfTrxImported: result.nrOfTrxImported,
                  accountName: result.accountName,
                });
                setCurrentStep(3);
              }}
            />
          );
        }
        break;
      case 3:
        return (
          <ImportTrxStep3
            nrOfTrxImported={step2Result?.nrOfTrxImported || 0}
            accountName={step2Result?.accountName || ""}
          />
        );
      default:
        return null;
    }
  };

  const navigate = useNavigate();
  const { startListening, recognizedText, speak } = useSpeech();

  return (
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
          flexDirection="column"
        >
          <PageHeader
            title={t("importTransactions.importTransactions")}
            subtitle={t("importTransactions.strapLine")}
          />
        </Box>
        <Box sx={{ mt: theme.spacing(0), mb: theme.spacing(2) }}>
          <Stepper activeStep={currentStep}>
            {steps.map((label, index) => (
              <Step key={label} completed={completed[index]}>
                <StepButton color="inherit" onClick={() => {}}>
                  {label}
                </StepButton>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box sx={{ mt: theme.spacing(0), mb: theme.spacing(2) }}>
          {renderStepContent(currentStep)}
        </Box>
      </Paper>
    </div>
  );
};

export default ImportTransactions;
