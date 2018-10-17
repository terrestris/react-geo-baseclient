// /*eslint-env jest*/
// import * as actions from './MapLayerChangeAction';

// describe('MapLayerChangeAction', () => {
//   it ('dispatches an action on setting layers', () => {
//     const layers = {
//       id: '1909',
//       root: true,
//       children: [],
//       text: 'Yarmolenko'
//     };
//     const expectedAction = {
//       type: actions.SET_LAYERS,
//       layerObjects: [layers]
//     };

//     expect(actions.setLayers([layers])).toEqual(expectedAction);
//   });

//   it ('dispatches an action on adding a layer', () => {
//     const layer = {
//       id: '1909',
//       name: 'Yarmolenko'
//     };
//     const expectedAction = {
//       type: actions.ADD_LAYERS,
//       layerObjects: [layer]
//     };

//     expect(actions.addLayers([layer])).toEqual(expectedAction);
//   });

//   it ('dispatches an action on updating the visibility of a layer tree node to the current map layers state object', () => {
//     const shogunId = 1909;
//     const visibility = true;
//     const expectedAction = {
//       type: actions.CHANGE_LAYER_VISIBILITY,
//       shogunLayerId: shogunId,
//       visibility
//     };

//     expect(actions.changeLayerVisibility(shogunId, visibility)).toEqual(expectedAction);
//   });

//   it ('dispatches an action on updating the ordering of layers in the tree / map to the current map layers state object', () => {
//     const mapLayers = [{
//       id: '1909',
//       name: 'Yarmolenko'
//     }];
//     const expectedAction = {
//       type: actions.UPDATE_LAYER_ORDERING,
//       mapLayers
//     };

//     expect(actions.updateLayerOrdering(mapLayers)).toEqual(expectedAction);
//   });

// });
