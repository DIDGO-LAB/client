import client, { unwrapTrainingData } from './client';

export const getDocumentProgress = async () => {
  const response = await client.get('/api/trainings/document/progress');
  return unwrapTrainingData(response);
};

export const startDocumentSession = async (payload) => {
  const response = await client.post('/api/trainings/document/sessions', payload);
  return unwrapTrainingData(response);
};

export const submitDocumentAnswers = async (sessionId, payload) => {
  const response = await client.post(`/api/trainings/document/sessions/${sessionId}/answers`, payload);
  return unwrapTrainingData(response);
};

export const getDocumentSessionDetail = async (sessionId) => {
  const response = await client.get(`/api/trainings/document/sessions/${sessionId}/detail`);
  return unwrapTrainingData(response);
};
