process.env.NODE_ENV = 'development';

const path = require('path');
const fetch = require('node-fetch');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const InterpolateHtmlPlugin = require('interpolate-html-plugin');
const URLSearchParams = require('url-search-params');
const cheerio = require('cheerio');
const winston = require('winston');
const commonConfig = require('./webpack.common.config.js');
let commonWebpackConfig = commonConfig.commonWebpackConfig;
const Logger = winston.createLogger({
  format: winston.format.simple(),
  level: 'info',
  transports: [
    new winston.transports.Console({
      colorize: true
    })
  ]
});
const shogunConfig = require('./shogunconfig.json');

commonWebpackConfig.mode = 'development';
// prepare the InterpolateHtmlPlugin
const interpolations = {
  'NODE_ENV': 'development',
  'PUBLIC_URL': ''
};

const backendUrl = shogunConfig.baseUrl;
const userName = shogunConfig.user;
const password = shogunConfig.password;

if (!backendUrl) {
  Logger.error(`No SHOGun base URL set in .shogunrc.`);
  return;
}

if (!userName) {
  Logger.error(`No SHOGun user set in .shogunrc.`);
  return;
}

if (!password) {
  Logger.error(`No SHOGun password set in .shogunrc.`);
  return;
}

const isHttpsBackendUrl = backendUrl.startsWith('https://');

const searchParams = new URLSearchParams();
searchParams.set('username', userName);
searchParams.set('password', password);

const https = require('https');
const agent = new https.Agent({
  rejectUnauthorized: false
});

// commonWebpackConfig.devtool = 'inline-source-map';

const delayedConf =
  fetch(`${backendUrl}/login`, {
    agent: isHttpsBackendUrl ? agent : null
  }).then((response) => {
    let status = response.status;
    let statusText = response.statusText;

    if (status !== 200) {
      Logger.error(`Received an unexpected status code: ${status} (${statusText})`);
    }
    return response.text().then((responseText) => {
      const $ = cheerio.load(responseText);
      let csrfToken = $('meta[name="_csrf"]').prop('content');
      const csrfHeader = $('meta[name="_csrf_header"]').prop('content');
      const csrfParameterName = '_csrf';
      let cookie = response.headers.get('set-cookie');

      if (csrfToken && csrfHeader && csrfParameterName) {
        Logger.info(`Successfully acquired the following CSRF meta tags: \n` +
          `  ▸ _csrf: ${csrfToken} \n`);
      } else {
        return Promise.reject(new Error(`Could not detect all required CSRF meta tags.`));
      }
      searchParams.set(csrfParameterName, csrfToken);

      return fetch(`${backendUrl}/doLogin`, {
        agent: isHttpsBackendUrl ? agent : null,
        body: searchParams,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Cookie': cookie,
          'X-CSRF-TOKEN': csrfToken
        },
        method: 'POST',
        redirect: 'manual'
      })
        .then(loginResponse => {
          let success = loginResponse.status === 302 ? true : false;
          cookie = loginResponse.headers.get('set-cookie');

          // ATTENTION:
          // since we have a new session, we get a new csrf token embedded in the client, so we have to fetch this as well
          return fetch(`${backendUrl}/client/`, { // TODO: should reference to the react-geo-baseclient instance when ready...
            agent: isHttpsBackendUrl ? agent : null,
            headers: {
              'Cookie': cookie,
              'X-CSRF-TOKEN': csrfToken
            },
            method: 'GET',
            redirect: 'manual'
          })
            .then(resp => resp.text()).then((html) => {
              const $2 = cheerio.load(html);
              csrfToken = $2('meta[name="_csrf"]').prop('content');

              if (success) {
                Logger.info(`Successfully logged in. Will append the cookie ${cookie} to ` +
                  'all proxied contexts.');
              } else {
                Logger.error('Could not log in. The webpack server will start, but ' +
                  'it is very likely the application will not work as expected.');
              }

              commonWebpackConfig.plugins = [
                ...commonWebpackConfig.plugins || [],
                new HtmlWebpackPlugin({
                  favicon: './public/icon_terrestris.png',
                  filename: 'index.html',
                  files: {
                    csrfHeader: csrfHeader,
                    csrfParameterName: csrfParameterName,
                    csrfToken: csrfToken
                  },
                  hash: true,
                  minify: {
                    collapseWhitespace: true,
                    removeComments: true
                  },
                  template: './public/index.html',
                  title: 'react-geo-baseclient'
                }),
                new webpack.ProgressPlugin({ profile: false }),
                new CopyWebpackPlugin([
                  './public/logo_terrestris.png',
                  './public/index.css',
                  './public/something-went-wrong.png'
                ]),
                new InterpolateHtmlPlugin(interpolations)
              ];

              commonWebpackConfig.devServer = {
                contentBase: path.join(__dirname, 'src'),
                disableHostCheck: true,
                host: '0.0.0.0',
                https: true,
                inline: true,
                port: 9090,
                proxy: [{
                  context: [
                    '/rest/**',
                    '/locale/**',
                    '/**/*.action',
                    '/import/**'
                  ],
                  headers: {
                    'Access-Control-Allow-Origin': '*',
                    'X-CSRF-TOKEN': csrfToken,
                    cookie: cookie
                  },
                  secure: false,
                  target: backendUrl
                }],
                publicPath: 'https://localhost:9090/'
              };
              return commonWebpackConfig;
            });
          })
          .catch((error) => {
            Logger.log('error', `Error while trying to login: ${error.message}`);
          });
    });
  });

module.exports = new Promise((resolve) => {
  Logger.log('info', `Trying to login to ${backendUrl}`);
  delayedConf.then((conf) => {
    resolve(conf);
  });
});
