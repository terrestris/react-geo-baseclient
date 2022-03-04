process.env.NODE_ENV = 'development';

const path = require('path');
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

commonWebpackConfig.mode = 'development';
// prepare the InterpolateHtmlPlugin
const interpolations = {
  'NODE_ENV': 'development',
  'PUBLIC_URL': ''
};

const title = customAppConfig && customAppConfig.appTitle || 'react-geo-baseclient';
const loadingMaskImg = customAppConfig && customAppConfig.loadingMaskImg || 'logo_terrestris.png';

if (process.env.USE_SOURCEMAP) {
  commonWebpackConfig.devtool = 'inline-source-map';
}

const delayedConf = new Promise(function(resolve) {
  commonWebpackConfig.plugins = [
    ...commonWebpackConfig.plugins || [],
    new HtmlWebpackPlugin({
      favicon: './public/icon_terrestris.png',
      filename: 'index.html',
      appPrefix: APP_PREFIX ? APP_PREFIX : './',
      hash: true,
      minify: {
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true,
        removeComments: true
      },
      template: customAppConfig && customAppConfig.indexTemplate || './public/index.html',
      title,
      loadingMaskImg
    }),
    new InterpolateHtmlPlugin(HtmlWebpackPlugin,interpolations)
  ];

  commonWebpackConfig.devServer = {
    historyApiFallback: true,
    host: '0.0.0.0',
    port: 9090,
    hot: false,
    proxy: [].concat(customAppConfig && customAppConfig.proxy ? customAppConfig.proxy : [{}])
  };
  resolve(commonWebpackConfig);
});

module.exports = new Promise((resolve) => {
  delayedConf.then((conf) => {
    resolve(conf);
  });
});
