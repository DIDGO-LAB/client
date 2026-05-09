import client, { API_BASE_URL, unwrapTrainingData } from './client';

export const selectSocialJobType = async (payload) => {
  const response = await client.post('/api/trainings/social/job-type', payload);
  return unwrapTrainingData(response);
};

export const getSocialScenarios = async (jobType) => {
  const response = await client.get('/api/trainings/social/scenarios', {
    params: { jobType },
  });
  return unwrapTrainingData(response);
};

export const getSocialScenario = async (scenarioId) => {
  const response = await client.get(`/api/trainings/social/scenarios/${scenarioId}`);
  return unwrapTrainingData(response);
};

export const startSocialSession = async (payload) => {
  const response = await client.post('/api/trainings/social/sessions', payload);
  return unwrapTrainingData(response);
};

export const prepareSocialVoiceSession = async (sessionId) => {
  const response = await client.post(`/api/trainings/social/sessions/${sessionId}/voice/prepare`, {});
  return unwrapTrainingData(response);
};

export const prepareSocialOpeningAudio = async (scenarioId) => {
  const response = await client.post(`/api/trainings/social/scenarios/${scenarioId}/opening-audio`, {});
  return unwrapTrainingData(response);
};

export const getSocialOpeningAudioBlob = async (audioUrl) => {
  const response = await client.get(audioUrl, {
    responseType: 'blob',
  });
  return response.data;
};

export const completeSocialSession = async (sessionId, payload) => {
  const response = await client.post(`/api/trainings/social/sessions/${sessionId}/complete`, payload);
  return unwrapTrainingData(response);
};

export const getSocialSessionDetail = async (sessionId) => {
  const response = await client.get(`/api/trainings/social/sessions/${sessionId}/detail`);
  return unwrapTrainingData(response);
};

export const createSocialVoiceWebSocketUrl = (connectionToken) => {
  const url = new URL('/ws/trainings/social/voice', API_BASE_URL);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.searchParams.set('token', connectionToken);
  return url.toString();
};
