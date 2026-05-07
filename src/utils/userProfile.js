export const genderToApi = (gender) => {
  if (gender === '?⑥꽦') {
    return 'MALE';
  }

  if (gender === '?ъ꽦') {
    return 'FEMALE';
  }

  return gender;
};

export const genderFromApi = (gender) => {
  if (gender === 'MALE') {
    return '?⑥꽦';
  }

  if (gender === 'FEMALE') {
    return '?ъ꽦';
  }

  return gender || '';
};

export const signupFormToApiPayload = (signupData) => ({
  loginId: signupData.userId,
  password: signupData.password,
  name: signupData.userName,
  birthDate: signupData.birthDate,
  gender: genderToApi(signupData.gender),
  email: signupData.email,
  disabilities: [],
  desiredJob: signupData.job,
});

export const userFromApi = (user) => ({
  userId: user.loginId || '',
  userName: user.name || '',
  birthDate: user.birthDate || '',
  gender: genderFromApi(user.gender),
  email: user.email || '',
  job: user.desiredJob || '',
});

export const userEditToApiPayload = (userData) => ({
  name: userData.userName,
  gender: genderToApi(userData.gender),
  email: userData.email,
  disabilities: [],
  desiredJob: userData.job,
});
