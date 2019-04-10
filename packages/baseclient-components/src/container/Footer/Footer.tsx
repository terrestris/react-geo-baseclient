import * as React from 'react';
import './Footer.less';
import { ScaleCombo } from '@terrestris/react-geo';

// default props
interface DefaultFooterProps {
}

interface FooterProps extends Partial<DefaultFooterProps>{
  map: any,
  t: (arg: string) => {}
}

interface FooterState {
}

/**
 * Class representing the Footer.
 *
 * @class LegendContainer
 * @extends React.Component
 */
export default class Footer extends React.Component<FooterProps, FooterState> {

  /**
   * Create the Footer.
   *
   * @constructs Footer
   */
  constructor(props: FooterProps) {
    super(props);
  }

  /**
   * The render function
   */
  render() {
    const {
      map,
      t
    } = this.props;

    return (
      <div className="footer">
        <div className="scalecombo">
          <span>{t('ScaleComboLabel')}</span>
          <ScaleCombo
            map={map}
            style={{'width': '150px'}}
          />
        </div>
      </div>
    );
  }
}
