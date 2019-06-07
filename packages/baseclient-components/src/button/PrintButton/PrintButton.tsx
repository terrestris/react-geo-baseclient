import * as React from 'react';

import {
  SimpleButton,
  Window
} from '@terrestris/react-geo';
import PrintPanelV3, { PrintConfig } from 'src/container/PrintPanel/PrintPanelV3';

interface DefaultPrintButtonProps {
  type: string,
  shape: string,
  icon: string
}

interface PrintButtonProps extends Partial<DefaultPrintButtonProps> {
  map: any,
  t: (arg: string) => string,
  config: PrintConfig
}

interface PrintButtonState {
  winVisible: boolean
}

/**
 * Class representing the PrintButton.
 *
 * @class PrintButton
 * @extends React.Component
 */
export default class PrintButton extends React.Component<PrintButtonProps, PrintButtonState> {

  /**
   * Create the PrintButton. Works currently with PrintPanelV3 only.
   *
   * @constructs PrintButton
   */
  constructor(props: PrintButtonProps) {
    super(props);
    this.state = {
      winVisible: false
    }
  }

  /**
   * Inverts visibility of print window on call.
   *
   */
  changeFullPrintWindowVisibility = () => {
    this.setState({
      winVisible: !this.state.winVisible
    });
  }

  /**
   * The render function
   */
  render() {
    const {
      t,
      type,
      shape,
      icon,
      map,
      config
    } = this.props;
    const {
      winVisible
    } = this.state;

    if (!config) {
      return <div />;
    }

    return (
      <div>
      <SimpleButton
        type={type}
        shape={shape}
        icon={icon}
        onClick={this.changeFullPrintWindowVisibility}
      />
      { winVisible &&
        <Window
          onEscape={this.changeFullPrintWindowVisibility}
          title={t('PrintPanel.windowTitle')}
          width={750}
          y={50}
          x={100}
          enableResizing={false}
          collapseTooltip={t('Component.collapse')}
          bounds="#app"
          tools={[
            <SimpleButton
              icon="times"
              key="close-tool"
              size="small"
              tooltip={t('Component.close')}
              onClick={this.changeFullPrintWindowVisibility}
            />
          ]}
        >
          <PrintPanelV3
            map={map}
            key="5"
            t={t}
            config={config}
            legendBlackList={[]}
            printLayerBlackList={[]}
          />
        </Window>
      }
      </div>
    );
  }
}
