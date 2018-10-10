import * as React from 'react';
import './Main.css';
import 'ol/ol.css';
import { connect } from 'react-redux';
import i18next from './i18n';
import { translate } from 'react-i18next';
import OlMap from 'ol/Map';
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
    // Display fallback UI
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
      // You can render any custom fallback UI
      return (
        <div><h1>Something went wrong.</h1>
          <p>{this.state.error}</p>
          {this.state.info}
          </div>
      );
    }
    const {
      // activeModules,
      appContextLoading,
      // loading,
      map
    } = this.props;

    if (appContextLoading || !i18next.isInitialized) {
      return (
        <div>Lade bitte warten</div>
      );
    } else {
      return (
        <MapComponent 
          map={map}
        />
      );
    }
  }
}

export default connect(mapStateToProps)(translate()(Main));