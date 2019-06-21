module.exports = {
  rootDir: "../../",
  globals: {
    PROJECT_MAIN_PATH: './',
    PROJECT_MAIN_CLASS: 'ProjectMain'
  },
  testEnvironment: 'jsdom',
  preset: 'jest-puppeteer',
  moduleFileExtensions: [
    'js',
    'jsx',
    'ts',
    'tsx'
  ],
  moduleDirectories: [
    '<rootDir>/node_modules'
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/config/jest/spec/__mocks__/fileMock.js',
    '\\.(css|less)$': '<rootDir>/config/jest/spec/__mocks__/styleMock.js'
  },
  testRegex: '(/__tests__/.*|(\\.|/)(spec))\\.(js|ts|tsx)$',
  transform: {
    '^.+\\.tsx?$': 'babel-jest',
    '^.+\\.ts?$': 'babel-jest',
    '^.+\\.js?$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!(ol|css-animation|labelgun|mapbox-to-ol-style|ol-mapbox-style|antd|@terrestris|(rc-*[a-z]*))/).*/'
  ],
  setupFiles: [
    '<rootDir>/config/jest/spec/setup.js'
  ],
  setupFilesAfterEnv: [
    'jest-canvas-mock'
  ],
  collectCoverage: false,
  coverageDirectory: '<rootDir>/coverage'
};
