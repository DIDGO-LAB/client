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
  COMMUTE_SAFETY: [],
  INFECTIOUS_DISEASE: [],
  SEXUAL_EDUCATION: [
    {
      scenarioId: 601,
      badge: '직장 내 경계',
      title: '자리에서 불편한 접촉을 받았어요',
      description: '사무실에서 원하지 않는 신체 접촉이 있을 때 거절하고 도움을 요청하는 연습입니다.',
      scenes: [
        {
          sceneId: 1,
          screenInfo: '사무실 내 자리',
          title: '사무실 내 자리',
          situationText: '업무를 하고 있는데 사수가 뒤에서 가까이 다가와 어깨에 손을 올립니다. 나는 놀라고 불편합니다.',
          imageUrl: '/mock/trainings/safety/scenes/workplace-touch_new.png',
          imageAlt: '사무실에서 사수가 직원 뒤로 다가와 어깨에 손을 올리는 장면',
          feedbackImageUrl: '/mock/trainings/safety/feedback/workplace-touch-correct.png?v=20260507',
          feedbackImageAlt: '불편한 접촉을 멈추게 하고 안전하게 거리를 둔 결과 화면',
          choices: [],
        },
        {
          sceneId: 2,
          screenInfo: '불편함을 느낀 순간',
          title: '불편함을 느낀 순간',
          situationText: '상대가 계속 가까이 서 있어서 불편합니다. 먼저 내 의사를 분명히 표현해야 합니다.',
          questionText: '이때 나를 지키는 말과 행동은 무엇일까요?',
          imageUrl: '/mock/trainings/safety/scenes/workplace-touch_new.png',
          imageAlt: '사무실 자리에서 불편한 접촉을 받은 뒤 대응을 고르는 장면',
          feedbackImageUrl: '/mock/trainings/safety/feedback/workplace-touch-correct.png?v=20260507',
          feedbackImageAlt: '거절 의사를 밝히고 안전하게 거리를 둔 결과 화면',
          choices: [
            {
              choiceId: 1,
              text: '“불편합니다. 손을 치워 주세요.”라고 말하고 거리를 둔다.',
              correct: true,
              message: '좋아요. 원하지 않는 접촉은 멈춰 달라고 말하고 거리를 둘 수 있습니다.',
              resultText: '불편한 접촉을 분명히 거절하고 안전한 거리를 만들었습니다.',
              effectText: '내 몸의 경계를 표현하는 것은 안전을 지키는 중요한 행동입니다.',
            },
            {
              choiceId: 2,
              text: '상대가 민망할까 봐 웃으며 아무 말도 하지 않는다.',
              correct: false,
              message: '불편했다면 참지 않아도 됩니다. 멈춰 달라고 말할 수 있습니다.',
              resultText: '불편한 접촉은 그냥 넘기지 않는 것이 좋습니다.',
              effectText: '아무 말도 하지 않으면 같은 상황이 반복될 수 있습니다.',
              feedbackImageUrl: '/mock/trainings/safety/scenes/workplace-touch_new.png',
              feedbackImageAlt: '불편하지만 말하지 못하고 참고 있는 상황',
            },
          ],
        },
        {
          sceneId: 3,
          screenInfo: '도움 요청하기',
          title: '도움 요청하기',
          situationText: '거절했는데도 마음이 불안하거나 같은 일이 다시 생길까 걱정됩니다. 혼자 해결하려 하지 않아도 됩니다.',
          questionText: '다음으로 누구에게 알리는 것이 좋을까요?',
          imageUrl: '/mock/trainings/safety/scenes/workplace-touch_new.png',
          imageAlt: '사무실에서 불편한 접촉 상황 뒤 도움 요청 방법을 확인하는 장면',
          feedbackImageUrl: '/mock/trainings/safety/feedback/workplace-touch-correct.png?v=20260507',
          feedbackImageAlt: '경계를 지키고 도움을 요청해 훈련을 마무리한 결과 화면',
          choices: [
            {
              choiceId: 5,
              text: '믿을 수 있는 담당자나 관리자에게 상황을 알린다.',
              correct: true,
              message: '맞아요. 불편한 접촉은 혼자 감추지 말고 도움을 요청해야 합니다.',
              resultText: '상황을 담당자에게 알리고 보호받을 수 있는 방법을 선택했습니다.',
              effectText: '도움을 요청하면 같은 일이 반복되지 않도록 조치를 받을 수 있습니다.',
              feedbackImageUrl: '/mock/trainings/safety/feedback/workplace-touch-correct.png?v=20260507',
              feedbackImageAlt: '안전하게 상황을 마무리한 결과 화면',
            },
            {
              choiceId: 6,
              text: '내가 예민한 것 같다고 생각하고 아무에게도 말하지 않는다.',
              correct: false,
              message: '내가 불편했다면 도움을 요청해도 됩니다.',
              resultText: '불편한 일을 혼자 감추면 보호받기 어렵습니다.',
              effectText: '내가 느낀 불편함은 중요한 신호입니다.',
              feedbackImageUrl: '/mock/trainings/safety/scenes/workplace-touch_new.png',
              feedbackImageAlt: '혼자 참고 넘어가려는 상황',
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

// Legacy question set kept as a reference; mock sessions use regradedDocumentQuestionsByLevel below.
// eslint-disable-next-line no-unused-vars
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

const createDocumentQuestion = (
  questionId,
  theme,
  title,
  documentText,
  questionText,
  correctAnswer,
  explanation,
  choices,
  correctChoiceIndex = 0,
) => ({
  questionId,
  theme,
  title,
  documentText,
  questionText,
  questionType: 'MULTIPLE_CHOICE',
  choices: choices.map((text, index) => ({
    choiceId: questionId * 10 + index,
    choiceOrder: index + 1,
    text,
  })),
  correctChoiceId: questionId * 10 + correctChoiceIndex,
  correctAnswer,
  explanation,
});

const regradedDocumentQuestionsByLevel = {
  1: [
    createDocumentQuestion(101, 'ANNOUNCEMENT', '회의실 예약 안내', '오늘 오후 2시부터 4시까지 회의실 B는 고객사 미팅으로 사용합니다. 회의실 A와 C는 평소처럼 예약할 수 있습니다.', '오후 2시부터 4시까지 사용할 수 없는 회의실은 어디인가요?', '회의실 B', '문서에 회의실 B가 고객사 미팅으로 사용된다고 되어 있습니다.', ['회의실 B', '회의실 A', '회의실 C']),
    createDocumentQuestion(102, 'MESSENGER', '방문자 명단 확인', '출근하면 안내 데스크에 놓인 방문자 명단을 먼저 확인해 주세요. 빠진 이름이 있으면 김대리에게 알려 주세요.', '출근하면 먼저 확인해야 하는 것은 무엇인가요?', '방문자 명단', '첫 문장에 방문자 명단을 먼저 확인하라고 되어 있습니다.', ['방문자 명단', '점심 주문표', '우편 요금표']),
    createDocumentQuestion(103, 'MANUAL', '프린터 용지 보충', '프린터 용지가 부족하면 A4 용지를 아래 칸에 넣습니다. 용지를 넣은 뒤에는 덮개를 닫습니다.', 'A4 용지는 어느 칸에 넣어야 하나요?', '아래 칸', '문서에 A4 용지를 아래 칸에 넣는다고 적혀 있습니다.', ['아래 칸', '위쪽 덮개 위', '출력물 받침대']),
    createDocumentQuestion(104, 'ANNOUNCEMENT', '개인 컵 정리', '금요일 오후 5시 전까지 개인 컵은 이름표가 붙은 선반에 올려 주세요. 이름표가 없는 컵은 공용 컵 바구니에 넣습니다.', '이름표가 붙은 개인 컵은 어디에 올려야 하나요?', '이름표가 붙은 선반', '첫 문장에 개인 컵을 이름표가 붙은 선반에 올리라고 되어 있습니다.', ['이름표가 붙은 선반', '공용 컵 바구니', '회의실 책상']),
    createDocumentQuestion(105, 'MESSENGER', '택배 보관 안내', '오늘 도착한 일반 택배는 총무팀 보관함에 넣어 주세요. 냉장 표시가 있는 택배만 탕비실 냉장고에 넣습니다.', '일반 택배는 어디에 넣어야 하나요?', '총무팀 보관함', '첫 문장에 일반 택배는 총무팀 보관함에 넣으라고 되어 있습니다.', ['총무팀 보관함', '탕비실 냉장고', '회의실 앞']),
  ],
  2: [
    createDocumentQuestion(201, 'MANUAL', '회의 자료 인쇄 절차', '회의 자료는 흑백으로 12부 인쇄합니다. 인쇄가 끝나면 왼쪽 위를 스테이플러로 묶고 회의실 A 앞 테이블에 둡니다.', '인쇄가 끝난 회의 자료는 어디에 두어야 하나요?', '회의실 A 앞 테이블', '인쇄 후 묶은 자료를 회의실 A 앞 테이블에 두라고 되어 있습니다.', ['회의실 A 앞 테이블', '총무팀 보관함', '프린터 옆 바구니']),
    createDocumentQuestion(202, 'ANNOUNCEMENT', '사무용품 신청 마감', '이번 달 사무용품 신청은 목요일 오후 3시에 마감됩니다. 필요한 물품은 신청서에 수량을 적어 총무팀에 제출해 주세요.', '사무용품을 신청하려면 어디에 제출해야 하나요?', '총무팀', '필요한 물품은 신청서에 수량을 적어 총무팀에 제출하라고 되어 있습니다.', ['총무팀', '시설팀', '회의실 A']),
    createDocumentQuestion(203, 'MESSENGER', '파일명 변경 요청', '공유 폴더에 올린 견적서 파일명을 "거래처명_견적서_날짜" 형식으로 바꿔 주세요. 내용은 수정하지 않아도 됩니다.', '견적서에서 수정하지 않아도 되는 것은 무엇인가요?', '파일 내용', '문서에 파일 내용은 수정하지 않아도 된다고 되어 있습니다.', ['파일 내용', '파일명', '공유 폴더 위치']),
    createDocumentQuestion(204, 'MANUAL', '교육실 정리 순서', '교육이 끝나면 회의실 의자는 뒤쪽 벽으로 붙이고, 사용한 네임펜은 강사 책상 위 상자에 모아 주세요.', '사용한 네임펜은 어디에 모아야 하나요?', '강사 책상 위 상자', '사용한 네임펜은 강사 책상 위 상자에 모으라고 되어 있습니다.', ['강사 책상 위 상자', '회의실 의자 위', '총무팀 보관함']),
    createDocumentQuestion(205, 'ANNOUNCEMENT', '세탁물 제출 안내', '근무복 세탁물은 수요일 오전까지 2층 세탁함에 넣어 주세요. 목요일 이후 제출한 세탁물은 다음 주에 처리됩니다.', '목요일 이후 제출한 세탁물은 언제 처리되나요?', '다음 주', '목요일 이후 제출하면 다음 주에 처리된다고 되어 있습니다.', ['다음 주', '이번 주', '당일 오후']),
  ],
  3: [
    createDocumentQuestion(301, 'ANNOUNCEMENT', '비품 절약 협조 안내', '최근 종이컵과 A4 용지 사용량이 늘었습니다. 오늘부터 회의 때는 개인 컵 사용을 권장하고, 출력 전에는 꼭 필요한 문서인지 확인해 주세요.', '이 안내의 주된 목적은 무엇인가요?', '비품 사용을 줄이기 위해', '종이컵과 A4 용지 사용량 증가를 설명하고 절약 행동을 요청하고 있습니다.', ['비품 사용을 줄이기 위해', '회의실 예약을 늘리기 위해', '새 컵을 주문하기 위해']),
    createDocumentQuestion(302, 'MANUAL', '개인정보 문서 처리', '주민등록번호나 연락처가 적힌 문서는 일반 쓰레기통에 버리지 않습니다. 필요한 내용 확인이 끝나면 문서 파쇄함에 넣어 주세요.', '이 안내에서 가장 중요하게 지키려는 것은 무엇인가요?', '개인정보가 밖으로 새지 않게 하는 것', '개인정보가 적힌 문서를 일반 쓰레기통에 버리지 말라는 안내입니다.', ['개인정보가 밖으로 새지 않게 하는 것', '일반 쓰레기통을 비우는 것', '문서를 더 오래 보관하는 것']),
    createDocumentQuestion(303, 'MESSENGER', '반품 상자 처리 요청', '반품 상자는 송장 사진을 찍은 뒤 물류팀 앞 파란 카트에 올려 주세요. 새 상품 상자와 섞이지 않게 해 주세요.', '반품 상자를 새 상품 상자와 섞지 않는 이유로 알맞은 것은 무엇인가요?', '반품과 새 상품을 구분해 처리하기 위해', '반품 상자를 별도 카트에 올려 새 상품과 섞이지 않게 하라고 되어 있습니다.', ['반품과 새 상품을 구분해 처리하기 위해', '송장 사진을 지우기 위해', '파란 카트를 비우기 위해']),
    createDocumentQuestion(304, 'MANUAL', '고객 전화 기록 지침', '고객 전화가 오면 이름, 연락처, 요청 내용을 기록합니다. 해결이 어려운 요청은 혼자 답하지 말고 팀장에게 전달합니다.', '해결이 어려운 요청을 받았을 때 알맞은 행동은 무엇인가요?', '팀장에게 전달한다', '해결이 어려운 요청은 혼자 답하지 말고 팀장에게 전달하라고 되어 있습니다.', ['팀장에게 전달한다', '혼자 바로 답한다', '연락처만 지운다']),
    createDocumentQuestion(305, 'ANNOUNCEMENT', '엘리베이터 점검 안내', '오늘 오후 1시부터 3시까지 2호기 엘리베이터를 점검합니다. 점검 중에는 1호기 엘리베이터나 계단을 이용해 주세요.', '오후 2시에 이동해야 한다면 어떻게 해야 하나요?', '1호기 엘리베이터나 계단을 이용한다', '오후 2시는 점검 시간 안이므로 2호기 대신 1호기나 계단을 이용해야 합니다.', ['1호기 엘리베이터나 계단을 이용한다', '2호기 엘리베이터를 이용한다', '안내 데스크에 출석표를 낸다']),
  ],
  4: [
    createDocumentQuestion(401, 'MANUAL', '상품 상태별 분류 기준', '포장지가 찢어졌거나 라벨이 잘못 붙은 상품은 불량품 바구니에 넣습니다. 단, 박스 모서리만 살짝 눌린 상품은 정상 상품으로 분류합니다.', '정상 상품으로 분류해야 하는 경우는 무엇인가요?', '박스 모서리만 살짝 눌린 상품', '예외 문장에 박스 모서리만 살짝 눌린 상품은 정상 상품이라고 되어 있습니다.', ['박스 모서리만 살짝 눌린 상품', '포장지가 찢어진 상품', '라벨이 잘못 붙은 상품']),
    createDocumentQuestion(402, 'ANNOUNCEMENT', '분실 보안 카드 신고', '보안 카드를 분실한 직원은 즉시 총무팀에 신고해야 합니다. 신고 후 임시 출입증을 받을 수 있지만 당일만 사용할 수 있습니다.', '보안 카드를 잃어버렸을 때 오늘 해야 할 일은 무엇인가요?', '총무팀에 신고하고 임시 출입증을 받는다', '분실 시 즉시 신고하고, 신고 후 당일용 임시 출입증을 받을 수 있습니다.', ['총무팀에 신고하고 임시 출입증을 받는다', '다음 날 새 카드를 기다린다', '다른 직원 카드를 사용한다']),
    createDocumentQuestion(403, 'MESSENGER', '고객 방문 준비', '오후 3시에 방문하는 고객님께는 회의실 C를 안내해 주세요. 담당자가 도착하기 전까지 생수 한 병과 회사 소개 자료 2부를 준비합니다.', '고객이 담당자보다 먼저 도착하면 해야 할 일로 알맞은 것은 무엇인가요?', '회의실 C로 안내하고 생수와 자료를 준비한다', '고객에게 회의실 C를 안내하고 담당자 도착 전까지 준비물을 챙겨야 합니다.', ['회의실 C로 안내하고 생수와 자료를 준비한다', '대기석에 앉히고 아무것도 준비하지 않는다', '회의실 A로 안내하고 명단만 확인한다']),
    createDocumentQuestion(404, 'MANUAL', '전자세금계산서 확인', '전자세금계산서를 받으면 거래처명과 금액을 먼저 확인합니다. 금액이 주문서와 같으면 승인 요청을 올리고, 다르면 회계팀에 확인 요청을 보냅니다.', '금액이 주문서와 다를 때 해야 할 일은 무엇인가요?', '회계팀에 확인 요청을 보낸다', '금액이 다르면 승인하지 않고 회계팀에 확인 요청을 보내야 합니다.', ['회계팀에 확인 요청을 보낸다', '승인 요청을 올린다', '거래처명을 지운다']),
    createDocumentQuestion(405, 'ANNOUNCEMENT', '근무복 제출 일정', '이번 주 근무복은 수요일 오전까지 2층 세탁함에 넣어 주세요. 이름표가 없는 근무복은 접수하지 않습니다. 목요일 이후 제출하면 다음 주에 처리됩니다.', '이번 주에 처리되려면 어떤 조건을 지켜야 하나요?', '수요일 오전까지 이름표가 있는 근무복을 제출한다', '이번 주 처리에는 제출 기한과 이름표 조건이 모두 필요합니다.', ['수요일 오전까지 이름표가 있는 근무복을 제출한다', '목요일 이후 이름표 없이 제출한다', '수요일 오전까지 이름표 없이 제출한다']),
  ],
  5: [
    createDocumentQuestion(501, 'MESSENGER', '납품 일정 변경 메일', '오늘 납품 예정이던 A상품은 거래처 요청으로 내일 오전 11시에 출고합니다. 대신 B상품 20개를 오늘 오후 4시까지 먼저 준비해 주세요. A상품 송장은 오늘 출력하지 말고, B상품 송장만 출력합니다.', '오늘 해야 할 일로 알맞은 것은 무엇인가요?', 'B상품 20개를 준비하고 B상품 송장만 출력한다', 'A상품은 내일 출고하므로 오늘은 B상품 준비와 B상품 송장 출력만 해야 합니다.', ['B상품 20개를 준비하고 B상품 송장만 출력한다', 'A상품 송장을 출력하고 A상품을 준비한다', 'A상품과 B상품을 모두 내일 준비한다']),
    createDocumentQuestion(502, 'ANNOUNCEMENT', '근태 정정 신청 안내', '출근 기록이 누락된 직원은 당일 오후 6시 전까지 근태 정정 신청서를 작성해야 합니다. 신청서에는 누락 사유와 팀장 확인 서명이 필요합니다. 오후 6시 이후 제출하면 인사팀 검토가 다음 영업일로 넘어갑니다.', '오늘 안에 바로 검토받으려면 어떤 조건을 모두 지켜야 하나요?', '오후 6시 전까지 사유와 팀장 서명이 있는 신청서를 제출한다', '당일 검토를 위해서는 제출 시각, 누락 사유, 팀장 확인 서명이 모두 필요합니다.', ['오후 6시 전까지 사유와 팀장 서명이 있는 신청서를 제출한다', '오후 6시 이후 신청서만 제출한다', '팀장 서명 없이 사유만 적는다']),
    createDocumentQuestion(503, 'MANUAL', '고객 정보 파일 전달 규칙', '고객 연락처가 포함된 파일은 외부 메일로 보내지 않습니다. 꼭 전달해야 할 때는 비밀번호를 설정한 뒤 승인받은 공유 링크로 전달합니다. 비밀번호는 파일과 같은 메시지에 적지 말고 전화로 따로 알려 주세요.', '고객 연락처 파일을 외부에 전달해야 할 때 올바른 방법은 무엇인가요?', '비밀번호를 설정하고 승인받은 공유 링크로 전달한 뒤 비밀번호는 전화로 알린다', '문서는 공유 링크 사용, 비밀번호 설정, 비밀번호 별도 전달을 모두 요구합니다.', ['비밀번호를 설정하고 승인받은 공유 링크로 전달한 뒤 비밀번호는 전화로 알린다', '외부 메일에 파일과 비밀번호를 함께 보낸다', '비밀번호 없이 공유 링크만 보낸다']),
    createDocumentQuestion(504, 'MANUAL', '월간 보고서 확인 요청', '월간 보고서에서 3페이지 매출 표만 다시 확인해 주세요. 표의 합계가 맞으면 파일명 뒤에 "_확인완료"를 붙여 저장하면 됩니다. 합계가 맞지 않으면 파일명을 바꾸지 말고 회계팀에 오류 내용을 전달해 주세요.', '매출 표 합계가 맞지 않을 때 해야 할 일은 무엇인가요?', '파일명을 바꾸지 말고 회계팀에 오류 내용을 전달한다', '합계가 맞지 않으면 파일명을 변경하지 않고 회계팀에 오류 내용을 전달해야 합니다.', ['파일명을 바꾸지 말고 회계팀에 오류 내용을 전달한다', '파일명 뒤에 "_확인완료"를 붙인다', '3페이지를 삭제한다']),
    createDocumentQuestion(505, 'ANNOUNCEMENT', '행사 준비 체크리스트', '행사장 입구에는 안내 배너를 세우고, 접수대에는 명찰과 참석자 명단을 둡니다. 점심 도시락은 오전 11시 이후 도착하면 냉장 보관하지 않고 바로 배식 준비 테이블로 옮깁니다. 오전 11시 전에 도착한 도시락만 냉장고에 넣어 주세요.', '오전 11시 20분에 도착한 도시락은 어떻게 처리해야 하나요?', '바로 배식 준비 테이블로 옮긴다', '오전 11시 이후 도착한 도시락은 냉장 보관하지 않고 배식 준비 테이블로 옮겨야 합니다.', ['바로 배식 준비 테이블로 옮긴다', '냉장고에 넣는다', '접수대에 둔다']),
  ],
};

const documentQuestions = regradedDocumentQuestionsByLevel[1];

const historySessions = {
  SOCIAL: [
    {
      sessionId: 100,
      scenarioId: 101,
      scenarioTitle: '회의 자료를 몇 부 복사해야 하는지 모르겠어요',
      trainingType: 'SOCIAL',
      score: 90,
      feedbackSummary: '상대방에게 필요한 내용을 다시 확인하는 연습을 잘했습니다.',
      correctCount: null,
      totalCount: null,
      playedLevel: null,
      accuracyRate: null,
      wrongCount: null,
      averageReactionMs: null,
      completedAt: '2026-05-01T10:00:00',
    },
    {
      sessionId: 101,
      scenarioId: 102,
      scenarioTitle: '업무 중 실수를 발견했어요',
      trainingType: 'SOCIAL',
      score: 82,
      feedbackSummary: '실수를 숨기지 않고 바로 보고하는 연습을 했습니다.',
      correctCount: null,
      totalCount: null,
      playedLevel: null,
      accuracyRate: null,
      wrongCount: null,
      averageReactionMs: null,
      completedAt: '2026-05-02T10:00:00',
    },
    {
      sessionId: 102,
      scenarioId: 201,
      scenarioTitle: '무거운 상자를 옮길 때 도움 요청하기',
      trainingType: 'SOCIAL',
      score: 88,
      feedbackSummary: '도움이 필요한 상황을 분명하게 요청했습니다.',
      correctCount: null,
      totalCount: null,
      playedLevel: null,
      accuracyRate: null,
      wrongCount: null,
      averageReactionMs: null,
      completedAt: '2026-05-03T10:00:00',
    },
    {
      sessionId: 103,
      scenarioId: 101,
      scenarioTitle: '고객 응대 중 모르는 내용을 확인하기',
      trainingType: 'SOCIAL',
      score: 94,
      feedbackSummary: '모르는 부분을 혼자 추측하지 않고 담당자에게 구체적으로 확인했습니다.',
      correctCount: null,
      totalCount: null,
      playedLevel: null,
      accuracyRate: null,
      wrongCount: null,
      averageReactionMs: null,
      completedAt: '2026-05-04T10:00:00',
    },
  ],
  SAFETY: [
    {
      sessionId: 200,
      scenarioId: 501,
      scenarioTitle: '횡단보도 건너기',
      category: 'COMMUTE_SAFETY',
      trainingType: 'SAFETY',
      score: 80,
      correctCount: 4,
      totalCount: 5,
      accuracyRate: 80,
      wrongCount: 1,
      averageReactionMs: null,
      feedbackSummary: '신호와 주변 차량을 확인하는 선택이 좋았습니다.',
      completedAt: '2026-05-01T11:00:00',
    },
    {
      sessionId: 201,
      scenarioId: 601,
      scenarioTitle: '자리에서 불편한 접촉을 받았어요',
      category: 'SEXUAL_EDUCATION',
      trainingType: 'SAFETY',
      score: 100,
      correctCount: 2,
      totalCount: 2,
      accuracyRate: 100,
      wrongCount: 0,
      averageReactionMs: null,
      feedbackSummary: '불편함을 분명히 말하고 도움을 요청하는 선택을 잘했습니다.',
      completedAt: '2026-05-04T13:30:00',
    },
  ],
  DOCUMENT: [
    {
      sessionId: 300,
      scenarioId: null,
      scenarioTitle: '방문객 응대 안내문 복습',
      trainingType: 'DOCUMENT',
      score: 80,
      accuracyRate: 80,
      correctCount: 4,
      totalCount: 5,
      playedLevel: 2,
      wrongCount: 1,
      averageReactionMs: null,
      feedbackSummary: '방문 시간과 준비물처럼 바로 확인할 수 있는 정보를 잘 찾았습니다.',
      completedAt: '2026-05-01T12:00:00',
    },
    {
      sessionId: 301,
      scenarioId: null,
      scenarioTitle: '물류팀 반품 처리 문서 복습',
      trainingType: 'DOCUMENT',
      score: 60,
      accuracyRate: 60,
      correctCount: 3,
      totalCount: 5,
      playedLevel: 3,
      wrongCount: 2,
      averageReactionMs: null,
      feedbackSummary: '반품 처리 순서와 예외 조건을 다시 확인하는 연습이 필요합니다.',
      completedAt: '2026-05-03T15:20:00',
    },
    {
      sessionId: 302,
      scenarioId: null,
      scenarioTitle: '근태 정정 신청서 복습',
      trainingType: 'DOCUMENT',
      score: 100,
      accuracyRate: 100,
      correctCount: 5,
      totalCount: 5,
      playedLevel: 5,
      wrongCount: 0,
      averageReactionMs: null,
      feedbackSummary: '신청 조건, 마감 시간, 필요한 서명을 정확하게 구분했습니다.',
      completedAt: '2026-05-05T09:40:00',
    },
  ],
};

const safetyHistoryDetails = {
  200: {
    sessionId: 200,
    score: 80,
    choiceSummary: { correctCount: 4, totalCount: 5 },
    actions: [
      {
        sceneId: 2101,
        situationText: '횡단보도 신호가 깜빡이고 있습니다.',
        selectedChoice: '다음 신호를 기다린다.',
        correct: true,
      },
      {
        sceneId: 2102,
        situationText: '차가 멈췄지만 운전자가 나를 보지 못한 것 같습니다.',
        selectedChoice: '차량이 완전히 멈추고 운전자와 눈을 맞춘 뒤 건넌다.',
        correct: true,
      },
      {
        sceneId: 2103,
        situationText: '버스가 도착해 사람들이 몰리고 있습니다.',
        selectedChoice: '줄 뒤에 선다.',
        correct: true,
      },
      {
        sceneId: 2104,
        situationText: '비가 와서 바닥이 미끄럽습니다.',
        selectedChoice: '천천히 걸으며 손잡이를 잡는다.',
        correct: true,
      },
      {
        sceneId: 2105,
        situationText: '이어폰을 끼고 길을 건너려 합니다.',
        selectedChoice: '음악을 크게 틀고 바로 건넌다.',
        correct: false,
      },
    ],
    feedback: {
      summary: '신호와 주변 차량을 확인하는 선택이 좋았습니다.',
      detailText: '길을 건널 때는 신호뿐 아니라 차량이 완전히 멈췄는지 함께 확인하면 더 안전합니다.',
    },
    latestSceneImageUrl: '/mock/trainings/safety/scenes/office-intro.png',
    latestSceneImageAlt: '안전 훈련 마지막 장면',
  },
  201: {
    sessionId: 201,
    score: 100,
    choiceSummary: { correctCount: 2, totalCount: 2 },
    actions: [
      {
        sceneId: 2,
        situationText: '상대가 계속 가까이 서 있어서 불편합니다. 먼저 내 의사를 분명히 표현해야 합니다.',
        selectedChoice: '“불편합니다. 손을 치워 주세요.”라고 말하고 거리를 둔다.',
        correct: true,
      },
      {
        sceneId: 3,
        situationText: '거절했는데도 마음이 불안하거나 같은 일이 다시 생길까 걱정됩니다.',
        selectedChoice: '믿을 수 있는 담당자나 관리자에게 상황을 알린다.',
        correct: true,
      },
    ],
    feedback: {
      summary: '불편함을 분명히 말하고 도움을 요청하는 선택을 잘했습니다.',
      detailText: '원하지 않는 접촉은 참지 않고 표현할 수 있습니다. 반복될까 걱정되면 담당자에게 바로 알려 보호를 받을 수 있습니다.',
    },
    latestSceneImageUrl: '/mock/trainings/safety/feedback/workplace-touch-correct.png?v=20260507',
    latestSceneImageAlt: '경계를 지키고 도움을 요청해 훈련을 마무리한 결과 화면',
  },
};

const socialHistoryDetails = {
  100: {
    sessionId: 100,
    score: 90,
    scoreType: 'AI_EVALUATION',
    feedback: {
      summary: '상대방에게 필요한 내용을 다시 확인하는 연습을 잘했습니다.',
      detailText: '몇 부가 필요한지 바로 다시 물었고, 확인한 수량을 다시 말해 업무 지시를 정확히 정리했습니다.',
    },
    dialogLogs: [
      { turnNo: 1, speaker: 'PARTNER', content: '지우 씨, 오늘 회의 자료 복사 부탁해요.' },
      { turnNo: 2, speaker: 'USER', content: '네. 몇 부가 필요한지 다시 한번 말씀해 주실 수 있을까요?' },
      { turnNo: 3, speaker: 'PARTNER', content: '다섯 부만 준비하면 됩니다.' },
      { turnNo: 4, speaker: 'USER', content: '확인했습니다. 다섯 부 복사해서 회의실에 가져다 드릴게요.' },
    ],
  },
  101: {
    sessionId: 101,
    score: 82,
    scoreType: 'AI_EVALUATION',
    feedback: {
      summary: '실수를 숨기지 않고 바로 보고하는 연습을 했습니다.',
      detailText: '실수 내용을 먼저 말한 점이 좋았습니다. 다음에는 수정 방법까지 함께 제안하면 더 분명한 보고가 됩니다.',
    },
    dialogLogs: [
      { turnNo: 1, speaker: 'PARTNER', content: '거래처 명단 입력은 다 끝났나요?' },
      { turnNo: 2, speaker: 'USER', content: '입력은 끝났는데 전화번호 한 자리가 잘못된 것을 확인했습니다.' },
      { turnNo: 3, speaker: 'PARTNER', content: '바로 알려줘서 좋아요. 어느 부분인지 같이 봅시다.' },
      { turnNo: 4, speaker: 'USER', content: '네, 수정 위치를 표시해 두었습니다. 확인 후 바로 고치겠습니다.' },
    ],
  },
  102: {
    sessionId: 102,
    score: 88,
    scoreType: 'AI_EVALUATION',
    feedback: {
      summary: '도움이 필요한 상황을 분명하게 요청했습니다.',
      detailText: '혼자 들기 어렵다는 이유와 함께 도움을 요청해 안전한 선택을 했습니다.',
    },
    dialogLogs: [
      { turnNo: 1, speaker: 'PARTNER', content: '이 상자들을 창고 안쪽 선반으로 옮겨 주세요.' },
      { turnNo: 2, speaker: 'USER', content: '상자가 무거워서 혼자 들기 어렵습니다. 같이 옮겨 주실 수 있을까요?' },
      { turnNo: 3, speaker: 'PARTNER', content: '좋아요. 둘이 같이 들면 더 안전합니다.' },
    ],
  },
  103: {
    sessionId: 103,
    score: 94,
    scoreType: 'AI_EVALUATION',
    feedback: {
      summary: '모르는 부분을 혼자 추측하지 않고 담당자에게 구체적으로 확인했습니다.',
      detailText: '고객에게 기다림을 안내하고 정확한 정보를 확인한 뒤 다시 알려 주는 흐름이 자연스러웠습니다.',
    },
    dialogLogs: [
      { turnNo: 1, speaker: 'PARTNER', content: '서류는 어디에 제출하면 되나요?' },
      { turnNo: 2, speaker: 'USER', content: '정확히 안내드리기 위해 담당자에게 확인해 보겠습니다. 잠시만 기다려 주세요.' },
      { turnNo: 3, speaker: 'PARTNER', content: '네, 알겠습니다.' },
      { turnNo: 4, speaker: 'USER', content: '확인해 보니 안내 데스크 오른쪽 제출함에 넣으시면 됩니다.' },
      { turnNo: 5, speaker: 'PARTNER', content: '감사합니다.' },
    ],
  },
};

const documentHistoryDetails = {
  300: {
    sessionId: 300,
    score: 80,
    answerSummary: { correctCount: 4, totalCount: 5 },
    answers: [
      {
        questionId: 3101,
        questionText: '오후 3시에 방문하는 고객은 어느 회의실로 안내해야 하나요?',
        userAnswer: '회의실 C',
        correctAnswer: '회의실 C',
        correct: true,
        explanation: '방문 안내 공지에 오후 3시 고객은 회의실 C로 안내하라고 되어 있습니다.',
      },
      {
        questionId: 3102,
        questionText: '담당자가 오기 전까지 준비해야 하는 것은 무엇인가요?',
        userAnswer: '생수 한 병',
        correctAnswer: '생수 한 병',
        correct: true,
        explanation: '메신저에 담당자가 도착하기 전까지 생수 한 병을 준비해 달라고 되어 있습니다.',
      },
      {
        questionId: 3103,
        questionText: '방문증을 건네기 전에 먼저 확인해야 하는 것은 무엇인가요?',
        userAnswer: '방문 목적',
        correctAnswer: '이름과 방문 목적',
        correct: false,
        explanation: '방문객 응대 절차에는 이름과 방문 목적을 모두 확인한 뒤 방문증을 건넨다고 되어 있습니다.',
      },
      {
        questionId: 3104,
        questionText: '방문자 명단은 어디에 제출해야 하나요?',
        userAnswer: '안내 데스크 제출함',
        correctAnswer: '안내 데스크 제출함',
        correct: true,
        explanation: '공지에 방문자 명단은 안내 데스크 제출함에 넣으라고 되어 있습니다.',
      },
      {
        questionId: 3105,
        questionText: '고객이 도착하면 누구에게 알려야 하나요?',
        userAnswer: '담당자',
        correctAnswer: '담당자',
        correct: true,
        explanation: '메신저에 고객이 도착하면 담당자에게 바로 알려 달라고 되어 있습니다.',
      },
    ],
  },
  301: {
    sessionId: 301,
    score: 60,
    answerSummary: { correctCount: 3, totalCount: 5 },
    answers: [
      {
        questionId: 3201,
        questionText: '반품 상자를 파란 카트에 올리기 전에 해야 할 일은 무엇인가요?',
        userAnswer: '송장 사진 찍기',
        correctAnswer: '송장 사진 찍기',
        correct: true,
        explanation: '반품 처리 매뉴얼에 송장 사진을 찍은 뒤 파란 카트에 올리라고 되어 있습니다.',
      },
      {
        questionId: 3202,
        questionText: '이번 주 반품 접수 마감 시간은 언제인가요?',
        userAnswer: '금요일 오후 6시',
        correctAnswer: '목요일 오후 3시',
        correct: false,
        explanation: '공지에는 이번 주 반품 접수가 목요일 오후 3시에 마감된다고 되어 있습니다.',
      },
      {
        questionId: 3203,
        questionText: '반품 상자는 어떤 상자와 섞이지 않게 해야 하나요?',
        userAnswer: '새 상품 상자',
        correctAnswer: '새 상품 상자',
        correct: true,
        explanation: '메신저에 반품 상자는 새 상품 상자와 섞이지 않게 해 달라고 되어 있습니다.',
      },
      {
        questionId: 3204,
        questionText: '라벨이 훼손된 상품은 어디에 따로 보관해야 하나요?',
        userAnswer: '정상 상품 진열대',
        correctAnswer: '확인 필요 바구니',
        correct: false,
        explanation: '매뉴얼에 라벨이 훼손된 상품은 확인 필요 바구니에 따로 보관하라고 되어 있습니다.',
      },
      {
        questionId: 3205,
        questionText: '반품 사진은 어느 폴더에 올려야 하나요?',
        userAnswer: '반품_사진_이번주 폴더',
        correctAnswer: '반품_사진_이번주 폴더',
        correct: true,
        explanation: '메신저에 반품 사진을 반품_사진_이번주 폴더에 올리라고 되어 있습니다.',
      },
    ],
  },
  302: {
    sessionId: 302,
    score: 100,
    answerSummary: { correctCount: 5, totalCount: 5 },
    answers: [
      {
        questionId: 3301,
        questionText: '출근 기록이 누락되면 언제까지 정정 신청서를 작성해야 하나요?',
        userAnswer: '당일 오후 6시 전',
        correctAnswer: '당일 오후 6시 전',
        correct: true,
        explanation: '근태 정정 공지에는 당일 오후 6시 전까지 신청서를 작성해야 한다고 되어 있습니다.',
      },
      {
        questionId: 3302,
        questionText: '정정 신청서에 필요한 서명은 무엇인가요?',
        userAnswer: '팀장 확인 서명',
        correctAnswer: '팀장 확인 서명',
        correct: true,
        explanation: '작성 기준에 팀장 확인 서명이 필요하다고 되어 있습니다.',
      },
      {
        questionId: 3303,
        questionText: '정정 사유를 적은 뒤 누구에게 먼저 보내야 하나요?',
        userAnswer: '팀장',
        correctAnswer: '팀장',
        correct: true,
        explanation: '메신저에 정정 사유를 적은 뒤 팀장에게 먼저 보내 달라고 되어 있습니다.',
      },
      {
        questionId: 3304,
        questionText: '정정 신청서에 반드시 적어야 하는 내용은 무엇인가요?',
        userAnswer: '누락 사유',
        correctAnswer: '누락 사유',
        correct: true,
        explanation: '신청서 작성 기준에 누락 사유를 반드시 적어야 한다고 되어 있습니다.',
      },
      {
        questionId: 3305,
        questionText: '다음 날 제출한 정정 신청서는 언제 처리되나요?',
        userAnswer: '다음 급여 반영일',
        correctAnswer: '다음 급여 반영일',
        correct: true,
        explanation: '공지에 다음 날 제출한 신청서는 다음 급여 반영일에 처리된다고 되어 있습니다.',
      },
    ],
  },
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

    const payload = parseBody(config.data);
    const feedbackSummary = '상대방의 말을 듣고 필요한 내용을 차분하게 요청했습니다.';
    const result = {
      sessionId,
      score: 86,
      feedbackSummary,
      completed: true,
    };

    mockSocialSessions.set(sessionId, {
      ...session,
      ...result,
      detail: {
        sessionId,
        score: result.score,
        scoreType: 'AI_EVALUATION',
        feedback: {
          summary: feedbackSummary,
          detailText: '필요한 내용을 다시 확인하고, 상대방의 답변을 듣고 나서 행동을 정리하는 흐름이 좋았습니다.',
        },
        dialogLogs: payload.dialogLogs || [],
      },
    });

    return [200, wrappedTraining(result)];
  });

  mockApi.onGet(/\/api\/trainings\/social\/sessions\/\d+\/detail$/).reply((config) => {
    const authError = requireAuth(config);
    if (authError) {
      return authError;
    }

    const sessionId = Number(config.url.split('/').at(-2));
    const historyDetail = socialHistoryDetails[sessionId];
    const session = mockSocialSessions.get(sessionId);

    if (!historyDetail && !session?.detail) {
      return [404, { success: false, error: { code: 'NOT_FOUND', message: '훈련 세션을 찾을 수 없습니다.' } }];
    }

    return [200, wrappedTraining(historyDetail || session.detail)];
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
    const category = Object.entries(safetyScenarios).find(([, items]) =>
      items.some((item) => item.scenarioId === Number(payload.scenarioId)),
    )?.[0];
    const sessionId = nextSafetySessionId;
    nextSafetySessionId += 1;
    mockSafetySessions.set(sessionId, {
      sessionId,
      scenarioId: payload.scenarioId,
      category,
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

  mockApi.onPost(/\/api\/trainings\/safety\/sessions\/\d+\/advance-scene$/).reply((config) => {
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
    const nextSceneIndex = currentIndex + 1;
    if (nextSceneIndex >= session.scenario.scenes.length) {
      return [404, { success: false, error: { code: 'NOT_FOUND', message: '다음 장면을 찾을 수 없습니다.' } }];
    }
    mockSafetySessions.set(sessionId, {
      ...session,
      sceneIndex: nextSceneIndex,
    });
    return [
      200,
      wrappedTraining({
        completed: false,
        nextScene: cloneSafetyScene(
          session.scenario.scenes[nextSceneIndex],
          nextSceneIndex === session.scenario.scenes.length - 1,
        ),
        result: null,
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
              result: {
                ...(result || {
                correct: true,
                title: '잘했어요!',
                score,
                resultText: '상황을 차분히 확인하며 훈련을 마무리했습니다.',
                effectText: '상황을 먼저 이해하고 다음 행동을 준비하는 것도 중요한 안전 행동입니다.',
                feedbackImageUrl: scene.feedbackImageUrl || scene.imageUrl,
                feedbackImageAlt: scene.feedbackImageAlt || scene.imageAlt,
                feedback: '상황을 차분히 확인하며 훈련을 마무리했습니다.',
                }),
                scenarioId: session.scenarioId,
                category: session.category,
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
      scenarioId: session.scenarioId,
      category: session.category,
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
    const historyDetail = safetyHistoryDetails[sessionId];
    const session = mockSafetySessions.get(sessionId);
    if (historyDetail) {
      return [200, wrappedTraining(historyDetail)];
    }
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

    const questions = regradedDocumentQuestionsByLevel[level] || regradedDocumentQuestionsByLevel[1];
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
      const selectedChoice = question.choices?.find((choice) => choice.choiceId === answer?.choiceId);

      return {
        questionId: question.questionId,
        questionText: question.questionText,
        userAnswer: selectedChoice?.text || answer?.userAnswer || null,
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
      level: session.level,
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
    const historyDetail = documentHistoryDetails[sessionId];
    const session = mockDocumentSessions.get(sessionId);

    if (!historyDetail && !session) {
      return [404, { success: false, error: { code: 'NOT_FOUND', message: '훈련 세션을 찾을 수 없습니다.' } }];
    }

    if (historyDetail) {
      return [200, wrappedTraining(historyDetail)];
    }

    return [
      200,
      wrappedTraining({
        sessionId,
        level: session.level,
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
              userAnswer: result.userAnswer,
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
