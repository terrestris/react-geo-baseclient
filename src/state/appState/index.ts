import {
  createSlice
} from '@reduxjs/toolkit';

export interface AppState {
  addLayerWindow: boolean;
  helpModal: boolean;
  layerTree: boolean;
};

const initialState: AppState = {
  addLayerWindow: false,
  helpModal: false,
  layerTree: true
};

const slice = createSlice({
  name: 'appState',
  initialState,
  reducers: {
    hideLayerTree(state) {
      state.layerTree = false;
    },
    showLayerTree(state) {
      state.layerTree = true;
    },
    hideAddLayerWindow(state) {
      state.addLayerWindow = false;
    },
    showAddLayerWindow(state) {
      state.addLayerWindow = true;
    },
    toggleAddLayerWindow(state) {
      state.addLayerWindow = !state.addLayerWindow;
    },
    toggleHelpModal(state) {
      state.helpModal = !state.helpModal;
    }
  }
});

export const {
  hideLayerTree,
  showLayerTree,
  hideAddLayerWindow,
  showAddLayerWindow,
  toggleAddLayerWindow,
  toggleHelpModal
} = slice.actions;

export default slice.reducer;
