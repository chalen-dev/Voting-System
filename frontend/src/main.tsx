import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import {ThemeProvider} from "./contexts/ThemeContext.tsx";
import { BrowserRouter } from "react-router-dom";
import {AuthProvider} from "./contexts/AuthContext.tsx";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <QueryClientProvider client={queryClient}>
          <BrowserRouter>
              <AuthProvider>
                  <ThemeProvider>
                      <App />
                  </ThemeProvider>
              </AuthProvider>
          </BrowserRouter>
      </QueryClientProvider>
  </StrictMode>,
)
