import * as React from 'react';
import { Modal } from 'antd';

import './Metadata.less';

interface MetadataProps {
  layer: any;
  onCancel: (arg: any) => void;
  t: (arg: string) => {};
}

/**
 * The Modal Metadata component
 *
 */
export class Metadata extends React.Component<MetadataProps> {

  /**
   *
   */
  constructor(props: MetadataProps) {
    super(props);
  }

  /**
   * The render function
   */
  render() {
    const {
      t,
      layer,
      onCancel
    } = this.props;

    return (
      <Modal
        className="metadata-modal"
        visible={layer}
        footer={null}
        title={t('Modal.Metadata.title')}
        onCancel={onCancel}
      >
        {/* {console.log(layer.get('name'))} */}
      </Modal>

    );
  }
}

export default Metadata;
