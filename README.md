# react-geo-baseclient #

[![Greenkeeper badge](https://badges.greenkeeper.io/terrestris/react-geo-baseclient.svg)](https://greenkeeper.io/)

## FAQ

* How to install?

`git submodule update --init --recursive`

and then

`npm i`

* How to start the application?

  * When using shogun2 as backend
    * Set the credentials in `.shogunrc`
    * Start the app with `npm run start-shogun2`
  * When using no backend / a static appContext
    * Start the app with `npm run start-static`

* To start a new project:
  * Create a new folder next to the baseclient package, e.g. "myproject" and add at least a single Main class.
  * Configure the project main view and configs in an `.env` file located in your project base folder, e.g. in `myproject/.env`
    * This `.env` file should look like
```
## Contents of .env file
# Whether to use source map in webpack dev server or not
USE_SOURCEMAP=true

# The name of the main class
PROJECT_MAIN_CLASS=ProjectMain

# The paths !!! relative to Main Component in react-geo-baseclient/packages/baseclient/src/Main.tsx !!!
PROJECT_MAIN_PATH='../../../src/Main/'

# resources path relative to webpack config in react-geo-baseclient/packages/baseclient/config
RESOURCES_PATH='../../src/resources/'
```
  * Place an project `package.json` which uses previously configured `.env` file using [`env-cmd`](https://www.npmjs.com/package/env-cmd), e.g.
```
  ...
  "scripts": {
    ...
    "start": "cd ../baseclient/ && env-cmd ../myproject/.env npm run start-static",
    ...
  },
  ...
```

## Notes

* When working with react-geo linked make sure to configure the alias for `ol`
  in the webpack.commmon.config.

