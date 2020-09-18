import * as React from 'react';
import {
  Spin,
  Row,
  Col
} from 'antd';

import NominatimSearch from '@terrestris/react-geo/dist/Field/NominatimSearch/NominatimSearch';
import SimpleButton from '@terrestris/react-geo/dist/Button/SimpleButton/SimpleButton';

import { toggleHelpModal } from '../../../state/actions/AppStateAction';

import './Header.less';

type LogoConfig = {
  src: string,
  target: string
};

// default props
interface DefaultHeaderProps {
  className: string;
  title: string;
  loading: boolean;
  logoConfig: LogoConfig[];
}

interface HeaderProps extends Partial<DefaultHeaderProps>{
  dispatchFn: (arg: any) => void;
  topic: string;
  map: any;
  i18n: any;
  t: (arg: string) => {};
}

interface HeaderState {
}

/**
 * Class representing the Header.
 *
 * @class Header
 * @extends React.Component
 */
export default class Header extends React.Component<HeaderProps, HeaderState> {

  /**
   * Create the Header.
   *
   * @constructs Header
   */
  constructor(props: HeaderProps) {
    super(props);

    this.onHelpButtonClick = this.onHelpButtonClick.bind(this);
  }

  public static defaultProps: DefaultHeaderProps = {
    title: 'react-geo-baseclient',
    className: 'app-header',
    loading: false,
    logoConfig: [{
      src: 'logo_terrestris.png',
      target: 'https://www.terrestris.de'
    }]
  };

  /**
   * Change handler if language was changed
   * @param {String} lang The chosen language (e.g. 'de' or 'en')
   */
  onLanguageChange = (lang: string) => {
    if (this.props.i18n) {
      this.props.i18n.changeLanguage(lang);
    }
  }

  /**
   * Handler for click action of help button
   */
  onHelpButtonClick() {
    this.props.dispatchFn(toggleHelpModal());
  }

  /**
   * The render function
   */
  render() {
    const {
      map,
      title,
      loading,
      topic,
      className,
      logoConfig,
      t
    } = this.props;

    let titleString = title;
    if (topic) {
      titleString = `${title} (${topic})`;
    }

    return (
      <header className={className}>
        <Row>
          <Col
            xs={1}
            sm={1}
            md={1}
            lg={1}
          >
            <Spin
              spinning={loading}
              className="app-loading-indicator"
            />
          </Col>
          <Col
            xs={0}
            sm={0}
            md={logoConfig.length}
            lg={logoConfig.length}
          >
          <div className="logo">
            {
                logoConfig.map((config, idx) =>
                  <img
                    src={config.src}
                    key={`logo-${idx}`}
                    alt={config.target}
                    className="app-logo"
                    onClick={() => window.open(config.target, '_blank')}
                  />
                )
            }
          </div>
          </Col>
          <Col
            xs={10}
            sm={10}
            md={8}
            lg={8}
          >
            <NominatimSearch
              placeholder={t('Header.nominatimPlaceHolder')}
              countrycodes={''}
              map={map}
              style={{
                width: '100%'
              }}
            />
          </Col>
          <Col
             xs={0}
             sm={0}
             md={13 - logoConfig.length}
             lg={13 - logoConfig.length}
          >
            <span className="app-title">{titleString}</span>
          </Col>
          <Col
            xs={1}
            sm={1}
            md={1}
            lg={1}
          >
            <SimpleButton
              name="helpButtonModule"
              icon="question"
              shape="circle"
              tooltip={t('Header.helpButtonTooltip') as string}
              onClick={this.onHelpButtonClick}
              tooltipPlacement={'bottom'}
            />
          </Col>
          <Col
            xs={1}
            sm={1}
            md={1}
            lg={1}
          >
            <div className="app-language-selection">
              <img src="de.png" alt="DE" onClick={() => this.onLanguageChange('de')}/>
              <img src="en.png" alt="EN" onClick={() => this.onLanguageChange('en')}/>
            </div>
          </Col>
        </Row>
      </header>
    );
  }
}
