import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./data/react-query.ts";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import MyFinThemeProvider from "./providers/MyFinThemeProvider.tsx";
import RoutesProvider from "./providers/RoutesProvider.tsx";
import { SpeechProvider, useSpeech } from "./providers/SpeechProvider.tsx";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function App() {

	const [speaking, setSpeaking] = useState<boolean>(false);
	// useEffect(()=> {
	//     let loop = async () => {
	//         if(!speaking)
	//             speak("Heyo", () => { setSpeaking(true) });
	//         else{
	//             startListening(async () => {
	//                 console.log(recognizedText.current);
	//             });
	//         }
	// } 
	// loop();
	// }, [speaking]);
	return (
			<MyFinThemeProvider>
				<QueryClientProvider client={queryClient}>
					<RoutesProvider />
					<ReactQueryDevtools initialIsOpen={false} />
				</QueryClientProvider>
			</MyFinThemeProvider>
	)
}

export default App
