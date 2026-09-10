import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router";
import './features/pwa/installPrompt';
import App from './App.tsx'
import './index.css'
import {AuthProvider} from "./providers/auth/AuthProvider.tsx";
import {ThemeProvider} from "@/providers/theme/ThemeProvider.tsx";
import {Toaster} from "@/components/ui/toast.tsx";
import {ProfileProvider} from "@/providers/profile/ProfileProvider.tsx";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <AuthProvider>
          <ProfileProvider>
              <BrowserRouter>
                  <ThemeProvider>
                      <App />
                      <Toaster />
                  </ThemeProvider>
              </BrowserRouter>
          </ProfileProvider>
      </AuthProvider>
  </StrictMode>,
)
