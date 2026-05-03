import MockAdapter from 'axios-mock-adapter';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import client from '../client';
import { getMe, updateMe } from '../user';

describe('userApi', () => {
  let mock;

  beforeEach(() => {
    mock = new MockAdapter(client);
  });

  afterEach(() => {
    mock.restore();
  });

  it('gets the current user profile', async () => {
    const response = {
      userId: 1,
      loginId: 'user01',
      name: '홍길동',
      accountStatus: 'ACTIVE',
    };

    mock.onGet('/api/users/me').reply(200, response);

    await expect(getMe()).resolves.toEqual(response);
  });

  it('patches the current user profile', async () => {
    const payload = {
      email: 'new-user@example.com',
      desiredJob: '사무직',
    };
    const response = { message: '사용자 정보가 수정되었습니다.' };

    mock.onPatch('/api/users/me', payload).reply(200, response);

    await expect(updateMe(payload)).resolves.toEqual(response);
  });
});
