import React from 'react';
import { connect } from 'react-redux';

import OlLayerBase from 'ol/layer/Base';

import { Tooltip } from 'antd';
import moment from 'moment';

import config from '../../../config/config';

import {
  setStartDate,
  setEndDate,
  setTimeInterval,
  setSelectedTimeLayer
} from '../../../state/dataRange/actions';

interface LayerTreeApplyTimeIntervalProps {
  layer: OlLayerBase;
  t: (arg: string) => {};
  map: any;
  dispatch: (arg: any) => void;
  dataRange: any;
}

interface LayerTreeApplyTimeIntervalState {}

/**
 * mapStateToProps - mapping state to props of HsiButton Component.
 *
 * @param {Object} state current state
 * @return {Object} mapped props
 */
const mapStateToProps = (state: any) => {
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
   * Parses the time interval out of the layer description field
   * @param layer
   */
  setTimeIntervalToTimeLine(layer: any) {
    const { dispatch } = this.props;
    const layerTimeDimension = layer.get('timeDimension') || undefined;
    let timeDimension: any = [];
    if (layerTimeDimension) {
      timeDimension = layerTimeDimension.match(
        new RegExp(/([^\s]*)[/]([^\s]*)[/]([^\s]*)/)
      );

      // check if timeDimension may be a list
      if (!timeDimension) {
        timeDimension = [];
        const dimensionListText = layerTimeDimension.match(
          new RegExp(/([^\s]*[,])([^\s]*)/)
        );

        if (dimensionListText) {
          const dimensionList = dimensionListText[0].split(',');

          timeDimension[1] = dimensionList[0];
          timeDimension[2] = dimensionList.slice(-1)[0];
          timeDimension[3] = dimensionList;
        }
      }

      // dispatch start and end date only if values are set via interval or list
      if (timeDimension && timeDimension.length >= 2) {
        dispatch(setStartDate(moment(timeDimension[1])));
        dispatch(setEndDate(moment(timeDimension[2])));
        dispatch(setTimeInterval(timeDimension[3]));

        dispatch(setSelectedTimeLayer(layer));
      }
    }
  }

  /**
   * The render function.
   */
  render() {
    const { t, layer, dataRange } = this.props;

    const className = `fa fa-calendar-o layer-tree-node-title-settings ${
      dataRange.timeLayer === layer
        ? 'calendar-selected'
        : 'calendar-unselected'
    }`;

    return (
      <div>
        <Tooltip
          title={t('LayerTreeApplyTimeInterval.setTimeLineToLayerInterval')}
          placement="right"
          {...config.tooltipProps}
        >
          <span
            className={className}
            onClick={() => this.setTimeIntervalToTimeLine(layer)}
          />
        </Tooltip>
      </div>
    );
  }
}

export default connect(mapStateToProps)(LayerTreeApplyTimeInterval);
