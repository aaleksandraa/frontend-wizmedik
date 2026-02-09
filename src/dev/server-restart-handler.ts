/**
 * Server Restart Handler
 * Handles automatic reconnection when development servers restart
 */

interface ServerRestartConfig {
  maxRetries: number;
  retryDelay: number;
  backoffMultiplier: number;
}

const DEFAULT_CONFIG: ServerRestartConfig = {
  maxRetries: 10,
  retryDelay: 1000, // 1 second
  backoffMultiplier: 1.5,
};

export class ServerRestartHandler {
  private config: ServerRestartConfig;
  private retryCount: number = 0;
  private isReconnecting: boolean = false;

  constructor(config: Partial<ServerRestartConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Handle server restart by attempting to reconnect
   */
  async handleRestart(
    checkConnection: () => Promise<boolean>,
    onSuccess?: () => void,
    onFailure?: (error: Error) => void
  ): Promise<boolean> {
    if (this.isReconnecting) {
      return false;
    }

    this.isReconnecting = true;
    this.retryCount = 0;

    try {
      const connected = await this.attemptReconnection(checkConnection);
      
      if (connected) {
        onSuccess?.();
        return true;
      } else {
        const error = new Error('Failed to reconnect after maximum retries');
        onFailure?.(error);
        return false;
      }
    } finally {
      this.isReconnecting = false;
    }
  }

  private async attemptReconnection(
    checkConnection: () => Promise<boolean>
  ): Promise<boolean> {
    while (this.retryCount < this.config.maxRetries) {
      try {
        const isConnected = await checkConnection();
        
        if (isConnected) {
          console.log('[Server] Reconnected successfully');
          return true;
        }
      } catch (error) {
        console.log(`[Server] Reconnection attempt ${this.retryCount + 1} failed`);
      }

      this.retryCount++;
      
      if (this.retryCount < this.config.maxRetries) {
        const delay = this.calculateDelay();
        console.log(`[Server] Retrying in ${delay}ms...`);
        await this.sleep(delay);
      }
    }

    return false;
  }

  private calculateDelay(): number {
    return Math.floor(
      this.config.retryDelay * Math.pow(this.config.backoffMultiplier, this.retryCount)
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  reset(): void {
    this.retryCount = 0;
    this.isReconnecting = false;
  }
}

/**
 * Check if backend API is available
 */
export async function checkBackendConnection(): Promise<boolean> {
  try {
    const response = await fetch('/api/health', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Check if Vite dev server is available
 */
export async function checkViteConnection(): Promise<boolean> {
  try {
    // Check if we can reach the Vite server
    const response = await fetch('/', {
      method: 'HEAD',
    });
    return response.ok;
  } catch {
    return false;
  }
}
