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
  disabilities: ['지적장애'],
  desiredJob: '사무직',
  accountStatus: 'ACTIVE',
};

const socialScenarios = {
  OFFICE: [
    {
      scenarioId: 101,
      badge: '사무직',
      title: '회의 자료를 몇 부 복사해야 하는지 모르겠어요',
      description: '상사에게 필요한 정보를 다시 묻고 확인하는 연습입니다.',
      situationText: '상사가 회의 자료를 복사해 달라고 했지만 몇 부가 필요한지 정확히 듣지 못했습니다.',
      npcName: '민수',
      learnerName: '지우',
      dialogues: [
        { speaker: 'PARTNER', speakerName: '민수', message: '지우 씨, 오늘 회의 자료 복사 부탁해요.' },
        { speaker: 'USER', speakerName: '지우', message: '몇 부가 필요한지 다시 한번 말씀해 주실 수 있을까요?' },
        { speaker: 'PARTNER', speakerName: '민수', message: '좋아요. 다섯 부만 준비하면 됩니다.' },
        { speaker: 'USER', speakerName: '지우', message: '네, 다섯 부 복사해서 가져다 드릴게요.' },
      ],
    },
    {
      scenarioId: 102,
      badge: '사무직',
      title: '업무 중 실수를 발견했어요',
      description: '실수를 숨기지 않고 바로 보고하는 연습입니다.',
      situationText: '입력한 숫자 중 하나가 잘못된 것을 발견했습니다. 바로 보고하고 수정해야 합니다.',
      npcName: '대리님',
      learnerName: '지우',
      dialogues: [
        { speaker: 'PARTNER', speakerName: '대리님', message: '자료 정리는 잘 되고 있나요?' },
        { speaker: 'USER', speakerName: '지우', message: '입력한 숫자 하나가 잘못된 것을 확인했습니다.' },
        { speaker: 'PARTNER', speakerName: '대리님', message: '바로 알려줘서 고마워요. 같이 수정해 봅시다.' },
      ],
    },
  ],
  LABOR: [
    {
      scenarioId: 201,
      badge: '현장직',
      title: '무거운 상자를 옮길 때 도움 요청하기',
      description: '무거운 물건을 혼자 들지 않고 안전하게 도움을 요청하는 연습입니다.',
      situationText: '무거운 상자를 옮겨야 하지만 혼자 들기에는 무겁습니다.',
      npcName: '주임',
      learnerName: '지우',
      dialogues: [
        { speaker: 'PARTNER', speakerName: '주임', message: '이 상자들을 창고로 옮겨야 합니다.' },
        { speaker: 'USER', speakerName: '지우', message: '상자가 무거워서 같이 옮겨 주실 수 있을까요?' },
        { speaker: 'PARTNER', speakerName: '주임', message: '좋아요. 같이 들면 더 안전합니다.' },
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
      description: '신호와 주변 차량을 확인하고 안전하게 길을 건너는 연습입니다.',
      scenes: [
        {
          sceneId: 1,
          screenInfo: '횡단보도 앞',
          title: '횡단보도 앞',
          situationText: '신호등이 빨간불이고 차가 지나가고 있습니다.',
          imageUrl: '/mock/trainings/safety/scenes/office-intro.png',
          imageAlt: '횡단보도 앞에서 신호를 기다리는 장면',
          choices: [],
        },
        {
          sceneId: 2,
          screenInfo: '초록불이 켜진 뒤',
          title: '초록불이 켜진 뒤',
          situationText: '초록불이 켜졌지만 옆 차선에서 차량이 천천히 지나가고 있습니다.',
          questionText: '이제 어떻게 해야 할까요?',
          imageUrl: '/mock/trainings/safety/scenes/office-intro.png',
          imageAlt: '초록불이 켜진 뒤 주변을 살피는 장면',
          feedbackImageUrl: '/mock/trainings/safety/feedback/workplace-touch-correct.png',
          feedbackImageAlt: '안전하게 주변을 살피고 건너는 결과 화면',
          choices: [
            {
              choiceId: 1,
              text: '좌우를 살피고 천천히 건넌다.',
              correct: true,
              message: '좋아요. 초록불이어도 주변을 확인해야 합니다.',
              resultText: '좌우를 살피고 건너는 선택이 안전합니다.',
              effectText: '주변을 확인하는 습관이 몸을 지켜 줍니다.',
              feedbackImageUrl: '/mock/trainings/safety/feedback/workplace-touch-correct.png',
              feedbackImageAlt: '안전하게 횡단보도를 건너는 결과 화면',
            },
            {
              choiceId: 2,
              text: '휴대전화를 보며 건넌다.',
              correct: false,
              message: '길을 건널 때는 앞과 좌우를 계속 봐야 해요.',
              resultText: '길을 건널 때는 휴대전화를 보지 않는 것이 안전합니다.',
              effectText: '주변을 보지 않으면 위험을 늦게 발견할 수 있습니다.',
              feedbackImageUrl: '/mock/trainings/safety/scenes/office-intro.png',
              feedbackImageAlt: '주의를 놓친 채 길을 건너는 상황',
            },
          ],
        },
        {
          sceneId: 3,
          screenInfo: '횡단보도를 건너는 중',
          title: '횡단보도를 건너는 중',
          situationText: '횡단보도를 건너는 중에도 주변을 계속 살펴야 합니다.',
          questionText: '끝까지 안전하게 건너려면 어떻게 해야 할까요?',
          imageUrl: '/mock/trainings/safety/scenes/office-intro.png',
          imageAlt: '횡단보도를 건너는 중인 장면',
          feedbackImageUrl: '/mock/trainings/safety/feedback/workplace-touch-correct.png',
          feedbackImageAlt: '안전하게 길을 건너 훈련을 마무리한 결과 화면',
          choices: [
            {
              choiceId: 1,
              text: '앞을 보고 빠르게 끝까지 건넌다.',
              correct: true,
              message: '좋아요. 끝까지 집중해서 이동하는 것이 안전합니다.',
              resultText: '끝까지 주변을 살피며 이동했습니다.',
              effectText: '도로에서는 마지막까지 주의를 유지해야 합니다.',
              feedbackImageUrl: '/mock/trainings/safety/feedback/workplace-touch-correct.png',
              feedbackImageAlt: '안전하게 횡단보도를 끝까지 건너는 결과 화면',
            },
            {
              choiceId: 2,
              text: '중간에 멈춰 휴대전화를 확인한다.',
              correct: false,
              message: '도로를 건널 때는 멈추거나 한눈팔지 않는 것이 좋습니다.',
              resultText: '이동 중에는 주의를 다른 곳에 빼앗기지 않아야 합니다.',
              effectText: '한눈을 팔면 주변 위험을 늦게 발견할 수 있습니다.',
              feedbackImageUrl: '/mock/trainings/safety/scenes/office-intro.png',
              feedbackImageAlt: '횡단 중 주의를 놓친 상황',
            },
          ],
        },
      ],
    },
  ],
  WORKPLACE_SAFETY: [
    {
      scenarioId: 601,
      badge: '직장 안전',
      title: '원하지 않는 접촉 대처하기',
      description: '불편한 신체 접촉 상황에서 분명하게 거절하고 도움을 요청하는 연습입니다.',
      scenes: [
        {
          sceneId: 1,
          screenInfo: '사무실 자리',
          title: '사무실 자리',
          situationText: '사수가 어깨를 주무르며 다가옵니다. 나는 너무 당황해서 몸이 얼어버렸습니다.',
          imageUrl: '/mock/trainings/safety/scenes/workplace-touch-01.png',
          imageAlt: '상사가 앉아 있는 직원의 어깨에 손을 올리는 사무실 장면',
          feedbackImageUrl: '/mock/trainings/safety/feedback/workplace-touch-correct.png',
          feedbackImageAlt: '불편한 접촉을 분명히 거절한 결과 화면',
          choices: [],
        },
        {
          sceneId: 2,
          screenInfo: '자리에서 벗어난 뒤',
          title: '자리에서 벗어난 뒤',
          situationText: '상황이 불편해서 잠시 자리를 벗어났습니다. 이제 누구에게 알릴지 생각해야 합니다.',
          questionText: '다음으로 어떻게 행동하는 것이 좋을까요?',
          imageUrl: '/mock/trainings/safety/scenes/workplace-touch-choice.png',
          imageAlt: '불편한 상황 뒤에 대응 방법을 고르는 장면',
          feedbackImageUrl: '/mock/trainings/safety/feedback/workplace-touch-correct.png',
          feedbackImageAlt: '도움을 요청하는 올바른 대응 결과 화면',
          choices: [
            {
              choiceId: 1,
              text: '믿을 수 있는 담당자에게 바로 알린다.',
              correct: true,
              message: '좋아요. 혼자 참지 말고 믿을 수 있는 사람에게 알려야 합니다.',
              resultText: '상황을 혼자 감당하지 않고 바로 도움을 요청했습니다.',
              effectText: '도움을 요청하면 더 안전하게 보호받을 수 있습니다.',
            },
            {
              choiceId: 2,
              text: '아무에게도 말하지 않고 그냥 넘어간다.',
              correct: false,
              message: '불편한 접촉은 숨기지 말고 알려도 됩니다.',
              resultText: '불편한 상황은 혼자 감추지 않는 것이 좋습니다.',
              effectText: '알려야 적절한 도움과 보호를 받을 수 있습니다.',
              feedbackImageUrl: '/mock/trainings/safety/scenes/workplace-touch-choice.png',
              feedbackImageAlt: '도움을 요청하지 않고 혼자 고민하는 상황',
            },
          ],
        },
        {
          sceneId: 3,
          screenInfo: '상황 정리',
          title: '상황 정리',
          situationText: '도움을 요청한 뒤에는 안전한 공간으로 이동해 상황을 정리합니다.',
          questionText: '마지막으로 무엇을 기억하면 좋을까요?',
          imageUrl: '/mock/trainings/safety/scenes/workplace-touch-choice.png',
          imageAlt: '상황을 정리하며 안전 수칙을 확인하는 장면',
          feedbackImageUrl: '/mock/trainings/safety/feedback/workplace-touch-correct.png',
          feedbackImageAlt: '경계를 지키고 도움을 요청해 훈련을 마무리한 결과 화면',
          choices: [
            {
              choiceId: 5,
              text: '원하지 않는 접촉은 분명히 거절하고 도움을 요청한다.',
              correct: true,
              message: '맞아요. 이것이 나를 지키는 중요한 방법입니다.',
              resultText: '경계를 표현하고 도움을 요청하는 방법을 기억했습니다.',
              effectText: '불편한 상황에서는 내 의사를 분명히 말하는 것이 중요합니다.',
              feedbackImageUrl: '/mock/trainings/safety/feedback/workplace-touch-correct.png',
              feedbackImageAlt: '안전하게 상황을 마무리한 결과 화면',
            },
            {
              choiceId: 6,
              text: '상대가 불편해할까 봐 아무 말도 하지 않는다.',
              correct: false,
              message: '내가 불편했다면 말할 수 있고 도움도 요청할 수 있습니다.',
              resultText: '불편한 상황에서는 참지 않고 대응하는 것이 좋습니다.',
              effectText: '내 안전과 경계가 먼저입니다.',
              feedbackImageUrl: '/mock/trainings/safety/scenes/workplace-touch-choice.png',
              feedbackImageAlt: '참고 넘어가려는 상황',
            },
          ],
        },
      ],
    },
  ],
  DAILY_SAFETY: [
    {
      scenarioId: 701,
      badge: '생활 안전',
      title: '뜨거운 물건 다루기',
      description: '뜨거운 조리도구를 만질 때 보호 도구를 사용해 안전하게 행동하는 연습입니다.',
      scenes: [
        {
          sceneId: 1,
          screenInfo: '주방',
          title: '주방',
          situationText: '끓는 냄비 손잡이를 잡아야 합니다.',
          imageUrl: '/mock/trainings/safety/scenes/office-intro.png',
          imageAlt: '뜨거운 물건을 조심해야 하는 생활 안전 장면',
          feedbackImageUrl: '/mock/trainings/safety/feedback/workplace-touch-correct.png',
          feedbackImageAlt: '보호 장비를 사용해 안전하게 행동한 결과 화면',
          choices: [],
        },
        {
          sceneId: 2,
          screenInfo: '뜨거운 냄비를 옮기기 전',
          title: '뜨거운 냄비를 옮기기 전',
          situationText: '보호 도구를 준비했지만 바닥이 미끄럽지 않은지도 확인해야 합니다.',
          questionText: '옮기기 전에 무엇을 더 확인해야 할까요?',
          imageUrl: '/mock/trainings/safety/scenes/office-intro.png',
          imageAlt: '뜨거운 냄비를 옮기기 전 주변을 확인하는 장면',
          feedbackImageUrl: '/mock/trainings/safety/feedback/workplace-touch-correct.png',
          feedbackImageAlt: '주변을 확인한 뒤 안전하게 행동하는 결과 화면',
          choices: [
            {
              choiceId: 1,
              text: '주변이 미끄럽지 않은지 보고 천천히 움직인다.',
              correct: true,
              message: '좋아요. 주변 환경까지 확인하면 더 안전합니다.',
              resultText: '주변 위험 요소를 먼저 확인했습니다.',
              effectText: '안전한 행동은 도구뿐 아니라 주변 확인까지 포함합니다.',
            },
            {
              choiceId: 2,
              text: '빨리 끝내려고 바로 움직인다.',
              correct: false,
              message: '급하게 움직이면 넘어지거나 데일 수 있어요.',
              resultText: '뜨거운 물건은 서두르지 않는 것이 중요합니다.',
              effectText: '천천히 주변을 확인하며 움직여야 합니다.',
            },
          ],
        },
        {
          sceneId: 3,
          screenInfo: '이동을 마무리할 때',
          title: '이동을 마무리할 때',
          situationText: '뜨거운 냄비를 내려놓을 자리를 정한 뒤 끝까지 조심해서 옮겨야 합니다.',
          questionText: '마지막으로 어떻게 행동하는 것이 좋을까요?',
          imageUrl: '/mock/trainings/safety/scenes/office-intro.png',
          imageAlt: '뜨거운 물건을 안전하게 내려놓는 장면',
          feedbackImageUrl: '/mock/trainings/safety/feedback/workplace-touch-correct.png',
          feedbackImageAlt: '뜨거운 물건을 안전하게 옮겨 훈련을 마무리한 결과 화면',
          choices: [
            {
              choiceId: 5,
              text: '내려놓을 자리를 미리 보고 천천히 내려놓는다.',
              correct: true,
              message: '맞아요. 끝까지 조심하는 것이 중요합니다.',
              resultText: '뜨거운 물건을 안전하게 이동하고 정리했습니다.',
              effectText: '위험한 물건은 시작부터 끝까지 천천히 다뤄야 합니다.',
            },
            {
              choiceId: 6,
              text: '대충 빈 곳에 빠르게 내려놓는다.',
              correct: false,
              message: '내려놓는 순간에도 화상이나 쏟아짐에 주의해야 합니다.',
              resultText: '마지막 순간까지 안전을 확인해야 합니다.',
              effectText: '급하게 내려놓으면 다칠 수 있습니다.',
            },
          ],
        },
      ],
    },
  ],
};

const mockSocialSessions = new Map();
const mockSafetySessions = new Map();
const mockDocumentSessions = new Map();
let nextSocialSessionId = 1000;
let nextSafetySessionId = 2000;
let nextDocumentSessionId = 3000;

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

const cloneSafetyScene = (scene, endScene = false) => ({
  sceneId: scene.sceneId,
  screenInfo: scene.screenInfo,
  title: scene.title,
  situationText: scene.situationText,
  questionText: scene.questionText,
  imageUrl: scene.imageUrl,
  imageAlt: scene.imageAlt,
  choices: (scene.choices || []).map(({ choiceId, text }) => ({ choiceId, text })),
  endScene,
});

const buildSafetyResult = (choice, scene, score) => ({
  correct: Boolean(choice?.correct),
  title: choice?.correct ? '잘했어요!' : '다시 생각해볼까요?',
  score,
  resultText: choice?.resultText || choice?.message || '선택 결과를 확인해 주세요.',
  effectText: choice?.effectText || (choice?.correct ? '나를 지키는 적절한 선택이었습니다.' : '다른 선택이 더 안전합니다.'),
  feedbackImageUrl: choice?.feedbackImageUrl || scene.feedbackImageUrl || scene.imageUrl,
  feedbackImageAlt: choice?.feedbackImageAlt || scene.feedbackImageAlt || scene.imageAlt,
  feedback: choice?.resultText || choice?.message || '선택 결과를 확인해 주세요.',
});

const documentQuestions = [
  {
    questionId: 1,
    title: '회의실 예약 안내',
    documentText: '회의실 2번은 오후 3시에 사용할 수 있습니다. 사용 전에는 불을 끄고 문을 닫아 주세요.',
    questionText: '오후 3시에 사용할 수 있는 회의실은 어디인가요?',
    questionType: 'MULTIPLE_CHOICE',
    choices: [
      { choiceId: 10, choiceOrder: 1, text: '회의실 2번' },
      { choiceId: 11, choiceOrder: 2, text: '창고' },
      { choiceId: 12, choiceOrder: 3, text: '휴게실' },
    ],
    correctChoiceId: 10,
    correctAnswer: '회의실 2번',
    explanation: '문서에 회의실 2번을 오후 3시에 사용할 수 있다고 적혀 있습니다.',
  },
  {
    questionId: 2,
    title: '작업 안내문',
    documentText: '복사한 서류는 종류별로 나누어 파란 파일에 넣습니다.',
    questionText: '복사한 서류는 어디에 넣어야 하나요?',
    questionType: 'MULTIPLE_CHOICE',
    choices: [
      { choiceId: 20, choiceOrder: 1, text: '책상 위' },
      { choiceId: 21, choiceOrder: 2, text: '파란 파일' },
      { choiceId: 22, choiceOrder: 3, text: '휴지통' },
    ],
    correctChoiceId: 21,
    correctAnswer: '파란 파일',
    explanation: '안내문에 파란 파일에 넣으라고 적혀 있습니다.',
  },
];

const historySessions = {
  SOCIAL: [
    {
      sessionId: 100,
      scenarioId: 101,
      scenarioTitle: '회의 자료를 몇 부 복사해야 하는지 모르겠어요',
      trainingType: 'SOCIAL',
      score: 90,
      feedbackSummary: '상대방에게 필요한 내용을 다시 확인하는 연습을 잘했습니다.',
      situationText: '상사가 회의 자료를 복사해 달라고 했지만 몇 부가 필요한지 정확히 듣지 못했습니다.',
      completedAt: '2026-05-01T10:00:00',
    },
    {
      sessionId: 101,
      scenarioId: 102,
      scenarioTitle: '업무 중 실수를 발견했어요',
      trainingType: 'SOCIAL',
      score: 82,
      feedbackSummary: '실수를 숨기지 않고 바로 보고하는 연습을 했습니다.',
      completedAt: '2026-05-02T10:00:00',
    },
    {
      sessionId: 102,
      scenarioId: 201,
      scenarioTitle: '무거운 상자를 옮길 때 도움 요청하기',
      trainingType: 'SOCIAL',
      score: 88,
      feedbackSummary: '도움이 필요한 상황을 분명하게 요청했습니다.',
      completedAt: '2026-05-03T10:00:00',
    },
    {
      sessionId: 103,
      scenarioId: 101,
      scenarioTitle: '회의 자료를 몇 부 복사해야 하는지 모르겠어요',
      trainingType: 'SOCIAL',
      score: 94,
      feedbackSummary: '모르는 부분을 구체적으로 확인했습니다.',
      completedAt: '2026-05-04T10:00:00',
    },
  ],
  SAFETY: [
    {
      sessionId: 200,
      scenarioId: 501,
      scenarioTitle: '횡단보도 건너기',
      trainingType: 'SAFETY',
      score: 80,
      feedbackSummary: '신호와 주변 차량을 확인하는 선택이 좋았습니다.',
      completedAt: '2026-05-01T11:00:00',
    },
  ],
  DOCUMENT: [
    {
      sessionId: 300,
      scenarioId: null,
      scenarioTitle: '회의실 예약 안내',
      trainingType: 'DOCUMENT',
      score: 100,
      feedbackSummary: '문서에서 필요한 정보를 정확하게 찾았습니다.',
      completedAt: '2026-05-01T12:00:00',
    },
  ],
};

const publicDocumentQuestions = () =>
  documentQuestions.map((question) => ({
    questionId: question.questionId,
    title: question.title,
    documentText: question.documentText,
    questionText: question.questionText,
    questionType: question.questionType,
    choices: question.choices,
  }));

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
            message: '아이디와 비밀번호를 입력해 주세요.',
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
      title: '대화를 자연스럽게 이어갔어요.',
      feedback: '상대방의 말을 듣고 필요한 내용을 차분하게 요청했습니다.',
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
        title: session.title || '사회성 훈련을 완료했어요.',
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
      return [404, { success: false, error: { code: 'NOT_FOUND', message: '????? ?? ? ????.' } }];
    }
    const sessionId = nextSafetySessionId;
    nextSafetySessionId += 1;
    mockSafetySessions.set(sessionId, {
      sessionId,
      scenarioId: payload.scenarioId,
      scenario,
      sceneIndex: 0,
      correctCount: 0,
      completed: false,
      result: null,
      score: 0,
    });
    return [
      200,
      wrappedTraining({
        sessionId,
        scene: cloneSafetyScene(scenario.scenes[0], scenario.scenes.length === 1),
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
    const sceneIndex = session.scenario.scenes.findIndex((item) => item.sceneId === payload.sceneId);
    const currentIndex = sceneIndex >= 0 ? sceneIndex : session.sceneIndex;
    const scene = session.scenario.scenes[currentIndex];
    const hasChoices = Array.isArray(scene.choices) && scene.choices.length > 0;
    const choice = hasChoices ? scene.choices.find((item) => item.choiceId === payload.choiceId) : null;
    const nextSceneIndex = currentIndex + 1;
    const completed = nextSceneIndex >= session.scenario.scenes.length;
    const nextCorrectCount = session.correctCount + (choice?.correct ? 1 : 0);
    const score = Math.round((nextCorrectCount / session.scenario.scenes.length) * 100);
    const result = hasChoices ? buildSafetyResult(choice, scene, score) : null;
    mockSafetySessions.set(sessionId, {
      ...session,
      sceneIndex: completed ? currentIndex : nextSceneIndex,
      correctCount: nextCorrectCount,
      completed,
      result,
      score,
    });
    return [
      200,
      wrappedTraining(
        completed
          ? {
              completed: true,
              result: result || {
                correct: true,
                title: '잘했어요!',
                score,
                resultText: '상황을 차분히 확인하며 훈련을 마무리했습니다.',
                effectText: '상황을 먼저 이해하고 다음 행동을 준비하는 것도 중요한 안전 행동입니다.',
                feedbackImageUrl: scene.feedbackImageUrl || scene.imageUrl,
                feedbackImageAlt: scene.feedbackImageAlt || scene.imageAlt,
                feedback: '상황을 차분히 확인하며 훈련을 마무리했습니다.',
              },
            }
          : {
              completed: false,
              nextScene: cloneSafetyScene(
                session.scenario.scenes[nextSceneIndex],
                nextSceneIndex === session.scenario.scenes.length - 1,
              ),
            },
      ),
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
    const score = session.score || Math.round((session.correctCount / totalScenes) * 100);
    const result = {
      sessionId,
      score,
      title: session.result?.title || '안전 훈련을 마쳤어요.',
      feedback: session.result?.effectText || '상황을 보고 안전한 선택을 연습했습니다.',
      correct: session.result?.correct ?? score >= 70,
      resultText: session.result?.resultText || '선택 결과를 확인해 주세요.',
      effectText: session.result?.effectText || '상황을 보고 안전한 선택을 연습했습니다.',
      feedbackImageUrl: session.result?.feedbackImageUrl || session.scenario.scenes.at(-1)?.feedbackImageUrl || session.scenario.scenes.at(-1)?.imageUrl,
      feedbackImageAlt: session.result?.feedbackImageAlt || session.scenario.scenes.at(-1)?.feedbackImageAlt || session.scenario.scenes.at(-1)?.imageAlt,
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
    const latestScene = session.scenario.scenes.at(Math.min(session.sceneIndex, session.scenario.scenes.length - 1));
    return [
      200,
      wrappedTraining({
        sessionId,
        score: session.score || 0,
        title: session.result?.title || session.title || '안전 훈련을 마쳤어요.',
        feedback: session.result?.effectText || session.feedback || '위험한 상황에서 안전한 선택을 연습했습니다.',
        correct: session.result?.correct ?? (session.score || 0) >= 70,
        resultText: session.result?.resultText || '선택 결과를 확인해 주세요.',
        effectText: session.result?.effectText || session.feedback || '위험한 상황에서 안전한 선택을 연습했습니다.',
        feedbackImageUrl: session.result?.feedbackImageUrl || session.scenario.scenes.at(-1)?.feedbackImageUrl || session.scenario.scenes.at(-1)?.imageUrl,
        feedbackImageAlt: session.result?.feedbackImageAlt || session.scenario.scenes.at(-1)?.feedbackImageAlt || session.scenario.scenes.at(-1)?.imageAlt,
        latestSceneImageUrl: latestScene?.imageUrl,
        latestSceneImageAlt: latestScene?.imageAlt,
      }),
    ];
  });

  mockApi.onGet('/api/trainings/document/progress').reply((config) => {
    const authError = requireAuth(config);
    if (authError) {
      return authError;
    }

    return [
      200,
      wrappedTraining({
        currentLevel: 1,
        highestUnlockedLevel: 2,
        lastPlayedLevel: 1,
        lastAccuracyRate: 100,
        lastAverageReactionMs: null,
      }),
    ];
  });

  mockApi.onPost('/api/trainings/document/sessions').reply((config) => {
    const authError = requireAuth(config);
    if (authError) {
      return authError;
    }

    const payload = parseBody(config.data);
    const sessionId = nextDocumentSessionId;
    nextDocumentSessionId += 1;

    mockDocumentSessions.set(sessionId, {
      sessionId,
      level: payload.level || 1,
      questions: documentQuestions,
      score: 0,
    });

    return [
      200,
      wrappedTraining({
        sessionId,
        questions: publicDocumentQuestions(),
      }),
    ];
  });

  mockApi.onPost(/\/api\/trainings\/document\/sessions\/\d+\/answers$/).reply((config) => {
    const authError = requireAuth(config);
    if (authError) {
      return authError;
    }

    const sessionId = Number(config.url.split('/').at(-2));
    const session = mockDocumentSessions.get(sessionId);

    if (!session) {
      return [404, { success: false, error: { code: 'NOT_FOUND', message: '훈련 세션을 찾을 수 없습니다.' } }];
    }

    const payload = parseBody(config.data);
    const results = session.questions.map((question) => {
      const answer = payload.answers?.find((item) => item.questionId === question.questionId);
      const correct = answer?.choiceId === question.correctChoiceId;

      return {
        questionId: question.questionId,
        correct,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
      };
    });
    const correctCount = results.filter((result) => result.correct).length;
    const totalCount = results.length;
    const score = Math.round((correctCount / totalCount) * 100);
    const result = {
      sessionId,
      score,
      correctCount,
      totalCount,
      results,
      completed: true,
    };

    mockDocumentSessions.set(sessionId, { ...session, ...result });

    return [200, wrappedTraining(result)];
  });

  mockApi.onGet(/\/api\/trainings\/document\/sessions\/\d+\/detail$/).reply((config) => {
    const authError = requireAuth(config);
    if (authError) {
      return authError;
    }

    const sessionId = Number(config.url.split('/').at(-2));
    const session = mockDocumentSessions.get(sessionId);

    if (!session) {
      return [404, { success: false, error: { code: 'NOT_FOUND', message: '훈련 세션을 찾을 수 없습니다.' } }];
    }

    return [
      200,
      wrappedTraining({
        sessionId,
        score: session.score || 0,
        answerSummary: {
          correctCount: session.correctCount || 0,
          totalCount: session.totalCount || session.questions.length,
        },
        answers:
          session.results?.map((result) => {
            const question = session.questions.find((item) => item.questionId === result.questionId);
            return {
              questionId: result.questionId,
              questionText: question?.questionText,
              userAnswer: null,
              correctAnswer: result.correctAnswer,
              correct: result.correct,
              explanation: result.explanation,
            };
          }) || [],
      }),
    ];
  });

  mockApi.onGet('/api/trainings/progress/summary').reply((config) => {
    const authError = requireAuth(config);
    if (authError) {
      return authError;
    }

    return [
      200,
      wrappedTraining({
        items: [
          { trainingType: 'SOCIAL', level: 3 },
          { trainingType: 'SAFETY', level: 2 },
          { trainingType: 'DOCUMENT', level: 1 },
        ],
      }),
    ];
  });

  mockApi.onGet('/api/trainings/sessions').reply((config) => {
    const authError = requireAuth(config);
    if (authError) {
      return authError;
    }

    const type = config.params?.type || 'SOCIAL';
    const sessions = historySessions[type] || [];

    return [
      200,
      wrappedTraining({
        trainingType: type,
        page: Number(config.params?.page || 0),
        size: Number(config.params?.size || 10),
        totalElements: sessions.length,
        sessions,
      }),
    ];
  });

  mockApi.onAny().passThrough();

  return mockApi;
};




