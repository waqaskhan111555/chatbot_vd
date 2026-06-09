/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  transform: {},
  extensionsToTreatAsEsm: [".js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  collectCoverageFrom: [
    "lib/**/*.js",
    "app/api/**/*.js",
    "!app/api/**/route.js", // excluded — framework glue
  ],
  coverageThreshold: {
    global: { lines: 85 },
  },
};

export default config;
