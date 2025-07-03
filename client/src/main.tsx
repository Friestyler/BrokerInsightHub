import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add global error handling to prevent unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.warn('Unhandled promise rejection prevented:', event.reason);
  // Prevent the error from reaching the runtime error plugin
  event.preventDefault();
});

// Add global error handling for regular errors
window.addEventListener('error', (event) => {
  console.warn('Global error caught:', event.error);
  // Only prevent timeout-related errors from propagating
  if (event.error?.message?.includes('timeout') || 
      event.error?.name === 'AbortError' ||
      event.error?.message?.includes('Request timeout')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
