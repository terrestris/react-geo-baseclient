import * as React from 'react';
import { Modal } from 'antd';

import './Help.less';

interface HelpProps {
  helpPdf: string;
  onCancel: (arg: any) => void;
  t: (arg: string) => {};
}

/**
 * The Modal Help component
 *
 */
export class Help extends React.Component<HelpProps> {

  /**
   *
   */
  constructor(props: HelpProps) {
    super(props);
  }

  /**
   * The render function
   */
  render() {
    const {
      t,
      helpPdf,
      onCancel
    } = this.props;

    return (
      <Modal
        className="help-modal"
        visible={true}
        footer={null}
        title={t('Modal.Help.title')}
        onCancel={onCancel}
      >
        <iframe
            src={helpPdf}
            width="100%"
        />
      </Modal>

    );
  }
}

export default Help;
