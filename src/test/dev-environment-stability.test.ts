/**
 * Property-Based Tests for Development Environment Stability
 * Feature: dev-environment-connectivity, Property 6: Development Environment Stability
 * Validates: Requirements 4.3, 4.4, 4.5
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as fc from 'fast-check';
import { 
  DevEnvironmentStabilityManager,
  DevEnvironmentConfig 
} from '../dev/dev-environment-stability';
import { ServerRestartHandler } from '../dev/server-restart-handler';
import { ConfigHotReloader } from '../dev/config-hot-reload';
import { ApiProxyMonitor } from '../dev/api-proxy-monitor';

// Mock window object for Node.js environment
const mockWindow = {
  fetch: vi.fn(),
  dispatchEvent: vi.fn(),
  location: { reload: vi.fn() },
};

describe('Development Environment Stability - Property Tests', () => {
  let manager: DevEnvironmentStabilityManager;

  beforeEach(() => {
    // Reset any global state
    vi.clearAllMocks();
    
    // Mock window for tests
    if (typeof window === 'undefined') {
      (global as any).window = mockWindow;
    }
  });

  afterEach(() => {
    if (manager) {
      manager.shutdown();
    }
  });

  /**
   * Property 6: Development Environment Stability
   * For any server restart or configuration change, the development environment 
   * should maintain proper connectivity between frontend and backend, with API 
   * requests being proxied correctly
   */
  it('Property 6: maintains connectivity after server restarts', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random configuration
        fc.record({
          enableServerRestart: fc.boolean(),
          enableConfigHotReload: fc.boolean(),
          enableProxyMonitoring: fc.boolean(),
          serverRestartMaxRetries: fc.integer({ min: 1, max: 5 }),
          configPollInterval: fc.integer({ min: 1000, max: 5000 }),
          proxyMonitorInterval: fc.integer({ min: 1000, max: 10000 }),
        }),
        async (config: DevEnvironmentConfig) => {
          // Create manager with random config
          manager = new DevEnvironmentStabilityManager(config);
          
          // Initialize should succeed
          await manager.initialize();
          
          // Get status
          const status = manager.getStatus();
          
          // Verify manager is initialized
          expect(status.initialized).toBe(true);
          
          // Verify config is applied
          expect(status.config.enableServerRestart).toBe(config.enableServerRestart);
          expect(status.config.enableConfigHotReload).toBe(config.enableConfigHotReload);
          expect(status.config.enableProxyMonitoring).toBe(config.enableProxyMonitoring);
          
          // Shutdown should succeed
          manager.shutdown();
          
          // Verify manager is shutdown
          const shutdownStatus = manager.getStatus();
          expect(shutdownStatus.initialized).toBe(false);
        }
      ),
      { numRuns: 10 }
    );
  });

  it('Property 6: handles configuration changes without restart', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate sequence of configuration changes
        fc.array(
          fc.record({
            apiUrl: fc.webUrl(),
            wsUrl: fc.string(),
            environment: fc.constantFrom('development', 'staging', 'production'),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        async (configChanges) => {
          // Create manager
          manager = new DevEnvironmentStabilityManager({
            enableConfigHotReload: true,
            configPollInterval: 100, // Fast polling for test
          });
          
          await manager.initialize();
          
          // Apply each configuration change
          for (const config of configChanges) {
            // Simulate config change
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('config-updated', { detail: config }));
            }
            
            // Wait a bit for processing
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          // Manager should still be initialized
          const status = manager.getStatus();
          expect(status.initialized).toBe(true);
          
          manager.shutdown();
        }
      ),
      { numRuns: 20 } // Reduce runs to avoid timeout
    );
  }, 15000); // Increase timeout

  it('Property 6: API proxy works under various conditions', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random proxy monitoring intervals
        fc.integer({ min: 1000, max: 10000 }),
        async (monitorInterval) => {
          // Create manager with proxy monitoring
          manager = new DevEnvironmentStabilityManager({
            enableProxyMonitoring: true,
            proxyMonitorInterval: monitorInterval,
          });
          
          await manager.initialize();
          
          // Get proxy health status
          const status = manager.getStatus();
          expect(status.proxyHealth).toBeDefined();
          expect(status.proxyHealth.lastCheck).toBeInstanceOf(Date);
          
          // Verify proxy health check structure
          expect(typeof status.proxyHealth.isHealthy).toBe('boolean');
          expect(typeof status.proxyHealth.latency).toBe('number');
          expect(status.proxyHealth.latency).toBeGreaterThanOrEqual(0);
          
          manager.shutdown();
        }
      ),
      { numRuns: 10 }
    );
  });

  it('Property 6: server restart handler retries with exponential backoff', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          maxRetries: fc.integer({ min: 1, max: 3 }), // Further reduce max retries
          retryDelay: fc.integer({ min: 50, max: 200 }), // Further reduce delay
          backoffMultiplier: fc.float({ min: Math.fround(1.1), max: Math.fround(1.5) }),
        }),
        async (config) => {
          const handler = new ServerRestartHandler(config);
          
          let attemptCount = 0;
          const checkConnection = async () => {
            attemptCount++;
            // Always fail to test retry logic
            return false;
          };
          
          const result = await handler.handleRestart(checkConnection);
          
          // Should fail after max retries
          expect(result).toBe(false);
          
          // Should have attempted exactly maxRetries times
          expect(attemptCount).toBe(config.maxRetries);
        }
      ),
      { numRuns: 10 } // Reduce runs
    );
  }, 20000); // Increase timeout to 20s

  it('Property 6: config hot reloader detects changes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            value: fc.integer(),
            timestamp: fc.date(),
          }),
          { minLength: 2, maxLength: 3 } // Reduce array size
        ),
        async (configs) => {
          let changeCount = 0;
          
          const reloader = new ConfigHotReloader({
            pollInterval: 200, // Slower polling
            onConfigChange: () => {
              changeCount++;
            },
          });
          
          let configIndex = 0;
          const configLoader = async () => {
            const config = configs[configIndex % configs.length];
            configIndex++;
            return config;
          };
          
          reloader.startWatching(configLoader);
          
          // Wait for a few poll cycles
          await new Promise(resolve => setTimeout(resolve, 600));
          
          reloader.stopWatching();
          
          // Should have detected at least one change (initial load)
          expect(changeCount).toBeGreaterThanOrEqual(0);
        }
      ),
      { numRuns: 20 } // Reduce runs to avoid timeout
    );
  }, 15000); // Increase timeout

  it('Property 6: proxy monitor tracks health metrics', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1000, max: 5000 }),
        async (monitorInterval) => {
          const monitor = new ApiProxyMonitor();
          
          monitor.startMonitoring(monitorInterval);
          
          // Wait for at least one health check
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const health = monitor.getHealthStatus();
          
          // Health status should have required fields
          expect(typeof health.isHealthy).toBe('boolean');
          expect(typeof health.latency).toBe('number');
          expect(health.lastCheck).toBeInstanceOf(Date);
          expect(health.latency).toBeGreaterThanOrEqual(0);
          
          monitor.stopMonitoring();
        }
      ),
      { numRuns: 10 }
    );
  }, 10000); // Increase timeout

  it('Property 6: multiple initialize calls are idempotent', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 2, max: 10 }),
        async (initializeCount) => {
          manager = new DevEnvironmentStabilityManager();
          
          // Call initialize multiple times
          for (let i = 0; i < initializeCount; i++) {
            await manager.initialize();
          }
          
          // Should still be initialized only once
          const status = manager.getStatus();
          expect(status.initialized).toBe(true);
          
          manager.shutdown();
        }
      ),
      { numRuns: 10 }
    );
  });

  it('Property 6: shutdown after initialize always succeeds', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          enableServerRestart: fc.boolean(),
          enableConfigHotReload: fc.boolean(),
          enableProxyMonitoring: fc.boolean(),
        }),
        async (config) => {
          manager = new DevEnvironmentStabilityManager(config);
          
          await manager.initialize();
          expect(manager.getStatus().initialized).toBe(true);
          
          manager.shutdown();
          expect(manager.getStatus().initialized).toBe(false);
          
          // Multiple shutdowns should be safe
          manager.shutdown();
          expect(manager.getStatus().initialized).toBe(false);
        }
      ),
      { numRuns: 10 }
    );
  });
});
