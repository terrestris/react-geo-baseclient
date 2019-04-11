# react-geo-baseclient #

[![Greenkeeper badge](https://badges.greenkeeper.io/terrestris/react-geo-baseclient.svg)](https://greenkeeper.io/)

## FAQ

* How to install?

`git submodule update --init --recursive`

and then

`npm i`

This will automatically install package dependencies with `lerna bootstrap`.
It will also automatically compile the submodules like react-geo, the state and components module via postinstall.

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
* How to add a dependency?

`npm run add -- [NAME_OF_DEPENDENCY] [LERNA_ADD_ARGS]`

If you want, for instance, to add `lodash` to the `react-geo-bc-state` package,
one could use the following:

`npm run add -- lodash --exact --dev --scope=baseclient-state`

* How to update dependencies?

`npm run bootstrap`

## Notes

* react-geo linked in client automatically

## TODOS

* Publish react-geo-bc-state and components as own project
* Add ol-util and base-util as packages?
* Check why babelrc config with react is needed in react-geo-bc-state
