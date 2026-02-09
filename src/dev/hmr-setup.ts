/**
 * Development environment HMR setup
 * Configures WebSocket connections for hot module replacement
 */

import { WebSocketManager, defaultHMRConfig } from '../utils/websocket-config';

/**
 * Initialize HMR WebSocket connection for development
 */
export function initializeHMR(): WebSocketManager {
  const wsManager = new WebSocketManager(defaultHMRConfig);

  // Set up HMR-specific event handlers
  wsManager.on('open', () => {
    console.log('[HMR] WebSocket connected successfully');
  });

  wsManager.on('message', (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'update') {
        console.log('[HMR] Received update:', data.updates);
        handleHMRUpdate(data.updates);
      } else if (data.type === 'full-reload') {
        console.log('[HMR] Full reload requested');
        window.location.reload();
      }
    } catch (error) {
      console.warn('[HMR] Failed to parse message:', error);
    }
  });

  wsManager.on('error', (error: Event) => {
    console.error('[HMR] WebSocket error:', error);
  });

  wsManager.on('close', () => {
    console.log('[HMR] WebSocket connection closed, attempting reconnect...');
  });

  wsManager.on('maxReconnectAttemptsReached', () => {
    console.error('[HMR] Max reconnection attempts reached. Please refresh the page.');
  });

  return wsManager;
}

/**
 * Handle HMR update messages
 */
function handleHMRUpdate(updates: any[]): void {
  updates.forEach(update => {
    if (update.type === 'js-update') {
      console.log(`[HMR] Updating ${update.path}`);
      // In a real implementation, this would trigger module reloading
    } else if (update.type === 'css-update') {
      console.log(`[HMR] Updating CSS ${update.path}`);
      // In a real implementation, this would update stylesheets
    }
  });
}

/**
 * Check if we're in development mode and HMR should be enabled
 */
export function shouldEnableHMR(): boolean {
  return import.meta.env.DEV && import.meta.env.MODE === 'development';
}

/**
 * Initialize HMR if in development mode
 */
if (shouldEnableHMR()) {
  const hmrManager = initializeHMR();
  
  // Connect to HMR WebSocket
  hmrManager.connect().catch(error => {
    console.error('[HMR] Failed to connect:', error);
  });

  // Make available globally for debugging
  (window as any).__HMR_MANAGER__ = hmrManager;
}