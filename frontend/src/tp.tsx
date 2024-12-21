import { useEffect, useState } from "react";
import { useSpeech } from "./providers/SpeechProvider"

export const Tp = () => {
    const { recognizedText, isListening, startListening, stopListening, speak } = useSpeech();
    const [speaking, setSpeaking] = useState<boolean>(false);
    useEffect(()=> {
        let loop = async () => {
            if(!speaking)
                speak("Heyo", () => { setSpeaking(true) });
            else{
                startListening(async () => {
                    console.log(recognizedText.current);
                });
            }
    } 
    loop();
    }, [speaking]);

    // useEffect(() => {
    //     console.log(recognizedText);
    // }, [recognizedText])
    return <>
    HI
    </>
}