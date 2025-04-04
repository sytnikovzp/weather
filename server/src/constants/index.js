require('dotenv').config({ path: '../.env' });

module.exports = {
  AUTH: {
    ACCESS_SECRET: process.env.ACCESS_SECRET,
    REFRESH_SECRET: process.env.REFRESH_SECRET,
    ACCESS_TOKEN_TIME: process.env.ACCESS_TOKEN_TIME,
    REFRESH_TOKEN_TIME: process.env.REFRESH_TOKEN_TIME,
  },
  HASH: {
    SALT_ROUNDS: parseInt(process.env.SALT_ROUNDS),
  },
  CLIENT: {
    URL: process.env.CLIENT_URL,
  },
  SERVER_CONFIG: {
    HOST: process.env.WEATHER_SERVER_HOST,
    PORT: parseInt(process.env.WEATHER_SERVER_PORT) || 5000,
  },
  DATABASE: {
    DB_USER: process.env.DB_USER,
    DB_PASS: process.env.DB_PASS,
    DB_NAME: process.env.DB_NAME,
    DB_DIALECT: process.env.DB_DIALECT,
  },
};
