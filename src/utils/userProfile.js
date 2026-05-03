export const genderToApi = (gender) => {
  if (gender === '남성') {
    return 'MALE';
  }

  if (gender === '여성') {
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

export const signupFormToApiPayload = (signupData) => ({
  loginId: signupData.userId,
  password: signupData.password,
  name: signupData.userName,
  birthDate: signupData.birthDate,
  gender: genderToApi(signupData.gender),
  email: signupData.email,
  disabilities: signupData.disability ? [signupData.disability] : [],
  desiredJob: signupData.job,
});

export const userFromApi = (user) => ({
  userId: user.loginId || '',
  userName: user.name || '',
  birthDate: user.birthDate || '',
  gender: genderFromApi(user.gender),
  email: user.email || '',
  disability: Array.isArray(user.disabilities) ? user.disabilities.join(', ') : '',
  job: user.desiredJob || '',
});

export const userEditToApiPayload = (userData) => ({
  name: userData.userName,
  gender: genderToApi(userData.gender),
  email: userData.email,
  disabilities: userData.disability
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean),
  desiredJob: userData.job,
});
