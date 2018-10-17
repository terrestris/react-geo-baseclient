# react-geo baseclient

## FAQ

* How to install?

`npm i`

This will automaticall install package dependencies with `lerna bootstrap`.

* How to start the application?

`npm run start`

This will start the react-geo-bc-client's start-shogun2 script.

* How to add a dependency?

`npm run add -- [NAME_OF_DEPENDENCY] [LERNA_ADD_ARGS]`

If you want, for instance, to add `lodash` to the `react-geo-bc-state` package,
one could use the following:

`npm run add -- lodash --exact --scope=react-geo-bc-state`

* How to update dependencies?

`npm run bootstrap`

## Notes

* react-geo linked in client automatically

## TODOS

* Publish react-geo-bc-state as own project
* Add ol-util and base-util as packages?
* Check why babelrc config with react is needed in react-geo-bc-state