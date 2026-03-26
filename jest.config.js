module.exports = {
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'storage.js',
    '!**/node_modules/**'
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/'
  ],
  testMatch: [
    '**/__tests__/**/*.js',
    '**/?(*.)+(spec|test).js'
  ]
};
