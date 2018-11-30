# react-geo-baseclient #

[![Greenkeeper badge](https://badges.greenkeeper.io/terrestris/react-geo-baseclient.svg)](https://greenkeeper.io/)

## FAQ

* How to install?

`git submodule update --init --recursive`

and then

`npm i`

This will automatically install package dependencies with `lerna bootstrap`.

Initially you will also need to build react-geo, the state and components module:
`cd packages/react-geo && npm run build:dist && cd ../baseclient-state && npm run build:ts && cd ../baseclient-components && npm run build:ts`

TODO: move above to postinstall

* How to start the application?

  * When using shogun2 as backend
    * Set the credentials in config/projectconfig.json
    * Start the app with `npm run start-shogun2`
  * When using no backend / a static appContext
    * Start the app with `npm run start-static`

* To start a new project:
  * Create a new folder next to the baseclient package, e.g. "myproject" and add at least a single Main class.
  * Configure the project main view and configs in the baseclient/config/projectconfig.json file
  * This way, your project will use the baseclients setup and will render your own view and components

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