# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
- Allow webpack proxy config through custom app config([#841](https://github.com/terrestris/react-geo-baseclient/pull/841))
- Update terrestris vectortiles lib ([#840](https://github.com/terrestris/react-geo-baseclient/pull/840))

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
