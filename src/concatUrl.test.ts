import { describe, it, expect } from 'vitest';
import { concatUrl } from './concatUrl';

describe('concatUrl', () => {
  describe('when concatenating absolute URLs with routes', () => {
    it('should concatenate base URL and route path', () => {
      const result = concatUrl('http://example.com', '/api/users');
      expect(result).toBe('http://example.com/api/users');
    });

    it('should handle base URL with trailing slash', () => {
      const result = concatUrl('http://example.com/', '/api/users');
      expect(result).toBe('http://example.com/api/users');
    });

    it('should preserve port numbers in the URL', () => {
      const result = concatUrl('http://localhost:3000', '/api/users');
      expect(result).toBe('http://localhost:3000/api/users');
    });

    it('should work with HTTPS protocol', () => {
      const result = concatUrl('https://example.com', '/api/users');
      expect(result).toBe('https://example.com/api/users');
    });

    it('should preserve query parameters in the route', () => {
      const result = concatUrl('http://example.com', '/api/users?page=1');
      expect(result).toBe('http://example.com/api/users?page=1');
    });

    it('should preserve hash fragments in the route', () => {
      const result = concatUrl('http://example.com', '/api/users#section');
      expect(result).toBe('http://example.com/api/users#section');
    });
  });

  describe('when using fallback mechanism for relative paths', () => {
    it('should concatenate relative base and route paths', () => {
      const result = concatUrl('/base', '/path');
      expect(result).toBe('/base/path');
    });

    it('should handle paths starting with slash', () => {
      const result = concatUrl('/api', '/users');
      expect(result).toBe('/api/users');
    });

    it('should handle base path without leading slash', () => {
      const result = concatUrl('api', '/users');
      expect(result).toBe('/api/users');
    });

    it('should handle empty base URL', () => {
      const result = concatUrl('', '/users');
      expect(result).toBe('/users');
    });

    it('should handle complex nested relative paths', () => {
      const result = concatUrl('/api/v1', '/users/123/posts');
      expect(result).toBe('/api/v1/users/123/posts');
    });

    it('should concatenate paths without slashes', () => {
      const result = concatUrl('api', 'users');
      expect(result).toBe('/apiusers');
    });
  });

  describe('when handling edge cases', () => {
    it('should handle empty route with absolute URL', () => {
      const result = concatUrl('http://example.com', '');
      expect(result).toBe('http://example.com/');
    });

    it('should handle both empty base URL and route', () => {
      const result = concatUrl('', '');
      expect(result).toBe('/');
    });

    it('should override base URL when route is a complete URL', () => {
      const result = concatUrl('http://example.com', 'http://other.com/path');
      expect(result).toBe('http://other.com/path');
    });

    it('should preserve URL-encoded special characters', () => {
      const result = concatUrl('http://example.com', '/api/users/john%20doe');
      expect(result).toBe('http://example.com/api/users/john%20doe');
    });
  });
});
