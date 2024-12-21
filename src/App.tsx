import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./data/react-query.ts";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import MyFinThemeProvider from "./providers/MyFinThemeProvider.tsx";
import RoutesProvider from "./providers/RoutesProvider.tsx";
import "./i18n.ts"
import {SpeechProvider} from "./providers/SpeechProvider.tsx";

function App() {
    return (
	<SpeechProvider>
		<MyFinThemeProvider>
		    <QueryClientProvider client={queryClient}>
			<RoutesProvider />
			<ReactQueryDevtools initialIsOpen={false} />
		    </QueryClientProvider>
		</MyFinThemeProvider>
	</SpeechProvider>
    )
}

export default App
