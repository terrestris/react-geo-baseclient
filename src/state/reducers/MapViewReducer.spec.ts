/*eslint-env jest*/
import { reduce } from './MapViewReducer';
import {
  SET_PROJECTION,
  SET_CENTER,
  SET_ZOOM,
  SET_SCALE,
  ZOOM_IN,
  ZOOM_OUT
} from '../constants/MapViewChange';

describe('MapViewReducer', () => {

  it('should return the initial state', () => {
    expect(reduce(undefined, {})).toEqual({});
  });

  it('should handle SET_PROJECTION', () => {
    // test with empty initial state
    const mapViewState = {
      projection: 'EPSG:4326'
    };
    const defaultAction = {
      type: SET_PROJECTION,
      projection: 'EPSG:4326'
    };

    expect(reduce({}, defaultAction)).toEqual(mapViewState);

    // test with existing state
    const actionChangedView = {
      type: SET_PROJECTION,
      projection: 'EPSG:3857'
    };
    expect(reduce(mapViewState, actionChangedView)).toEqual({
      projection: 'EPSG:3857'
    });
  });

  it('should handle SET_CENTER', () => {
    // test with empty initial state
    const mapViewState = {
      center: [0, 0]
    };
    const defaultAction = {
      type: SET_CENTER,
      center: [0, 0]
    };

    expect(reduce({}, defaultAction)).toEqual(mapViewState);

    // test with existing state
    const actionChangedView = {
      type: SET_CENTER,
      center: [19, 9]
    };
    expect(reduce(mapViewState, actionChangedView)).toEqual({
      center: [19, 9]
    });
  });

  it('should handle SET_ZOOM', () => {
    // test with empty initial state
    const mapViewState = {
      zoom: 0
    };
    const defaultAction = {
      type: SET_ZOOM,
      zoom: 0
    };
    expect(reduce({}, defaultAction)).toEqual(mapViewState);

    // test with existing state
    const actionChangedView = {
      type: SET_ZOOM,
      zoom: 9
    };
    expect(reduce(mapViewState, actionChangedView)).toEqual({
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
      type: ZOOM_IN
    };
    expect(reduce({}, defaultAction)).toEqual({
      zoom: 0
    });

    // test with existing state
    expect(reduce(mapViewState, defaultAction)).toEqual({
      resolutions: [0, 8, 15],
      zoom: 1
    });

    // test with existing stats
    // should not return an zoom level that is longer than the length of resolutions array minus 1
    expect(reduce({
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
      type: ZOOM_OUT
    };
    expect(reduce({}, defaultAction)).toEqual({
      zoom: 0
    });

    // test with existing state
    expect(reduce(mapViewState, defaultAction)).toEqual({
      resolutions: [0, 8, 15],
      zoom: 1
    });

    // test with existing state
    // should not return zoom level lower than 0
    expect(reduce({
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
      type: SET_SCALE,
      scale: 25000
    };
    expect(reduce({}, defaultAction)).toEqual({
      zoom: 0
    });

    // test with existing state and no existing scale parameter
    // should return default zoom
    const actionChangedViewErrornousParameter = {
      type: SET_SCALE,
      zoom: 25000
    };
    expect(reduce(mapViewState, actionChangedViewErrornousParameter)).toEqual({
      resolutions: [560, 280, 140, 70, 28, 14, 7, 2.8, 1.4, 0.7, 0.28, 0.14, 0.028],
      zoom: 0
    });

    const scales = [-1, 0, 1909, 56264.4, 10000000000, {}, 250001, 249999, (50000 + 25000) / 2, undefined, 'Manta', 'Manta1909'];
    const targetZoomLevels = [0, (mapViewState.resolutions.length - 1), 9, 5, 0, 0, 3, 3, 5, 0, 0 ,0];
    expect(scales.length).toBe(targetZoomLevels.length);

    for (let i = 0; i < scales.length; i++) {
      // test with existing state and existing scales
      const actionChangedView = {
        type: SET_SCALE,
        scale: scales[i]
      };
      expect(reduce(mapViewState, actionChangedView)).toEqual({
        resolutions: [560, 280, 140, 70, 28, 14, 7, 2.8, 1.4, 0.7, 0.28, 0.14, 0.028],
        zoom: targetZoomLevels[i]
      });
    }
  });

});
