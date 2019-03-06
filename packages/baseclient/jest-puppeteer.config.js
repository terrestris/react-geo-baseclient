module.exports = {
  launch: {
    ignoreHTTPSErrors: true,
    dumpio: true,
    headless: true
  },
  browserContext: 'default',
  server: {
    command: 'cd build && http-server -p 8000',
    port: 8000
  }
}
