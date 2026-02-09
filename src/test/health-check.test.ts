/**
 * Frontend Health Check Tests
 * 
 * Tests the frontend health check utilities and endpoints to ensure
 * proper monitoring of development environment connectivity.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { 
  performHealthCheck, 
  performPing, 
  checkDevelopmentEnvironment,
  startHealthMonitoring 
} from '../utils/health-check';

// Mock fetch for testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

// Mock window object
Object.defineProperty(global, 'window', {
  value: {
    localStorage: mockLocalStorage,
    location: {
      port: '5173',
      href: 'http://localhost:5173',
    },
  },
  writable: true,
});

// Mock WebSocket
const mockWebSocket = vi.fn();
global.WebSocket = mockWebSocket;

// Mock import.meta.env
vi.mock('import.meta', () => ({
  env: {
    DEV: true,
    MODE: 'development',
    VITE_APP_VERSION: '1.0.0',
  },
  hot: true,
}));

describe('Frontend Health Check', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('performPing', () => {
    it('should return ok status with timestamp', () => {
      const result = performPing();
      
      expect(result.status).toBe('ok');
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(typeof result.response_time).toBe('number');
      expect(result.response_time).toBeGreaterThanOrEqual(0);
    });
  });

  describe('checkDevelopmentEnvironment', () => {
    it('should return development environment status', () => {
      const result = checkDevelopmentEnvironment();
      
      expect(result).toHaveProperty('vite_dev_server');
      expect(result).toHaveProperty('hmr_enabled');
      expect(result).toHaveProperty('api_proxy_configured');
      expect(result).toHaveProperty('environment');
      
      expect(typeof result.vite_dev_server).toBe('boolean');
      expect(typeof result.hmr_enabled).toBe('boolean');
      expect(typeof result.api_proxy_configured).toBe('boolean');
      expect(typeof result.environment).toBe('string');
    });
  });

  describe('performHealthCheck', () => {
    it('should return healthy status when all checks pass', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      });

      // Mock successful localStorage
      mockLocalStorage.setItem.mockImplementation(() => {});
      mockLocalStorage.getItem.mockReturnValue('test_value');
      mockLocalStorage.removeItem.mockImplementation(() => {});

      const result = await performHealthCheck();
      
      expect(result.status).toBe('healthy');
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      expect(result.checks).toHaveProperty('frontend_server', true);
      expect(result.checks).toHaveProperty('backend_api', true);
      expect(result.checks).toHaveProperty('local_storage', true);
      expect(result.version).toBeDefined();
    });

    it('should return unhealthy status when backend API fails', async () => {
      // Mock failed API response
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      // Mock successful localStorage
      mockLocalStorage.setItem.mockImplementation(() => {});
      mockLocalStorage.getItem.mockReturnValue('test_value');
      mockLocalStorage.removeItem.mockImplementation(() => {});

      const result = await performHealthCheck();
      
      expect(result.status).toBe('unhealthy');
      expect(result.checks.frontend_server).toBe(true);
      expect(result.checks.backend_api).toBe(false);
      expect(result.checks.local_storage).toBe(true);
      expect(result.errors).toContain('Backend API connection failed: Network error');
    });

    it('should return unhealthy status when localStorage fails', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      });

      // Mock localStorage failure
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const result = await performHealthCheck();
      
      expect(result.status).toBe('unhealthy');
      expect(result.checks.frontend_server).toBe(true);
      expect(result.checks.backend_api).toBe(true);
      expect(result.checks.local_storage).toBe(false);
      expect(result.errors).toContain('Local storage test failed: Storage quota exceeded');
    });

    it('should handle API timeout gracefully', async () => {
      // Mock API timeout
      mockFetch.mockImplementation(() => 
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), 100)
        )
      );

      // Mock successful localStorage
      mockLocalStorage.setItem.mockImplementation(() => {});
      mockLocalStorage.getItem.mockReturnValue('test_value');
      mockLocalStorage.removeItem.mockImplementation(() => {});

      const result = await performHealthCheck();
      
      expect(result.status).toBe('unhealthy');
      expect(result.checks.backend_api).toBe(false);
      expect(result.errors).toContain('Backend API connection failed: Timeout');
    });

    it('should handle non-200 API responses', async () => {
      // Mock API error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      });

      // Mock successful localStorage
      mockLocalStorage.setItem.mockImplementation(() => {});
      mockLocalStorage.getItem.mockReturnValue('test_value');
      mockLocalStorage.removeItem.mockImplementation(() => {});

      const result = await performHealthCheck();
      
      expect(result.status).toBe('unhealthy');
      expect(result.checks.backend_api).toBe(false);
      expect(result.errors).toContain('Backend API returned status 500');
    });

    it('should include version information', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      });

      // Mock successful localStorage
      mockLocalStorage.setItem.mockImplementation(() => {});
      mockLocalStorage.getItem.mockReturnValue('test_value');
      mockLocalStorage.removeItem.mockImplementation(() => {});

      const result = await performHealthCheck();
      
      expect(result.version).toBeDefined();
      expect(typeof result.version).toBe('string');
    });
  });

  describe('startHealthMonitoring', () => {
    it('should start periodic health monitoring', () => {
      const mockSetInterval = vi.spyOn(global, 'setInterval');
      const mockClearInterval = vi.spyOn(global, 'clearInterval');
      
      const cleanup = startHealthMonitoring(1000);
      
      expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 1000);
      
      cleanup();
      
      expect(mockClearInterval).toHaveBeenCalled();
      
      mockSetInterval.mockRestore();
      mockClearInterval.mockRestore();
    });

    it('should use default interval when not specified', () => {
      const mockSetInterval = vi.spyOn(global, 'setInterval');
      
      const cleanup = startHealthMonitoring();
      
      expect(mockSetInterval).toHaveBeenCalledWith(expect.any(Function), 60000);
      
      cleanup();
      
      mockSetInterval.mockRestore();
    });
  });

  describe('error handling', () => {
    it('should handle localStorage read/write mismatch', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      });

      // Mock localStorage that returns wrong value
      mockLocalStorage.setItem.mockImplementation(() => {});
      mockLocalStorage.getItem.mockReturnValue('wrong_value');
      mockLocalStorage.removeItem.mockImplementation(() => {});

      const result = await performHealthCheck();
      
      expect(result.status).toBe('unhealthy');
      expect(result.checks.local_storage).toBe(false);
      expect(result.errors).toContain('Local storage read/write test failed');
    });

    it('should handle WebSocket connection failures gracefully', async () => {
      // Mock successful API response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: 'ok' }),
      });

      // Mock successful localStorage
      mockLocalStorage.setItem.mockImplementation(() => {});
      mockLocalStorage.getItem.mockReturnValue('test_value');
      mockLocalStorage.removeItem.mockImplementation(() => {});

      // Mock WebSocket failure
      mockWebSocket.mockImplementation(() => {
        throw new Error('WebSocket connection failed');
      });

      const result = await performHealthCheck();
      
      // WebSocket failure should not make overall health check fail
      // since it's handled gracefully
      expect(result.checks.websocket_connection).toBe(false);
    });
  });
});