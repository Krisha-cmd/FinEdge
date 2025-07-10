import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './styles/main.css';

// Silence all console errors in production
if (process.env.NODE_ENV === 'production') {
    console.error = () => {};
}

// Global error handler
window.onerror = (message, source, lineno, colno, error) => {
    // Silently log errors
    console.error({
        message,
        source,
        lineno,
        colno,
        error
    });
    // Prevent error from showing to user
    return true;
};

window.addEventListener('unhandledrejection', (event) => {
  event.preventDefault();
  console.error('Global handler:', event.reason);
});


// Handle unhandled promise rejections
window.onunhandledrejection = (event) => {
    // Prevent error from showing to user
    event.preventDefault();
    // Silently log error
    console.error('Unhandled promise rejection:', event.reason);
    return true;
};

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);