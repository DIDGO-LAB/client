import client, { unwrapTrainingData } from './client';

export const getFocusProgress = async () => {
  const response = await client.get('/api/trainings/focus/progress');
  return unwrapTrainingData(response);
};

export const startFocusSession = async (payload) => {
  const response = await client.post('/api/trainings/focus/sessions', payload);
  return unwrapTrainingData(response);
};

export const completeFocusSession = async (sessionId, payload) => {
  const response = await client.post(`/api/trainings/focus/sessions/${sessionId}/complete`, payload);
  return unwrapTrainingData(response);
};
