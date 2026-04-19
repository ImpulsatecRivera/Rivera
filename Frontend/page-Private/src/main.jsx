import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './Context/authContext.jsx'; 
import axios from 'axios';
import { config } from './config';
import { initOfflineQueue } from './services/OfflineQueueService';

// Ensure cookies are included on all axios requests by default
axios.defaults.withCredentials = true;
axios.defaults.baseURL = config.api.API_URL;
initOfflineQueue(axios);

if (import.meta.env.PROD) {
  // Disable console.log in production builds.
  console.log = () => {};
  // Disable console.warn in production builds.
  console.warn = () => {};
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider> 
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
