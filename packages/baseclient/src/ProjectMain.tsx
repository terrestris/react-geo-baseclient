import * as React from 'react';
import './ProjectMain.less';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import OlMap from 'ol/map';
import SomethingWentWrong from './SomethingWentWrong';
import {
  MapComponent,
//   ToggleButton,
  // Panel
} from '@terrestris/react-geo';
import { Layout } from 'antd';
const { /*Header,*/ Footer, Content } = Layout;

import { SiderMenu } from 'baseclient-components';


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
  layerGroup: [],
  viewport: object | null
}

/**
 * Class representing the projects main component.
 *
 * @class The ProjectMain.
 * @extends React.Component
 */
export class ProjectMain extends React.Component<MainProps, MainState> {

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
      layerGroup: [],
      viewport: this.setupViewport()
    };
  }

  /**
   * 
   * @param error 
   * @param info 
   */
  componentDidCatch(error: Error | null, info: object) {
    this.setState({
      hasError: true,
      error,
      info
    });
  }

  /**
   * 
   */
  setupViewport(): object {
    const {
      map
    } = this.props;
    const viewport = (
      <div>
        <Layout>
          <SiderMenu
            map={map}
          />
            <Content>
              <MapComponent
                map={map}
              />
            </Content>
        </Layout>
        <Footer>Footer</Footer>
      </div>
    );
    return viewport;
  }

  /**
   * The render function.
   *
   */
  render() {
    if (this.state.hasError) {
      return (
        <SomethingWentWrong
          error={
            JSON.stringify(this.state.error) +
            JSON.stringify(this.state.info)
          }
        />
      );
    }
    return this.state.viewport;
  }
}

export default connect(mapStateToProps)(translate()(ProjectMain));