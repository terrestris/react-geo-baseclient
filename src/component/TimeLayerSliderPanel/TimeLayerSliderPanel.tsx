import * as React from 'react';
import { connect } from 'react-redux';

import moment from 'moment';

import _isFinite from 'lodash/isFinite';
import _isEqual from 'lodash/isEqual';

import {
  TimeSlider,
  timeLayerAware,
  ToggleButton,
  SimpleButton
} from '@terrestris/react-geo';

import {
  Select,
  DatePicker,
  Popover
} from 'antd';
const { RangePicker } = DatePicker;
const Option = Select.Option;

import {
  setStartDate,
  setEndDate
} from '../../state/dataRange';

import './TimeLayerSliderPanel.css';

type timeRange = [moment.Moment, moment.Moment];

export interface DefaultTimeLayerSliderPanelProps {
  className: string;
  onChange: (arg: moment.Moment) => void;
  timeAwareLayers: any[];
  value: moment.Moment;
  t: (arg: string) => string;
  dateFormat: string;
}

export interface TimeLayerSliderPanelProps extends Partial<DefaultTimeLayerSliderPanelProps> {
  map: any;
  startDate: moment.Moment;
  endDate: moment.Moment;
  dispatch: (arg: any) => void;
}

export interface TimeLayerSliderPanelState {
  value: moment.Moment;
  playbackSpeed: string;
  autoPlayActive: boolean;
}

/**
 * mapStateToProps - mapping state to props of Map Component.
 *
 * @param {Object} state current state
 * @return {Object} mapped props
 */
const mapStateToProps = (state: any) => {
  return {
    startDate: state.dataRange.startDate,
    endDate: state.dataRange.endDate
  };
};

/**
* The panel combining all time slider related parts.
*/
export class TimeLayerSliderPanel extends React.Component<TimeLayerSliderPanelProps, TimeLayerSliderPanelState> {

  /**
  * The default props of LayerSetBaseMapChooser
  *
  * @static
  * @type {DefaultLayerSetBaseMapChooserProps}
  * @memberof LayerSetBaseMapChooser
  */
  public static defaultProps: DefaultTimeLayerSliderPanelProps = {
    className: '',
    onChange: () => { },
    timeAwareLayers: [],
    value: moment(moment.now()),
    t: (arg: string) => arg,
    dateFormat: 'YYYY-MM-DD'
  };

  private _TimeLayerAwareSlider: any;
  private _wmsTimeLayers: any[];
  private _interval: number;

  /**
  * Constructs time panel.
  */
  constructor(props: TimeLayerSliderPanelProps) {
    super(props);

    this.state = {
      value: moment().milliseconds(0),
      playbackSpeed: '1',
      autoPlayActive: false
    };

    this._interval = 1000;

    this.wrapTimeSlider();

    // binds
    this.onTimeChanged = this.onTimeChanged.bind(this);
    this.autoPlay = this.autoPlay.bind(this);
    this.updateDataRange = this.updateDataRange.bind(this);
  }

  componentDidUpdate(prevProps: TimeLayerSliderPanelProps) {
    // TODO this deep check may impact performance..
    if (!(_isEqual(prevProps.timeAwareLayers, this.props.timeAwareLayers))) {
      // update slider properties if some another layer set was chosen
      this.wrapTimeSlider();
      this.findRangeForLayers();
    }
  }

  /**
   *
   * @param nextProps
   * @param nextState
   */
  shouldComponentUpdate(nextProps: TimeLayerSliderPanelProps, nextState: TimeLayerSliderPanelState) {
    const {
      value,
      autoPlayActive
    } = this.state;
    const {
      startDate,
      endDate,
      timeAwareLayers
    } = this.props;

    if (nextState.value !== value) {
      return true;
    }
    if (nextState.autoPlayActive !== autoPlayActive) {
      return true;
    }
    if (nextProps.startDate !== startDate) {
      return true;
    }
    if (nextProps.endDate !== endDate) {
      return true;
    }
    if (!(_isEqual(nextProps.timeAwareLayers, timeAwareLayers))) {
      return true;
    }
    return false;
  }

  /**
  * Wraps the TimeSlider component in timeLayerAware.
  */
  wrapTimeSlider = () => {
    this._wmsTimeLayers = [];
    this.props.timeAwareLayers!.forEach((l: any) => {
      if (l.get('type') === 'WMSTime') {
        this._wmsTimeLayers.push({
          layer: l
        });
      }
    });
    // make sure an initial value is set
    this.wmsTimeHandler(this.state.value);
    this._TimeLayerAwareSlider = timeLayerAware(TimeSlider, this._wmsTimeLayers);
  };

  /**
   * Updates slider time range depending on chosen layer set.
   */
  findRangeForLayers = () => {
    const {
      startDate,
      endDate,
      timeAwareLayers
    } = this.props;

    if (timeAwareLayers.length === 0) {
      return;
    }

    const startDatesFromLayers: moment.Moment[] = [];
    const endDatesFromLayers: moment.Moment[] = [];

    this._wmsTimeLayers.forEach((l: any) => {
      const sd = l.layer.get('startDate');
      const ed = l.layer.get('endDate');
      let sdm;
      let edm;
      if (sd) {
        sdm = moment(l.layer.get('startDate'));
      }
      if (ed) {
        edm = moment(l.layer.get('endDate'));
      }
      if (sdm) {
        startDatesFromLayers.push(sdm);
      }
      if (edm) {
        endDatesFromLayers.push(edm);
      }
    });
    const newStartDate: moment.Moment =
      startDatesFromLayers.length > 0 ? moment.min(startDatesFromLayers) : startDate;
    const newEndDate: moment.Moment =
      endDatesFromLayers.length > 0 ? moment.max(endDatesFromLayers) : endDate;
    this.updateDataRange([newStartDate, newEndDate]);
  };

  /**
  * Handler for the time slider change behaviour
  */
  timeSliderCustomHandler = (value: any) => {
    const currentMoment = moment(value).milliseconds(0);
    const newValue = currentMoment.clone();
    this.setState({
      value: newValue
    });
    if (this.props.onChange) {
      this.props.onChange(newValue);
    }
  };

  /**
  * makes sure that the appended time parameter in GetMap calls
  * is rounded to full hours to receive a valid response
  */
  wmsTimeHandler = (value?: any) => {
    this._wmsTimeLayers.forEach(config => {
      if (config.layer && config.layer.get('type') === 'WMSTime') {
        const params = config.layer.getSource().getParams();
        let time;
        if (Array.isArray(value)) {
          time = value[0];
        } else {
          time = value;
        }
        if (!moment.isMoment(time)) {
          time = moment(time);
        }
        time.set('minute', 0);
        time.set('second', 0);
        const timeFormat = config.layer.get('timeFormat');
        if (timeFormat.toLowerCase().indexOf('hh') > 0) {
          params.TIME = time.toISOString();
        } else {
          params.TIME = time.format(timeFormat);
        }
        config.layer.getSource().updateParams(params);
      }
    });
  };

  /**
  * start or stop auto playback
  * TODO: we should do the request for new features less aggresive,
  * e.g. a precache would be helpful
  */
  autoPlay(pressed: boolean) {
    if (pressed) {
      window.clearInterval(this._interval);
      this._interval = window.setInterval(() => {
        const {
          endDate
        } = this.props;
        const {
          value,
          playbackSpeed
        } = this.state;
        if (value >= endDate!) {
          window.clearInterval(this._interval);
          this.setState({
            autoPlayActive: false
          });
          return;
        }

        let newValue;
        if (_isFinite(parseFloat(playbackSpeed))) {
          newValue = value.clone().add(playbackSpeed, 'seconds');
        } else {
          newValue = value.clone().add(1, playbackSpeed as moment.DurationInputArg2);
        }
        this.timeSliderCustomHandler(newValue);
        this.wmsTimeHandler(newValue);
        // value is handled in timeSliderCustomHandler
        this.setState({
          autoPlayActive: true
        });
      }, 1000, this);
    } else {
      window.clearInterval(this._interval);
      this.setState({
        autoPlayActive: false
      });
    }
  }

  /**
  * handle playback speed change
  */
  onPlaybackSpeedChange = (val: string) => {
    this.setState({
      playbackSpeed: val
    }, () => {
      if (this.state.autoPlayActive) {
        this.autoPlay(true);
      }
    });
  };

  /**
  * Sets the slider to the current time of the user
  */
  setSliderToNow = () => {
    const now = moment().milliseconds(0);
    this.setState({
      value: now
    }, () => {
      this.timeSliderCustomHandler(now);
      this.wmsTimeHandler(now);
    });
  };

  /**
  *
  */
  updateDataRange([startDate, endDate]: timeRange) {
    this.props.dispatch(setStartDate(startDate));
    this.props.dispatch(setEndDate(endDate));
    this.setState({
      value: startDate!.clone().add(endDate!.diff(startDate) / 2)
    }, () => this.wrapTimeSlider());
  }

  /**
  *
  * @param val
  */
  onTimeChanged(val: string) {
    this.setState({
      value: moment(val)
    }, () => {
      this.wmsTimeHandler(this.state.value);
    });
  }

  /**
  *
  *
  * @memberof TimeLayerSliderPanel
  */
  render = () => {
    const {
      className,
      t,
      startDate,
      endDate,
      timeAwareLayers,
      dateFormat
    } = this.props;

    const {
      autoPlayActive,
      value
    } = this.state;

    const resetVisible = true;

    const startDateString = startDate ? startDate.toISOString() : undefined;
    const endDateString = endDate ? endDate.toISOString() : undefined;
    const valueString = value ? value.toISOString() : undefined;
    const mid = startDate!.clone().add(endDate!.diff(startDate) / 2);
    const marks = {};
    const futureClass = moment().isBefore(value) ? ' timeslider-in-future' : '';
    const extraCls = className ? className : '';
    const disabledCls = timeAwareLayers.length < 1 ? 'no-layers-available' : '';

    marks[startDateString] = {
      label: startDate!.format(dateFormat)
    };
    marks[endDateString] = {
      label: endDate!.format(dateFormat),
      style: {
        left: 'unset',
        right: 0,
        transform: 'translate(50%)'
      }
    };
    marks[mid.toISOString()] = {
      label: mid.format(dateFormat)
    };

    return (
      <div className={`time-layer-slider ${disabledCls}`.trim()}>

        <Popover
          placement="topRight"
          title={t('TimeLayerSliderPanel.dataRange')}
          trigger="click"
          content={
            <RangePicker
              showTime={{ format: 'HH:mm' }}
              defaultValue={[startDate, endDate]}
              onOk={this.updateDataRange}
            />
          }
        >
          <SimpleButton
            className="change-datarange-button"
            iconName={['fas', 'calendar-circle']}
          />
        </Popover>
        {
          resetVisible ?
            <SimpleButton
              type="primary"
              iconName={['fas', 'refresh']}
              onClick={this.setSliderToNow}
              tooltip={t('TimeLayerSliderPanel.setToNow')}
            /> : null
        }
        <this._TimeLayerAwareSlider
          className={`${extraCls} timeslider ${futureClass}`.trim()}
          formatString={dateFormat}
          defaultValue={startDateString}
          min={startDateString}
          max={endDateString}
          value={valueString}
          marks={marks}
          onChange={this.onTimeChanged}
        />
        <div className="time-value">
          {value.format('DD.MM.YYYY HH:mm:ss')}
        </div>
        <ToggleButton
          type="primary"
          iconName={['fas', 'play-circle']}
          className={extraCls + ' playback'}
          pressed={autoPlayActive}
          onToggle={this.autoPlay}
          tooltip={autoPlayActive ? 'Pause' : 'Autoplay'}
          pressedIconName={['fas', 'pause-circle']}
        />
        <Select
          defaultValue={'1'}
          className={extraCls + ' speed-picker'}
          onChange={this.onPlaybackSpeedChange}
        >
          <Option value="0.5">0.5x</Option>
          <Option value="1">1x</Option>
          <Option value="2">2x</Option>
          <Option value="5">5x</Option>
          <Option value="10">10x</Option>
          <Option value="100">100x</Option>
          <Option value="300">300x</Option>
          <Option value="hours">{t('TimeLayerSliderPanel.hours')}</Option>
          <Option value="days">{t('TimeLayerSliderPanel.days')}</Option>
          <Option value="weeks">{t('TimeLayerSliderPanel.weeks')}</Option>
          <Option value="months">{t('TimeLayerSliderPanel.months')}</Option>
          <Option value="years">{t('TimeLayerSliderPanel.years')}</Option>
        </Select>
      </div>
    );
  };
}

export default connect(mapStateToProps)(TimeLayerSliderPanel);
