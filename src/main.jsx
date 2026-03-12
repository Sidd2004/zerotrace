import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/hooks/useAuth';
import ErrorBoundary from '@/components/ErrorBoundary';
import App from './App';
import '@/styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#0f0f11',
                color: '#f0f0f0',
                border: '1px solid #1a1a1f',
                borderRadius: '12px',
                fontFamily: 'Poppins, sans-serif',
              },
              success: {
                iconTheme: { primary: '#22c55e', secondary: '#0f0f11' },
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#0f0f11' },
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
);
