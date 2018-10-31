import * as React from 'react';
import { Layout, Menu, Icon } from 'antd';
import './SiderMenu.less';
import { LayerTree } from '@terrestris/react-geo';
import LegendContainer from '../container/Legend/LegendContainer';
import MapUtil from '@terrestris/ol-util/src/MapUtil/MapUtil';
const { Sider } = Layout;
const SubMenu = Menu.SubMenu;

// default props
interface SiderProps {
  collapsed: boolean,
  map: any,
  t: (arg: string) => {},
  i18n: any
}

interface SiderState {
  collapsed: boolean
}

/**
 * Class representing the SiderMenu component.
 *
 * @class The SiderMenu.
 * @extends React.Component
 */
export class SiderMenu extends React.Component<SiderProps, SiderState> {

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
  }

  onLanguageChange = (lang: string) => {
    this.props.i18n.changeLanguage(lang);
  }

  render() {
    const {
      t
    } = this.props;
    return (
      <Sider
        width="300"
        theme="light"
        className="sidermenu"
        collapsible
        collapsed={this.state.collapsed}
        onCollapse={this.onCollapse}
      >
        <div className="sidermenu-logo">
          <img src="logo_terrestris.png" alt="Logo" />
        </div>
        <div className="sidermenu-language-selection">
        <img src="de.png" alt="DE" onClick={() => this.onLanguageChange('de')}/>
          <img src="en.png" alt="EN" onClick={() => this.onLanguageChange('en')}/>
        </div>
        <Menu theme="light" defaultSelectedKeys={['1']} mode="inline">
          <SubMenu
            key="1"
            className="treesubmenu"
            mode="vertical"
            title={
              <div><Icon type="file" /><span>{t('LayerTree')}</span></div>
            }
          >
            <LayerTree
              map={this.props.map}
            />
          </SubMenu>
          <SubMenu 
            key="2"
            mode="vertical"
            title={
              <div><Icon type="desktop" /><span>{t('Legend')}</span></div>
            }
          >
            <LegendContainer
              layerGroup={this.props.map.getLayerGroup()}
              scale={MapUtil.getScaleForResolution(this.props.map.getView().getResolution(), 'm')}
              filterFn={(l: any) => l.getVisible()}
            />
          </SubMenu>
          <SubMenu
            key="sub1"
            mode="vertical"
            title={
              <div><Icon type="file" /><span>{t('Measure.title')}</span></div>
            }
          >
            <Menu.Item key="3">{t('Measure.point')}</Menu.Item>
            <Menu.Item key="4">{t('Measure.line')}</Menu.Item>
            <Menu.Item key="5">{t('Measure.area')}</Menu.Item>
          </SubMenu>
          <SubMenu
            key="sub2"
            title={<span><Icon type="team" /><span>{t('Imprint.title')}</span></span>}
          >
            <Menu.Item key="6">{t('Imprint.contact')}</Menu.Item>
            <Menu.Item key="8">{t('Imprint.privacypolicy')}</Menu.Item>
          </SubMenu>
          <Menu.Item key="9">
            <Icon type="user" />
            <span>{t('Logout')}</span>
          </Menu.Item>
        </Menu>
      </Sider>
    );
  }
}
export default SiderMenu;
