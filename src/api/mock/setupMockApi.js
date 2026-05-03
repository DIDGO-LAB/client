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

  mockApi.onAny().passThrough();

  return mockApi;
};
