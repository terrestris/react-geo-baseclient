import React, { useState } from 'react';

import SimpleButton, { SimpleButtonProps } from '@terrestris/react-geo/dist/Button/SimpleButton/SimpleButton';
import Window from '@terrestris/react-geo/dist/Window/Window';

import { ButtonProps } from 'antd/lib/button';

import { faLink, faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import PermalinkUtil from '@terrestris/ol-util/dist/PermalinkUtil/PermalinkUtil';

import OlMap from 'ol/Map';

import Permalink from '../../Permalink/Permalink';
import { uniqueId } from 'lodash';

interface DefaultPermalinkButtonProps extends SimpleButtonProps {
  shape: 'circle' | 'round';
}

interface BaseProps {
  map: OlMap;
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
        icon={
          <FontAwesomeIcon
            icon={faLink}
          />
        }
        tooltip={tooltip}
        tooltipPlacement={tooltipPlacement}
        onClick={() => setWinVisible(!winVisible)}
      />
      {
        winVisible &&
        <Window
          id={uniqueId('window-')}
          parentId={'app'}
          resizeOpts={false}
          collapsible={false}
          draggable={true}
          collapsed={false}
          titleBarHeight={37.5}
          onEscape={() => setWinVisible(!winVisible)}
          title={t('Permalink.windowTitle')}
          width={750}
          height="auto"
          y={windowPosition && windowPosition[1] || 50}
          x={windowPosition && windowPosition[0] || 100}
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
