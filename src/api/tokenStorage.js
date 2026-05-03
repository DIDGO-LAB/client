const ACCESS_TOKEN_KEY = 'didgo.accessToken';
const REFRESH_TOKEN_KEY = 'didgo.refreshToken';
const TOKEN_STORAGE_KEY = 'didgo.tokenStorage';

const STORAGE_TYPES = {
  LOCAL: 'local',
  SESSION: 'session',
};

const getStorage = (type) => (type === STORAGE_TYPES.LOCAL ? localStorage : sessionStorage);

const getCurrentStorageType = () => {
  const savedType = localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY);

  if (savedType === STORAGE_TYPES.LOCAL || savedType === STORAGE_TYPES.SESSION) {
    return savedType;
  }

  if (localStorage.getItem(ACCESS_TOKEN_KEY) || localStorage.getItem(REFRESH_TOKEN_KEY)) {
    return STORAGE_TYPES.LOCAL;
  }

  if (sessionStorage.getItem(ACCESS_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY)) {
    return STORAGE_TYPES.SESSION;
  }

  return STORAGE_TYPES.SESSION;
};

const clearStorage = (storage) => {
  storage.removeItem(ACCESS_TOKEN_KEY);
  storage.removeItem(REFRESH_TOKEN_KEY);
  storage.removeItem(TOKEN_STORAGE_KEY);
};

export const tokenStorage = {
  save({ accessToken, refreshToken, rememberMe = false }) {
    const storageType = rememberMe ? STORAGE_TYPES.LOCAL : STORAGE_TYPES.SESSION;
    const activeStorage = getStorage(storageType);
    const inactiveStorage = getStorage(rememberMe ? STORAGE_TYPES.SESSION : STORAGE_TYPES.LOCAL);

    clearStorage(inactiveStorage);

    if (accessToken) {
      activeStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }

    if (refreshToken) {
      activeStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }

    activeStorage.setItem(TOKEN_STORAGE_KEY, storageType);
  },

  update({ accessToken, refreshToken }) {
    const storage = getStorage(getCurrentStorageType());

    if (accessToken) {
      storage.setItem(ACCESS_TOKEN_KEY, accessToken);
    }

    if (refreshToken) {
      storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  getAccessToken() {
    return getStorage(getCurrentStorageType()).getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken() {
    return getStorage(getCurrentStorageType()).getItem(REFRESH_TOKEN_KEY);
  },

  clear() {
    clearStorage(localStorage);
    clearStorage(sessionStorage);
  },
};
