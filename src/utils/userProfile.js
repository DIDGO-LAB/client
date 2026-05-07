const DEFAULT_DISABILITIES = ['발달장애'];

export const genderToApi = (gender) => {
  if (gender === '남성' || gender === 'MALE') {
    return 'MALE';
  }

  if (gender === '여성' || gender === 'FEMALE') {
    return 'FEMALE';
  }

  return gender;
};

export const genderFromApi = (gender) => {
  if (gender === 'MALE') {
    return '남성';
  }

  if (gender === 'FEMALE') {
    return '여성';
  }

  return gender || '';
};

const normalizeDisabilities = (disabilities) =>
  Array.isArray(disabilities) && disabilities.length > 0 ? disabilities : DEFAULT_DISABILITIES;

export const signupFormToApiPayload = (signupData) => ({
  loginId: signupData.userId,
  password: signupData.password,
  name: signupData.userName,
  birthDate: signupData.birthDate,
  gender: genderToApi(signupData.gender),
  email: signupData.email,
  disabilities: normalizeDisabilities(signupData.disabilities),
  desiredJob: signupData.job,
});

export const userFromApi = (user) => ({
  userId: user.loginId || '',
  userName: user.name || '',
  birthDate: user.birthDate || '',
  gender: genderFromApi(user.gender),
  email: user.email || '',
  disabilities: normalizeDisabilities(user.disabilities),
  job: user.desiredJob || '',
});

export const userEditToApiPayload = (userData) => ({
  name: userData.userName,
  gender: genderToApi(userData.gender),
  email: userData.email,
  disabilities: normalizeDisabilities(userData.disabilities),
  desiredJob: userData.job,
});
