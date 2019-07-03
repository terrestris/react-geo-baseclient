import {
  TOGGLE_ADDLAYERWINDOW,
  SHOW_ADDLAYERWINDOW,
  HIDE_ADDLAYERWINDOW
} from '../constants/AppState';

export function toggleAddLayerWindow() {
  return {
    type: TOGGLE_ADDLAYERWINDOW
  };
}

export function showAddLayerWindow() {
  return {
    type: SHOW_ADDLAYERWINDOW
  };
}

export function hideAddLayerWindow() {
  return {
    type: HIDE_ADDLAYERWINDOW
  };
}
