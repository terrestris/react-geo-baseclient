import React, { useState } from 'react';

import SimpleButton, { SimpleButtonProps } from '@terrestris/react-geo/dist/Button/SimpleButton/SimpleButton';
import Window from '@terrestris/react-geo/dist/Window/Window';

import Button, { ButtonProps } from 'antd/lib/button';
import { message } from 'antd';

import PermalinkUtil from '@terrestris/ol-util/dist/PermalinkUtil/PermalinkUtil';

import copy from 'copy-to-clipboard';

import './PermalinkButton.css';

interface DefaultPermalinkButtonProps extends SimpleButtonProps{
  shape: 'circle' | 'round';
}

interface BaseProps {
  map: any;
  t: (arg: string) => string;
  getLink?: () => string;
}

export type PermalinkButtonProps = BaseProps & Partial<DefaultPermalinkButtonProps> & ButtonProps;

/**
 * Function component representing the PermalinkButton.
 * Opens window which creates a permalink.
 * @param props The props for this component
 */
export default function PermalinkButton(props: PermalinkButtonProps) {

  const [winVisible, setWinVisible] = useState(false);

  const {
    t,
    type,
    shape,
    iconName,
    map,
    tooltip,
    tooltipPlacement,
    getLink
  } = props;

  /**
   * Copy the permalink to clipboard
   */
  function copyToClipBoard() {
    const linkInput: HTMLInputElement = document.querySelector(
      '.permalink input');
    if (linkInput) {
      const success = copy(linkInput.value);
      if (success) {
        message.info(t('Permalink.copiedToClipboard'));
      } else {
        message.info(t('Permalink.copyToClipboardFailed'));
      }
    }
  }

  return (
    <div>
      <SimpleButton
        type={type}
        shape={shape}
        iconName={iconName}
        tooltip={tooltip}
        tooltipPlacement={tooltipPlacement}
        onClick={() => setWinVisible(!winVisible)}
      />
      { winVisible &&
    <Window
      onEscape={() => setWinVisible(!winVisible)}
      title={t('Permalink.windowTitle')}
      width={750}
      y={50}
      x={100}
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
      <div
        className="permalink"
      >
        <label
          htmlFor="permalink"
        >
          {t('Permalink.label')}:
        </label>
        <input
          readOnly
          id="permalink"
          type="text"
          value={getLink ? getLink() : PermalinkUtil.getLink(map)}
        />
        <Button
          onClick={copyToClipBoard}
        >
          {t('Permalink.copy')}
        </Button>
      </div>
    </Window>
      }
    </div>
  );
}

/**
 * The default properties.
 */
PermalinkButton.defaultProps = {
  type: 'primary',
  shape: 'circle',
  iconName: 'fas fa-link'
};
