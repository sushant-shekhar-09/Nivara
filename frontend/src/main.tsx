import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// Enforce single light theme and clear any legacy theme keys
if (typeof document !== 'undefined') {
  document.documentElement.removeAttribute('data-theme');
  try {
    localStorage.removeItem('studentmind_theme');
  } catch {
    // Ignore storage errors
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
