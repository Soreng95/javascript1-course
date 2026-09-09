export const ENVIRONMENTS = {
  LOCAL: 'local',
  PRODUCTION: 'production',
};

const LOCAL_HOSTNAMES = ['localhost', '127.0.0.1', '0.0.0.0', '::1', ''];

const OVERRIDE_KEY = 'rainy-days.env';

const SETTINGS = {
  [ENVIRONMENTS.LOCAL]: {
    name: ENVIRONMENTS.LOCAL,
    apiBaseUrl: 'http://localhost:8080/api',
    requestTimeoutMs: 10000,
    debug: true,
  },
  [ENVIRONMENTS.PRODUCTION]: {
    name: ENVIRONMENTS.PRODUCTION,
    apiBaseUrl: 'http://localhost:8080/api',
    requestTimeoutMs: 20000,
    debug: false,
  },
};

const readStoredOverride = () => {
  try {
    return window.localStorage.getItem(OVERRIDE_KEY);
  } catch {
    return null;
  }
};

const readOverride = () => {
  const fromQuery = new URLSearchParams(window.location.search).get('env');

  if (fromQuery && SETTINGS[fromQuery]) {
    try {
      window.localStorage.setItem(OVERRIDE_KEY, fromQuery);
    } catch {
      return fromQuery;
    }
    return fromQuery;
  }

  const stored = readStoredOverride();
  return stored && SETTINGS[stored] ? stored : null;
};

const detect = () => {
  const override = readOverride();
  if (override) return override;

  return LOCAL_HOSTNAMES.includes(window.location.hostname)
    ? ENVIRONMENTS.LOCAL
    : ENVIRONMENTS.PRODUCTION;
};

export const ENV = SETTINGS[detect()];

export const isLocal = () => ENV.name === ENVIRONMENTS.LOCAL;

export const isProduction = () => ENV.name === ENVIRONMENTS.PRODUCTION;

export const setEnvironment = (name) => {
  if (!SETTINGS[name]) {
    throw new Error(`Unknown environment "${name}". Use "local" or "production".`);
  }

  try {
    window.localStorage.setItem(OVERRIDE_KEY, name);
  } catch {
    return name;
  }

  return name;
};

export const clearEnvironmentOverride = () => {
  try {
    window.localStorage.removeItem(OVERRIDE_KEY);
  } catch {
    return;
  }
};
