import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initSentry } from './config/sentry'

// Initialize error monitoring (A09: Security Logging and Monitoring)
initSentry()

// Mount the app directly without MSW
// The app will connect to the real backend via Vite proxy
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
