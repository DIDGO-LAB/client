import { describe, expect, it } from 'vitest';
import { tokenStorage } from '../tokenStorage';

describe('tokenStorage', () => {
  it('stores remembered tokens in localStorage', () => {
    tokenStorage.save({
      accessToken: 'access-local',
      refreshToken: 'refresh-local',
      rememberMe: true,
    });

    expect(localStorage.getItem('didgo.accessToken')).toBe('access-local');
    expect(localStorage.getItem('didgo.refreshToken')).toBe('refresh-local');
    expect(localStorage.getItem('didgo.tokenStorage')).toBe('local');
    expect(sessionStorage.getItem('didgo.accessToken')).toBeNull();
  });

  it('stores non-remembered tokens in sessionStorage', () => {
    tokenStorage.save({
      accessToken: 'access-session',
      refreshToken: 'refresh-session',
      rememberMe: false,
    });

    expect(sessionStorage.getItem('didgo.accessToken')).toBe('access-session');
    expect(sessionStorage.getItem('didgo.refreshToken')).toBe('refresh-session');
    expect(sessionStorage.getItem('didgo.tokenStorage')).toBe('session');
    expect(localStorage.getItem('didgo.accessToken')).toBeNull();
  });

  it('updates tokens in the active storage', () => {
    tokenStorage.save({
      accessToken: 'old-access',
      refreshToken: 'old-refresh',
      rememberMe: false,
    });

    tokenStorage.update({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });

    expect(sessionStorage.getItem('didgo.accessToken')).toBe('new-access');
    expect(sessionStorage.getItem('didgo.refreshToken')).toBe('new-refresh');
  });

  it('clears both local and session token state', () => {
    localStorage.setItem('didgo.accessToken', 'local-access');
    sessionStorage.setItem('didgo.refreshToken', 'session-refresh');

    tokenStorage.clear();

    expect(localStorage.getItem('didgo.accessToken')).toBeNull();
    expect(sessionStorage.getItem('didgo.refreshToken')).toBeNull();
  });
});
