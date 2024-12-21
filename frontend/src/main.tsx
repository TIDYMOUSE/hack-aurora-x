import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { SpeechProvider } from './providers/SpeechProvider.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <SpeechProvider>
    <App />
  </SpeechProvider>
  // {/* </React.StrictMode>, */}
)
