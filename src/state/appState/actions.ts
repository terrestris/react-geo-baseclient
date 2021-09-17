import { createAction } from '@reduxjs/toolkit';

export interface AppState {
  addLayerWindow: boolean;
  helpModal: boolean;
  layerTree: boolean;
};

export const toggleAddLayerWindow = createAction('appState/addLayerWindow/toggle');
export const showAddLayerWindow = createAction('appState/addLayerWindow/show');
export const hideAddLayerWindow = createAction('appState/addLayerWindow/hide');
export const toggleHelpModal = createAction('appState/helpModal/toggle');
export const showLayerTree = createAction('appState/layerTree/show');
export const hideLayerTree = createAction('appState/layerTree/hide');
