import * as React from 'react';
import './SomethingWentWrong.css';

export interface DefaultProps {
  error: string;
}

/**
 * Class representing the SomethingWentWrong component.
 *
 * @class SomethingWentWrong.
 * @extends React.Component
 */
export class SomethingWentWrong extends React.Component<DefaultProps> {

  /**
   * Create a SomethingWentWrong component.
   * @constructs SomethingWentWrong
   */
  constructor(props: DefaultProps) {
    super(props);
  }

  /**
   * The render function.
   *
   */
  render() {
    if (this.props.error) {
      return (
        <div className="something-went-wrong">
          <img src="something-went-wrong.png" alt="" />
          <h1>Sorry, something went wrong.</h1>
          The error was:
          <p>{this.props.error}</p>
        </div>
      );
    } else {
      return (
        <div className="something-went-wrong">
          <img src="something-went-wrong.png" alt="" />
          <h1>Sorry, something went wrong.</h1>
        Please reload the page
        </div>
      );
    }
  }
}

export default SomethingWentWrong;
