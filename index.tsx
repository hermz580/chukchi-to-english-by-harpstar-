
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Also select the new front door on static Vite deployments without Express.
if (window.location.pathname === '/') {
  window.location.replace('/chuukese/' + window.location.search + window.location.hash);
} else {
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
}
