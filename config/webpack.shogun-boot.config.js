process.env.NODE_ENV = 'development';

const path = require('path');
const fetch = require('node-fetch');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const commonConfig = require('./webpack.common.config.js');
let commonWebpackConfig = commonConfig.commonWebpackConfig;
const Logger = commonConfig.logger;
const APP_PREFIX = process.env.APP_PREFIX;

let customAppConfig;
try {
  customAppConfig = require('../../' + process.env.CUSTOM_WEBPACK_CONFIG);
} catch (error) {
  Logger.info('No custom app config provided, using defaults.');
}

let customCsrfValues;
if (customAppConfig && customAppConfig.csrf) {
  customCsrfValues = customAppConfig.csrf;
}

commonWebpackConfig.mode = 'development';
// prepare the InterpolateHtmlPlugin
const interpolations = {
  'NODE_ENV': 'development',
  'PUBLIC_URL': ''
};

const backendUrl = process.env.SHOGUN_BACKEND_URL;
const username = process.env.SHOGUN_USER;
const password = process.env.SHOGUN_PASS;
const realm = process.env.KEYCLOAK_REALM;
const clientId = process.env.KEYCLOAK_CLIENT_ID;
const keycloakUrl = process.env.KEYCLOAK_URL;

if (!backendUrl) {
  Logger.error('No SHOGun base URL set in .shogunrc.');
  return;
}

if (!username) {
  Logger.error('No SHOGun user set in .shogunrc.');
  return;
}

if (!password) {
  Logger.error('No SHOGun password set in .shogunrc.');
  return;
}

if (!realm) {
  Logger.error('No Keycloak realm set in .shogunrc.');
  return;
}

if (!clientId) {
  Logger.error('No Keycloak client id set in .shogunrc.');
  return;
}

const loadingMaskImg = customAppConfig && customAppConfig.loadingMaskImg || 'logo_terrestris.png';

console.log(`Try to login to shogun boot with user ${username}`);

const body = `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&grant_type=password&client_id=${encodeURIComponent(clientId)}`;
const loginUrl = `${keycloakUrl}/realms/${realm}/protocol/openid-connect/token`;
const isHttpsBackendUrl = loginUrl.startsWith('https://');
const https = require('https');
const agent = new https.Agent({
  rejectUnauthorized: false
});

const delayedConf =
  fetch(loginUrl, {
    method: 'POST',
    body,
    headers: {
      'Content-type': 'application/x-www-form-urlencoded'
    },
    agent: isHttpsBackendUrl ? agent : null
  }).then(r => r.json())
    .then(response => {
      if (response.error_description || response.error) {
        Logger.error(`Received an unexpected error: ${response.error_description || response.error}`);
        return false;
      }

      const accessToken = response.access_token;
      Logger.info(`Got token for user ${username}: ${accessToken}`);

      // If not needed keep this to 'none'
      // If sourcemap is needed choose a value from https://webpack.js.org/configuration/devtool/
      commonWebpackConfig.devtool = 'eval';

      commonWebpackConfig.plugins = [
        ...commonWebpackConfig.plugins || [],
        new HtmlWebpackPlugin({
          filename: 'index.html',
          favicon: './public/favicon.ico',
          appPrefix: APP_PREFIX ? APP_PREFIX : './',
          csrf: {
            // TODO Fix reading CSRF values
            // csrfHeader: csrfHeader,
            // csrfParameterName: csrfParameterName,
            // csrfToken: csrfToken,
            ...customCsrfValues
          },
          hash: true,
          minify: {
            collapseWhitespace: true,
            collapseInlineTagWhitespace: true,
            removeComments: true
          },
          template: customAppConfig && customAppConfig.indexTemplate || './public/index.html',
          title: 'SHOGun Boot Client',
          loadingMaskImg
        }),
        new webpack.ProgressPlugin({ profile: false }),
        new InterpolateHtmlPlugin(HtmlWebpackPlugin, interpolations)
      ];

      const proxyCommonConf = {
        logLevel: 'info',
        secure: false,
        followRedirects: true,
        target: 'https://localhost/',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Cookie: `token=${accessToken}`
        }
      };

      commonWebpackConfig.devServer = {
        historyApiFallback: true,
        contentBase: path.join(__dirname, 'src'),
        disableHostCheck: true,
        host: '0.0.0.0',
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        https: true,
        inline: true,
        port: 9091,
        // https://github.com/chimurai/http-proxy-middleware#context-matching
        // Note: In multiple path matching, you cannot use string paths and
        //       wildcard paths together!
        proxy: [{
          ...proxyCommonConf,
          context: [
            '/**/*.action',
            '/applications/**',
            '/layers/**',
            '/config/**',
            '/files/**',
            '/imagefiles/**',
            '/users/**',
            '/sso/**',
            '/print/**'
          ]
        }, {
          ...proxyCommonConf,
          context: [
            '/applications',
            '/layers',
            '/files',
            '/imagefiles',
            '/users',
            '/info/app',
            '/geoserver',
            '/print'
          ]
        }].concat(customAppConfig && customAppConfig.proxy ? customAppConfig.proxy : [{}]),
        publicPath: 'https://localhost:9091/'
      };
      return commonWebpackConfig;
    });

module.exports = new Promise((resolve, reject) => {
  Logger.log('info', `Trying to login to ${loginUrl}`);
  delayedConf.then(conf => conf ? resolve(conf) : reject());
});
