import { createReducer } from '@reduxjs/toolkit';

import {
  hideLayerTree,
  showLayerTree,
  hideAddLayerWindow,
  showAddLayerWindow,
  toggleAddLayerWindow,
  toggleHelpModal,
  AppState
} from './actions';

const initialState: AppState = {
  addLayerWindow: false,
  helpModal: false,
  layerTree: true
};

const reduce = createReducer(initialState, builder =>
  builder
    .addCase(hideLayerTree, (state) => {
      state.layerTree = false;
      return state;
    })
    .addCase(showLayerTree, (state) => {
      state.layerTree = true;
      return state;
    })
    .addCase(hideAddLayerWindow, (state) => {
      state.addLayerWindow = false;
      return state;
    })
    .addCase(showAddLayerWindow, (state) => {
      state.addLayerWindow = true;
      return state;
    })
    .addCase(toggleAddLayerWindow, (state) => {
      state.addLayerWindow = !state.addLayerWindow;
      return state;
    })
    .addCase(toggleHelpModal, (state) => {
      state.helpModal = !state.helpModal;
      return state;
    })
);

export default reduce;
