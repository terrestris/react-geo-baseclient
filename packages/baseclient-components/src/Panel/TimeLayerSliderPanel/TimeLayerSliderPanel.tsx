import * as React from 'react';
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
import * as moment from "moment";
const Option = Select.Option;

const _isFinite = require('lodash/isFinite');

import './TimeLayerSliderPanel.less';

type timeRange = [moment.Moment, moment.Moment];

export interface DefaultTimeLayerSliderPanelProps {
  className: string;
  onChange: (arg: moment.Moment) => void;
  timeAwareLayers: any[];
}

export interface TimeLayerSliderPanelProps extends Partial<DefaultTimeLayerSliderPanelProps> {
  map: any;
}

export interface TimeLayerSliderPanelState {
  value: moment.Moment;
  forceUpdate: number;
  playbackSpeed: string;
  autoPlayActive: boolean;
  startDate: moment.Moment;
  endDate: moment.Moment;
};

/**
 * The panel combining all time slider related parts.
 */
export class TimeLayerSliderPanel extends React.Component<TimeLayerSliderPanelProps, TimeLayerSliderPanelState> {

  private _TimeLayerAwareSlider: any;
  private _wmsTimeLayers: any[];
  private _interval: number;

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
    timeAwareLayers: []
  };

  /**
   * Constructs time panel.
   */
  constructor(props: TimeLayerSliderPanelProps) {
    super(props);

    // this.sunRiseLayer = new SunRiseLayer({
    //   map: this.props.map
    // });

    this.state = {
      value: moment("2015-01-01"),
      forceUpdate: 1,
      playbackSpeed: '1',
      autoPlayActive: false,
      startDate: moment("2006-01-01"),
      endDate: moment("2019-06-06")
    };

    this._interval = 1000;

    this.wrapTimeSlider();

    // binds
    this.onTimeChanged = this.onTimeChanged.bind(this);
    this.autoPlay = this.autoPlay.bind(this);
    this.onDataRangeOk = this.onDataRangeOk.bind(this);
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
  }

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
  }

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
        params['TIME'] = time.format(config.layer.get('timeFormat'));
        config.layer.getSource().updateParams(params);
      }
    });
  }

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
        } = this.state;
        const {
          value
        } = this.state;
        if (value >= endDate!) {
          window.clearInterval(this._interval);
          this.setState({
            autoPlayActive: false
          });
          return;
        }

        const valueToAdd = this.state.playbackSpeed;
        let newValue;
        if (_isFinite(valueToAdd)) {
          newValue = value.clone().add(valueToAdd, 'seconds');
        } else {
          newValue = value.clone().add(1, valueToAdd as moment.DurationInputArg2);
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
  }

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
  }

  /**
   *
   */
  onDataRangeOk([startDate, endDate]: timeRange) {
    this.setState({
      startDate,
      endDate
    });
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
    })
  }

  /**
   *
   *
   * @memberof TimeLayerSliderPanel
   */
  render = () => {
    const {
      className
    } = this.props;

    const {
      autoPlayActive,
      value,
      startDate,
      endDate
    } = this.state;

    const resetVisible = true;

    const startDateString = startDate ? startDate.toISOString() : undefined;
    const endDateString = endDate ? endDate.toISOString() : undefined;
    const valueString = value ? value.toISOString() : undefined;
    const format = 'YYYY-MM-DD';
    const mid = startDate!.clone().add(endDate!.diff(startDate)/2);
    const marks =  {};
    const futureClass = moment().isBefore(value) ? ' timeslider-in-future' : '';
    const extraCls = className ? className : '';

    marks[startDateString!] = startDate!.format(format);
    marks[endDateString!] = endDate!.format(format);
    marks[mid.toISOString()] = mid.format(format);

    return (
      <div className="time-layer-slider">

        <Popover
          placement="topRight"
          title="Zeitleisten Bereich"
          content={
            <RangePicker
              showTime={{ format: 'HH:mm' }}
              defaultValue={[startDate, endDate]}
              onOk={this.onDataRangeOk}
            />
          }
        >
          <SimpleButton
            className="change-datarange-button"
            icon="calendar-o"
          />
        </Popover>
        {
          resetVisible ?
            <SimpleButton
              type="primary"
              icon="refresh"
              onClick={this.setSliderToNow}
              tooltip={'Auf aktuelle Zeit zentrieren'}
            /> : null
        }
        <this._TimeLayerAwareSlider
          className={extraCls + ' timeslider' + futureClass}
          formatString={format}
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
          icon="play-circle-o"
          className={extraCls + ' playback'}
          pressed={autoPlayActive}
          onToggle={this.autoPlay}
          tooltip={autoPlayActive ? 'Pause' : 'Autoplay'}
          pressedIcon="pause-circle-o"
        />
        <Select
          defaultValue={"1"}
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
          <Option value="hours">hour</Option>
          <Option value="days">day</Option>
          <Option value="weeks">week</Option>
          <Option value="months">month</Option>
          <Option value="years">year</Option>
        </Select>
      </div>
    );
  }
}

export default TimeLayerSliderPanel;
