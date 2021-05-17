# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Breaking changes

- GetFeatureInfo components refactoring ([#810](https://github.com/terrestris/react-geo-baseclient/pull/811))
  - Refactored all `GetFeatureInfo` related components to react's functional component
  - 🚨 Replaced `width` property set on GetFeatureInfo overlay menu by `maxWidth` (increased from 200 to 350px) to prevent cropped titles on long layer names
- Introduce "Zoom to layer resolution" context menu entry ([#809](https://github.com/terrestris/react-geo-baseclient/pull/809))
  - Add configurable layer context menu entry "Zoom to layer resolution" (default is false)
  - 🚨 Default value of `showZoomToLayerExtent` and `showApplyTimeInterval` configs was changed to `false`. So from now, the configs must be explicitily provided by component instantiation if the context menu entries should be shown in client.

### Added

- Add this CHANGELOG file ([#811](https://github.com/terrestris/react-geo-baseclient/pull/811)).

### Changed

- Set `shogunId` property on all parsed layers in the `ShogunBootAppContextUtil` ([#804](https://github.com/terrestris/react-geo-baseclient/pull/804)).
- Extract `Permalink` panel to an own component ([#806](https://github.com/terrestris/react-geo-baseclient/pull/806)).

### Fixed

- Reenable hover/pressed button color ([#805](https://github.com/terrestris/react-geo-baseclient/pull/805)).
- Use `text-overflow:ellipsis` to avoid cropped permalink links ([#808](https://github.com/terrestris/react-geo-baseclient/pull/808)).

## [1.0.0] - 2021-05-07

This is the first tagged version of the project. It includes the current state
of the `main` branch at commit [1f65740](https://github.com/terrestris/react-geo-baseclient/commit/1f657400d16ed74969b4e62fea8862c168ade26a).

[Unreleased]: https://github.com/terrestris/react-geo-baseclient/releases/tag/v1.0.0...HEAD
[1.0.0]: https://github.com/terrestris/react-geo-baseclient/releases/tag/v1.0.0