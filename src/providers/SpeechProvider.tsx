import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  ReactNode,
} from "react";

interface SpeechContextProps {
  recognizedText: string;
  isListening: boolean;
  startListening: (onSpeechEnd?: () => void) => void;
  stopListening: () => void;
  speak: (text: string, onComplete?: () => void) => void;
}

const SpeechContext = createContext<SpeechContextProps | undefined>(undefined);

export const SpeechProvider = ({ children }: { children: ReactNode }) => {
  const [recognizedText, setRecognizedText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = (onSpeechEnd?: () => void) => {
    if (
      !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      alert("Speech Recognition API is not supported in your browser.");
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false; // Stops after one result

    recognition.onstart = () => {
      setIsListening(true);
      console.log("Speech Recognition Started");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[event.resultIndex][0].transcript;
      setRecognizedText((prev) => `${prev} ${transcript}`);
      console.log("Recognized Text:", transcript);
    };

    recognition.onspeechend = () => {
      console.log("Speech detected has ended.");
      recognition.stop();
    };

    recognition.onend = () => {
      console.log("Speech Recognition Session Ended");
      setIsListening(false);
      if (onSpeechEnd) onSpeechEnd(); // Call the callback after ending
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
