import * as React from 'react';
import { Modal, Descriptions } from 'antd';

import MetadataParser from '../../../util/MetadataParser';

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
        const metaData = MetadataParser.parseCswRecord(json);
        this.setState({
          metadata: metaData
        });
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);
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
      onCancel
    } = this.props;

    const {
      metadata,
      error
    } = this.state;

    if (isEmpty(metadata)) {
      return(
        <div></div>
      );
    }

    /* eslint-disable max-len */
    return (
      <Modal
        className="metadata-modal"
        visible={true}
        footer={null}
        title={t('Modal.Metadata.title')}
        onCancel={onCancel}
      >
        {!isEmpty(error) ?
          <div>{error}</div>
          :
          <Descriptions bordered>
            {metadata.title ? <Descriptions.Item label="Title:">{metadata.title}</Descriptions.Item> : null}
            {metadata.abstract ? <Descriptions.Item label="Abstract:" span={3}>{metadata.abstract}</Descriptions.Item> : null }
            {metadata.topic ? <Descriptions.Item label="Topic:">{metadata.topic}</Descriptions.Item> : null }
            {metadata.referenceDate ? <Descriptions.Item label="Reference Date:">{metadata.referenceDate['#text']}</Descriptions.Item> : null }
            {metadata.spatialRepresentationType ? <Descriptions.Item label="Spatial Representation Type:">{metadata.spatialRepresentationType}</Descriptions.Item> : null }
            {metadata.legalConstraints ? <Descriptions.Item label="Legal Constraints:">{metadata.legalConstraints}</Descriptions.Item> : null }
            {metadata.metadataConstraints ? <Descriptions.Item label="Metadata Constraints:">{metadata.metadataConstraints}</Descriptions.Item> : null }
            {metadata.onlineResource ? <Descriptions.Item label="Online Resource:">{metadata.onlineResource}</Descriptions.Item> : null }
            {metadata.orgName ? <Descriptions.Item label="Organisation Name:">{metadata.orgName}</Descriptions.Item> : null }
            {metadata.orgWebsite ? <Descriptions.Item label="Organisation Website:">{metadata.orgWebsite}</Descriptions.Item> : null }
            {metadata.addressDeliveryPoint ? <Descriptions.Item label="Address Delivery Point:">{metadata.addressDeliveryPoint}</Descriptions.Item> : null }
            {metadata.addressPostalCode ? <Descriptions.Item label="Address Postal Code:">{metadata.addressPostalCode}</Descriptions.Item> : null }
            {metadata.addressCity ? <Descriptions.Item label="Address City:">{metadata.addressCity}</Descriptions.Item> : null }
            {metadata.addressCountry ? <Descriptions.Item label="Address Country:">{metadata.addressCountry}</Descriptions.Item> : null }
            {metadata.personName ? <Descriptions.Item label="Person Name:">{metadata.personName}</Descriptions.Item> : null }
            {metadata.personEmail ? <Descriptions.Item label="Person Email:">{metadata.personEmail}</Descriptions.Item> : null }
            {metadata.status ? <Descriptions.Item label="Status:">{metadata.status}</Descriptions.Item> : null }
            {metadata.timeExtentStart ? <Descriptions.Item label="Time Extent Start:">{metadata.timeExtentStart}</Descriptions.Item> : null }
            {metadata.timeExtentEnd ? <Descriptions.Item label="Time Extent End:">{metadata.timeExtentEnd}</Descriptions.Item> : null }
            {metadata.extent ? <Descriptions.Item label="Geographical Extent:" span={3}>
              minX: {metadata.extent.minX['#text']}
              <br />
              minY: {metadata.extent.minY['#text']}
              <br />
              maxX: {metadata.extent.maxX['#text']}
              <br />
              maxy: {metadata.extent.maxY['#text']}
            </Descriptions.Item> : null }
          </Descriptions>
        }
      </Modal>

    );
  }
}

export default Metadata;
