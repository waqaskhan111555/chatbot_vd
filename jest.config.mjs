/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: [
    "lib/**/*.js",
  ],
  coverageThreshold: {
    global: { lines: 85 },
  },
};

export default config;
