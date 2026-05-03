import client, { unwrapTrainingData } from './client';

export const getSafetyScenarios = async (category) => {
  const response = await client.get('/api/trainings/safety/scenarios', {
    params: { category },
  });
  return unwrapTrainingData(response);
};

export const startSafetySession = async (payload) => {
  const response = await client.post('/api/trainings/safety/sessions', payload);
  return unwrapTrainingData(response);
};

export const goToNextSafetyScene = async (sessionId, payload) => {
  const response = await client.post(`/api/trainings/safety/sessions/${sessionId}/next-scene`, payload);
  return unwrapTrainingData(response);
};

export const completeSafetySession = async (sessionId) => {
  const response = await client.post(`/api/trainings/safety/sessions/${sessionId}/complete`, {});
  return unwrapTrainingData(response);
};

export const getSafetySessionDetail = async (sessionId) => {
  const response = await client.get(`/api/trainings/safety/sessions/${sessionId}/detail`);
  return unwrapTrainingData(response);
};
