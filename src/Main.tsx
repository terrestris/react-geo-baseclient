import * as React from 'react';
import 'normalize.css';
import 'ol/ol.css';
import './Theme.css';
import './Main.css';
import SomethingWentWrong from './SomethingWentWrong';
import { withTranslation } from 'react-i18next';
import ProjectMain from './ProjectMain';
import OlMap from 'ol/Map';
export interface MainProps {
  map: OlMap;
  t: (arg: string) => string;
}

export interface MainState {
  hasError: boolean;
  error: Error | null;
  info: object | null;
}

export interface MainType {
  map?: OlMap;
}

/**
 * Class representing the main component.
 *
 * @class The Main.
 * @extends React.Component
 */
export class Main extends React.Component<MainProps, MainState> {

  main: React.ComponentType<MainType>;

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

    // require.context may not be available in test setup. Use
    // default ProjectMain instead
    // @ts-ignore
    if (process.env.APP_MODE.indexOf('test') > -1) {
      this.main = ProjectMain;
      return;
    }
    // load and show the project specific main view, as
    // configured by the user in the projectconfig.js
    // @ts-ignore
    const context = require.context(process.env.PROJECT_MAIN_PATH, true, process.env.PROJECT_MAIN_CLASS);
    context.keys().forEach((filename: string) => {
      const main = context(filename);
      this.main = main.default;
    });
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
    return (
      this.main ? <this.main map={this.props.map}/> : null
    );
  }
}

export default withTranslation()(Main);
