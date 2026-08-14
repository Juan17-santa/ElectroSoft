import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { ToastProvider } from './context/ToastContext'

// Interceptar fetch para agregar el token automáticamente
const originalFetch = window.fetch;
window.fetch = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    
    if (token && typeof url === "string" && url.includes("localhost:4000")) {
        options.headers = {
            ...options.headers,
            "Authorization": `Bearer ${token}`,
        };
    }
    
    return originalFetch(url, options);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <App />
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)