import * as React from 'react';
import './ProjectMain.css';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import i18n from './i18n';
import SomethingWentWrong from './SomethingWentWrong';

import Map from './component/Map/Map';
import Toolbar from '@terrestris/react-geo/dist/Toolbar/Toolbar';
import Window from '@terrestris/react-geo/dist/Window/Window';
import SimpleButton from '@terrestris/react-geo/dist/Button/SimpleButton/SimpleButton';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import { getAppContextUtil } from './util/getAppContextUtil';
import SiderMenu from './component/SiderMenu/SiderMenu';
import Footer from './component/container/Footer/Footer';
import AddLayerPanel from './component/AddLayerPanel/AddLayerPanel';

import OlMap from 'ol/Map';

import { hideAddLayerWindow } from './state/appState';
import { BaseClientState } from './state/reducer';

import PermalinkUtil from '@terrestris/ol-util/dist/PermalinkUtil/PermalinkUtil';
import { uniqueId } from 'lodash';


/**
 * mapStateToProps - mapping state to props of Main Component
 *
 * @param {Object} state current state
 *
 * @return {Object} mapped props
 */
const mapStateToProps = (state: BaseClientState) => {
  return {
    activeModules: state.activeModules,
    loading: state.loadingQueue.loading,
    appContext: state.appContext,
    mapScales: state.mapScales,
    addLayerWindowVisible: state.appState.addLayerWindow,
    projection: state.mapView.projection
  };
};

// default props
export interface DefaultMainProps {
  loading: boolean;
}

export interface MainProps extends Partial<DefaultMainProps> {
  dispatch: (arg: any) => void;
  loading: boolean;
  map: OlMap;
  appContext: any;
  addLayerWindowVisible: boolean;
  activeModules: object[];
  mapScales: number[];
  t: (arg: string) => string;
  projection: string;
}

export interface MainState {
  hasError: boolean;
  error: Error | null;
  info: object | null;
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

    this.applyStyle();
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
  componentDidMount() {
    // apply possibly given permalink
    PermalinkUtil.applyLink(this.props.map);
  }

  /**
   * apply custom style from app context
   */
  applyStyle() {
    const style = this.props.appContext?.style;
    if (style) {
      // set all keys and vals from backend response as CSS custom variables
      Object.keys(style).forEach((key) => {
        document.documentElement.style.setProperty(
          '--' + key,
          '#' + style[key]
        );
      });
    }
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

    const appContextUtil = getAppContextUtil();
    const measureToolsEnabled = appContextUtil.measureToolsEnabled(activeModules);

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
            {appContextUtil.getToolsForToolbar(activeModules, map, appContext, t)}
          </Toolbar>
          {
            addLayerWindowVisible ?
              <Window
                id={uniqueId('window-')}
                parentId={'app'}
                resizeOpts={false}
                collapsible={false}
                draggable={true}
                collapsed={false}
                titleBarHeight={37.5}
                collapseTooltip={t('General.collapse')}
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
                    size="small"
                    tooltip={t('General.close')}
                    onClick={this.closeAddLayerWindow}
                    icon={
                      <FontAwesomeIcon
                        icon={faTimes}
                      />
                    }
                  />
                ]}
              >
                <AddLayerPanel
                  map={map}
                  onCancel={this.closeAddLayerWindow}
                />
              </Window> :
              null
          }
        </div>
        <Footer
          map={map}
          t={t}
          mapScales={mapScales}
          imprint={appContext.imprint}
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
