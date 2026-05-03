import client from './client';

export const getMe = async () => {
  const response = await client.get('/api/users/me');
  return response.data;
};

export const updateMe = async (payload) => {
  const response = await client.patch('/api/users/me', payload);
  return response.data;
};
