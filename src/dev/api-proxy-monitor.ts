/**
 * API Proxy Monitor
 * Ensures API proxy works correctly under all conditions
 */

interface ProxyHealthCheck {
  isHealthy: boolean;
  latency: number;
  lastCheck: Date;
  error?: string;
}

export class ApiProxyMonitor {
  private healthStatus: ProxyHealthCheck = {
    isHealthy: false,
    latency: 0,
    lastCheck: new Date(),
  };
  private checkInterval: NodeJS.Timeout | null = null;
  private isMonitoring: boolean = false;

  /**
   * Start monitoring API proxy health
   */
  startMonitoring(intervalMs: number = 5000): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;

    // Initial check
    this.checkProxyHealth();

    // Periodic checks
    this.checkInterval = setInterval(() => {
      this.checkProxyHealth();
    }, intervalMs);
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isMonitoring = false;
  }

  /**
   * Check if API proxy is working correctly
   */
  private async checkProxyHealth(): Promise<void> {
    const startTime = Date.now();

    try {
      const response = await fetch('/api/health', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      const latency = Date.now() - startTime;

      if (response.ok) {
        this.healthStatus = {
          isHealthy: true,
          latency,
          lastCheck: new Date(),
        };
        console.log(`[Proxy] Health check passed (${latency}ms)`);
      } else {
        this.healthStatus = {
          isHealthy: false,
          latency,
          lastCheck: new Date(),
          error: `HTTP ${response.status}: ${response.statusText}`,
        };
        console.warn(`[Proxy] Health check failed: ${this.healthStatus.error}`);
      }
    } catch (error) {
      const latency = Date.now() - startTime;
      this.healthStatus = {
        isHealthy: false,
        latency,
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      console.error('[Proxy] Health check error:', this.healthStatus.error);
    }
  }

  /**
   * Get current health status
   */
  getHealthStatus(): ProxyHealthCheck {
    return { ...this.healthStatus };
  }

  /**
   * Test API proxy with a specific endpoint
   */
  async testProxyEndpoint(endpoint: string): Promise<boolean> {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(5000),
      });

      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Verify proxy handles CORS correctly
   */
  async verifyCorsHandling(): Promise<boolean> {
    try {
      const response = await fetch('/api/health', {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'GET',
        },
      });

      // Check for CORS headers
      const hasCorsHeaders = 
        response.headers.has('access-control-allow-origin') ||
        response.headers.has('Access-Control-Allow-Origin');

      return response.ok && hasCorsHeaders;
    } catch {
      return false;
    }
  }

  /**
   * Verify proxy handles authentication correctly
   */
  async verifyAuthHandling(): Promise<boolean> {
    try {
      // Test with credentials
      const response = await fetch('/api/user', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include',
      });

      // Should get either 200 (authenticated) or 401 (not authenticated)
      // Both are valid responses indicating proxy is working
      return response.status === 200 || response.status === 401;
    } catch {
      return false;
    }
  }
}

/**
 * Global proxy monitor instance
 */
let globalProxyMonitor: ApiProxyMonitor | null = null;

export function getProxyMonitor(): ApiProxyMonitor {
  if (!globalProxyMonitor) {
    globalProxyMonitor = new ApiProxyMonitor();
  }
  return globalProxyMonitor;
}
