import * as React from 'react';

import SimpleButton from '@terrestris/react-geo/dist/Button/SimpleButton/SimpleButton';
import Window from '@terrestris/react-geo/dist/Window/Window';

import PrintPanelV3, { PrintConfig } from '../../PrintPanel/PrintPanelV3';
import { TooltipPlacement } from 'antd/lib/tooltip';
import { ButtonProps } from 'antd/lib/button';

import DeviceDetector from '../../../util/DeviceDetector';

interface DefaultPrintButtonProps {
  type: 'default' | 'primary' | 'ghost' | 'dashed' | 'danger' | 'link';
  shape: 'circle' | 'round';
  iconName: string;
}

interface BaseProps {
  map: any;
  tooltip: string;
  tooltipPlacement: TooltipPlacement;
  t: (arg: string) => string;
  config: PrintConfig;
  printScales: number[];
}

interface PrintButtonState {
  winVisible: boolean;
}

export type PrintButtonProps = BaseProps & Partial<DefaultPrintButtonProps> & ButtonProps;

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
    };
  }

  /**
   * Inverts visibility of print window on call.
   *
   */
  changeFullPrintWindowVisibility = () => {
    this.setState({
      winVisible: !this.state.winVisible
    });
  };

  /**
   * The render function
   */
  render() {
    const {
      t,
      type,
      shape,
      iconName,
      map,
      tooltip,
      tooltipPlacement,
      config,
      printScales
    } = this.props;
    const {
      winVisible
    } = this.state;

    const isMobile = DeviceDetector.isMobileDevice();

    if (!config) {
      return <div />;
    }

    return (
      <div>
        <SimpleButton
          type={type}
          shape={shape}
          iconName={iconName}
          tooltip={tooltip}
          tooltipPlacement={tooltipPlacement}
          onClick={this.changeFullPrintWindowVisibility}
        />
        { winVisible &&
        <Window
          onEscape={this.changeFullPrintWindowVisibility}
          title={t('PrintPanel.windowTitle')}
          width={isMobile ? 'auto' : 750}
          y={50}
          x={isMobile ? 0 : 100}
          enableResizing={false}
          collapseTooltip={t('General.collapse')}
          bounds="#app"
          tools={[
            <SimpleButton
              iconName="fas fa-times"
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
            legendBlackList={[
              'react-geo_measure',
              'hoverVectorLayer'
            ]}
            printLayerBlackList={[
              'react-geo_measure',
              'hoverVectorLayer'
            ]}
            printScales={printScales}
          />
        </Window>
        }
      </div>
    );
  }
}
