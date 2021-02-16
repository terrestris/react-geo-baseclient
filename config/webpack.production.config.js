const commonConfig = require('./webpack.common.config.js');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');

let commonWebpackConfig = commonConfig.commonWebpackConfig;
const Logger = commonConfig.logger;
let customAppConfig;
try {
  customAppConfig = require('../../' + process.env.CUSTOM_WEBPACK_CONFIG);
} catch (error) {
  Logger.info("No custom app config provided, using defaults.");
}

// prepare the InterpolateHtmlPlugin
const interpolations = {
  'NODE_ENV': 'production',
  'PUBLIC_URL': ''
};

const loadingMaskImg = customAppConfig && customAppConfig.loadingMaskImg || 'logo_terrestris.png';

commonWebpackConfig.plugins = [
  ...commonWebpackConfig.plugins || [],
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify('production')
    },
    APP_MODE: JSON.stringify(commonConfig.TARGET)
  }),
  new HtmlWebpackPlugin({
    filename: 'index.html',
    favicon: './public/favicon.ico',
    template: './public/index.html',
    loadingMaskImg: loadingMaskImg,
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
  new InterpolateHtmlPlugin(HtmlWebpackPlugin, interpolations)
];

commonWebpackConfig.mode = 'production';

module.exports = commonWebpackConfig;
