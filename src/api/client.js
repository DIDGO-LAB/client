import axios from 'axios';
import { tokenStorage } from './tokenStorage';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost';

export const resolveApiAssetUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return url;
  }

  if (/^https?:\/\//i.test(url) || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }

  if (url.startsWith('/trainings/')) {
    return `${API_BASE_URL.replace(/\/$/, '')}${url}`;
  }

  return url;
};

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const normalizeError = (error) => {
  const response = error.response;
  const payload = response?.data;
  const wrappedError = payload?.error;

  return {
    code: wrappedError?.code || payload?.code || error.code || 'API_ERROR',
    message: wrappedError?.message || payload?.message || error.message || 'API request failed.',
    status: response?.status,
    details: payload,
  };
};

client.interceptors.request.use((config) => {
  const accessToken = tokenStorage.getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = tokenStorage.getRefreshToken();

    if (
      error.response?.status === 401 &&
      refreshToken &&
      originalRequest &&
      !originalRequest._retry &&
      originalRequest.url !== '/api/auth/reissue'
    ) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(`${API_BASE_URL}/api/auth/reissue`, { refreshToken });
        tokenStorage.update(response.data);
        originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
        return client(originalRequest);
      } catch (reissueError) {
        tokenStorage.clear();
        throw normalizeError(reissueError);
      }
    }

    throw normalizeError(error);
  },
);

export const unwrapTrainingData = (response) => {
  const body = response.data;

  if (body?.success === false) {
    throw {
      code: body.error?.code || 'API_ERROR',
      message: body.error?.message || 'API request failed.',
      status: response.status,
      details: body,
    };
  }

  return body?.data;
};

export default client;
