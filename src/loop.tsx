import { useEffect, useState } from "react";
import { useSpeech } from "./providers/SpeechProvider";

// Event Loop Component
const SpeechLoop = () => {
  const { speak, startListening, stopListening, recognizedText } = useSpeech();
  const [currentStep, setCurrentStep] = useState<"speak" | "listen">("speak");
  const staticResponses = [
    "Welcome to the application.",
    "Please tell me what you need.",
    "What would you like to do next?",
    "Your input is important to us.",
  ];

  useEffect(() => {
    const loop = async () => {
      if (currentStep === "speak") {
        const randomMessage =
          staticResponses[Math.floor(Math.random() * staticResponses.length)];
        speak(randomMessage, () => setCurrentStep("listen"));
      } else if (currentStep === "listen") {
        startListening(() => setCurrentStep("speak")); // Pass the callback here
      }
    };

    loop();
  }, [currentStep]);

  return (
    <div>
      <h1>Speech Recognition and Synthesis Loop</h1>
      <p>
        <strong>Recognized Text:</strong> {recognizedText}
      </p>
      <button onClick={() => setCurrentStep("speak")}>Restart Loop</button>
      <button onClick={() => stopListening()}>Stop Listening</button>
    </div>
  );
};

export default SpeechLoop;
