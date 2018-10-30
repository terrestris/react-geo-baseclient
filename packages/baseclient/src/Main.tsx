import * as React from 'react';
import './Main.css';
import 'ol/ol.css';
import OlMap from 'ol/map';
import SomethingWentWrong from './SomethingWentWrong';
import ProjectMain from './ProjectMain';

export interface MainProps {
    map: OlMap,
    t: (arg: string) => void
}

export interface MainState {
  hasError: boolean,
  error: Error | null,
  info: object | null
}

/**
 * Class representing the main component.
 *
 * @class The Main.
 * @extends React.Component
 */
export class Main extends React.Component<MainProps, MainState> {

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
      <ProjectMain
        map={this.props.map}
      />
    );
  }
}

export default Main;