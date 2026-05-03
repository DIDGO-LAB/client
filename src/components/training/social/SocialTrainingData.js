const createMockResult = (score = 90) => ({
  // TODO: 백엔드 결과 API가 연결되면 이 mockBackendResult 대신 실제 응답을 사용하세요.
  // 백엔드가 내려줄 값: score, aiFeedback, recommendedAnswer, extraMessages 등.
  score,
  aiFeedback: '백엔드 연결 전 임시 AI 피드백입니다.',
  recommendedAnswer: '백엔드 연결 전 임시 추천 답변입니다.',
  extraMessages: [],
});

const createTutorial = ({
  id,
  label,
  description,
  characterLine,
  userLine = '어떻게 말하면 좋을지 다시 한번 확인해도 될까요?',
  score,
}) => ({
  id,
  label,
  description,
  // TODO: 백엔드 대화 API에서 내려오는 messages로 교체하세요.
  mockMessages: [
    { id: `${id}-character-1`, speaker: 'character', text: characterLine },
    { id: `${id}-user-1`, speaker: 'user', text: userLine },
  ],
  mockBackendResult: createMockResult(score),
});

const createSituation = ({ id, label, tutorials }) => ({
  id,
  label,
  tutorials,
});

export const JOB_TYPES = [
  { id: 'office', label: '사무직' },
  { id: 'labor', label: '단순노무직' },
];

export const SOCIAL_TRAINING_CONTENT = {
  office: {
    introTitle: '"회사 생활\n우리 같이 연습해 봐요!"',
    introDescription:
      '여기는 사무직 사원들을 위한 훈련 공간이에요.\n지금 나에게 일어난 상황이나 걱정되는 카드를 하나만 골라보세요.',
    situations: [
      createSituation({
        id: 'unclear-instruction',
        label: '지시가 모호해 이해가 어려워요',
        tutorials: [
          createTutorial({
            id: 'office-unclear-copy',
            label: '복사 수량 확인하기',
            description:
              '사수님이 서류를 가져와 책상에 툭 내려놓으며 "이거 넉넉히 복사해서 회의실에 갖다 둬요."라고 말하고 급하게 나갔습니다. 회의 인원이 몇 명인지 몰라 몇 장을 복사해야 할지 당황스러운 상황입니다. 어떻게 대처해야 할까요?',
            characterLine: '이거 넉넉히 복사해서 회의실에 갖다 둬요.',
            userLine: '회의 인원이 몇 명인지 몰라서요. 몇 장 정도 복사하면 될까요?',
            score: 90,
          }),
          createTutorial({
            id: 'office-unclear-phone',
            label: '전화 연락처 확인하기',
            description:
              '팀장님이 외근 중인데 사무실로 전화가 왔습니다. 상대방이 "나 박 사장인데, 팀장 오면 전화하라고 해요." 말하고 끊으려 합니다. 연락처를 모르면 팀장님께 보고할 수 없는 상황입니다. 어떻게 말해야 할까요?',
            characterLine: '나 박 사장인데, 팀장 오면 전화하라고 해요.',
            userLine: '죄송하지만 성함과 연락드릴 번호를 다시 한번 알려주실 수 있을까요?',
            score: 90,
          }),
          createTutorial({
            id: 'office-unclear-drinks',
            label: '구매 기준 확인하기',
            description:
              '대리님이 법인카드를 주며 "손님들 오시니까 탕비실에 음료수 좀 종류별로 사다 채워놔요. 센스 있게 알죠?"라고 합니다. 어떤 음료를 몇 개나 사야 할지 막막한 상황입니다. 뭐라고 물어봐야 할까요?',
            characterLine: '손님들 오시니까 탕비실에 음료수 좀 종류별로 사다 채워놔요. 센스 있게 알죠?',
            userLine: '커피나 주스처럼 어떤 종류를 몇 개 정도 사면 될까요?',
            score: 90,
          }),
        ],
      }),
      createSituation({
        id: 'work-mistake',
        label: '업무 중 실수했어요',
        tutorials: [
          createTutorial({
            id: 'office-mistake-shredder',
            label: '파쇄 실수 보고하기',
            description:
              '파쇄기 옆에 놓인 종이 뭉치를 당연히 버리는 건 줄 알고 다 갈아버렸습니다. 그런데 알고 보니 사수님이 점심시간 직전에 정리해둔 영수증 원본들이었습니다. 이미 가루가 된 상황에서 어떻게 보고해야 할까요?',
            characterLine: '아까 정리해둔 영수증 원본 봤어요?',
            userLine: '죄송합니다. 파쇄할 서류인 줄 알고 영수증 원본을 파쇄했습니다.',
            score: 85,
          }),
          createTutorial({
            id: 'office-mistake-meeting-room',
            label: '회의실 예약 실수 말하기',
            description:
              '오후 2시 회의를 위해 회의실에 갔더니 이미 다른 팀이 회의 중입니다. 알고 보니 내가 예약 시스템에 등록하는 걸 깜빡해서 우리 팀원들이 들어가지 못하고 있습니다. 팀장님께 이 상황을 어떻게 말해야 할까요?',
            characterLine: '회의실 준비됐나요?',
            userLine: '죄송합니다. 제가 예약 등록을 놓쳤습니다. 바로 빈 회의실을 찾아보겠습니다.',
            score: 85,
          }),
          createTutorial({
            id: 'office-mistake-late',
            label: '지각 상황 보고하기',
            description:
              '출근하는 지하철이 터널 안에서 고장으로 멈췄습니다. 안내 방송에서는 "출발이 20분 이상 지연될 예정"이라고 합니다. 9시 정각까지 출근하기 불가능한 상황에서 사수님께 어떻게 연락해야 할까요?',
            characterLine: '지금 어디쯤이에요?',
            userLine: '지하철 고장으로 20분 이상 지연될 예정이라 9시까지 도착이 어렵습니다.',
            score: 85,
          }),
        ],
      }),
      createSituation({
        id: 'refuse-request',
        label: '부당하거나 어려운 부탁을 받았어요',
        tutorials: [
          createTutorial({
            id: 'office-refuse-boxes',
            label: '개인 부탁 거절하기',
            description:
              '옆자리 선배가 자기 책상에 쌓인 빈 박스 더미를 내 밀차에 툭 던지며 "OO 씨는 이제 할 일 없지? 나 바쁘니까 이것도 가져가서 분리수거장에 좀 버리고 와요."라고 합니다. 원래 내 업무가 아닌데 당연하다는 듯 시키는 상황에서 뭐라고 대답해야 할까요?',
            characterLine: 'OO 씨는 이제 할 일 없지? 나 바쁘니까 이것도 가져가서 분리수거장에 좀 버리고 와요.',
            userLine: '죄송하지만 지금 맡은 업무가 있어서 개인적인 부탁은 어렵습니다.',
            score: 88,
          }),
          createTutorial({
            id: 'office-refuse-private-question',
            label: '사생활 질문 넘기기',
            description:
              '점심시간에 선배가 "OO 씨는 장애가 있어서 취직하기 편했겠어. 수당도 나오죠? 한 달에 얼마 받아요?"라며 기분 나쁜 사생활 질문을 합니다. 대답하고 싶지 않을 때 어떻게 상황을 넘겨야 할까요?',
            characterLine: 'OO 씨는 장애가 있어서 취직하기 편했겠어. 수당도 나오죠? 한 달에 얼마 받아요?',
            userLine: '그건 개인적인 일이라 말씀드리기 곤란합니다.',
            score: 88,
          }),
          createTutorial({
            id: 'office-refuse-dangerous-work',
            label: '위험한 방식 거절하기',
            description:
              '기계 작업을 하고 있는데 동료가 다가와 "야, 이거 그냥 손으로 대충 밀어 넣어. 기계 안 멈춰도 돼. 언제 일일이 끄고 해?"라며 위험한 방식을 권유합니다. 규칙대로 하지 않으면 동료가 나를 답답해할까 봐 걱정되는 상황입니다. 어떻게 말해야 할까요?',
            characterLine: '야, 이거 그냥 손으로 대충 밀어 넣어. 기계 안 멈춰도 돼. 언제 일일이 끄고 해?',
            userLine: '그렇게 하면 다칠 수 있어서 위험합니다. 규칙대로 기계를 멈추고 하겠습니다.',
            score: 88,
          }),
        ],
      }),
    ],
  },
  labor: {
    introTitle: '"현장 생활\n우리 같이 연습해 봐요!"',
    introDescription:
      '여기는 단순노무직 사원들을 위한 훈련 공간이에요.\n지금 나에게 일어난 상황이나 걱정되는 카드를 하나만 골라보세요.',
    situations: [
      createSituation({
        id: 'accept-feedback',
        label: '지적 및 피드백 수용',
        tutorials: [
          createTutorial({
            id: 'labor-feedback-cleaning',
            label: '청소 지적 수용하기',
            description:
              '화장실 청소를 열심히 마쳤는데 관리자님이 오더니 "여기 구석에 머리카락 그대로잖아요! 눈에 보이는 것만 치울 거예요?"라며 사람들 앞에서 크게 화를 냅니다. 너무 속상하지만 일을 마무리하려면 뭐라고 대답해야 할까요?',
            characterLine: '여기 구석에 머리카락 그대로잖아요! 눈에 보이는 것만 치울 거예요?',
            userLine: '죄송합니다. 지적해주신 곳을 확인하고 즉시 다시 청소하겠습니다.',
            score: 90,
          }),
          createTutorial({
            id: 'labor-feedback-speed',
            label: '작업 속도 피드백 받기',
            description:
              '물류 박스를 접고 있는데 반장님이 오셔서 "OO 씨는 손이 너무 느려요. 옆 사람은 벌써 두 박스 다 채웠는데 언제 끝낼 거야?"라며 속도를 지적합니다. 마음이 급해지는 상황에서 뭐라고 말해야 할까요?',
            characterLine: 'OO 씨는 손이 너무 느려요. 옆 사람은 벌써 두 박스 다 채웠는데 언제 끝낼 거야?',
            userLine: '알겠습니다. 조금 더 속도를 내보겠습니다.',
            score: 90,
          }),
          createTutorial({
            id: 'labor-feedback-safety-helmet',
            label: '안전 규칙 지적받기',
            description:
              '작업장이 너무 더워서 안전모를 잠깐 벗고 땀을 닦고 있었습니다. 그때 관리자님이 나타나 "안전 규칙 몰라요? 사고 나면 책임질 거야? 당장 써요!"라고 무섭게 지적합니다. 뭐라고 답변해야 할까요?',
            characterLine: '안전 규칙 몰라요? 사고 나면 책임질 거야? 당장 써요!',
            userLine: '죄송합니다. 바로 안전모를 쓰겠습니다.',
            score: 90,
          }),
        ],
      }),
      createSituation({
        id: 'ask-help',
        label: '도움 요청 및 조율',
        tutorials: [
          createTutorial({
            id: 'labor-help-machine',
            label: '기계 이상 알리기',
            description:
              "대형 세탁기에서 수건을 꺼내고 있는데 기계에서 '텅텅'거리는 쇳소리가 나더니 갑자기 멈췄습니다. 혼자 해결하려다 사고가 날 것 같아 무서운 상황입니다. 관리자님께 어떻게 알려야 할까요?",
            characterLine: '무슨 일인가요?',
            userLine: "세탁기에서 '텅텅' 소리가 나고 갑자기 멈췄습니다. 확인을 도와주실 수 있을까요?",
            score: 90,
          }),
          createTutorial({
            id: 'labor-help-heavy-box',
            label: '무거운 박스 도움 요청하기',
            description:
              '주방에서 식자재 박스 5개를 창고로 옮겨야 합니다. 박스가 너무 크고 무거워서 혼자 들다가 허리를 다칠 것 같은 상황입니다. 옆에 있는 동료에게 어떻게 도움을 청해야 할까요?',
            characterLine: '박스 옮기는 중이에요?',
            userLine: '박스가 너무 무거워서 그런데 같이 들어주실 수 있나요?',
            score: 90,
          }),
          createTutorial({
            id: 'labor-help-retraining',
            label: '작업 순서 다시 묻기',
            description:
              '어제 배운 나사 조립 작업인데, 오늘 아침 기계 앞에 서니 어디서부터 시작해야 할지 순서가 하나도 기억나지 않습니다. 가만히 있으면 일이 밀리는 상황입니다. 사수님께 어떻게 말해야 할까요?',
            characterLine: '작업 시작하면 됩니다.',
            userLine: '죄송하지만 순서가 기억나지 않습니다. 다시 한번만 알려주실 수 있을까요?',
            score: 90,
          }),
        ],
      }),
      createSituation({
        id: 'health-report',
        label: '휴식 및 신체 상태 보고',
        tutorials: [
          createTutorial({
            id: 'labor-health-restroom',
            label: '화장실 자리 비움 요청하기',
            description:
              '마트 진열 업무를 하던 중 갑자기 배가 너무 아파서 당장 화장실에 가야 할 것 같습니다. 하지만 내 자리를 비우면 손님 안내를 할 사람이 없는 상황입니다. 관리자님께 뭐라고 말해야 할까요?',
            characterLine: '무슨 일 있어요?',
            userLine: '배가 너무 아파서 화장실에 다녀와야 할 것 같습니다. 잠시 자리를 비워도 될까요?',
            score: 90,
          }),
          createTutorial({
            id: 'labor-health-dizzy',
            label: '어지러움으로 휴식 요청하기',
            description:
              '한여름 뙤약볕에서 주차 안내를 하는데 갑자기 어지럽고 식은땀이 나며 쓰러질 것 같습니다. 계속 서 있으면 위험할 것 같은 상황입니다. 반장님께 휴식을 요청하려면 뭐라고 말해야 할까요?',
            characterLine: '괜찮아요?',
            userLine: '어지럽고 식은땀이 나서 쓰러질 것 같습니다. 10분만 쉬어도 될까요?',
            score: 90,
          }),
          createTutorial({
            id: 'labor-health-cut',
            label: '부상 보고하기',
            description:
              '박스를 뜯다가 커터 칼에 손가락이 깊게 베여서 피가 많이 나고 손이 떨립니다. 너무 아파서 일을 계속할 수 없는 상황일 때 상사에게 어떻게 보고해야 할까요?',
            characterLine: '왜 일을 멈췄어요?',
            userLine: '커터 칼에 손가락을 깊게 베었습니다. 피가 많이 나서 치료가 필요합니다.',
            score: 90,
          }),
        ],
      }),
    ],
  },
};
