import * as React from 'react';

import SimpleButton from '@terrestris/react-geo/dist/Button/SimpleButton/SimpleButton';
import Window from '@terrestris/react-geo/dist/Window/Window';

import PrintPanelV3, { PrintConfig } from '../../PrintPanel/PrintPanelV3';
import { TooltipPlacement } from 'antd/lib/tooltip';

interface DefaultPrintButtonProps {
  type: 'default' | 'primary' | 'ghost' | 'dashed' | 'danger' | 'link',
  shape: 'circle' | 'circle-outline' | 'round',
  icon: string
}

interface PrintButtonProps extends Partial<DefaultPrintButtonProps> {
  map: any,
  tooltip: string,
  tooltipPlacement: TooltipPlacement,
  t: (arg: string) => string,
  config: PrintConfig,
  printScales: number[]
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
      tooltip,
      tooltipPlacement,
      config,
      printScales
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
        tooltip={tooltip}
        tooltipPlacement={tooltipPlacement}
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
          collapseTooltip={t('General.collapse')}
          bounds="#app"
          tools={[
            <SimpleButton
              icon="times"
              key="close-tool"
              size="small"
              tooltip={t('General.close')}
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
            printScales={printScales}
          />
        </Window>
      }
      </div>
    );
  }
}
