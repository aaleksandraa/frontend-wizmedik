/**
 * WebSocket configuration utilities for HMR and development
 * Handles authentication token management and connection reliability
 */

export interface WebSocketConfig {
  host: string;
  port: number;
  secure: boolean;
  reconnectAttempts: number;
  reconnectInterval: number;
}

export interface HMRConfig extends WebSocketConfig {
  overlay: boolean;
  clientPort?: number;
}

/**
 * Default WebSocket configuration for development environment
 */
export const defaultWebSocketConfig: WebSocketConfig = {
  host: 'localhost',
  port: 5173,
  secure: false,
  reconnectAttempts: 5,
  reconnectInterval: 1000,
};

/**
 * Default HMR configuration
 */
export const defaultHMRConfig: HMRConfig = {
  ...defaultWebSocketConfig,
  overlay: false,
  clientPort: 5173,
};

/**
 * Generate WebSocket URL with proper authentication
 */
export function generateWebSocketURL(config: WebSocketConfig, token?: string): string {
  const protocol = config.secure ? 'wss' : 'ws';
  const baseUrl = `${protocol}://${config.host}:${config.port}`;
  
  if (token) {
    return `${baseUrl}?token=${encodeURIComponent(token)}`;
  }
  
  return baseUrl;
}

/**
 * Validate authentication token format
 */
export function isValidAuthToken(token: string): boolean {
  if (!token || token.length === 0) {
    return false;
  }
  
  // Basic validation: token should have some structure
  return token.includes('.') && token.length > 10;
}

/**
 * WebSocket connection manager with retry logic
 */
export class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private reconnectCount = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private listeners: { [key: string]: Function[] } = {};

  constructor(config: WebSocketConfig = defaultWebSocketConfig) {
    this.config = config;
  }

  /**
   * Connect to WebSocket with optional authentication
   */
  connect(token?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const url = generateWebSocketURL(this.config, token);
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
          this.reconnectCount = 0;
          this.emit('open');
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.emit('message', event);
        };

        this.ws.onerror = (error) => {
          this.emit('error', error);
          reject(error);
        };

        this.ws.onclose = () => {
          this.emit('close');
          this.handleReconnect(token);
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Handle automatic reconnection with exponential backoff
   */
  private handleReconnect(token?: string): void {
    if (this.reconnectCount >= this.config.reconnectAttempts) {
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectCount++;
    const delay = this.config.reconnectInterval * Math.pow(2, this.reconnectCount - 1);

    this.reconnectTimer = setTimeout(() => {
      this.connect(token).catch(() => {
        // Reconnection failed, will try again if under limit
      });
    }, delay);
  }

  /**
   * Send message through WebSocket
   */
  send(data: string): boolean {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(data);
      return true;
    }
    return false;
  }

  /**
   * Close WebSocket connection
   */
  close(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Add event listener
   */
  on(event: string, callback: Function): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  /**
   * Remove event listener
   */
  off(event: string, callback: Function): void {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }

  /**
   * Emit event to listeners
   */
  private emit(event: string, data?: any): void {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => callback(data));
    }
  }

  /**
   * Get current connection state
   */
  get readyState(): number {
    return this.ws ? this.ws.readyState : WebSocket.CLOSED;
  }

  /**
   * Check if connection is open
   */
  get isConnected(): boolean {
    return this.ws ? this.ws.readyState === WebSocket.OPEN : false;
  }
}