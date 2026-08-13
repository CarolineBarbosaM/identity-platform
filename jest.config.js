module.exports = {
  rootDir: 'src',

  moduleFileExtensions: [
    'js',
    'json',
    'ts',
  ],

  testRegex: '.*\\.spec\\.ts$',

  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },

  extensionsToTreatAsEsm: ['.ts'],

  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },

  transformIgnorePatterns: [
    'node_modules/(?!(@otplib|@scure)/)',
  ],

  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],

  coverageDirectory: '../coverage',

  testEnvironment: 'node',
};
