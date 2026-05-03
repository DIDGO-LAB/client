import client from './client';
import { tokenStorage } from './tokenStorage';

export const signup = async (payload) => {
  const response = await client.post('/api/auth/signup', payload);
  return response.data;
};

export const login = async (payload) => {
  const response = await client.post('/api/auth/login', payload);
  const { accessToken, refreshToken } = response.data;

  tokenStorage.save({
    accessToken,
    refreshToken,
    rememberMe: payload.rememberMe,
  });

  return response.data;
};

export const logout = async () => {
  try {
    const response = await client.post('/api/auth/logout', {});
    return response.data;
  } finally {
    tokenStorage.clear();
  }
};

export const reissue = async (refreshToken) => {
  const response = await client.post('/api/auth/reissue', { refreshToken });
  tokenStorage.update(response.data);
  return response.data;
};
