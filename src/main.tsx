import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router";
import './index.css'
import App from './App.tsx'
import {AuthProvider} from "./providers/auth/AuthProvider.tsx";
import {ThemeProvider} from "@/providers/theme/ThemeProvider.tsx";
import {Toaster} from "@/components/ui/toast.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <AuthProvider>
          <BrowserRouter>
              <ThemeProvider>
                  <App />
                  <Toaster />
              </ThemeProvider>
          </BrowserRouter>
      </AuthProvider>
  </StrictMode>,
)
