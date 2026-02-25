import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { preloadCardSettings } from "./hooks/useCardSettings";
import { preloadSearchData } from "./hooks/useSmartSearch";
import "./utils/mobileScrollDebug";

// Import HMR setup for development
if (import.meta.env.DEV) {
  import("./dev/hmr-setup");
}

// Ensure React is available globally (fixes module loading issues on refresh)
if (typeof window !== 'undefined') {
  (window as any).React = React;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
  });
}

// PWA is temporarily disabled.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
      .then((results) => {
        if (results.some(Boolean)) {
          console.log('Service workers unregistered (PWA disabled).');
        }
      })
      .catch((error) => {
        console.log('Service worker cleanup failed:', error);
      });
  });
}

// Preload settings to avoid flash when rendering
preloadCardSettings();
preloadSearchData();

// Ensure root element exists before rendering
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

// Create root and render with error handling
try {
  createRoot(rootElement).render(<App />);
} catch (error) {
  console.error("Failed to render app:", error);
  // Fallback error display
  rootElement.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; padding: 20px; text-align: center;">
      <h1 style="color: #dc2626; margin-bottom: 16px;">Greška pri učitavanju aplikacije</h1>
      <p style="margin-bottom: 24px;">Molimo osvježite stranicu (Ctrl+Shift+R)</p>
      <button onclick="window.location.reload()" style="padding: 12px 24px; background: #0891b2; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px;">
        Osvježi stranicu
      </button>
    </div>
  `;
}

