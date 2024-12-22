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
  setLanguage: () => void;
}

const SpeechContext = createContext<SpeechContextProps | undefined>(undefined);

export const SpeechProvider = ({ children }: { children: ReactNode }) => {
  const recognizedText = useRef<string>("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [lang, setLang] = useState<number>(0);
  const mapping = ["en-US", "hi-IN"];
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
    recognition.lang = mapping[lang];
    recognition.onstart = () => {
      setIsListening(true);
      console.log("Speech Recognition Started");
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[event.resultIndex][0].transcript;
      recognizedText.current = transcript;
      console.log("recog" + recognition.lang);
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
    utterance.lang = mapping[lang];
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;
    console.log("utt" + utterance.lang);
    // let ss = new SpeechSynthesis();
    // let voices = ss.getVoices();
    // const hindiVoice = voices.find((voice) => voice.lang === "hi-IN");
    // if (hindiVoice && utterance.lang == "hi-IN") {
    //   utterance.voice = hindiVoice; // Use the Hindi voice
    // }
    utterance.onstart = () => console.log("Speech synthesis started.");
    utterance.onend = () => {
      console.log("Speech synthesis ended.");
      if (onComplete) onComplete();
    };

    speechSynthesis.speak(utterance);
  };

  let setLanguage = () => {
    setLang((prev)=> (prev + 1) % 2);
  }

  return (
    <SpeechContext.Provider
      value={{
        recognizedText,
        isListening,
        startListening,
        stopListening,
        speak,
        setLanguage
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
