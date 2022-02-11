module.exports = {
  verbose: true,
  rootDir: '../../',
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
  testRegex: '((\\.|/)(spec|uitest))\\.(js|ts|tsx)$',
  transform: {
    '^.+\\.tsx?$': 'babel-jest',
    '^.+\\.ts?$': 'babel-jest',
    '^.+\\.js?$': 'babel-jest'
  },
  transformIgnorePatterns: [
    // eslint-ignore-next-line
    '/node_modules/(?!(ol|rc-time-picker|css-animation|labelgun|mapbox-to-ol-style|ol-mapbox-style|antd|node-fetch|data-uri-to-buffer|fetch-blob|formdata-polyfill|@ant-design|@terrestris|@babel|(rc-*[a-z]*))/).*/'
  ],
  setupFiles: [
    '<rootDir>/config/jest/spec/setup.js',
    '<rootDir>/config/jest/spec/__mocks__/matchMediaMock.js',
  ],
  setupFilesAfterEnv: [
    'jest-canvas-mock'
  ],
  collectCoverage: false,
  coverageDirectory: '<rootDir>/coverage'
};
