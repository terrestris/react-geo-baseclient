/*eslint-env jest*/
import * as actions from './MapViewChangeAction';
import {
  SET_MAPVIEW,
  SET_CENTER,
  SET_ZOOM,
  SET_SCALE,
  ZOOM_IN,
  ZOOM_OUT
} from '../constants/MapViewChange';

const mapView = {
  center: [370000, 5546750],
  zoom: 0
};

describe('MapViewChangeAction', () => {

  it ('dispatches an action on map view change', () => {
    const expectedAction = {
      type: SET_MAPVIEW,
      mapView
    };
    expect(actions.setMapView(mapView)).toEqual(expectedAction);
  });

  it ('dispatches an action on center change', () => {
    const expectedAction = {
      type: SET_CENTER,
      center: [19, 9]
    };
    expect(actions.setCenter([19, 9])).toEqual(expectedAction);
  });

  it ('dispatches an action on setting zoom level', () => {
    const expectedAction = {
      type: SET_ZOOM,
      zoom: 9
    };
    expect(actions.setZoom(9)).toEqual(expectedAction);
  });

  it ('dispatches an action on setting map scale', () => {
    const expectedAction = {
      type: SET_SCALE,
      scale: 25000
    };
    expect(actions.setScale(25000)).toEqual(expectedAction);
  });

  it ('dispatches an action on setting zoom in', () => {
    const expectedAction = {
      type: ZOOM_IN
    };
    expect(actions.zoomIn()).toEqual(expectedAction);
  });

  it ('dispatches an action on setting zoom out', () => {
    const expectedAction = {
      type: ZOOM_OUT,
    };
    expect(actions.zoomOut()).toEqual(expectedAction);
  });

});
