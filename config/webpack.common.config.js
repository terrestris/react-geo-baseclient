const path = require('path');
const winston = require('winston');
const paths = require('./paths.js');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// const CustomAntThemeModifyVars = require('./src/theme/antLessModifyVars.js');
const TARGET = process.env.npm_lifecycle_event;
const PROJECT_MAIN_PATH = process.env.PROJECT_MAIN_PATH || './';
const PROJECT_MAIN_CLASS = process.env.PROJECT_MAIN_CLASS || 'ProjectMain';
const RESOURCES_PATH = process.env.RESOURCES_PATH || './src/resources/';

const Logger = winston.createLogger({
  format: winston.format.simple(),
  level: 'info',
  transports: [
    new winston.transports.Console({
      colorize: true
    })
  ]
});

const commonWebpackConfig = {
  entry: {
    app: [
      '@babel/polyfill',
      'whatwg-fetch',
      'object-fit-polyfill',
      paths.appIndexJs
    ]
  },

  output: {
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: (TARGET.indexOf('build') > -1) ? false: true,
    path: (TARGET.indexOf('start') > -1) ? path.join(__dirname + '/../') : path.join(__dirname + '/../', 'build'),
    // This does not produce a real file. It's just the virtual path that is
    // served by WebpackDevServer in development. This is the JS bundle
    // containing code from all our entry points, and the Webpack runtime.
    filename: 'bundle.js',
    publicPath: '',
    // There are also additional JS chunk files if you use code splitting.
    chunkFilename: 'static/js/[name].chunk.js'
  },

  module: {
    rules: [{
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'ts-loader',
          options: {
            transpileOnly: true // compile happens in ForkTsCheckerWebpackPlugin
          }
        }
      ]
    }, {
      test: /\.jsx?$/,
      exclude: /node_modules\/(?!@terrestris)/,
      loader: 'babel-loader',
    },
    {
      test: /\.css$/,
      loaders: [
        'style-loader',
        'css-loader'
      ]
    }, {
      test: /\.less$/,
      loaders: [
        'style-loader',
        'css-loader',
        {
          loader: 'less-loader',
          options: {
            // modifyVars: CustomAntThemeModifyVars(),
            javascriptEnabled: true
          }
        }
      ]
    }, {
      test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      use: [
        {
          loader: 'url-loader',
          options: {
            limit: 10000,
            mimetype: 'application/font-woff'
          }
        }
      ]
    }, {
      test: /\.(pdf|ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file-loader'
    }, {
      test: /\.(jpe?g|png|gif|ico)$/i,
      use: [
        'file-loader?name=img/[name].[ext]'
      ]
    }]
  },

  plugins: [
    // Moment.js is an extremely popular library that bundles large locale files
    // by default due to how Webpack interprets its code. This is a practical
    // solution that requires the user to opt into importing specific locales.
    // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
    // You can remove this if you don't use Moment.js:
    // new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    // Perform type checking and linting in a separate process to speed up compilation
    new ForkTsCheckerWebpackPlugin({
      async: false,
      watch: paths.appSrc,
      tsconfig: paths.appTsConfig,
      tslint: paths.appTsLint,
    }),
    new CopyWebpackPlugin([
        './public/de.png',
        './public/en.png',
        './public/logo_terrestris.png',
        './public/index.css',
        './public/manifest.json',
        './public/something-went-wrong.png',
        {
          from: RESOURCES_PATH + 'appContext.json',
          to: './resources/'
        }, {
          from: RESOURCES_PATH + 'i18n/',
          to: './resources/i18n/'
        }, {
          from: RESOURCES_PATH + 'img/',
          to: './resources/img/'
        }, {
          from: RESOURCES_PATH + 'help/',
          to: './resources/help/'
        }
    ]),
    new webpack.DefinePlugin({
      PROJECT_MAIN_PATH: JSON.stringify(PROJECT_MAIN_PATH),
      PROJECT_MAIN_CLASS: new RegExp('^./' + PROJECT_MAIN_CLASS + '\\.(jsx|js|ts|tsx)$'),
      ___TEST___: JSON.stringify(TARGET.indexOf('test') > -1)
    })
  ],

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    modules: ['node_modules'],
    alias: {
       // This is need if working with npm link or while invoking react-geo-baseclient as submodule
       // in some other project
      '@terrestris/base-util': path.join(__dirname + '/../', 'node_modules', '@terrestris/base-util'),
      '@terrestris/ol-util': path.join(__dirname + '/../', 'node_modules', '@terrestris/ol-util'),
      '@terrestris/react-geo': path.join(__dirname + '/../', 'node_modules', '@terrestris/react-geo'),
      'antd': path.join(__dirname + '/../', 'node_modules', 'antd'),
      'react': path.join(__dirname + '/../', 'node_modules', 'react'),
      'react-redux': path.join(__dirname + '/../', 'node_modules', 'react-redux'),
      'react-i18next': path.join(__dirname + '/../', 'node_modules', 'react-i18next'),
      'ol': path.join(__dirname + '/../', 'node_modules', 'ol')
    }
  }
};

module.exports = {
  logger: Logger,
  commonWebpackConfig: commonWebpackConfig,
  TARGET: TARGET
};
