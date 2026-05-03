import client, { unwrapTrainingData } from './client';

export const getTrainingProgress = async (type) => {
  const response = await client.get('/api/trainings/progress', {
    params: { type },
  });
  return unwrapTrainingData(response);
};

export const getTrainingProgressSummary = async () => {
  const response = await client.get('/api/trainings/progress/summary');
  return unwrapTrainingData(response);
};

export const getTrainingSessions = async ({ type, page = 0, size = 10 }) => {
  const response = await client.get('/api/trainings/sessions', {
    params: { type, page, size },
  });
  return unwrapTrainingData(response);
};
