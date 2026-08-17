import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router";
import './index.css'
import App from './App.tsx'
import {AuthProvider} from "./providers/auth/AuthProvider.tsx";
import {ThemeProvider} from "@/providers/theme/ThemeProvider.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <AuthProvider>
          <BrowserRouter>
              <ThemeProvider>
                  <App />
              </ThemeProvider>
          </BrowserRouter>
      </AuthProvider>
  </StrictMode>,
)
