import MockAdapter from 'axios-mock-adapter';
import client from '../client';

let mockApi;

let mockUser = {
  userId: 1,
  loginId: 'user01',
  name: '홍길동',
  birthDate: '2000-01-01',
  gender: 'MALE',
  email: 'user@example.com',
  disabilities: ['정신적 장애'],
  desiredJob: '사무직',
  accountStatus: 'ACTIVE',
};

const socialScenarios = {
  OFFICE: [
    {
      scenarioId: 101,
      badge: '사무직',
      title: '동료에게 도움 요청하기',
      description: '모르는 업무가 있을 때 정중하게 질문하는 상황입니다.',
      npcName: '민수',
      learnerName: '지우',
      dialogues: [
        {
          speaker: 'PARTNER',
          speakerName: '민수',
          message: '지우님, 오늘 자료 정리는 잘 되고 있나요?',
        },
        {
          speaker: 'USER',
          speakerName: '지우',
          message: '아직 헷갈리는 부분이 있어서 도움을 받을 수 있을까요?',
        },
        {
          speaker: 'PARTNER',
          speakerName: '민수',
          message: '좋아요. 어느 부분이 어려운지 같이 볼게요.',
        },
        {
          speaker: 'USER',
          speakerName: '지우',
          message: '감사합니다. 다음에는 제가 먼저 확인해보고 질문하겠습니다.',
        },
      ],
    },
    {
      scenarioId: 102,
      badge: '사무직',
      title: '회의에서 의견 말하기',
      description: '회의 중 내 생각을 짧고 분명하게 말하는 상황입니다.',
      npcName: '팀장',
      learnerName: '지우',
      dialogues: [
        {
          speaker: 'PARTNER',
          speakerName: '팀장',
          message: '이번 안내문은 어떤 방식으로 정리하면 좋을까요?',
        },
        {
          speaker: 'USER',
          speakerName: '지우',
          message: '중요한 날짜를 먼저 보여주면 이해하기 쉬울 것 같습니다.',
        },
        {
          speaker: 'PARTNER',
          speakerName: '팀장',
          message: '좋은 의견이에요. 그 방식으로 초안을 만들어볼까요?',
        },
      ],
    },
  ],
  SERVICE: [
    {
      scenarioId: 201,
      badge: '서비스직',
      title: '손님에게 인사하기',
      description: '손님을 맞이하고 필요한 것을 묻는 상황입니다.',
      npcName: '손님',
      learnerName: '지우',
      dialogues: [
        {
          speaker: 'PARTNER',
          speakerName: '손님',
          message: '안녕하세요. 물건을 찾고 있어요.',
        },
        {
          speaker: 'USER',
          speakerName: '지우',
          message: '안녕하세요. 어떤 물건을 찾으시는지 알려주시면 도와드리겠습니다.',
        },
        {
          speaker: 'PARTNER',
          speakerName: '손님',
          message: '친절하게 알려줘서 고마워요.',
        },
      ],
    },
  ],
  MANUFACTURING: [
    {
      scenarioId: 301,
      badge: '생산직',
      title: '작업 순서 확인하기',
      description: '작업 전에 순서를 확인하고 안전하게 시작하는 상황입니다.',
      npcName: '선임',
      learnerName: '지우',
      dialogues: [
        {
          speaker: 'PARTNER',
          speakerName: '선임',
          message: '오늘은 포장 전에 검수를 먼저 해야 해요.',
        },
        {
          speaker: 'USER',
          speakerName: '지우',
          message: '네, 검수 후 포장 순서로 진행하겠습니다.',
        },
        {
          speaker: 'PARTNER',
          speakerName: '선임',
          message: '맞아요. 헷갈리면 바로 물어보세요.',
        },
      ],
    },
  ],
};

const safetyScenarios = {
  COMMUTE_SAFETY: [
    {
      scenarioId: 501,
      badge: '교통 안전',
      title: '횡단보도 건너기',
      description: '신호등과 주변 차량을 확인하고 안전하게 길을 건넙니다.',
      scenes: [
        {
          sceneId: 1,
          title: '횡단보도 앞',
          situationText: '길을 건너기 전 어떤 행동을 해야 할까요?',
          prompt: '신호등은 빨간불이고 차가 지나가고 있습니다.',
          choices: [
            { choiceId: 1, text: '빨리 뛰어서 건넌다.', correct: false, message: '빨간불에는 멈춰서 기다려야 해요.' },
            { choiceId: 2, text: '초록불이 될 때까지 기다린다.', correct: true, message: '맞아요. 신호를 기다리는 것이 안전합니다.' },
          ],
        },
        {
          sceneId: 2,
          title: '초록불이 켜진 뒤',
          situationText: '초록불이 켜졌습니다. 다음 행동은 무엇일까요?',
          prompt: '초록불이지만 오른쪽에서 차가 천천히 다가오고 있습니다.',
          choices: [
            { choiceId: 1, text: '좌우를 살피고 천천히 건넌다.', correct: true, message: '좋아요. 초록불이어도 주변을 확인해야 합니다.' },
            { choiceId: 2, text: '휴대폰을 보며 건넌다.', correct: false, message: '걸을 때 휴대폰을 보면 위험을 놓칠 수 있어요.' },
          ],
        },
      ],
    },
  ],
  WORKPLACE_SAFETY: [
    {
      scenarioId: 601,
      badge: '직장 안전',
      title: '젖은 바닥 지나가기',
      description: '미끄러운 바닥을 발견했을 때 안전하게 행동합니다.',
      scenes: [
        {
          sceneId: 1,
          title: '복도에서',
          situationText: '바닥에 물이 흘러 있습니다.',
          prompt: '동료들이 지나가는 복도에 물기가 보입니다.',
          choices: [
            { choiceId: 1, text: '그냥 지나간다.', correct: false, message: '미끄러질 수 있으니 조심해야 해요.' },
            { choiceId: 2, text: '주변에 알리고 천천히 피해서 간다.', correct: true, message: '맞아요. 다른 사람에게도 알려주는 것이 좋습니다.' },
          ],
        },
      ],
    },
  ],
  LIFE_SAFETY: [
    {
      scenarioId: 701,
      badge: '생활 안전',
      title: '뜨거운 물건 조심하기',
      description: '뜨거운 컵이나 냄비를 안전하게 다룹니다.',
      scenes: [
        {
          sceneId: 1,
          title: '주방에서',
          situationText: '뜨거운 컵이 놓여 있습니다.',
          prompt: '김이 나는 컵을 옮겨야 합니다.',
          choices: [
            { choiceId: 1, text: '맨손으로 바로 든다.', correct: false, message: '뜨거운 물건은 맨손으로 잡으면 다칠 수 있어요.' },
            { choiceId: 2, text: '손잡이를 잡거나 보호 장갑을 사용한다.', correct: true, message: '좋아요. 손을 보호하는 행동입니다.' },
          ],
        },
      ],
    },
  ],
};

const mockSocialSessions = new Map();
const mockSafetySessions = new Map();
let nextSocialSessionId = 1000;
let nextSafetySessionId = 2000;

const parseBody = (data) => {
  if (!data) {
    return {};
  }

  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  return data;
};

const hasBearerToken = (config) => Boolean(config.headers?.Authorization);

const requireAuth = (config) => {
  if (!hasBearerToken(config)) {
    return [
      401,
      {
        error: {
          code: 'UNAUTHORIZED',
          message: '로그인이 필요합니다.',
        },
      },
    ];
  }

  return null;
};

const wrappedTraining = (data) => ({
  success: true,
  data,
});

const findSocialScenario = (scenarioId) =>
  Object.values(socialScenarios)
    .flat()
    .find((scenario) => scenario.scenarioId === Number(scenarioId));

const findSafetyScenario = (scenarioId) =>
  Object.values(safetyScenarios)
    .flat()
    .find((scenario) => scenario.scenarioId === Number(scenarioId));

export const setupMockApi = () => {
  if (mockApi) {
    return mockApi;
  }

  mockApi = new MockAdapter(client, { delayResponse: 250 });

  mockApi.onPost('/api/auth/signup').reply((config) => {
    const payload = parseBody(config.data);

    mockUser = {
      ...mockUser,
      loginId: payload.loginId,
      name: payload.name,
      birthDate: payload.birthDate,
      gender: payload.gender,
      email: payload.email,
      disabilities: payload.disabilities ?? [],
      desiredJob: payload.desiredJob,
    };

    return [200, { userId: mockUser.userId, message: '회원가입이 완료되었습니다.' }];
  });

  mockApi.onPost('/api/auth/login').reply((config) => {
    const payload = parseBody(config.data);

    if (!payload.loginId || !payload.password) {
      return [
        400,
        {
          error: {
            code: 'VALIDATION_ERROR',
            message: '아이디와 비밀번호를 입력해주세요.',
          },
        },
      ];
    }

    return [
      200,
      {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: mockUser,
      },
    ];
  });

  mockApi.onPost('/api/auth/logout').reply(200, {
    message: '로그아웃이 완료되었습니다.',
  });

  mockApi.onPost('/api/auth/reissue').reply(200, {
    accessToken: 'mock-reissued-access-token',
    refreshToken: 'mock-reissued-refresh-token',
  });

  mockApi.onGet('/api/users/me').reply((config) => {
    const authError = requireAuth(config);
    if (authError) {
      return authError;
    }

    return [200, mockUser];
  });

  mockApi.onPatch('/api/users/me').reply((config) => {
    const authError = requireAuth(config);
    if (authError) {
      return authError;
    }

    const payload = parseBody(config.data);

    mockUser = {
      ...mockUser,
      ...payload,
      disabilities: payload.disabilities ?? mockUser.disabilities,
    };

    return [200, { message: '사용자 정보가 수정되었습니다.' }];
  });

  mockApi.onPost('/api/trainings/social/job-type').reply((config) => {
    const authError = requireAuth(config);
    if (authError) {
      return authError;
    }

    const payload = parseBody(config.data);

    return [
      200,
      wrappedTraining({
        jobType: payload.jobType,
        nextPage: 'SCENARIO_SELECTION',
      }),
    ];
  });

  mockApi.onGet('/api/trainings/social/scenarios').reply((config) => {
    const authError = requireAuth(config);
    if (authError) {
      return authError;
    }

    const jobType = config.params?.jobType || 'OFFICE';
    const scenarios = socialScenarios[jobType] || [];

    return [
      200,
      wrappedTraining(
        scenarios.map(({ dialogues, ...scenario }) => ({
          ...scenario,
          dialogueCount: dialogues.length,
        })),
      ),
    ];
  });

  mockApi.onGet(/\/api\/trainings\/social\/scenarios\/\d+$/).reply((config) => {
    const authError = requireAuth(config);
    if (authError) {
      return authError;
    }

    const scenarioId = config.url.split('/').pop();
    const scenario = findSocialScenario(scenarioId);

    if (!scenario) {
      return [404, { success: false, error: { code: 'NOT_FOUND', message: '시나리오를 찾을 수 없습니다.' } }];
    }

    return [200, wrappedTraining(scenario)];
  });

  mockApi.onPost('/api/trainings/social/sessions').reply((config) => {
    const authError = requireAuth(config);
    if (authError) {
      return authError;
    }

    const payload = parseBody(config.data);
    const scenario = findSocialScenario(payload.scenarioId);
    const sessionId = nextSocialSessionId;
    nextSocialSessionId += 1;

    mockSocialSessions.set(sessionId, {
      sessionId,
      scenarioId: payload.scenarioId,
      scenario,
      score: 0,
    });

    return [200, wrappedTraining({ sessionId, scenarioId: payload.scenarioId })];
  });

  mockApi.onPost(/\/api\/trainings\/social\/sessions\/\d+\/voice\/prepare$/).reply((config) => {
    const authError = requireAuth(config);
    if (authError) {
      return authError;
    }

    const sessionId = Number(config.url.split('/').at(-3));

    return [200, wrappedTraining({ sessionId, connectionToken: `mock-social-${sessionId}` })];
  });

  mockApi.onPost(/\/api\/trainings\/social\/sessions\/\d+\/complete$/).reply((config) => {
    const authError = requireAuth(config);
    if (authError) {
      return authError;
    }

    const sessionId = Number(config.url.split('/').at(-2));
    const session = mockSocialSessions.get(sessionId);

    if (!session) {
      return [404, { success: false, error: { code: 'NOT_FOUND', message: '훈련 세션을 찾을 수 없습니다.' } }];
    }

    const result = {
      sessionId,
      score: 86,
      title: '대화를 자연스럽게 이어갔어요',
      feedback: '상대방의 말을 듣고 필요한 도움을 정중하게 요청했습니다.',
    };

    mockSocialSessions.set(sessionId, { ...session, ...result });

    return [200, wrappedTraining(result)];
  });

  mockApi.onGet(/\/api\/trainings\/social\/sessions\/\d+\/detail$/).reply((config) => {
    const authError = requireAuth(config);
    if (authError) {
      return authError;
    }

    const sessionId = Number(config.url.split('/').at(-2));
    const session = mockSocialSessions.get(sessionId);

    if (!session) {
      return [404, { success: false, error: { code: 'NOT_FOUND', message: '훈련 세션을 찾을 수 없습니다.' } }];
    }

    return [
      200,
      wrappedTraining({
        sessionId,
        score: session.score || 86,
        title: session.title || '사회성 훈련을 완료했어요',
        feedback: session.feedback || '상황에 맞게 대화를 이어가는 연습을 했습니다.',
      }),
    ];
  });

  mockApi.onGet('/api/trainings/safety/scenarios').reply((config) => {
    const authError = requireAuth(config);
    if (authError) {
      return authError;
    }

    const category = config.params?.category || 'COMMUTE_SAFETY';
    const scenarios = safetyScenarios[category] || [];

    return [
      200,
      wrappedTraining(
        scenarios.map(({ scenes, ...scenario }) => ({
          ...scenario,
          sceneCount: scenes.length,
        })),
      ),
    ];
  });

  mockApi.onPost('/api/trainings/safety/sessions').reply((config) => {
    const authError = requireAuth(config);
    if (authError) {
      return authError;
    }

    const payload = parseBody(config.data);
    const scenario = findSafetyScenario(payload.scenarioId);

    if (!scenario) {
      return [404, { success: false, error: { code: 'NOT_FOUND', message: '시나리오를 찾을 수 없습니다.' } }];
    }

    const sessionId = nextSafetySessionId;
    nextSafetySessionId += 1;

    mockSafetySessions.set(sessionId, {
      sessionId,
      scenarioId: payload.scenarioId,
      scenario,
      currentSceneIndex: 0,
      correctCount: 0,
    });

    return [
      200,
      wrappedTraining({
        sessionId,
        currentScene: scenario.scenes[0],
      }),
    ];
  });

  mockApi.onPost(/\/api\/trainings\/safety\/sessions\/\d+\/next-scene$/).reply((config) => {
    const authError = requireAuth(config);
    if (authError) {
      return authError;
    }

    const sessionId = Number(config.url.split('/').at(-2));
    const payload = parseBody(config.data);
    const session = mockSafetySessions.get(sessionId);

    if (!session) {
      return [404, { success: false, error: { code: 'NOT_FOUND', message: '훈련 세션을 찾을 수 없습니다.' } }];
    }

    const sceneIndex = session.scenario.scenes.findIndex((scene) => scene.sceneId === payload.sceneId);
    const scene = session.scenario.scenes[sceneIndex] || session.scenario.scenes[session.currentSceneIndex];
    const choice = scene.choices.find((item) => item.choiceId === payload.choiceId);
    const nextSceneIndex = sceneIndex + 1;
    const completed = nextSceneIndex >= session.scenario.scenes.length;
    const updatedSession = {
      ...session,
      currentSceneIndex: completed ? sceneIndex : nextSceneIndex,
      correctCount: session.correctCount + (choice?.correct ? 1 : 0),
    };

    mockSafetySessions.set(sessionId, updatedSession);

    return [
      200,
      wrappedTraining({
        selectedResult: {
          correct: Boolean(choice?.correct),
          message: choice?.message || '선택 결과를 확인했습니다.',
        },
        nextScene: completed ? null : session.scenario.scenes[nextSceneIndex],
        completed,
      }),
    ];
  });

  mockApi.onPost(/\/api\/trainings\/safety\/sessions\/\d+\/complete$/).reply((config) => {
    const authError = requireAuth(config);
    if (authError) {
      return authError;
    }

    const sessionId = Number(config.url.split('/').at(-2));
    const session = mockSafetySessions.get(sessionId);

    if (!session) {
      return [404, { success: false, error: { code: 'NOT_FOUND', message: '훈련 세션을 찾을 수 없습니다.' } }];
    }

    const totalScenes = session.scenario.scenes.length;
    const score = Math.round((session.correctCount / totalScenes) * 100);
    const result = {
      sessionId,
      score,
      title: '안전한 선택을 연습했어요',
      feedback: '상황을 보고 멈추기, 살피기, 도움 요청하기를 연습했습니다.',
    };

    mockSafetySessions.set(sessionId, { ...session, ...result });

    return [200, wrappedTraining(result)];
  });

  mockApi.onGet(/\/api\/trainings\/safety\/sessions\/\d+\/detail$/).reply((config) => {
    const authError = requireAuth(config);
    if (authError) {
      return authError;
    }

    const sessionId = Number(config.url.split('/').at(-2));
    const session = mockSafetySessions.get(sessionId);

    if (!session) {
      return [404, { success: false, error: { code: 'NOT_FOUND', message: '훈련 세션을 찾을 수 없습니다.' } }];
    }

    return [
      200,
      wrappedTraining({
        sessionId,
        score: session.score || 0,
        title: session.title || '안전훈련을 완료했어요',
        feedback: session.feedback || '위험한 상황에서 안전한 선택을 연습했습니다.',
      }),
    ];
  });

  mockApi.onAny().passThrough();

  return mockApi;
};
