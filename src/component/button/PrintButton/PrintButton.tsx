import * as React from 'react';

import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

import isMobile from 'is-mobile';

import SimpleButton from '@terrestris/react-geo/dist/Button/SimpleButton/SimpleButton';
import Window from '@terrestris/react-geo/dist/Window/Window';

import PrintPanelV3, { PrintConfig } from '../../PrintPanel/PrintPanelV3';
import { TooltipPlacement } from 'antd/lib/tooltip';
import { ButtonProps } from 'antd/lib/button';
import OlMap from 'ol/Map';
import { uniqueId } from 'lodash';

interface DefaultPrintButtonProps {
  type: 'default' | 'primary' | 'ghost' | 'dashed' | 'danger' | 'link';
  shape: 'circle' | 'round';
  iconName: IconProp;
}

interface BaseProps {
  map: OlMap;
  tooltip: string;
  tooltipPlacement: TooltipPlacement;
  t: (arg: string) => string;
  config: PrintConfig;
  printScales: number[];
  printTitle: string;
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
      printScales,
      printTitle
    } = this.props;
    const {
      winVisible
    } = this.state;

    if (!config) {
      return <div />;
    }

    const isMobileClient = isMobile({ tablet: true });

    return (
      <div>
        <SimpleButton
          type={type}
          shape={shape}
          icon={
            <FontAwesomeIcon
              icon={iconName}
            />
          }
          tooltip={tooltip}
          tooltipPlacement={tooltipPlacement}
          onClick={this.changeFullPrintWindowVisibility}
        />
        {
          winVisible &&
          <Window
            id={uniqueId('window-')}
            parentId={'app'}
            resizeOpts={false}
            collapsible={true}
            draggable={true}
            collapsed={false}
            titleBarHeight={37.5}
            onEscape={this.changeFullPrintWindowVisibility}
            title={t('PrintPanel.windowTitle')}
            width={isMobileClient ? window.innerWidth: 750}
            height="auto"
            y={50}
            x={isMobileClient ? 0 : 100}
            enableResizing={false}
            collapseTooltip={t('General.collapse')}
            bounds="#app"
            tools={[
              <SimpleButton
                icon={
                  <FontAwesomeIcon
                    icon={faTimes}
                  />
                }
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
              printTitle={printTitle}
              legendBlackList={[
                'react-geo_measure',
                'hoverVectorLayer'
              ]}
              printLayerBlackList={[
                'react-geo_measure',
                'hoverVectorLayer',
                'react-geo_geolocationlayer'
              ]}
              printScales={printScales}
            />
          </Window>
        }
      </div>
    );
  }
}
