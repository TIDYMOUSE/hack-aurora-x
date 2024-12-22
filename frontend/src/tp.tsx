import { useEffect, useState } from "react";
import { useSpeech } from "./providers/SpeechProvider";

export const Tp = () => {
  const { recognizedText, isListening, startListening, stopListening, speak } =
    useSpeech();
  const [id, setId] = useState<number>(0);
  const [userName, setUserName] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  useEffect(() => {
    let loop = () => {
      if (id == 0) {
        speak("Enter username", () => setId(1));
      } else if (id == 1) {
        startListening(async () => {
          console.log("username: ", recognizedText.current);
          setUserName(recognizedText.current);
          setId(2);
        });
      } else if (id == 2) {
        speak("Enter password", () => setId(3));
      } else if (id == 3) {
        startListening(async () => {
          console.log("password: ", recognizedText.current);
          setPassword(recognizedText.current);
          setId(4);
        });
      }
    };
    loop();
  }, [id]);

  // useEffect(() => {
  //     console.log(recognizedText);
  // }, [recognizedText])
  return (
    <>
      <div>{password}</div>
      <div>{userName}</div>
    </>
  );
};
