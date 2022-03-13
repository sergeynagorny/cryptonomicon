const getEnv = (key) => {
  if (process.env[key] === undefined) {
    throw new Error(`Env variable ${key} is required`);
  }
  return process.env[key] || "";
};

export const API_WS_URL = getEnv("VUE_APP_API_WS_URL");
export const API_KEY = getEnv("VUE_APP_API_KEY");
