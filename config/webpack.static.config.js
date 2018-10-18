process.env.NODE_ENV = 'development';

const path = require('path');
const fetch = require('node-fetch');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const InterpolateHtmlPlugin = require('interpolate-html-plugin');
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

commonWebpackConfig.mode = 'development';
// prepare the InterpolateHtmlPlugin
const interpolations = {
  'NODE_ENV': 'development',
  'PUBLIC_URL': ''
};

// commonWebpackConfig.devtool = 'inline-source-map';

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
    publicPath: 'https://localhost:9090/'
  };
  resolve(commonWebpackConfig);
});

module.exports = new Promise((resolve) => {
  delayedConf.then((conf) => {
    resolve(conf);
  });
});
