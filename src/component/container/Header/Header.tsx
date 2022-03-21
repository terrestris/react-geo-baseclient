import * as React from 'react';
import {
  Spin
} from 'antd';

import SimpleButton from '@terrestris/react-geo/dist/Button/SimpleButton/SimpleButton';

import { toggleHelpModal } from '../../../state/appState';

import './Header.css';
import Multisearch from '../../../component/Multisearch/Multisearch';

type LogoConfig = {
  src: string;
  target?: string;
};

// default props
interface DefaultHeaderProps {
  className: string;
  title: string;
  loading: boolean;
  logoConfig: LogoConfig[];
  showHelpButton: boolean;
  showLanguageSelection: boolean;
  showMultiSearch: boolean;
  showNominatimSearch: boolean;
  showUserChip: boolean;
  userChipHandler: () => void;
  userName: string;
}

interface HeaderProps extends Partial<DefaultHeaderProps> {
  dispatchFn: (arg: any) => void;
  topic: string;
  map: any;
  i18n: any;
  t: (arg: string) => {};
  wfsSearchBaseUrl?: string;
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

  public static defaultProps: DefaultHeaderProps = {
    title: 'react-geo-baseclient',
    className: 'app-header',
    loading: false,
    logoConfig: undefined,
    showHelpButton: false,
    showLanguageSelection: true,
    showMultiSearch: true,
    showNominatimSearch: true,
    showUserChip: false,
    userChipHandler: undefined,
    userName: undefined
  };

  /**
   * Create the Header.
   *
   * @constructs Header
   */
  constructor(props: HeaderProps) {
    super(props);

    this.onHelpButtonClick = this.onHelpButtonClick.bind(this);
  }

  /**
   * Change handler if language was changed
   * @param {String} lang The chosen language (e.g. 'de' or 'en')
   */
  onLanguageChange = (lang: string) => {
    if (this.props.i18n) {
      this.props.i18n.changeLanguage(lang);
    }
  };

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
      showHelpButton,
      showLanguageSelection,
      showMultiSearch,
      showNominatimSearch,
      showUserChip,
      userChipHandler,
      userName,
      wfsSearchBaseUrl,
      t
    } = this.props;

    let titleString = title;
    if (topic) {
      titleString = `${title} (${topic})`;
    }

    return (
      <header className={'app-header ' + className}>
        <Spin
          spinning={loading}
          className="app-loading-indicator"
        />
        <div className="logo">
          {
            logoConfig ? logoConfig.map((config, idx) =>
              <img
                src={config.src}
                key={`logo-${idx}`}
                alt={config.target}
                className={config.target ? 'app-logo with-link' : 'app-logo'}
                onClick={config.target ? () => window.open(config.target, '_blank') : () => {}}
              />
            )
              : null}
        </div>
        {showMultiSearch &&
          <Multisearch
            map={map}
            useNominatim={showNominatimSearch}
            useWfs={true}
            wfsSearchBaseUrl={wfsSearchBaseUrl}
            nominatimSearchTitle={t('Multisearch.nominatimSearchTitle') as string}
            placeHolder={t('Multisearch.placeHolder') as string}
          />
        }
        <span className="app-title">{titleString}</span>
        {showHelpButton &&
        <SimpleButton
          name="helpButtonModule"
          iconName={['fas', 'question']}
          shape="circle"
          tooltip={t('Header.helpButtonTooltip') as string}
          onClick={this.onHelpButtonClick}
          tooltipPlacement={'bottom'}
        />
        }
        {showLanguageSelection &&
        <div className="app-language-selection">
          <img src="de.png" alt="DE" onClick={() => this.onLanguageChange('de')} />
          <img src="en.png" alt="EN" onClick={() => this.onLanguageChange('en')} />
        </div>
        }
        {showUserChip &&
        <div className="user-chip">
          <SimpleButton
            name="userChipButton"
            iconName={['fas', 'user']}
            shape="circle"
            tooltip={t('Header.userChipButtonTooltip') as string}
            onClick={userChipHandler}
            tooltipPlacement={'bottom'}
          />
          <div
            className="user-name"
            onClick={userChipHandler}
          >
            {userName}
          </div>
        </div>
        }
      </header>
    );
  }
}
