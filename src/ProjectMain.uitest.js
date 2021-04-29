/**
 * @jest-environment jest-environment-puppeteer
 */
describe('Application render', () => {
  let page;
  let getMapFound = false;
  let interval;
  const getMapListener = (resolve) => {
    if (getMapFound) {
      clearInterval(interval);
      resolve();
    }
  };
  let getMapPromise = new Promise((resolve, reject) => {
    interval = setInterval(getMapListener, 1000, resolve);
  });

  it('app and map loads correctly', async () => {
    page = await global.browser.newPage();
    /**
     * listen to getmap calls
     */
    page.on('request', request => {
      const url = request.url();
      if (url.toLowerCase().indexOf('request=getmap') > -1) {
        getMapFound = true;
      }
    });
    await page.goto('http://0.0.0.0:8075');
    await page.waitForSelector('#map');
    await page.waitForSelector('canvas');
  }, 120000);

  it('app issues GetMap calls', async () => {
    await getMapPromise;
  }, 16000);

  it('app has correct demo title', async () => {
    const title = await page.evaluate(() => document.title);
    expect(title).toBe('Default Application');
  }, 16000);
});
