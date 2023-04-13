import React from 'react';
import { connect } from 'react-redux';

import OlMap from 'ol/Map';
import OlLayerBase from 'ol/layer/Base';

import { Tooltip } from 'antd';
import moment from 'moment';

import config from '../../../config/config';

import {
  setStartDate,
  setEndDate,
  setTimeInterval,
  setSelectedTimeLayer,
  DataRange
} from '../../../state/dataRange';
import { BaseClientState } from '../../../state/reducer';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/free-solid-svg-icons';

interface LayerTreeApplyTimeIntervalProps {
  layer: OlLayerBase;
  t: (arg: string) => {};
  map: OlMap;
  dispatch: (arg: any) => void;
  dataRange: DataRange;
}

interface LayerTreeApplyTimeIntervalState { }

/**
 * mapStateToProps - mapping state to props of HsiButton Component.
 *
 * @param {Object} state current state
 * @return {Object} mapped props
 */
const mapStateToProps = (state: BaseClientState) => {
  return {
    dataRange: state.dataRange
  };
};

/**
 * Class LayerTreeApplyTimeInterval.
 *
 * @class LayerTreeApplyTimeInterval
 * @extends React.Component
 */
// eslint-disable-next-line
export class LayerTreeApplyTimeInterval extends React.Component<
  LayerTreeApplyTimeIntervalProps,
  LayerTreeApplyTimeIntervalState
> {
  /**
   * Creates the LayerTreeApplyTimeInterval.
   *
   * @constructs LayerTreeApplyTimeInterval
   */
  constructor(props: LayerTreeApplyTimeIntervalProps) {
    super(props);

    // binds
    this.setTimeIntervalToTimeLine = this.setTimeIntervalToTimeLine.bind(this);
  }

  /**
   * Parses time dimension information from layer description field.
   * Dispatches startDate, endDate and time timeDimension.
   * @param {OlLayerBase} layer The layer containing the time information
   */
  setTimeIntervalToTimeLine(layer: OlLayerBase) {
    const { dispatch } = this.props;
    const layerTimeDimension = layer.get('timeDimension') || undefined;

    if (!layerTimeDimension) {
      return;
    }

    let timeDimension: string[] = [];

    if (layerTimeDimension.indexOf('/P') > -1) {
      // Case: Time dimension is a range
      timeDimension = layerTimeDimension.split('/');

      dispatch(setStartDate(moment(timeDimension[0])));
      dispatch(setEndDate(moment(timeDimension[1])));
      dispatch(setTimeInterval(timeDimension[2]));
    }
    else {
      // Case: Time dimension is a list
      const dimensionList = layerTimeDimension.split(',');
      timeDimension[0] = dimensionList[0];
      timeDimension[1] = dimensionList.slice(-1)[0];
      timeDimension[2] = dimensionList;

      dispatch(setStartDate(moment(timeDimension[0])));
      dispatch(setEndDate(moment(timeDimension[1])));
      dispatch(setTimeInterval(timeDimension[2]));
    }
    dispatch(setSelectedTimeLayer(layer));
  }

  /**
   * The render function.
   */
  render() {
    const { t, layer, dataRange } = this.props;

    return (
      <div>
        <Tooltip
          title={t('LayerTreeApplyTimeInterval.setTimeLineToLayerInterval')}
          placement="right"
          {...config.tooltipProps}
        >
          <FontAwesomeIcon
            className={`layer-tree-node-title-settings ${dataRange.timeLayer === layer
              ? 'calendar-selected'
              : 'calendar-unselected'
            }`}
            icon={faCalendar}
            onClick={() => this.setTimeIntervalToTimeLine(layer)}
          />
        </Tooltip>
      </div>
    );
  }
}

export default connect(mapStateToProps)(LayerTreeApplyTimeInterval);
