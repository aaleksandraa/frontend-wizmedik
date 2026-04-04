import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { preloadCardSettings } from "./hooks/useCardSettings";
import { preloadSearchData } from "./hooks/useSmartSearch";
import { scheduleLowPriorityWork } from "./utils/scheduleLowPriority";
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
    const cleanupServiceWorkers = () => {
      navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .catch(() => {
          // Old service worker cleanup is best-effort and should never affect startup.
        });
    };

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(cleanupServiceWorkers, { timeout: 3000 });
      return;
    }

    window.setTimeout(cleanupServiceWorkers, 1500);
  });
}

// Warm non-critical data after the first load so it does not compete with LCP.
if (typeof window !== "undefined") {
  const warmNonCriticalData = () => {
    scheduleLowPriorityWork(
      () => {
        void preloadCardSettings();
        void preloadSearchData();
      },
      { delay: 1500, skipOnSlowConnection: true, timeout: 2500 }
    );
  };

  if (document.readyState === "complete") {
    warmNonCriticalData();
  } else {
    window.addEventListener("load", warmNonCriticalData, { once: true });
  }
}

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

