/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  transform: {
    "^.+\.jsx?$": ["babel-jest", {
      presets: [["@babel/preset-env", { targets: { node: "current" } }], "@babel/preset-react"],
    }],
  },
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
