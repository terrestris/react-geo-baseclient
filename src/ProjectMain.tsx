import * as React from 'react';
import './ProjectMain.less';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import i18n from './i18n';
import SomethingWentWrong from './SomethingWentWrong';

import Map from './component/Map/Map';
import Toolbar from '@terrestris/react-geo/dist/Toolbar/Toolbar';
import Window from '@terrestris/react-geo/dist/Window/Window';
import SimpleButton from '@terrestris/react-geo/dist/Button/SimpleButton/SimpleButton';

import AppContextUtil from './util/AppContextUtil';
import SiderMenu from './component/SiderMenu/SiderMenu'
import Footer from './component/container/Footer/Footer';
import AddLayerPanel from './component/AddLayerPanel/AddLayerPanel';
import { hideAddLayerWindow } from './state/actions/AppStateAction';

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
    appContext: state.appContext,
    mapScales: state.mapScales,
    addLayerWindowVisible: state.appState.addLayerWindowVisible
  };
};

// default props
export interface DefaultMainProps {
  loading: boolean
}

export interface MainProps extends Partial<DefaultMainProps> {
  dispatch: (arg: any) => void,
  loading: boolean,
  map: any,
  appContext: {},
  appContextLoading: boolean,
  addLayerWindowVisible: boolean,
  activeModules: object[],
  mapScales: number[],
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
      error: null,
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

  closeAddLayerWindow() {
    this.props.dispatch(hideAddLayerWindow());
  }

  /**
   *
   */
  setupViewport(): object {
    const {
      map,
      appContext,
      t,
      activeModules,
      mapScales,
      addLayerWindowVisible
    } = this.props;

    const measureToolsEnabled = AppContextUtil.measureToolsEnabled(activeModules);
    const viewport = (
      <div className="viewport">
        <header>Header</header>
        <div className="main-content">
          <SiderMenu
            map={map}
            t={t}
            i18n={i18n}
            measureToolsEnabled={measureToolsEnabled}
          />
          <Map
            map={map}
          />
          <Toolbar
            alignment="vertical"
            className="tools-tb"
          >
            {AppContextUtil.getToolsForToolbar(activeModules, map, appContext, t)}
          </Toolbar>
          {
            addLayerWindowVisible ?
              <Window
                title={t('AddLayerPanel.addWms')}
                onClose={this.closeAddLayerWindow}
                onEscape={this.closeAddLayerWindow}
                width={800}
                height={400}
                x={(window.innerWidth / 2 - 400) / 2}
                y={(window.innerHeight / 2 - 200) / 2}
                className="add-wms-window"
                tools={[
                  <SimpleButton
                    key="closeButton"
                    icon="close"
                    size="small"
                    tooltip={t('General.close')}
                    onClick={this.closeAddLayerWindow}
                  />
                ]}
              >
                <AddLayerPanel
                  map={map}
                  onCancel={this.closeAddLayerWindow}
                >
                  {t('AddLayerPanel.wmsContent')}
                </AddLayerPanel>
              </Window> :
              null
          }
        </div>
        <Footer
          map={map}
          t={t}
          mapScales={mapScales}
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
