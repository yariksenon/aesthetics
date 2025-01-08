import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const reactRoot = document.getElementById('root')

createRoot(reactRoot).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
