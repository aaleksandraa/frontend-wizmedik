import { describe, it, expect } from 'vitest'
import { defaultHMRConfig, generateWebSocketURL, isValidAuthToken } from '../utils/websocket-config'

/**
 * Test Vite WebSocket configuration utilities
 * Validates: Requirements 1.1, 1.4, 4.1
 */

describe('Vite WebSocket Configuration', () => {
  it('should generate correct WebSocket URLs', () => {
    const config = defaultHMRConfig
    
    // Test without token
    const urlWithoutToken = generateWebSocketURL(config)
    expect(urlWithoutToken).toBe('ws://localhost:5173')
    
    // Test with token
    const token = 'test.token.123'
    const urlWithToken = generateWebSocketURL(config, token)
    expect(urlWithToken).toBe('ws://localhost:5173?token=test.token.123')
  })

  it('should validate authentication tokens correctly', () => {
    // Valid tokens
    expect(isValidAuthToken('valid.token.123')).toBe(true)
    expect(isValidAuthToken('another.valid.token.456')).toBe(true)
    
    // Invalid tokens
    expect(isValidAuthToken('')).toBe(false)
    expect(isValidAuthToken('short')).toBe(false)
    expect(isValidAuthToken('no-dots-here')).toBe(false)
  })

  it('should have correct default HMR configuration', () => {
    expect(defaultHMRConfig.host).toBe('localhost')
    expect(defaultHMRConfig.port).toBe(5173)
    expect(defaultHMRConfig.secure).toBe(false)
    expect(defaultHMRConfig.overlay).toBe(false)
    expect(defaultHMRConfig.clientPort).toBe(5173)
    expect(defaultHMRConfig.reconnectAttempts).toBe(5)
    expect(defaultHMRConfig.reconnectInterval).toBe(1000)
  })
})