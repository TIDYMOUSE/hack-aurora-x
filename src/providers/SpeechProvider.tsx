import React, { createContext, useContext, useState, useRef, ReactNode } from 'react';

interface SpeechContextProps {
  recognizedText: string;
  isListening: boolean;
  startListening: () => void;
  stopListening: () => void;
  speak: (text: string) => void;
}

const SpeechContext = createContext<SpeechContextProps | undefined>(undefined);

export const SpeechProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [recognizedText, setRecognizedText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech Recognition API is not supported in your browser.');
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = true;

    recognition.onstart = () => {
      setIsListening(true);
      console.log('Speech Recognition Started');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[event.resultIndex][0].transcript;
      setRecognizedText((prev) => `${prev} ${transcript}`);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech Recognition Error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      console.log('Speech Recognition Ended');
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    console.log('Speech Recognition Stopped');
  };

  const speak = (text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Speech Synthesis API is not supported in your browser.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;

    utterance.onstart = () => console.log('Speech synthesis started.');
    utterance.onend = () => console.log('Speech synthesis ended.');

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
    throw new Error('useSpeech must be used within a SpeechProvider');
  }
  return context;
};
