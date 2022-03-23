import * as React from 'react';
import { Layout, Menu } from 'antd';
import { FileOutlined, DesktopOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons';
import './SiderMenu.css';

import OlMap from 'ol/Map';

import MeasureButton from '@terrestris/react-geo/dist/Button/MeasureButton/MeasureButton';
import ToggleGroup from '@terrestris/react-geo/dist/Button/ToggleGroup/ToggleGroup';
import LayerTree from '@terrestris/react-geo/dist/LayerTree/LayerTree';

import LegendContainer from '../container/Legend/LegendContainer';
import MapUtil from '@terrestris/ol-util/src/MapUtil/MapUtil';
const { Sider } = Layout;
const SubMenu = Menu.SubMenu;

// default props
interface DefaultSiderProps {
  collapsible?: boolean;
}

interface SiderProps extends Partial<DefaultSiderProps> {
  collapsed?: boolean;
  map: OlMap;
  t: (arg: string) => {};
  i18n: any;
  measureToolsEnabled: boolean;
}

interface SiderState {
  collapsed: boolean;
}

/**
 * Class representing the SiderMenu component.
 *
 * @class The SiderMenu.
 * @extends React.Component
 */
export class SiderMenu extends React.Component<SiderProps, SiderState> {

  /**
  * The default properties.
  */
  public static defaultProps: DefaultSiderProps = {
    collapsible: true
  };

  /**
   * Create a SiderMenu component.
   * @constructs Main
   */
  constructor(props: SiderProps) {
    super(props);

    this.state = {
      collapsed: false
    };
  }

  onCollapse = (collapsed: boolean) => {
    this.setState({ collapsed });
    // needed to rescale the map clean instead of stretching it
    window.setTimeout(() => {
      this.props.map.updateSize();
    }, 200);
  };

  onLanguageChange = (lang: string) => {
    this.props.i18n.changeLanguage(lang);
  };

  render() {
    const {
      collapsible,
      t,
      measureToolsEnabled,
      map
    } = this.props;
    return (
      <Sider
        width="300"
        theme="light"
        className="sidermenu"
        collapsible={collapsible}
        collapsed={this.state.collapsed}
        onCollapse={this.onCollapse}
      >
        <div className="sidermenu-logo">
          <img src="logo_terrestris.png" alt="Logo" />
        </div>
        <div className="sidermenu-language-selection">
          <img src="de.png" alt="DE" onClick={() => this.onLanguageChange('de')} />
          <img src="en.png" alt="EN" onClick={() => this.onLanguageChange('en')} />
        </div>
        <Menu theme="light" defaultSelectedKeys={['1']} mode="inline">
          <SubMenu
            key="1"
            className="treesubmenu"
            title={
              <div>
                <FileOutlined />
                <span>{t('LayerTree')}</span>
              </div>
            }
          >
            <LayerTree
              map={this.props.map}
              filterFunction={(layer) => layer.get('name').indexOf('react-geo') < 0}
            />
          </SubMenu>
          <SubMenu
            key="2"
            title={
              <div>
                <DesktopOutlined />
                <span>{t('Legend')}</span>
              </div>
            }
          >
            <LegendContainer
              layerGroup={this.props.map.getLayerGroup()}
              scale={MapUtil.getScaleForResolution(this.props.map.getView().getResolution(), 'm')}
              filterFn={(l) => l.getVisible()}
            />
          </SubMenu>
          {measureToolsEnabled ?
            <SubMenu
              key="sub1"
              className="measuremenu"
              title={
                <div>
                  <FileOutlined />
                  <span>{t('Measure.title')}</span>
                </div>
              }
            >
              <Menu.Item key="5">
                <div className="measuregroup">
                  <ToggleGroup
                    allowDeselect={true}
                    selectedName="one"
                  >
                    <MeasureButton
                      name="multi"
                      map={map}
                      measureType="line"
                      multipleDrawing={true}
                      geodesic={true}
                    >
                      {t('Measure.line')}
                    </MeasureButton>
                    <MeasureButton
                      name="poly"
                      map={map}
                      measureType="polygon"
                      multipleDrawing={true}
                      geodesic={true}
                    >
                      {t('Measure.area')}
                    </MeasureButton>
                    <MeasureButton
                      name="angle"
                      map={map}
                      measureType="angle"
                      geodesic={true}
                    >
                      {t('Measure.angle')}
                    </MeasureButton>
                  </ToggleGroup>
                </div>
              </Menu.Item>
            </SubMenu> : null
          }
          <SubMenu
            key="sub2"
            title={<span>
              <TeamOutlined />
              <span>{t('Imprint.title')}</span>
            </span>
            }
          >
            <Menu.Item key="6">{t('Imprint.contact')}</Menu.Item>
            <Menu.Item key="8">{t('Imprint.privacypolicy')}</Menu.Item>
          </SubMenu>
          <Menu.Item key="9">
            <UserOutlined />
            <span>{t('Logout')}</span>
          </Menu.Item>
        </Menu>
      </Sider>
    );
  }
}
export default SiderMenu;
