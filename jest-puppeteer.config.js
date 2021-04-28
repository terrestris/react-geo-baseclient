module.exports = {
  launch: {
    ignoreHTTPSErrors: true,
    dumpio: true,
    headless: true
  },
  browserContext: 'default',
  server: {
    command: 'cd build && http-server -p 8075',
    port: 8075
  }
};
