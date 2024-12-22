import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
} from "react";

interface SpeechContextProps {
  recognizedText: React.MutableRefObject<string>;
  isListening: boolean;
  startListening: (onSpeechEnd?: () => Promise<void>) => void;
  stopListening: () => void;
  speak: (text: string, onComplete?: () => void) => void;
}

const SpeechContext = createContext<SpeechContextProps | undefined>(undefined);

export const SpeechProvider = ({ children }: { children: ReactNode }) => {
  const recognizedText = useRef<string>("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  let result = "";
  const startListening = async (onSpeechEnd?: () => Promise<void>) => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      alert("Speech Recognition API is not supported in your browser.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false; // Stops after one result

    recognition.onstart = () => {
      setIsListening(true);
      console.log("Speech Recognition Started");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[event.resultIndex][0].transcript;
      recognizedText.current = transcript;
      console.log("Recognized Text:", recognizedText.current);
    };

    recognition.onspeechend = () => {
      console.log("Speech detected has ended.");
      recognition.stop();
    };

    recognition.onend = async () => {
      console.log("Speech Recognition Session Ended");
      setIsListening(false);
      if (onSpeechEnd) {
        try {
          await onSpeechEnd(); // Await the async function
        } catch (error) {
          console.error("Error in onSpeechEnd callback:", error);
        }
      }
      return recognizedText;
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error("Speech Recognition Error:", event.error);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    console.log("Speech Recognition Stopped");
  };

  const speak = (text: string, onComplete?: () => void) => {
    if (!("speechSynthesis" in window)) {
      alert("Speech Synthesis API is not supported in your browser.");
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;

    utterance.onstart = () => console.log("Speech synthesis started.");
    utterance.onend = () => {
      console.log("Speech synthesis ended.");
      if (onComplete) onComplete();
    };

    speechSynthesis.speak(utterance);
  };


  return (
    <SpeechContext.Provider
      value={{
        recognizedText,
        isListening,
        startListening,
        stopListening,
        speak,
      }}
    >
      {children}
    </SpeechContext.Provider>
  );
};

export const useSpeech = (): SpeechContextProps => {
  const context = useContext(SpeechContext);
  if (!context) {
    throw new Error("useSpeech must be used within a SpeechProvider");
  }
  return context;
};
