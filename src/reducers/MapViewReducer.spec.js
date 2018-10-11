/*eslint-env jest*/
import { mapViewChange } from './MapViewReducer';
import * as actions from '../actions/MapViewChangeAction';

describe('MapViewReducer', () => {

  it('should return the initial state', () => {
    expect(mapViewChange(undefined, {})).toEqual({});
  });

  it('should handle SET_MAPVIEW', () => {
    // test with empty initial state
    const mapViewState = {
      center: [0, 0],
      zoom: 9
    };
    const defaultAction = {
      type: actions.SET_MAPVIEW,
      mapView: {
        center: [0, 0],
        zoom: 9
      }
    };
    expect(mapViewChange({}, defaultAction)).toEqual(mapViewState);

    // test with existing state
    const actionChangedView = {
      type: actions.SET_MAPVIEW,
      mapView: {
        center: [19, 19],
        zoom: 19
      }
    };

    expect(mapViewChange(mapViewState, actionChangedView)).toEqual({
      center: [19, 19],
      zoom: 19
    });
  });

  it('should handle SET_CENTER', () => {
    // test with empty initial state
    const mapViewState = {
      center: [0, 0]
    };
    const defaultAction = {
      type: actions.SET_CENTER,
      center: [0, 0]
    };

    expect(mapViewChange({}, defaultAction)).toEqual(mapViewState);

    // test with existing state
    const actionChangedView = {
      type: actions.SET_CENTER,
      center: [19, 9]
    };
    expect(mapViewChange(mapViewState, actionChangedView)).toEqual({
      center: [19, 9]
    });
  });

  it('should handle SET_ZOOM', () => {
    // test with empty initial state
    const mapViewState = {
      zoom: 0
    };
    const defaultAction = {
      type: actions.SET_ZOOM,
      zoom: 0
    };
    expect(mapViewChange({}, defaultAction)).toEqual(mapViewState);

    // test with existing state
    const actionChangedView = {
      type: actions.SET_ZOOM,
      zoom: 9
    };
    expect(mapViewChange(mapViewState, actionChangedView)).toEqual({
      zoom: 9
    });
  });

  it('should handle ZOOM_IN', () => {
    // test with empty initial state
    const mapViewState = {
      resolutions: [0, 8, 15],
      zoom: 0
    };

    const defaultAction = {
      type: actions.ZOOM_IN
    };
    expect(mapViewChange({}, defaultAction)).toEqual({
      zoom: 0
    });

    // test with existing state
    expect(mapViewChange(mapViewState, defaultAction)).toEqual({
      resolutions: [0, 8, 15],
      zoom: 1
    });

    // test with existing stats
    // should not return an zoom level that is longer than the length of resolutions array minus 1
    expect(mapViewChange({
      resolutions: [0, 8, 15],
      zoom: 2
    }, defaultAction)).toEqual({
      resolutions: [0, 8, 15],
      zoom: 2
    });
  });

  it('should handle ZOOM_OUT', () => {
    // test with empty initial state
    const mapViewState = {
      resolutions: [0, 8, 15],
      zoom: 2
    };

    const defaultAction = {
      type: actions.ZOOM_OUT
    };
    expect(mapViewChange({}, defaultAction)).toEqual({
      zoom: 0
    });

    // test with existing state
    expect(mapViewChange(mapViewState, defaultAction)).toEqual({
      resolutions: [0, 8, 15],
      zoom: 1
    });

    // test with existing state
    // should not return zoom level lower than 0
    expect(mapViewChange({
      resolutions: [0, 8, 15],
      zoom: 0
    }, defaultAction)).toEqual({
      resolutions: [0, 8, 15],
      zoom: 0
    });
  });

  it('should handle SET_SCALE', () => {
    // test with empty initial state
    const mapViewState = {
      resolutions: [560, 280, 140, 70, 28, 14, 7, 2.8, 1.4, 0.7, 0.28, 0.14, 0.028],
      zoom: 0
    };
    const defaultAction = {
      type: actions.SET_SCALE,
      scale: 25000
    };
    expect(mapViewChange({}, defaultAction)).toEqual({
      zoom: 0
    });

    // test with existing state and no existing scale parameter
    // should return default zoom
    const actionChangedViewErrornousParameter = {
      type: actions.SET_SCALE,
      zoom: 25000
    };
    expect(mapViewChange(mapViewState, actionChangedViewErrornousParameter)).toEqual({
      resolutions: [560, 280, 140, 70, 28, 14, 7, 2.8, 1.4, 0.7, 0.28, 0.14, 0.028],
      zoom: 0
    });

    const scales = [-1, 0, 1909, 56264.4, 10000000000, {}, 250001, 249999, (50000 + 25000) / 2, undefined, 'Manta', 'Manta1909'];
    const targetZoomLevels = [0, (mapViewState.resolutions.length - 1), 9, 5, 0, 0, 3, 3, 5, 0, 0 ,0];
    expect(scales.length).toBe(targetZoomLevels.length);

    for (let i = 0; i < scales.length; i++) {
      // test with existing state and existing scales
      const actionChangedView = {
        type: actions.SET_SCALE,
        scale: scales[i]
      };
      expect(mapViewChange(mapViewState, actionChangedView)).toEqual({
        resolutions: [560, 280, 140, 70, 28, 14, 7, 2.8, 1.4, 0.7, 0.28, 0.14, 0.028],
        zoom: targetZoomLevels[i]
      });
    }
  });

});
