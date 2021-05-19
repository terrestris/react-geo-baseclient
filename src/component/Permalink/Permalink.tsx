import React from 'react';

import Button  from 'antd/lib/button';
import { message } from 'antd';

import copy from 'copy-to-clipboard';

import './Permalink.css';

interface PermalinkProps {
  t: (arg: string) => string;
  getLink: () => string;
}

/**
 * Function component for permalink panel.
 */
export const Permalink: React.FC<PermalinkProps> = ({
  t,
  getLink
}): React.ReactElement => {

  /**
   * Copy the permalink to clipboard
   */
  const copyToClipBoard = () => {
    const linkInput: HTMLInputElement = document.querySelector('.permalink input');
    if (linkInput) {
      const success = copy(linkInput.value);
      if (success) {
        message.info(t('Permalink.copiedToClipboard'));
      } else {
        message.info(t('Permalink.copyToClipboardFailed'));
      }
    }
  };

  return (
    <div className="permalink">
      <label htmlFor="permalink">
        {t('Permalink.label')}:
      </label>
      <input
        readOnly
        id="permalink"
        type="text"
        value={getLink()}
      />
      <Button
        onClick={copyToClipBoard}
      >
        {t('Permalink.copy')}
      </Button>
    </div>
  );
};

export default Permalink;
