import * as React from 'react';
import { Modal, Descriptions } from 'antd';

import './Metadata.less';

const isEmpty = require('lodash/isEmpty');

interface MetadataProps {
  layer: any;
  onCancel: (arg: any) => void;
  t: (arg: string) => {};
}

interface MetadataState {
  metadata: any;
  error: string;
}

/**
 * The Modal Metadata component
 *
 */
export class Metadata extends React.Component<MetadataProps, MetadataState> {

  /**
   *
   */
  constructor(props: MetadataProps) {
    super(props);

    this.state = {
      metadata: {},
      error: ''
    };
  }

  /**
   * Called on lifecycle componentDidMount.
   */
  componentDidMount() {
    this.fetchMetadata(this.props.layer.get('metadataIdentifier'));
  }

  /**
   * Fetch metadata by uuid from GNOS
   * @param layer
   */
  fetchMetadata(uuid: string) {
    const url = '/globewq-webapp/metadata/getRecordByUuid.action?uuid=' + uuid + '&outputFormat=json';
    fetch(url)
      .then(response => response.json())
      .then(json => {
        console.log(json);


        this.setState({
            metadata: json['csw:Record']
        });
      })
      .catch(error => {
        this.setState({
            error: 'Error on fetching metadata'
        });
      });
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

    const {
        metadata,
        error
    } = this.state;

    if (!metadata) {
        return;
    }

    return (
      <Modal
        className="metadata-modal"
        visible={layer}
        footer={null}
        title={t('Modal.Metadata.title')}
        onCancel={onCancel}
      >
      {!isEmpty(error) ?
        <div>{error}</div>
        :
        <Descriptions bordered>
          <Descriptions.Item label="Title:">{metadata['dc:title']}</Descriptions.Item>
          <Descriptions.Item label="Description:" span={3}>{metadata['dc:description']}</Descriptions.Item>
          <Descriptions.Item label="Abstract:" span={3}>{metadata['dc:abstract']}</Descriptions.Item>
          <Descriptions.Item label="Subject:">{metadata['dc:subject']}</Descriptions.Item>
          <Descriptions.Item label="Language:">{metadata['dc:language']}</Descriptions.Item>
          <Descriptions.Item label="Identifier:">{metadata['dc:identifier']}</Descriptions.Item>
          <Descriptions.Item label="Identifier:">{metadata['dc:identifier']}</Descriptions.Item>
          <Descriptions.Item label="Time Period:">{metadata['dc:timePeriod']}</Descriptions.Item>
        </Descriptions>
      }
      </Modal>

    );
  }
}

export default Metadata;
