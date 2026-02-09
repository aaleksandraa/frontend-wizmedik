/**
 * Development Environment Stability
 * Coordinates server restart handling, config hot-reloading, and API proxy monitoring
 */

import { ServerRestartHandler, checkBackendConnection, checkViteConnection } from './server-restart-handler';
import { ConfigHotReloader, loadRuntimeConfig, applyConfigChanges } from './config-hot-reload';
import { ApiProxyMonitor, getProxyMonitor } from './api-proxy-monitor';

export interface DevEnvironmentConfig {
  enableServerRestart: boolean;
  enableConfigHotReload: boolean;
  enableProxyMonitoring: boolean;
  serverRestartMaxRetries?: number;
  configPollInterval?: number;
  proxyMonitorInterval?: number;
}

const DEFAULT_CONFIG: DevEnvironmentConfig = {
  enableServerRestart: true,
  enableConfigHotReload: true,
  enableProxyMonitoring: true,
  serverRestartMaxRetries: 10,
  configPollInterval: 2000,
  proxyMonitorInterval: 5000,
};

export class DevEnvironmentStabilityManager {
  private config: DevEnvironmentConfig;
  private serverRestartHandler: ServerRestartHandler;
  private configHotReloader: ConfigHotReloader;
  private proxyMonitor: ApiProxyMonitor;
  private isInitialized: boolean = false;

  constructor(config: Partial<DevEnvironmentConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    this.serverRestartHandler = new ServerRestartHandler({
      maxRetries: this.config.serverRestartMaxRetries,
    });

    this.configHotReloader = new ConfigHotReloader({
      pollInterval: this.config.configPollInterval,
      onConfigChange: applyConfigChanges,
    });

    this.proxyMonitor = getProxyMonitor();
  }

  /**
   * Initialize development environment stability features
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    console.log('[DevEnv] Initializing development environment stability...');

    // Start config hot-reloading
    if (this.config.enableConfigHotReload) {
      this.configHotReloader.startWatching(loadRuntimeConfig);
      console.log('[DevEnv] Configuration hot-reloading enabled');
    }

    // Start proxy monitoring
    if (this.config.enableProxyMonitoring) {
      this.proxyMonitor.startMonitoring(this.config.proxyMonitorInterval);
      console.log('[DevEnv] API proxy monitoring enabled');
    }

    // Setup server restart detection
    if (this.config.enableServerRestart) {
      this.setupServerRestartDetection();
      console.log('[DevEnv] Server restart handling enabled');
    }

    this.isInitialized = true;
    console.log('[DevEnv] Development environment stability initialized');
  }

  /**
   * Setup automatic server restart detection and handling
   */
  private setupServerRestartDetection(): void {
    // Only setup in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Listen for fetch errors that might indicate server restart
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      try {
        return await originalFetch(...args);
      } catch (error) {
        // Check if this is a network error that might indicate server restart
        if (error instanceof TypeError && error.message.includes('fetch')) {
          console.log('[DevEnv] Detected potential server restart, attempting reconnection...');
          
          await this.serverRestartHandler.handleRestart(
            checkBackendConnection,
            () => {
              console.log('[DevEnv] Backend reconnected successfully');
              // Retry the original request
            },
            (err) => {
              console.error('[DevEnv] Failed to reconnect to backend:', err);
            }
          );
        }
        throw error;
      }
    };

    // Listen for WebSocket disconnections
    if (import.meta.hot) {
      import.meta.hot.on('vite:ws:disconnect', () => {
        console.log('[DevEnv] Vite WebSocket disconnected, attempting reconnection...');
        
        this.serverRestartHandler.handleRestart(
          checkViteConnection,
          () => {
            console.log('[DevEnv] Vite server reconnected successfully');
            window.location.reload();
          },
          (err) => {
            console.error('[DevEnv] Failed to reconnect to Vite server:', err);
          }
        );
      });
    }
  }

  /**
   * Shutdown all stability features
   */
  shutdown(): void {
    if (!this.isInitialized) {
      return;
    }

    this.configHotReloader.stopWatching();
    this.proxyMonitor.stopMonitoring();
    this.serverRestartHandler.reset();
    
    this.isInitialized = false;
    console.log('[DevEnv] Development environment stability shutdown');
  }

  /**
   * Get current status of all stability features
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      config: this.config,
      proxyHealth: this.proxyMonitor.getHealthStatus(),
      currentConfig: this.configHotReloader.getCurrentConfig(),
    };
  }

  /**
   * Manually trigger server reconnection
   */
  async reconnectToBackend(): Promise<boolean> {
    return await this.serverRestartHandler.handleRestart(checkBackendConnection);
  }

  /**
   * Manually trigger Vite reconnection
   */
  async reconnectToVite(): Promise<boolean> {
    return await this.serverRestartHandler.handleRestart(checkViteConnection);
  }

  /**
   * Test all proxy functionality
   */
  async testProxyFunctionality(): Promise<{
    endpointTest: boolean;
    corsTest: boolean;
    authTest: boolean;
  }> {
    return {
      endpointTest: await this.proxyMonitor.testProxyEndpoint('/api/health'),
      corsTest: await this.proxyMonitor.verifyCorsHandling(),
      authTest: await this.proxyMonitor.verifyAuthHandling(),
    };
  }
}

/**
 * Global instance for development environment stability
 */
let globalDevEnvManager: DevEnvironmentStabilityManager | null = null;

export function getDevEnvironmentManager(): DevEnvironmentStabilityManager {
  if (!globalDevEnvManager) {
    globalDevEnvManager = new DevEnvironmentStabilityManager();
  }
  return globalDevEnvManager;
}

/**
 * Initialize development environment stability (call this in main.tsx)
 */
export async function initializeDevEnvironment(): Promise<void> {
  if (import.meta.env.DEV) {
    const manager = getDevEnvironmentManager();
    await manager.initialize();
  }
}
