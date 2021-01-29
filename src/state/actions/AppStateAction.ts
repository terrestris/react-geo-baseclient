import {
  TOGGLE_ADDLAYERWINDOW,
  SHOW_ADDLAYERWINDOW,
  HIDE_ADDLAYERWINDOW,
  TOGGLE_HELPMODAL,
  TOGGLE_LAYERTREE,
  SHOW_LAYERTREE,
  HIDE_LAYERTREE
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

export function toggleLayerTree() {
  return {
    type: TOGGLE_LAYERTREE
  };
}

export function showLayerTree() {
  return {
    type: SHOW_LAYERTREE
  };
}

export function hideLayerTree() {
  return {
    type: HIDE_LAYERTREE
  };
}
