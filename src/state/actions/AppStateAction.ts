import {
  TOGGLE_ADDLAYERWINDOW,
  SHOW_ADDLAYERWINDOW,
  HIDE_ADDLAYERWINDOW,
  TOGGLE_HELPMODAL
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

export function toggleHelpModal() {
  return {
    type: TOGGLE_HELPMODAL
  };
}
