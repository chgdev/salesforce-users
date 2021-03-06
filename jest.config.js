module.exports = {
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ["jest-extended", "jest-chain"],
};
