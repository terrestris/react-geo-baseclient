import OlLayerGroup from 'ol/layer/Group';
import StringUtil from '@terrestris/base-util/dist/StringUtil/StringUtil';
import MapUtil from '@terrestris/ol-util/dist/MapUtil/MapUtil';

/**
 * Helper class for some operations related to print function.
 *
 * @class
 */
export class PrintUtil {

  /**
   * Filter the printable layers from the current maplayers.
   *
   * @return {Array} The printable layers.
   */
  static getPrintableLayers = (map, printLayer) => {
    const layers = MapUtil.getAllLayers(map);
    return layers.filter(layer => {
      const layerName = layer.get('name');
      return layerName
        && !(layerName.includes('react-geo'))
        && layer.getVisible()
        && !(layer instanceof OlLayerGroup)
        && layer !== printLayer;
    });
  }

  /**
   * Creates an string containing all attributions fo the printable layers.
   *
   * @return {String} The attribution string.
   */
  static getAttributions(map, printLayer) {
    const layers = PrintUtil.getPrintableLayers(map, printLayer);
    let attributionString = '';
    layers
      .filter(layer => {
        const attributions = layer.getSource().getAttributions();

        if (attributions) {
          if (typeof attributions === 'function') {
            const attribution = attributions();
            attribution.forEach((attribution, index, allAttributions) => {
              attributionString += StringUtil.stripHTMLTags(attribution);
              if (index < (allAttributions.length - 1)) {
                attributionString += ',\n';
              }
            });
          }
        }
      });
    return attributionString.trim();
  }

}

export default PrintUtil;
