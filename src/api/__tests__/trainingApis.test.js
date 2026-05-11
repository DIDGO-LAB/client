import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import client, { resolveApiAssetUrl } from '../client';
import {
  getTrainingProgress,
  getTrainingProgressSummary,
  getTrainingSessions,
} from '../trainingProgress';
import {
  completeSocialSession,
  createSocialVoiceWebSocketUrl,
  getSocialScenario,
  getSocialScenarios,
  getSocialSessionDetail,
  prepareSocialVoiceSession,
  selectSocialJobType,
  startSocialSession,
} from '../socialTraining';
import {
  advanceSafetyScene,
  completeSafetySession,
  getSafetyScenarios,
  getSafetySessionDetail,
  goToNextSafetyScene,
  startSafetySession,
} from '../safetyTraining';
import {
  getDocumentProgress,
  getDocumentSessionDetail,
  startDocumentSession,
  submitDocumentAnswers,
} from '../documentTraining';
import {
  completeFocusSession,
  getFocusProgress,
  startFocusSession,
} from '../focusTraining';

const wrapped = (data) => ({ success: true, data, error: null });

describe('training API wrappers', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(client);
  });

  afterEach(() => {
    mock.restore();
  });

  it('calls training progress endpoints with expected params', async () => {
    mock.onGet('/api/trainings/progress', { params: { type: 'SOCIAL' } }).reply(200, wrapped({ level: 3 }));
    mock.onGet('/api/trainings/progress/summary').reply(200, wrapped({ items: [] }));
    mock
      .onGet('/api/trainings/sessions', { params: { type: 'SOCIAL', page: 2, size: 5 } })
      .reply(200, wrapped({ sessions: [] }));

    await expect(getTrainingProgress('SOCIAL')).resolves.toEqual({ level: 3 });
    await expect(getTrainingProgressSummary()).resolves.toEqual({ items: [] });
    await expect(getTrainingSessions({ type: 'SOCIAL', page: 2, size: 5 })).resolves.toEqual({
      sessions: [],
    });
  });

  it('calls social training endpoints and unwraps data', async () => {
    mock.onPost('/api/trainings/social/job-type', { jobType: 'OFFICE' }).reply(200, wrapped({ nextPage: 'SCENARIO_SELECTION' }));
    mock.onGet('/api/trainings/social/scenarios', { params: { jobType: 'OFFICE' } }).reply(200, wrapped([{ scenarioId: 1 }]));
    mock.onGet('/api/trainings/social/scenarios/1').reply(200, wrapped({ scenarioId: 1 }));
    mock.onPost('/api/trainings/social/sessions', { jobType: 'OFFICE', scenarioId: 1 }).reply(200, wrapped({ sessionId: 10 }));
    mock.onPost('/api/trainings/social/sessions/10/voice/prepare', {}).reply(200, wrapped({ sessionId: 10 }));
    mock.onPost('/api/trainings/social/sessions/10/complete', { dialogLogs: [] }).reply(200, wrapped({ completed: true }));
    mock.onGet('/api/trainings/social/sessions/10/detail').reply(200, wrapped({ score: 85 }));

    await expect(selectSocialJobType({ jobType: 'OFFICE' })).resolves.toEqual({ nextPage: 'SCENARIO_SELECTION' });
    await expect(getSocialScenarios('OFFICE')).resolves.toEqual([{ scenarioId: 1 }]);
    await expect(getSocialScenario(1)).resolves.toEqual({ scenarioId: 1 });
    await expect(startSocialSession({ jobType: 'OFFICE', scenarioId: 1 })).resolves.toEqual({ sessionId: 10 });
    await expect(prepareSocialVoiceSession(10)).resolves.toEqual({ sessionId: 10 });
    await expect(completeSocialSession(10, { dialogLogs: [] })).resolves.toEqual({ completed: true });
    await expect(getSocialSessionDetail(10)).resolves.toEqual({ score: 85 });
  });

  it('creates websocket URLs from the configured base URL', () => {
    expect(createSocialVoiceWebSocketUrl('connection-token')).toBe(
      'ws://localhost/ws/trainings/social/voice?token=connection-token',
    );
  });

  it('resolves backend training asset URLs against the API base URL', () => {
    expect(resolveApiAssetUrl('/trainings/safety/sex-education/scenario-01/story-01.png')).toBe(
      'http://localhost/trainings/safety/sex-education/scenario-01/story-01.png',
    );
    expect(resolveApiAssetUrl('/mock/trainings/safety/scenes/sample.png')).toBe('/mock/trainings/safety/scenes/sample.png');
    expect(resolveApiAssetUrl('https://cdn.example.com/story.png')).toBe('https://cdn.example.com/story.png');
  });

  it('calls safety training endpoints and unwraps data', async () => {
    mock.onGet('/api/trainings/safety/scenarios', { params: { category: 'COMMUTE_SAFETY' } }).reply(200, wrapped([{ scenarioId: 1 }]));
    mock.onPost('/api/trainings/safety/sessions', { scenarioId: 1 }).reply(200, wrapped({ sessionId: 20 }));
    mock.onPost('/api/trainings/safety/sessions/20/advance-scene', { sceneId: 1 }).reply(200, wrapped({ completed: false, nextScene: { sceneId: 2 } }));
    mock.onPost('/api/trainings/safety/sessions/20/next-scene', { sceneId: 1, choiceId: 1 }).reply(200, wrapped({ completed: false, nextScene: { sceneId: 2 } }));
    mock.onPost('/api/trainings/safety/sessions/20/complete', {}).reply(200, wrapped({ completed: true }));
    mock.onGet('/api/trainings/safety/sessions/20/detail').reply(200, wrapped({ score: 80, feedbackImageUrl: '/mock/result.png' }));

    await expect(getSafetyScenarios('COMMUTE_SAFETY')).resolves.toEqual([{ scenarioId: 1 }]);
    await expect(startSafetySession({ scenarioId: 1 })).resolves.toEqual({ sessionId: 20 });
    await expect(advanceSafetyScene(20, { sceneId: 1 })).resolves.toEqual({
      completed: false,
      nextScene: { sceneId: 2 },
    });
    await expect(goToNextSafetyScene(20, { sceneId: 1, choiceId: 1 })).resolves.toEqual({
      completed: false,
      nextScene: { sceneId: 2 },
    });
    await expect(completeSafetySession(20)).resolves.toEqual({ completed: true });
    await expect(getSafetySessionDetail(20)).resolves.toEqual({ score: 80, feedbackImageUrl: '/mock/result.png' });
  });

  it('calls document training endpoints and unwraps data', async () => {
    mock.onGet('/api/trainings/document/progress').reply(200, wrapped({ currentLevel: 2 }));
    mock.onPost('/api/trainings/document/sessions', { level: 1 }).reply(200, wrapped({ sessionId: 50 }));
    mock.onPost('/api/trainings/document/sessions/50/answers', { answers: [] }).reply(200, wrapped({ score: 100 }));
    mock.onGet('/api/trainings/document/sessions/50/detail').reply(200, wrapped({ score: 100 }));

    await expect(getDocumentProgress()).resolves.toEqual({ currentLevel: 2 });
    await expect(startDocumentSession({ level: 1 })).resolves.toEqual({ sessionId: 50 });
    await expect(submitDocumentAnswers(50, { answers: [] })).resolves.toEqual({ score: 100 });
    await expect(getDocumentSessionDetail(50)).resolves.toEqual({ score: 100 });
  });

  it('calls focus training endpoints and unwraps data', async () => {
    mock.onGet('/api/trainings/focus/progress').reply(200, wrapped({ currentLevel: 2 }));
    mock.onPost('/api/trainings/focus/sessions', { level: 1 }).reply(200, wrapped({ sessionId: 40, commands: [] }));
    mock
      .onPost('/api/trainings/focus/sessions/40/complete', { reactions: [] })
      .reply(200, wrapped({ score: 92, completed: true }));

    await expect(getFocusProgress()).resolves.toEqual({ currentLevel: 2 });
    await expect(startFocusSession({ level: 1 })).resolves.toEqual({ sessionId: 40, commands: [] });
    await expect(completeFocusSession(40, { reactions: [] })).resolves.toEqual({ score: 92, completed: true });
  });
});
