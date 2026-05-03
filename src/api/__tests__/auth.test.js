import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import client from '../client';
import { login, logout, reissue, signup } from '../auth';
import { tokenStorage } from '../tokenStorage';

describe('authApi', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(client);
  });

  afterEach(() => {
    mock.restore();
  });

  it('posts signup payload and returns the response body', async () => {
    const payload = {
      loginId: 'user01',
      password: 'password1234',
      name: '홍길동',
    };
    const response = { userId: 1, message: '회원가입이 완료되었습니다.' };

    mock.onPost('/api/auth/signup', payload).reply(200, response);

    await expect(signup(payload)).resolves.toEqual(response);
  });

  it('posts login payload, returns response body, and saves tokens', async () => {
    const payload = { loginId: 'user01', password: 'password1234', rememberMe: true };
    const response = {
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: { userId: 1 },
    };

    mock.onPost('/api/auth/login', payload).reply(200, response);

    await expect(login(payload)).resolves.toEqual(response);
    expect(tokenStorage.getAccessToken()).toBe('access-token');
    expect(tokenStorage.getRefreshToken()).toBe('refresh-token');
    expect(localStorage.getItem('didgo.tokenStorage')).toBe('local');
  });

  it('clears tokens after logout succeeds', async () => {
    tokenStorage.save({ accessToken: 'access-token', refreshToken: 'refresh-token' });
    const response = { message: '로그아웃이 완료되었습니다.' };

    mock.onPost('/api/auth/logout', {}).reply(200, response);

    await expect(logout()).resolves.toEqual(response);
    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
  });

  it('clears tokens after logout fails', async () => {
    tokenStorage.save({ accessToken: 'access-token', refreshToken: 'refresh-token' });

    mock.onPost('/api/auth/logout', {}).reply(500, { message: 'Server error' });

    await expect(logout()).rejects.toMatchObject({ status: 500 });
    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
  });

  it('posts refresh token for reissue and updates stored tokens', async () => {
    tokenStorage.save({ accessToken: 'old-access', refreshToken: 'old-refresh' });
    const response = { accessToken: 'new-access', refreshToken: 'new-refresh' };

    mock.onPost('/api/auth/reissue', { refreshToken: 'old-refresh' }).reply(200, response);

    await expect(reissue('old-refresh')).resolves.toEqual(response);
    expect(tokenStorage.getAccessToken()).toBe('new-access');
    expect(tokenStorage.getRefreshToken()).toBe('new-refresh');
  });
});
