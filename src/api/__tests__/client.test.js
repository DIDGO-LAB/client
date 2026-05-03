import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import client, { unwrapTrainingData } from '../client';
import { tokenStorage } from '../tokenStorage';

describe('api client', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(client);
  });

  afterEach(() => {
    mock.restore();
    vi.restoreAllMocks();
  });

  it('attaches bearer token when one is stored', async () => {
    tokenStorage.save({ accessToken: 'access-token', refreshToken: 'refresh-token' });

    mock.onGet('/protected').reply((config) => [
      200,
      { authorization: config.headers.Authorization },
    ]);

    await expect(client.get('/protected')).resolves.toMatchObject({
      data: { authorization: 'Bearer access-token' },
    });
  });

  it('unwraps training-service success responses', () => {
    const response = {
      status: 200,
      data: {
        success: true,
        data: { value: 1 },
        error: null,
      },
    };

    expect(unwrapTrainingData(response)).toEqual({ value: 1 });
  });

  it('throws training-service wrapped errors', () => {
    const response = {
      status: 400,
      data: {
        success: false,
        data: null,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request.',
        },
      },
    };

    expect(() => unwrapTrainingData(response)).toThrow(
      expect.objectContaining({
        code: 'VALIDATION_ERROR',
        message: 'Invalid request.',
        status: 400,
      }),
    );
  });

  it('reissues tokens and retries the original request after a 401', async () => {
    tokenStorage.save({ accessToken: 'expired-access', refreshToken: 'refresh-token' });

    const postSpy = vi.spyOn(axios, 'post').mockResolvedValue({
      data: {
        accessToken: 'new-access',
        refreshToken: 'new-refresh',
      },
    });

    mock.onGet('/protected').replyOnce(401, { message: 'Expired' });
    mock.onGet('/protected').reply((config) => [
      200,
      { authorization: config.headers.Authorization },
    ]);

    const response = await client.get('/protected');

    expect(postSpy).toHaveBeenCalledWith('http://localhost/api/auth/reissue', {
      refreshToken: 'refresh-token',
    });
    expect(response.data).toEqual({ authorization: 'Bearer new-access' });
    expect(tokenStorage.getAccessToken()).toBe('new-access');
    expect(tokenStorage.getRefreshToken()).toBe('new-refresh');
  });

  it('clears tokens when reissue fails', async () => {
    tokenStorage.save({ accessToken: 'expired-access', refreshToken: 'refresh-token' });

    vi.spyOn(axios, 'post').mockRejectedValue({
      code: 'ERR_BAD_REQUEST',
      response: {
        status: 401,
        data: {
          error: {
            code: 'INVALID_REFRESH_TOKEN',
            message: 'Invalid refresh token.',
          },
        },
      },
    });

    mock.onGet('/protected').replyOnce(401, { message: 'Expired' });

    await expect(client.get('/protected')).rejects.toMatchObject({
      code: 'INVALID_REFRESH_TOKEN',
      status: 401,
    });
    expect(tokenStorage.getAccessToken()).toBeNull();
    expect(tokenStorage.getRefreshToken()).toBeNull();
  });
});
