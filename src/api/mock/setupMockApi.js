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
          imageUrl: '/mock/trainings/safety/scenes/workplace-touch_new.png',
          imageAlt: '횡단보도 앞에서 신호를 기다리는 장면',
          choices: [],
        },
        {
          sceneId: 2,
          screenInfo: '초록불이 켜진 뒤',
          title: '초록불이 켜진 뒤',
          situationText: '초록불이 켜졌지만 옆 차선에서 차량이 천천히 지나가고 있습니다.',
          questionText: '이제 어떻게 해야 할까요?',
          imageUrl: '/mock/trainings/safety/scenes/workplace-touch_new.png',
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
              feedbackImageUrl: '/mock/trainings/safety/scenes/workplace-touch_new.png',
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
          imageUrl: '/mock/trainings/safety/scenes/workplace-touch_new.png',
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
              feedbackImageUrl: '/mock/trainings/safety/scenes/workplace-touch_new.png',
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
          imageUrl: '/mock/trainings/safety/scenes/workplace-touch_new.png',
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
          imageUrl: '/mock/trainings/safety/scenes/workplace-touch_new.png',
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
              feedbackImageUrl: '/mock/trainings/safety/scenes/workplace-touch_new.png',
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
          imageUrl: '/mock/trainings/safety/scenes/workplace-touch_new.png',
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
              feedbackImageUrl: '/mock/trainings/safety/scenes/workplace-touch_new.png',
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
          imageUrl: '/mock/trainings/safety/scenes/workplace-touch_new.png',
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
          imageUrl: '/mock/trainings/safety/scenes/workplace-touch_new.png',
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
          imageUrl: '/mock/trainings/safety/scenes/workplace-touch_new.png',
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

const documentLevels = [
  {
    level: 1,
    title: '1단계',
    subtitle: '짧은 안내문에서 장소와 시간을 찾아요.',
    unlocked: true,
    completed: true,
    recommended: false,
  },
  {
    level: 2,
    title: '2단계',
    subtitle: '업무 지시에서 해야 할 일을 골라요.',
    unlocked: true,
    completed: false,
    recommended: true,
  },
  {
    level: 3,
    title: '3단계',
    subtitle: '공지사항에서 날짜와 준비물을 확인해요.',
    unlocked: false,
    completed: false,
    recommended: false,
  },
  {
    level: 4,
    title: '4단계',
    subtitle: '금지사항과 주의사항을 구분해요.',
    unlocked: false,
    completed: false,
    recommended: false,
  },
  {
    level: 5,
    title: '5단계',
    subtitle: '여러 문장을 읽고 일의 순서를 정리해요.',
    unlocked: false,
    completed: false,
    recommended: false,
  },
];

const documentQuestionsByLevel = {
  1: [
    {
      questionId: 101,
      theme: 'ANNOUNCEMENT',
      title: '회의실 사용 공지',
      documentText: '오늘 오후 2시부터 4시까지 회의실 B는 고객사 미팅으로 사용합니다. 회의실 A와 C는 평소처럼 예약할 수 있습니다.',
      questionText: '오후 2시부터 4시까지 사용할 수 없는 회의실은 어디인가요?',
      questionType: 'MULTIPLE_CHOICE',
      choices: [
        { choiceId: 1010, choiceOrder: 1, text: '회의실 A' },
        { choiceId: 1011, choiceOrder: 2, text: '회의실 B' },
        { choiceId: 1012, choiceOrder: 3, text: '회의실 C' },
      ],
      correctChoiceId: 1011,
      correctAnswer: '회의실 B',
      explanation: '공지에 회의실 B가 오후 2시부터 4시까지 고객사 미팅으로 사용된다고 되어 있습니다.',
    },
    {
      questionId: 102,
      theme: 'MESSENGER',
      title: '출근 후 확인 요청',
      documentText: '지우님, 출근하면 먼저 안내 데스크에 놓인 방문자 명단을 확인하고, 빠진 이름이 있으면 저에게 알려 주세요.',
      questionText: '출근하면 먼저 확인해야 하는 것은 무엇인가요?',
      questionType: 'MULTIPLE_CHOICE',
      choices: [
        { choiceId: 1020, choiceOrder: 1, text: '방문자 명단' },
        { choiceId: 1021, choiceOrder: 2, text: '점심 주문표' },
        { choiceId: 1022, choiceOrder: 3, text: '우편 요금표' },
      ],
      correctChoiceId: 1020,
      correctAnswer: '방문자 명단',
      explanation: '메신저에 안내 데스크에 놓인 방문자 명단을 먼저 확인하라고 되어 있습니다.',
    },
    {
      questionId: 103,
      theme: 'MANUAL',
      title: '프린터 용지 보충 방법',
      documentText: '프린터 용지가 부족하면 A4 용지를 아래 칸에 넣습니다. 용지를 넣은 뒤에는 덮개를 닫고 확인 버튼을 누릅니다.',
      questionText: 'A4 용지는 프린터의 어느 칸에 넣어야 하나요?',
      questionType: 'MULTIPLE_CHOICE',
      choices: [
        { choiceId: 1030, choiceOrder: 1, text: '아래 칸' },
        { choiceId: 1031, choiceOrder: 2, text: '위쪽 덮개 위' },
        { choiceId: 1032, choiceOrder: 3, text: '출력물 받침대' },
      ],
      correctChoiceId: 1030,
      correctAnswer: '아래 칸',
      explanation: '매뉴얼에 A4 용지를 아래 칸에 넣는다고 적혀 있습니다.',
    },
    {
      questionId: 104,
      theme: 'ANNOUNCEMENT',
      title: '탕비실 정리 안내',
      documentText: '금요일 오후 5시 전까지 개인 컵은 이름표가 붙은 선반에 올려 주세요. 이름표가 없는 컵은 공용 컵 바구니에 넣습니다.',
      questionText: '이름표가 붙은 개인 컵은 어디에 올려야 하나요?',
      questionType: 'MULTIPLE_CHOICE',
      choices: [
        { choiceId: 1040, choiceOrder: 1, text: '이름표가 붙은 선반' },
        { choiceId: 1041, choiceOrder: 2, text: '공용 컵 바구니' },
        { choiceId: 1042, choiceOrder: 3, text: '회의실 책상' },
      ],
      correctChoiceId: 1040,
      correctAnswer: '이름표가 붙은 선반',
      explanation: '공지에 개인 컵은 이름표가 붙은 선반에 올리라고 되어 있습니다.',
    },
    {
      questionId: 105,
      theme: 'MESSENGER',
      title: '택배 수령 메시지',
      documentText: '오늘 도착한 택배는 총무팀 보관함에 넣어 주세요. 냉장 표시가 있는 택배만 탕비실 냉장고에 넣으면 됩니다.',
      questionText: '냉장 표시가 없는 일반 택배는 어디에 넣어야 하나요?',
      questionType: 'MULTIPLE_CHOICE',
      choices: [
        { choiceId: 1050, choiceOrder: 1, text: '총무팀 보관함' },
        { choiceId: 1051, choiceOrder: 2, text: '탕비실 냉장고' },
        { choiceId: 1052, choiceOrder: 3, text: '회의실 앞' },
      ],
      correctChoiceId: 1050,
      correctAnswer: '총무팀 보관함',
      explanation: '메시지에 일반 택배는 총무팀 보관함에 넣고, 냉장 표시 택배만 냉장고에 넣으라고 되어 있습니다.',
    },
  ],
  2: [
    {
      questionId: 201,
      theme: 'MANUAL',
      title: '회의 자료 인쇄 절차',
      documentText: '회의 자료는 흑백으로 12부 인쇄합니다. 인쇄가 끝나면 왼쪽 위를 스테이플러로 묶고 회의실 A 앞 테이블에 둡니다.',
      questionText: '회의 자료는 몇 부 인쇄해야 하나요?',
      questionType: 'MULTIPLE_CHOICE',
      choices: [
        { choiceId: 2010, choiceOrder: 1, text: '8부' },
        { choiceId: 2011, choiceOrder: 2, text: '12부' },
        { choiceId: 2012, choiceOrder: 3, text: '20부' },
      ],
      correctChoiceId: 2011,
      correctAnswer: '12부',
      explanation: '매뉴얼에 회의 자료를 흑백으로 12부 인쇄한다고 되어 있습니다.',
    },
    {
      questionId: 202,
      theme: 'ANNOUNCEMENT',
      title: '사무용품 신청 마감',
      documentText: '이번 달 사무용품 신청은 목요일 오후 3시에 마감됩니다. 필요한 물품은 신청서에 수량을 적어 총무팀에 제출해 주세요.',
      questionText: '사무용품 신청은 언제 마감되나요?',
      questionType: 'MULTIPLE_CHOICE',
      choices: [
        { choiceId: 2020, choiceOrder: 1, text: '목요일 오후 3시' },
        { choiceId: 2021, choiceOrder: 2, text: '금요일 오전 9시' },
        { choiceId: 2022, choiceOrder: 3, text: '월요일 오후 6시' },
      ],
      correctChoiceId: 2020,
      correctAnswer: '목요일 오후 3시',
      explanation: '공지에 이번 달 사무용품 신청이 목요일 오후 3시에 마감된다고 적혀 있습니다.',
    },
    {
      questionId: 203,
      theme: 'MESSENGER',
      title: '파일명 수정 요청',
      documentText: '공유 폴더에 올린 견적서 파일명을 "거래처명_견적서_날짜" 형식으로 바꿔 주세요. 내용은 수정하지 않아도 됩니다.',
      questionText: '무엇을 수정해야 하나요?',
      questionType: 'MULTIPLE_CHOICE',
      choices: [
        { choiceId: 2030, choiceOrder: 1, text: '파일명' },
        { choiceId: 2031, choiceOrder: 2, text: '견적서 내용' },
        { choiceId: 2032, choiceOrder: 3, text: '폴더 이름' },
      ],
      correctChoiceId: 2030,
      correctAnswer: '파일명',
      explanation: '메신저에 파일명을 정해진 형식으로 바꾸고 내용은 수정하지 않아도 된다고 되어 있습니다.',
    },
    {
      questionId: 204,
      theme: 'MANUAL',
      title: '방문객 응대 절차',
      documentText: '방문객이 오면 이름과 방문 목적을 확인합니다. 확인 후 방문증을 건네고 담당자에게 도착 사실을 알립니다.',
      questionText: '방문증을 건네기 전에 먼저 해야 할 일은 무엇인가요?',
      questionType: 'MULTIPLE_CHOICE',
      choices: [
        { choiceId: 2040, choiceOrder: 1, text: '이름과 방문 목적 확인' },
        { choiceId: 2041, choiceOrder: 2, text: '회의실 청소' },
        { choiceId: 2042, choiceOrder: 3, text: '점심 메뉴 확인' },
      ],
      correctChoiceId: 2040,
      correctAnswer: '이름과 방문 목적 확인',
      explanation: '절차에는 방문객의 이름과 방문 목적을 확인한 뒤 방문증을 건넨다고 되어 있습니다.',
    },
    {
      questionId: 205,
      theme: 'MESSENGER',
      title: '회의실 정리 요청',
      documentText: '오후 교육이 끝나면 회의실 의자는 뒤쪽 벽으로 붙이고, 사용한 네임펜은 강사 책상 위 상자에 모아 주세요.',
      questionText: '사용한 네임펜은 어디에 모아야 하나요?',
      questionType: 'MULTIPLE_CHOICE',
      choices: [
        { choiceId: 2050, choiceOrder: 1, text: '강사 책상 위 상자' },
        { choiceId: 2051, choiceOrder: 2, text: '회의실 뒤쪽 벽' },
        { choiceId: 2052, choiceOrder: 3, text: '탕비실 서랍' },
      ],
      correctChoiceId: 2050,
      correctAnswer: '강사 책상 위 상자',
      explanation: '메시지에 사용한 네임펜을 강사 책상 위 상자에 모아 달라고 되어 있습니다.',
    },
  ],
  3: [
    {
      questionId: 301,
      theme: 'ANNOUNCEMENT',
      title: '월말 재고 확인 공지',
      documentText: '월말 재고 확인은 금요일 오전 10시에 시작합니다. 사무용품은 총무팀, 청소용품은 시설팀 양식에 각각 기록해 주세요.',
      questionText: '사무용품 재고는 어느 팀 양식에 기록해야 하나요?',
      questionType: 'MULTIPLE_CHOICE',
      choices: [
        { choiceId: 3010, choiceOrder: 1, text: '총무팀 양식' },
        { choiceId: 3011, choiceOrder: 2, text: '시설팀 양식' },
        { choiceId: 3012, choiceOrder: 3, text: '인사팀 양식' },
      ],
      correctChoiceId: 3010,
      correctAnswer: '총무팀 양식',
      explanation: '공지에 사무용품은 총무팀 양식에 기록하라고 되어 있습니다.',
    },
    {
      questionId: 302,
      theme: 'MESSENGER',
      title: '자료 전달 방식 안내',
      documentText: '오늘 회의 자료는 출력하지 말고 PDF로 변환해서 "마케팅_회의자료" 폴더에 올려 주세요. 파일명 앞에는 오늘 날짜를 붙여 주세요.',
      questionText: '회의 자료는 어디에 올려야 하나요?',
      questionType: 'MULTIPLE_CHOICE',
      choices: [
        { choiceId: 3020, choiceOrder: 1, text: '"마케팅_회의자료" 폴더' },
        { choiceId: 3021, choiceOrder: 2, text: '개인 바탕화면' },
        { choiceId: 3022, choiceOrder: 3, text: '프린터 출력함' },
      ],
      correctChoiceId: 3020,
      correctAnswer: '"마케팅_회의자료" 폴더',
      explanation: '메신저에 PDF로 변환해 "마케팅_회의자료" 폴더에 올리라고 되어 있습니다.',
    },
    {
      questionId: 303,
      theme: 'MANUAL',
      title: '불량품 분류 기준',
      documentText: '상품 포장지가 찢어졌거나 라벨이 잘못 붙은 상품은 불량품 바구니에 넣습니다. 단, 박스 모서리만 살짝 눌린 상품은 정상 상품으로 분류합니다.',
      questionText: '정상 상품으로 분류하는 것은 무엇인가요?',
      questionType: 'MULTIPLE_CHOICE',
      choices: [
        { choiceId: 3030, choiceOrder: 1, text: '박스 모서리만 살짝 눌린 상품' },
        { choiceId: 3031, choiceOrder: 2, text: '포장지가 찢어진 상품' },
        { choiceId: 3032, choiceOrder: 3, text: '라벨이 잘못 붙은 상품' },
      ],
      correctChoiceId: 3030,
      correctAnswer: '박스 모서리만 살짝 눌린 상품',
      explanation: '매뉴얼에 박스 모서리만 살짝 눌린 상품은 정상 상품으로 분류한다고 되어 있습니다.',
    },
    {
      questionId: 304,
      theme: 'ANNOUNCEMENT',
      title: '근무복 세탁 공지',
      documentText: '이번 주부터 근무복 세탁물은 수요일 오전까지 2층 세탁함에 넣어 주세요. 목요일 이후 제출한 세탁물은 다음 주에 처리됩니다.',
      questionText: '이번 주에 처리되려면 세탁물을 언제까지 넣어야 하나요?',
      questionType: 'MULTIPLE_CHOICE',
      choices: [
        { choiceId: 3040, choiceOrder: 1, text: '수요일 오전까지' },
        { choiceId: 3041, choiceOrder: 2, text: '목요일 오후까지' },
        { choiceId: 3042, choiceOrder: 3, text: '금요일 퇴근 후' },
      ],
      correctChoiceId: 3040,
      correctAnswer: '수요일 오전까지',
      explanation: '공지에 수요일 오전까지 넣어야 이번 주에 처리된다고 되어 있습니다.',
    },
    {
      questionId: 305,
      theme: 'MESSENGER',
      title: '고객 응대 전달',
      documentText: '오후 3시에 방문하는 고객님께는 회의실 C를 안내해 주세요. 담당자가 도착하기 전까지 생수 한 병도 준비해 주세요.',
      questionText: '고객님께 안내해야 하는 회의실은 어디인가요?',
      questionType: 'MULTIPLE_CHOICE',
      choices: [
        { choiceId: 3050, choiceOrder: 1, text: '회의실 C' },
        { choiceId: 3051, choiceOrder: 2, text: '회의실 A' },
        { choiceId: 3052, choiceOrder: 3, text: '교육실' },
      ],
      correctChoiceId: 3050,
      correctAnswer: '회의실 C',
      explanation: '메신저에 오후 3시 방문 고객에게 회의실 C를 안내하라고 되어 있습니다.',
    },
  ],
  4: [
    {
      questionId: 401,
      theme: 'MANUAL',
      title: '개인정보 문서 처리 매뉴얼',
      documentText: '주민등록번호나 연락처가 적힌 문서는 일반 쓰레기통에 버리지 않습니다. 필요한 내용 확인이 끝나면 문서 파쇄함에 넣습니다.',
      questionText: '연락처가 적힌 문서는 어디에 넣어야 하나요?',
      questionType: 'MULTIPLE_CHOICE',
      choices: [
        { choiceId: 4010, choiceOrder: 1, text: '문서 파쇄함' },
        { choiceId: 4011, choiceOrder: 2, text: '일반 쓰레기통' },
        { choiceId: 4012, choiceOrder: 3, text: '탕비실 서랍' },
      ],
      correctChoiceId: 4010,
      correctAnswer: '문서 파쇄함',
      explanation: '매뉴얼에 개인정보가 적힌 문서는 확인 후 문서 파쇄함에 넣으라고 되어 있습니다.',
    },
    {
      questionId: 402,
      theme: 'ANNOUNCEMENT',
      title: '엘리베이터 점검 공지',
      documentText: '오늘 오후 1시부터 3시까지 2호기 엘리베이터를 점검합니다. 점검 중에는 1호기 엘리베이터나 계단을 이용해 주세요.',
      questionText: '점검 중 이용하면 안 되는 것은 무엇인가요?',
      questionType: 'MULTIPLE_CHOICE',
      choices: [
        { choiceId: 4020, choiceOrder: 1, text: '2호기 엘리베이터' },
        { choiceId: 4021, choiceOrder: 2, text: '1호기 엘리베이터' },
        { choiceId: 4022, choiceOrder: 3, text: '계단' },
      ],
      correctChoiceId: 4020,
      correctAnswer: '2호기 엘리베이터',
      explanation: '공지에 오후 1시부터 3시까지 2호기 엘리베이터를 점검한다고 되어 있습니다.',
    },
    {
      questionId: 403,
      theme: 'MESSENGER',
      title: '반품 상자 처리 요청',
      documentText: '반품 상자는 송장 사진을 찍은 뒤 물류팀 앞 파란 카트에 올려 주세요. 새 상품 상자와 섞이지 않게 해 주세요.',
      questionText: '반품 상자는 어디에 올려야 하나요?',
      questionType: 'MULTIPLE_CHOICE',
      choices: [
        { choiceId: 4030, choiceOrder: 1, text: '물류팀 앞 파란 카트' },
        { choiceId: 4031, choiceOrder: 2, text: '새 상품 진열대' },
        { choiceId: 4032, choiceOrder: 3, text: '회의실 앞 테이블' },
      ],
      correctChoiceId: 4030,
      correctAnswer: '물류팀 앞 파란 카트',
      explanation: '메시지에 반품 상자는 송장 사진을 찍은 뒤 물류팀 앞 파란 카트에 올리라고 되어 있습니다.',
    },
    {
      questionId: 404,
      theme: 'MANUAL',
      title: '민원 전화 기록 방법',
      documentText: '고객 전화가 오면 이름, 연락처, 요청 내용을 기록합니다. 해결이 어려운 요청은 혼자 답하지 말고 팀장에게 전달합니다.',
      questionText: '해결이 어려운 요청은 어떻게 해야 하나요?',
      questionType: 'MULTIPLE_CHOICE',
      choices: [
        { choiceId: 4040, choiceOrder: 1, text: '팀장에게 전달하기' },
        { choiceId: 4041, choiceOrder: 2, text: '혼자 아무 답이나 하기' },
        { choiceId: 4042, choiceOrder: 3, text: '기록하지 않고 끊기' },
      ],
      correctChoiceId: 4040,
      correctAnswer: '팀장에게 전달하기',
      explanation: '매뉴얼에 해결이 어려운 요청은 혼자 답하지 말고 팀장에게 전달하라고 되어 있습니다.',
    },
    {
      questionId: 405,
      theme: 'ANNOUNCEMENT',
      title: '보안 카드 재발급 공지',
      documentText: '보안 카드를 분실한 직원은 즉시 총무팀에 신고해야 합니다. 신고 후 임시 출입증을 받아 당일만 사용할 수 있습니다.',
      questionText: '보안 카드를 잃어버리면 먼저 해야 할 일은 무엇인가요?',
      questionType: 'MULTIPLE_CHOICE',
      choices: [
        { choiceId: 4050, choiceOrder: 1, text: '총무팀에 신고하기' },
        { choiceId: 4051, choiceOrder: 2, text: '그냥 퇴근하기' },
        { choiceId: 4052, choiceOrder: 3, text: '다른 사람 카드 쓰기' },
      ],
      correctChoiceId: 4050,
      correctAnswer: '총무팀에 신고하기',
      explanation: '공지에 보안 카드를 분실하면 즉시 총무팀에 신고해야 한다고 되어 있습니다.',
    },
  ],
  5: [
    {
      questionId: 501,
      theme: 'MANUAL',
      title: '전자세금계산서 확인 절차',
      documentText: '전자세금계산서를 받으면 거래처명과 금액을 먼저 확인합니다. 금액이 주문서와 다르면 승인하지 말고 회계팀에 확인 요청을 보냅니다.',
      questionText: '금액이 주문서와 다르면 어떻게 해야 하나요?',
      questionType: 'MULTIPLE_CHOICE',
      choices: [
        { choiceId: 5010, choiceOrder: 1, text: '회계팀에 확인 요청 보내기' },
        { choiceId: 5011, choiceOrder: 2, text: '바로 승인하기' },
        { choiceId: 5012, choiceOrder: 3, text: '거래처명을 지우기' },
      ],
      correctChoiceId: 5010,
      correctAnswer: '회계팀에 확인 요청 보내기',
      explanation: '매뉴얼에 금액이 주문서와 다르면 승인하지 말고 회계팀에 확인 요청을 보내라고 되어 있습니다.',
    },
    {
      questionId: 502,
      theme: 'MESSENGER',
      title: '긴급 납품 일정 변경',
      documentText: '오늘 납품 예정이던 A상품은 거래처 요청으로 내일 오전 11시에 출고합니다. 대신 B상품 20개를 오늘 오후 4시까지 먼저 준비해 주세요.',
      questionText: '오늘 오후 4시까지 먼저 준비해야 하는 것은 무엇인가요?',
      questionType: 'MULTIPLE_CHOICE',
      choices: [
        { choiceId: 5020, choiceOrder: 1, text: 'B상품 20개' },
        { choiceId: 5021, choiceOrder: 2, text: 'A상품 전량' },
        { choiceId: 5022, choiceOrder: 3, text: '내일 출고 송장' },
      ],
      correctChoiceId: 5020,
      correctAnswer: 'B상품 20개',
      explanation: '메시지에 A상품은 내일 오전 11시에 출고하고, B상품 20개를 오늘 오후 4시까지 먼저 준비하라고 되어 있습니다.',
    },
    {
      questionId: 503,
      theme: 'ANNOUNCEMENT',
      title: '근태 정정 신청 안내',
      documentText: '출근 기록이 누락된 직원은 당일 오후 6시 전까지 근태 정정 신청서를 작성해야 합니다. 신청서에는 사유와 팀장 확인 서명이 필요합니다.',
      questionText: '근태 정정 신청서에 꼭 필요한 것은 무엇인가요?',
      questionType: 'MULTIPLE_CHOICE',
      choices: [
        { choiceId: 5030, choiceOrder: 1, text: '사유와 팀장 확인 서명' },
        { choiceId: 5031, choiceOrder: 2, text: '점심 메뉴와 좌석 번호' },
        { choiceId: 5032, choiceOrder: 3, text: '방문객 명단' },
      ],
      correctChoiceId: 5030,
      correctAnswer: '사유와 팀장 확인 서명',
      explanation: '공지에 신청서에는 사유와 팀장 확인 서명이 필요하다고 되어 있습니다.',
    },
    {
      questionId: 504,
      theme: 'MANUAL',
      title: '고객 개인정보 메일 발송 기준',
      documentText: '고객 연락처가 포함된 파일은 외부 메일로 보내지 않습니다. 꼭 전달해야 할 때는 비밀번호를 설정한 뒤 승인받은 공유 링크로 전달합니다.',
      questionText: '고객 연락처가 포함된 파일을 꼭 전달해야 할 때 맞는 방법은 무엇인가요?',
      questionType: 'MULTIPLE_CHOICE',
      choices: [
        { choiceId: 5040, choiceOrder: 1, text: '비밀번호 설정 후 승인받은 공유 링크로 전달' },
        { choiceId: 5041, choiceOrder: 2, text: '개인 메일로 바로 전달' },
        { choiceId: 5042, choiceOrder: 3, text: '단체 채팅방에 파일 올리기' },
      ],
      correctChoiceId: 5040,
      correctAnswer: '비밀번호 설정 후 승인받은 공유 링크로 전달',
      explanation: '매뉴얼에 비밀번호를 설정한 뒤 승인받은 공유 링크로 전달하라고 되어 있습니다.',
    },
    {
      questionId: 505,
      theme: 'MESSENGER',
      title: '월간 보고서 최종 확인',
      documentText: '월간 보고서에서 3페이지 매출 표만 다시 확인해 주세요. 표의 합계가 맞으면 파일명 뒤에 "_확인완료"를 붙여 저장하면 됩니다.',
      questionText: '합계가 맞으면 파일명 뒤에 무엇을 붙여야 하나요?',
      questionType: 'MULTIPLE_CHOICE',
      choices: [
        { choiceId: 5050, choiceOrder: 1, text: '_확인완료' },
        { choiceId: 5051, choiceOrder: 2, text: '_삭제예정' },
        { choiceId: 5052, choiceOrder: 3, text: '_개인보관' },
      ],
      correctChoiceId: 5050,
      correctAnswer: '_확인완료',
      explanation: '메시지에 표의 합계가 맞으면 파일명 뒤에 "_확인완료"를 붙여 저장하라고 되어 있습니다.',
    },
  ],
};

const documentQuestions = documentQuestionsByLevel[1];

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

const publicDocumentQuestions = (questions = documentQuestions) =>
  questions.map((question) => ({
    questionId: question.questionId,
    theme: question.theme,
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
        currentLevel: 2,
        highestUnlockedLevel: 2,
        lastPlayedLevel: 1,
        lastAccuracyRate: 100,
        lastAverageReactionMs: null,
        levels: documentLevels,
      }),
    ];
  });

  mockApi.onPost('/api/trainings/document/sessions').reply((config) => {
    const authError = requireAuth(config);
    if (authError) {
      return authError;
    }

    const payload = parseBody(config.data);
    const level = payload.level || 1;
    const levelInfo = documentLevels.find((item) => item.level === level);

    if (!levelInfo || !levelInfo.unlocked) {
      return [
        403,
        { success: false, error: { code: 'LEVEL_LOCKED', message: '아직 해금되지 않은 단계입니다.' } },
      ];
    }

    const questions = documentQuestionsByLevel[level] || documentQuestionsByLevel[1];
    const sessionId = nextDocumentSessionId;
    nextDocumentSessionId += 1;

    mockDocumentSessions.set(sessionId, {
      sessionId,
      level,
      questions,
      score: 0,
    });

    return [
      200,
      wrappedTraining({
        sessionId,
        level,
        questions: publicDocumentQuestions(questions),
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
