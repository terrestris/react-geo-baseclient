import React, { useState } from 'react';

import SimpleButton, { SimpleButtonProps } from '@terrestris/react-geo/dist/Button/SimpleButton/SimpleButton';
import Window from '@terrestris/react-geo/dist/Window/Window';

import { ButtonProps } from 'antd/lib/button';

import PermalinkUtil from '@terrestris/ol-util/dist/PermalinkUtil/PermalinkUtil';

import Permalink from '../../Permalink/Permalink';

interface DefaultPermalinkButtonProps extends SimpleButtonProps {
  shape: 'circle' | 'round';
}

interface BaseProps {
  map: any;
  t: (arg: string) => string;
  getLink?: () => any;
  windowPosition?: [number, number];
}

export type PermalinkButtonProps = BaseProps & Partial<DefaultPermalinkButtonProps> & ButtonProps;

/**
 * Function component representing the PermalinkButton.
 * Opens window which creates a permalink.
 * @param props The props for this component
 */
export const PermalinkButton: React.FC<PermalinkButtonProps> = ({
  t,
  type = 'primary',
  shape = 'circle',
  iconName = 'fas fa-link',
  map,
  tooltip,
  tooltipPlacement,
  getLink = undefined,
  windowPosition
}) => {

  const [winVisible, setWinVisible] = useState(false);

  return (
    <>
      <SimpleButton
        type={type}
        shape={shape}
        iconName={iconName}
        tooltip={tooltip}
        tooltipPlacement={tooltipPlacement}
        onClick={() => setWinVisible(!winVisible)}
      />
      {
        winVisible &&
        <Window
          onEscape={() => setWinVisible(!winVisible)}
          title={t('Permalink.windowTitle')}
          width={750}
          y={windowPosition && windowPosition[1] || 50}
          x={windowPosition && windowPosition[0] || 100}
          enableResizing={false}
          collapseTooltip={t('General.collapse')}
          bounds="#app"
          tools={[
            <SimpleButton
              iconName="fas fa-times"
              key="close-tool"
              size="small"
              tooltip={t('General.close')}
              onClick={() => setWinVisible(!winVisible)}
            />
          ]}
        >
          <Permalink
            getLink={getLink ? getLink : () => PermalinkUtil.getLink(map)}
            t={t}
          />
        </Window>
      }
    </>
  );
};

export default PermalinkButton;
