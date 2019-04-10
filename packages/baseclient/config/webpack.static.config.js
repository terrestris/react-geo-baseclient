process.env.NODE_ENV = 'development';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InterpolateHtmlPlugin = require('interpolate-html-plugin');
const commonConfig = require('./webpack.common.config.js');
let commonWebpackConfig = commonConfig.commonWebpackConfig;

commonWebpackConfig.mode = 'development';
// prepare the InterpolateHtmlPlugin
const interpolations = {
  'NODE_ENV': 'development',
  'PUBLIC_URL': ''
};

if (process.env.USE_SOURCEMAP) {
  commonWebpackConfig.devtool = 'inline-source-map';
}

const delayedConf = new Promise(function(resolve) {
  commonWebpackConfig.plugins = [
    ...commonWebpackConfig.plugins || [],
    new HtmlWebpackPlugin({
      favicon: './public/icon_terrestris.png',
      filename: 'index.html',
      hash: true,
      minify: {
        collapseWhitespace: true,
        removeComments: true
      },
      template: './public/index.html',
      title: 'react-geo-baseclient'
    }),
    new webpack.ProgressPlugin({ profile: false }),
    new InterpolateHtmlPlugin(interpolations),
    new webpack.DefinePlugin({
      APP_MODE: JSON.stringify(commonConfig.TARGET)
    })
  ];

  commonWebpackConfig.devServer = {
    contentBase: path.join(__dirname, 'src'),
    disableHostCheck: true,
    host: '0.0.0.0',
    https: true,
    inline: true,
    port: 9090,
    publicPath: 'https://localhost:9090/'
  };
  resolve(commonWebpackConfig);
});

module.exports = new Promise((resolve) => {
  delayedConf.then((conf) => {
    resolve(conf);
  });
});
