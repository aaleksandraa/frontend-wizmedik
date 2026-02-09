/**
 * Frontend Health Check Utilities
 * 
 * Provides health check functionality for the frontend development server
 * and monitors connectivity to the backend API.
 */

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  checks: {
    frontend_server: boolean;
    backend_api: boolean;
    websocket_connection: boolean;
    local_storage: boolean;
  };
  version?: string;
  errors?: string[];
}

export interface PingResult {
  status: 'ok' | 'error';
  timestamp: string;
  response_time?: number;
}

/**
 * Perform comprehensive health check of frontend services
 */
export async function performHealthCheck(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  const errors: string[] = [];
  
  const checks = {
    frontend_server: true, // If this code runs, frontend server is working
    backend_api: false,
    websocket_connection: false,
    local_storage: false,
  };

  // Check backend API connectivity
  try {
    const response = await fetch('/api/ping', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      timeout: 5000,
    } as RequestInit);
    
    if (response.ok) {
      checks.backend_api = true;
    } else {
      errors.push(`Backend API returned status ${response.status}`);
    }
  } catch (error) {
    errors.push(`Backend API connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Check WebSocket connection (HMR)
  try {
    checks.websocket_connection = await checkWebSocketConnection();
  } catch (error) {
    errors.push(`WebSocket connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Check local storage functionality
  try {
    const testKey = 'health_check_test';
    const testValue = 'test_value';
    localStorage.setItem(testKey, testValue);
    const retrievedValue = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    
    if (retrievedValue === testValue) {
      checks.local_storage = true;
    } else {
      errors.push('Local storage read/write test failed');
    }
  } catch (error) {
    errors.push(`Local storage test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  const allHealthy = Object.values(checks).every(check => check === true);
  
  return {
    status: allHealthy ? 'healthy' : 'unhealthy',
    timestamp,
    checks,
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    ...(errors.length > 0 && { errors }),
  };
}

/**
 * Simple ping check for frontend server
 */
export function performPing(): PingResult {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  const response_time = Date.now() - startTime;
  
  return {
    status: 'ok',
    timestamp,
    response_time,
  };
}

/**
 * Check WebSocket connection for HMR
 */
async function checkWebSocketConnection(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      // Check if we're in development mode with HMR
      if (import.meta.env.DEV && import.meta.hot) {
        // If HMR is available, WebSocket is working
        resolve(true);
        return;
      }

      // In production or when HMR is not available, try to create a test WebSocket
      const wsUrl = `ws://localhost:5173`;
      const ws = new WebSocket(wsUrl);
      
      const timeout = setTimeout(() => {
        ws.close();
        resolve(false);
      }, 2000);

      ws.onopen = () => {
        clearTimeout(timeout);
        ws.close();
        resolve(true);
      };

      ws.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };

      ws.onclose = () => {
        clearTimeout(timeout);
        resolve(false);
      };
    } catch (error) {
      resolve(false);
    }
  });
}

/**
 * Monitor health check status and log issues
 */
export async function monitorHealth(): Promise<void> {
  try {
    const result = await performHealthCheck();
    
    if (result.status === 'unhealthy') {
      console.warn('Health check failed:', result);
      
      // Log to backend if possible
      if (result.checks.backend_api) {
        try {
          await fetch('/api/health/frontend-issue', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              health_check_result: result,
              user_agent: navigator.userAgent,
              url: window.location.href,
            }),
          });
        } catch (error) {
          console.error('Failed to report health issue to backend:', error);
        }
      }
    } else {
      console.log('Health check passed:', result);
    }
  } catch (error) {
    console.error('Health check monitoring failed:', error);
  }
}

/**
 * Start periodic health monitoring
 */
export function startHealthMonitoring(intervalMs: number = 60000): () => void {
  // Perform initial health check
  monitorHealth();
  
  // Set up periodic monitoring
  const intervalId = setInterval(monitorHealth, intervalMs);
  
  // Return cleanup function
  return () => {
    clearInterval(intervalId);
  };
}

/**
 * Check if development environment is properly configured
 */
export function checkDevelopmentEnvironment(): {
  vite_dev_server: boolean;
  hmr_enabled: boolean;
  api_proxy_configured: boolean;
  environment: string;
} {
  return {
    vite_dev_server: import.meta.env.DEV,
    hmr_enabled: !!import.meta.hot,
    api_proxy_configured: window.location.port === '5173',
    environment: import.meta.env.MODE,
  };
}