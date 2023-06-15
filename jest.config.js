export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ["<rootDir>/dist/", "<rootDir>/node_modules/"],
  transform: { "^.+\\.[tj]sx?$": "ts-jest" },
  transformIgnorePatterns: [
      "node_modules/(?!posipaki)",
  ],
};
