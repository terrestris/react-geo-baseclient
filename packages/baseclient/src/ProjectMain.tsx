import * as React from 'react';
import './ProjectMain.less';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import i18n from './i18n';
import BrowserUtil from './util/BrowserUtil';
import OlMap from 'ol/Map';
import SomethingWentWrong from './SomethingWentWrong';
import {
  MapComponent,
  Toolbar
} from '@terrestris/react-geo';
import { SiderMenu, Footer } from 'baseclient-components';
import AppContextUtil from './util/AppContextUtil';


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
    appContext: state.appContext
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
    appContext: {},
    appContextLoading: boolean,
    activeModules: object[],
    t: (arg: string) => string
}

export interface MainState {
  hasError: boolean,
  error: Error | null,
  info: object | null
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
      info: null
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
      map,
      appContext,
      t,
      activeModules
    } = this.props;
    const isMobile = BrowserUtil.isMobile();
    const measureToolsEnabled = AppContextUtil.measureToolsEnabled(activeModules);
    const viewport = (
      <div className="viewport">
        { isMobile ? null :
          <header>Header</header>
        }
        <div className="main-content">
          <SiderMenu
              map={map}
              t={t}
              i18n={i18n}
              collapsible={false}
              measureToolsEnabled={measureToolsEnabled}
            />
          <MapComponent
            map={map}
          />
          <Toolbar
            alignment="vertical"
            style={isMobile ? {top: '10px'} : null}
          >
            { AppContextUtil.getToolsForToolbar(activeModules, map, appContext, t) }
          </Toolbar>
        </div>
        <Footer
          map={map}
          t={t}
        />
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
    return this.setupViewport();
  }
}

export default withTranslation()(connect(mapStateToProps)(ProjectMain));
