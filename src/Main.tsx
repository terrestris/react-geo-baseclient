import * as React from 'react';
import './Main.css';
import 'ol/ol.css';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import OlMap from 'ol/map';
import SomethingWentWrong from './SomethingWentWrong';
import {
  MapComponent
//   ToggleButton,
//   LayerTree,
//   Panel
} from '@terrestris/react-geo';



/**
 * mapStateToProps - mapping state to props of Main Component
 *
 * @param {Object} state current state
 *
 * @return {Object} mapped props
 */
const mapStateToProps = (state: any) => {
  return {
    activeModules: state.activeModules,
    appContextLoading: state.asyncInitialState.loading,
    loading: state.loadingQueue.loading,
    mapLayers: state.mapLayers
  };
};

// default props
export interface DefaultMainProps {
  loading: boolean
}

export interface MainProps extends Partial<DefaultMainProps> {
    dispatch: (arg: any) => void,
    loading: boolean,
    map: OlMap,
    mapLayers: [],
    appContextLoading: boolean,
    activeModules: object[],
    t: (arg: string) => void
}

export interface MainState {
  hasError: boolean,
  error: Error | null,
  info: object | null,
  layerGroup: []
}

/**
 * Class representing the main component.
 *
 * @class The Main.
 * @extends React.Component
 */
export class Main extends React.Component<MainProps, MainState> {

  /**
   * Create a main component.
   * @constructs Main
   */
  constructor(props: MainProps) {
    super(props);

    this.state = {
      hasError: false,
      error:  null,
      info: null,      
      layerGroup: []
    };
  }

  /**
   * 
   * @param error 
   * @param info 
   */
  componentDidCatch(error: Error | null, info: object) {
    this.setState({
      hasError: true
    });
  }

  /**
   * The render function.
   *
   */
  render() {
    if (this.state.hasError) { // TODO check if it works ok
      return (
        <SomethingWentWrong
          error={
            JSON.stringify(this.state.error) +
            JSON.stringify(this.state.info)
          }
        />
      );
    }
    const {
      // activeModules,
      // loading,
      map
    } = this.props;

    return (
      <MapComponent 
        map={map}
      />
    );
  }
}

export default connect(mapStateToProps)(translate()(Main));