/**
 * Health Check Middleware for Vite Development Server
 * 
 * Provides health check endpoints for the frontend development server
 * to monitor connectivity and development environment status.
 */

import type { Connect } from 'vite';
import { performHealthCheck, performPing, checkDevelopmentEnvironment } from '../utils/health-check';

/**
 * Create health check middleware for Vite dev server
 */
export function createHealthCheckMiddleware(): Connect.NextHandleFunction {
  return async (req, res, next) => {
    // Only handle health check routes
    if (!req.url?.startsWith('/health') && !req.url?.startsWith('/ping')) {
      return next();
    }

    // Set CORS headers for health check endpoints
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Handle OPTIONS requests
    if (req.method === 'OPTIONS') {
      res.statusCode = 200;
      res.end();
      return;
    }

    // Only allow GET requests
    if (req.method !== 'GET') {
      res.statusCode = 405;
      res.end(JSON.stringify({ message: 'Method not allowed' }));
      return;
    }

    try {
      switch (req.url) {
        case '/health':
          await handleHealthCheck(res);
          break;
        case '/ping':
          handlePing(res);
          break;
        case '/health/dev':
          handleDevEnvironmentCheck(res);
          break;
        default:
          res.statusCode = 404;
          res.end(JSON.stringify({ message: 'Health check endpoint not found' }));
      }
    } catch (error) {
      console.error('Health check middleware error:', error);
      res.statusCode = 500;
      res.end(JSON.stringify({ 
        message: 'Health check failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  };
}

/**
 * Handle comprehensive health check
 */
async function handleHealthCheck(res: any): Promise<void> {
  try {
    const healthResult = await performHealthCheck();
    const statusCode = healthResult.status === 'healthy' ? 200 : 503;
    
    res.statusCode = statusCode;
    res.end(JSON.stringify(healthResult, null, 2));
  } catch (error) {
    res.statusCode = 500;
    res.end(JSON.stringify({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }));
  }
}

/**
 * Handle simple ping check
 */
function handlePing(res: any): void {
  const pingResult = performPing();
  res.statusCode = 200;
  res.end(JSON.stringify(pingResult, null, 2));
}

/**
 * Handle development environment check
 */
function handleDevEnvironmentCheck(res: any): void {
  const devCheck = checkDevelopmentEnvironment();
  const isHealthy = devCheck.vite_dev_server && devCheck.hmr_enabled && devCheck.api_proxy_configured;
  
  const result = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    development_environment: devCheck,
    vite_info: {
      version: '5.0.0', // This would be dynamically determined in a real setup
      mode: process.env.NODE_ENV || 'development',
      port: 5173,
      host: 'localhost',
    },
  };
  
  const statusCode = isHealthy ? 200 : 503;
  res.statusCode = statusCode;
  res.end(JSON.stringify(result, null, 2));
}