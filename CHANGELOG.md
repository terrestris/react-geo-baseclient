# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

- Enhance typings of `PrintPanelV3` component ([#1052](https://github.com/terrestris/react-geo-baseclient/pull/1052))
- Add callback prop for gridIsReady event ([#1050](https://github.com/terrestris/react-geo-baseclient/pull/1050))
- Add option to use filter on columns in featuregrid ([#1044](https://github.com/terrestris/react-geo-baseclient/pull/1044))
- Added CORS Header to dev server config ([#1043](https://github.com/terrestris/react-geo-baseclient/pull/1043))
- Configurable backend and client paths ([#861](https://github.com/terrestris/react-geo-baseclient/pull/861))
- Don't apply global text color for column sorter icons ([#855](https://github.com/terrestris/react-geo-baseclient/pull/855))
- Explicitly filter for ENABLE_LOADING and DISABLE_LOADING ([#854](https://github.com/terrestris/react-geo-baseclient/pull/854))
- Fix check for a current hover/pointerrest on a non map element ([#853](https://github.com/terrestris/react-geo-baseclient/pull/853))
- Added user chip to the header for login / logout
- More CI-friendly build output ([#843](https://github.com/terrestris/react-geo-baseclient/pull/843))
- Allow webpack proxy config through custom app config ([#841](https://github.com/terrestris/react-geo-baseclient/pull/841))
- Update terrestris vectortiles lib ([#840](https://github.com/terrestris/react-geo-baseclient/pull/840))
- Add tablet support for mobile device detection ([#848](https://github.com/terrestris/react-geo-baseclient/pull/848))
- Reorganize CSS ([946](https://github.com/terrestris/react-geo-baseclient/pull/946))
- Uses webpack 5 asset management [955](https://github.com/terrestris/react-geo-baseclient/pull/955)
- Reorganize CSS ([#946](https://github.com/terrestris/react-geo-baseclient/pull/946))
- Introduce redux toolkit ([#845](https://github.com/terrestris/react-geo-baseclient/pull/845))
  - 🚨 Several paths of the actions and reducers have been changed and might be updated in project clients:
    - `src/state/actions/ActiveModulesAction` -> `src/state/activeModules`
    - `src/state/reducers/ActiveModulesReducer` -> `src/state/activeModules`
    - `src/state/actions/ApplicationInfoAction` -> `src/state/appInfo`
    - `src/state/reducers/ApplicationInfoReducer` -> `src/state/appInfo`
    - `src/state/actions/AppStateAction` -> `src/state/appState`
    - `src/state/reducers/AppStateReducer` -> `src/state/appState`
    - `src/state/actions/DataRangeAction` -> `src/state/dataRange`
    - `src/state/reducers/DataRangeReducer` -> `src/state/dataRange`
    - `src/state/actions/LoadingAction` -> `src/state/loadingQueue`
    - `src/state/reducers/LoadingReducer` -> `src/state/loadingQueue`
    - `src/state/actions/MapLayerChangeAction` -> `src/state/mapLayers`
    - `src/state/reducers/MapLayerChangeReducer` -> `src/state/mapLayers`
    - `src/state/actions/MapViewChangeAction` -> `src/state/mapView`
    - `src/state/reducers/MapViewChangeReducer` -> `src/state/mapView`
    - `src/state/actions/RemoteFeatureAction` -> `src/state/remoteFeatures/actions`
    - `src/state/reducers/RemoteFeatureReducer` -> `src/state/remoteFeatures/reducer`
  - 🚨 All state constants in `src/state/contants` have been removed.
  - 🚨 The `appContextLoading` state key has been removed.
  - 🚨 The state key `mapView` doesn't wrap its keys in `past`, `present` and `future` anymore.
  - 🚨 Removed actions `setLayers`, `addLayers`, `removeLayers`, `updateLayerOrder`, `changeLayerVisibility`.
- `LayertreeClassic`: Added check for layer source type before adding the `Legend` component to a layer. https://github.com/terrestris/react-geo-baseclient/pull/1039
- 🚨 Several dependency updates and component fixes ([#1042](https://github.com/terrestris/react-geo-baseclient/pull/1042))
  - Fix propagation of click events to children of the layer tree context menu
  - Fix pressed icon color
  - Fix icon for print button
  - Fix feature info component after major ag-grid upgrade
  - Make title of feature info grid window configurable and set default to 37.5px (react-rnd default)
  - Fix webpack devserver config for shogun2 mode
  - Drop support for node <14 and npm <7

## [2.0.1] - 2021-07-21

### Added

- `HSIButton`: Allow setting the feature_count property via prop.
- `Footer`: Allow passing the `className` prop.

## [2.0.0] - 2021-07-20

### Breaking changes

- `GetFeatureInfo` components refactoring ([#810](https://github.com/terrestris/react-geo-baseclient/pull/811))
  - Refactored all `GetFeatureInfo` related components to react's functional component
  - 🚨 Replaced `width` property set on GetFeatureInfo overlay menu by `maxWidth` (increased from 200 to 350px) to prevent cropped titles on long layer names
- `HSIButton` component refactoring ([#817](https://github.com/terrestris/react-geo-baseclient/pull/817))
  - 🚨 `t` was removed from class props
  - 🚨 `dispatch` was removed from class props, react-redux hook will be used instead
  - 🚨 default value for `tooltip` is set to `Feature Info`
  - 🚨 default value for `tooltipPlacement` is set to `right`
  - added additional optional propery `onToggleCb` enabling custom logic on HSIButton activation (e.g. show notification about tool state, queryable layers etc.)
- Introduce `"Zoom to layer resolution"` context menu entry ([#809](https://github.com/terrestris/react-geo-baseclient/pull/809))
  - Add configurable layer context menu entry "Zoom to layer resolution" (default is false)
  - 🚨 Default value of `showZoomToLayerExtent` and `showApplyTimeInterval` configs was changed to `false`. So from now, the configs must be explicitily provided by component instantiation if the context menu entries should be shown in client.

### Added

- Allow adding of custom params to print job ([#830](https://github.com/terrestris/react-geo-baseclient/pull/830))
- Add this CHANGELOG file ([#811](https://github.com/terrestris/react-geo-baseclient/pull/811)).
- Introduce client component config ([#815](https://github.com/terrestris/react-geo-baseclient/pull/815))
- Introduce custom webpack property `indexTemplate` ([#823](https://github.com/terrestris/react-geo-baseclient/pull/823))

### Changed

- Set `shogunId` property on all parsed layers in the `ShogunBootAppContextUtil` ([#804](https://github.com/terrestris/react-geo-baseclient/pull/804)).
- Extract `Permalink` panel to an own component ([#806](https://github.com/terrestris/react-geo-baseclient/pull/806)).
- Pass all existing button props to `HsiButton`([#813](https://github.com/terrestris/react-geo-baseclient/pull/813)).

### Fixed

- Reenable hover/pressed button color ([#805](https://github.com/terrestris/react-geo-baseclient/pull/805)).
- Use `text-overflow:ellipsis` to avoid cropped permalink links ([#808](https://github.com/terrestris/react-geo-baseclient/pull/808)).
- Fix call of default permalink `getLink` function and ensure that permalink is applied only once on first render ([#818](https://github.com/terrestris/react-geo-baseclient/pull/818))
- Make `extraLegendParams` optional ([#819](https://github.com/terrestris/react-geo-baseclient/pull/819))
- Fix toggling of `HsiButton` ([#820](https://github.com/terrestris/react-geo-baseclient/pull/820))
- Fix layer tree node parser for shogun2-based context ([#821](https://github.com/terrestris/react-geo-baseclient/pull/821))
- Fix display template for multisearch ([#822](https://github.com/terrestris/react-geo-baseclient/pull/822))

## [1.0.0] - 2021-05-07

This is the first tagged version of the project. It includes the current state
of the `main` branch at commit [1f65740](https://github.com/terrestris/react-geo-baseclient/commit/1f657400d16ed74969b4e62fea8862c168ade26a).

[Unreleased]: https://github.com/terrestris/react-geo-baseclient/releases/tag/v1.0.0...HEAD
[1.0.0]: https://github.com/terrestris/react-geo-baseclient/releases/tag/v1.0.0
[2.0.0]: https://github.com/terrestris/react-geo-baseclient/releases/tag/v2.0.0
[2.0.1]: https://github.com/terrestris/react-geo-baseclient/releases/tag/v2.0.1
