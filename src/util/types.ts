import OlSource from 'ol/source/Source';
import OlLayer from 'ol/layer/Layer';
import OlLayerRenderer from 'ol/renderer/Layer';
import OlLayerVector from 'ol/layer/Vector';
import OlGeometry from 'ol/geom/Geometry';
import OlSourceVector from 'ol/source/Vector';

export type LayerType = OlLayer<OlSource, OlLayerRenderer<OlLayerVector<OlSourceVector<OlGeometry>>>>;
