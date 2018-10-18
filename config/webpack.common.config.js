const path = require('path');
const winston = require('winston');
const paths = require('./paths.js');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

// const CustomAntThemeModifyVars = require('./src/theme/antLessModifyVars.js');
const TARGET = process.env.npm_lifecycle_event;

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
      'whatwg-fetch',
      paths.appIndexJs
    ],
  },

  output: {
    // Add /* filename */ comments to generated require()s in the output.
    pathinfo: true,
    path: (TARGET === 'start') ? path.join(__dirname + '/../') : path.join(__dirname + '/../', 'build'),
    // This does not produce a real file. It's just the virtual path that is
    // served by WebpackDevServer in development. This is the JS bundle
    // containing code from all our entry points, and the Webpack runtime.
    filename: '../build/static/js/bundle.js',
    publicPath: '',
    // There are also additional JS chunk files if you use code splitting.
    chunkFilename: '../build/static/js/[name].chunk.js'
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
      loader: 'url-loader?limit=10000&mimetype=application/font-woff'
    }, {
      test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      loader: 'file-loader'
    }, {
      test: /\.(jpe?g|png|gif|ico)$/i,
      use: [
        'file-loader?name=img/[name].[ext]',
        'image-webpack-loader'
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
  ],

  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
    alias: {
      ol: path.join(__dirname + '/../', 'node_modules', 'ol'),
      react: path.join(__dirname + '/../', 'node_modules', 'react')
    }
  }
};

module.exports = {
  logger: Logger,
  commonWebpackConfig: commonWebpackConfig
};
