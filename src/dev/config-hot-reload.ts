/**
 * Configuration Hot-Reloading
 * Watches for configuration changes and applies them without full restart
 */

interface ConfigWatcherOptions {
  pollInterval: number;
  onConfigChange?: (config: any) => void;
}

const DEFAULT_OPTIONS: ConfigWatcherOptions = {
  pollInterval: 2000, // 2 seconds
};

export class ConfigHotReloader {
  private options: ConfigWatcherOptions;
  private currentConfig: any = null;
  private watchInterval: NodeJS.Timeout | null = null;
  private isWatching: boolean = false;

  constructor(options: Partial<ConfigWatcherOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Start watching for configuration changes
   */
  startWatching(configLoader: () => Promise<any>): void {
    if (this.isWatching) {
      return;
    }

    this.isWatching = true;

    // Load initial config
    configLoader().then(config => {
      this.currentConfig = config;
    });

    // Poll for changes
    this.watchInterval = setInterval(async () => {
      try {
        const newConfig = await configLoader();
        
        if (this.hasConfigChanged(newConfig)) {
          console.log('[Config] Configuration changed, applying updates...');
          this.currentConfig = newConfig;
          this.options.onConfigChange?.(newConfig);
        }
      } catch (error) {
        console.error('[Config] Error checking configuration:', error);
      }
    }, this.options.pollInterval);
  }

  /**
   * Stop watching for configuration changes
   */
  stopWatching(): void {
    if (this.watchInterval) {
      clearInterval(this.watchInterval);
      this.watchInterval = null;
    }
    this.isWatching = false;
  }

  /**
   * Check if configuration has changed
   */
  private hasConfigChanged(newConfig: any): boolean {
    if (!this.currentConfig) {
      return true;
    }

    return JSON.stringify(this.currentConfig) !== JSON.stringify(newConfig);
  }

  getCurrentConfig(): any {
    return this.currentConfig;
  }
}

/**
 * Load runtime configuration from environment or API
 */
export async function loadRuntimeConfig(): Promise<any> {
  try {
    // In development, we can load config from a special endpoint
    const response = await fetch('/api/config', {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    if (response.ok) {
      return await response.json();
    }
  } catch {
    // Fallback to environment variables
  }

  // Return default config based on environment
  return {
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:5173',
    environment: import.meta.env.MODE || 'development',
  };
}

/**
 * Apply configuration changes to the application
 */
export function applyConfigChanges(config: any): void {
  // Update any runtime configuration that can be changed without restart
  console.log('[Config] Applying configuration changes:', config);
  
  // Dispatch custom event for components to react to config changes
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('config-updated', { detail: config }));
  }
}
