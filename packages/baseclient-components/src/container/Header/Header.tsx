import * as React from 'react';
import {
  Spin,
  Row,
  Col,
  notification
} from 'antd';

import {
  NominatimSearch,
  SimpleButton
} from '@terrestris/react-geo';

import './Header.less';

// default props
interface DefaultHeaderProps {
  title: string;
  loading: boolean;
}

interface HeaderProps extends Partial<DefaultHeaderProps>{
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
    loading: false
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
    const { t } = this.props;
    notification.info({
      message: t('Header.helpMessage'),
      description: t('Header.helpDescription'),
      placement: 'bottomRight'
    });
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
      t
    } = this.props;

    let titleString = title;
    if (topic) {
      titleString = `${title} (${topic})`;
    }

    return (
      <header className="app-header">
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
            xs={2}
            sm={2}
            md={2}
            lg={2}
          >
          <img src="logo_terrestris.png" alt="Logo" className="app-logo" />
          </Col>
          <Col
            xs={10}
            sm={10}
            md={8}
            lg={8}
          >
            <NominatimSearch
              placeholder={t('Header.nominatimPlaceHolder')}
              map={map}
              style={{
                width: '100%'
              }}
            />
          </Col>
          <Col
             xs={0}
             sm={0}
             md={11}
             lg={11}
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
              tooltip={t('Header.helpButtonTooltip')}
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
