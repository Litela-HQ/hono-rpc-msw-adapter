import { describe, it, expect, beforeEach } from 'vitest';
import { setConfig, getConfig } from './config';

describe('config', () => {
  beforeEach(() => {
    // Reset config before each test
    setConfig({ baseUrl: '/' });
  });

  describe('setConfig', () => {
    it('should set baseUrl', () => {
      setConfig({ baseUrl: 'https://api.example.com' });
      expect(getConfig().baseUrl).toBe('https://api.example.com');
    });

    it('should merge with default config', () => {
      setConfig({ baseUrl: 'https://api.example.com' });
      const config = getConfig();
      expect(config.baseUrl).toBe('https://api.example.com');
    });

    it('should allow partial config update', () => {
      setConfig({ baseUrl: 'https://api.example.com' });
      expect(getConfig().baseUrl).toBe('https://api.example.com');
    });

    it('should use default baseUrl when not specified', () => {
      setConfig({});
      expect(getConfig().baseUrl).toBe('/');
    });
  });

  describe('getConfig', () => {
    it('should return default config initially', () => {
      const config = getConfig();
      expect(config.baseUrl).toBe('/');
    });

    it('should return updated config after setConfig', () => {
      setConfig({ baseUrl: 'https://api.example.com' });
      const config = getConfig();
      expect(config.baseUrl).toBe('https://api.example.com');
    });
  });
});
