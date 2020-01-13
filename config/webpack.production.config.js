const commonConfig = require('./webpack.common.config.js');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InterpolateHtmlPlugin = require('interpolate-html-plugin');

let commonWebpackConfig = commonConfig.commonWebpackConfig;
const Logger = commonConfig.logger;
let customAppConfig;
try {
  customAppConfig = require('../../src/config/webpack.config.js');
} catch (error) {
  Logger.info("no custom app config provided, use defaults");
}

// prepare the InterpolateHtmlPlugin
const interpolations = {
  'NODE_ENV': 'production',
  'PUBLIC_URL': ''
};

const title = customAppConfig && customAppConfig.appTitle || 'react-geo-baseclient';

commonWebpackConfig.plugins = [
  ...commonWebpackConfig.plugins || [],
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production')
    },
    APP_MODE: JSON.stringify(commonConfig.TARGET)
  }),
  new HtmlWebpackPlugin({
    title: title,
    filename: 'index.html',
    favicon: './public/favicon.ico',
    template: './public/index.html',
    files: {
      css: [],
      csrfToken: '${_csrf.token}',
      csrfHeader: '${_csrf.headerName}',
      csrfParameterName: '${_csrf.parameterName}'
    },
    hash: true,
    minify: {
      removeComments: true,
      collapseWhitespace: true
    }
  }),
  new webpack.ProgressPlugin({ profile: false }),
  new InterpolateHtmlPlugin(interpolations)
];

commonWebpackConfig.mode = 'production';

module.exports = commonWebpackConfig;
