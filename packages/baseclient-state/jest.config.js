module.exports = {
  rootDir: "./src",
  moduleFileExtensions: [
    'js',
    'jsx',
    'ts',
    'tsx'
  ],
  moduleDirectories: [
    'node_modules',
    '../baseclient/node_modules'
  ],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$': '<rootDir>/jest/__mocks__/fileMock.js',
    '\\.(css|less)$': '<rootDir>/jest/__mocks__/styleMock.js'
  },
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(js|ts|tsx)$",
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.tsx?$": "ts-jest"
  },
  transformIgnorePatterns: [
    '../baseclient/node_modules/(?!(ol|labelgun|mapbox-to-ol-style|ol-mapbox-style|antd|@terrestris|(rc-*[a-z]*))/).*/',
    '/node_modules/(?!(ol|labelgun|mapbox-to-ol-style|ol-mapbox-style|antd|@terrestris|(rc-*[a-z]*))/).*/'
  ],
  setupFiles: [
    // '<rootDir>/../config/jest/__mocks__/shim.js',
    // '<rootDir>/../config/jest/setup.js'
  ],
  collectCoverage: false,
  coverageDirectory: '<rootDir>/coverage'
};
