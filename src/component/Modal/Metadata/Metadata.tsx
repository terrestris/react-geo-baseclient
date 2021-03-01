import * as React from 'react';
import { Modal, Descriptions } from 'antd';

import MetadataParser from '../../../util/MetadataParser';
import config from '../../../config/config';

import './Metadata.css';

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
    const url = config.getBasePath() + 'metadata/getRecordByUuid.action?uuid=' + uuid + '&outputFormat=json';
    fetch(url)
      .then(response => response.json())
      .then(json => {
        const metaData = MetadataParser.parseCswRecord(json);
        this.setState({
          metadata: metaData
        });
      })
      .catch(() => {
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
      return (
        <div/>
      );
    }

    /* eslint-disable max-len */
    return (
      <Modal
        className="metadata-modal"
        visible={true}
        footer={null}
        title={t('Modal.Metadata.modalTitle')}
        onCancel={onCancel}
      >
        {!isEmpty(error) ?
          <div>{error}</div>
          :
          <Descriptions bordered>
            {metadata.title ? <Descriptions.Item label={t('Modal.Metadata.title')}>{metadata.title}</Descriptions.Item> : null}
            {metadata.abstract ? <Descriptions.Item label={t('Modal.Metadata.abstract')} span={2}>{metadata.abstract}</Descriptions.Item> : null }
            {metadata.topic ? <Descriptions.Item label={t('Modal.Metadata.topic')}>{metadata.topic}</Descriptions.Item> : null }
            {metadata.referenceDate ? <Descriptions.Item label={t('Modal.Metadata.referenceDate')}>{metadata.referenceDate['#text']}</Descriptions.Item> : null }
            {metadata.spatialRepresentationType ? <Descriptions.Item label={t('Modal.Metadata.spatialRepresentationType')}>{metadata.spatialRepresentationType}</Descriptions.Item> : null }
            {metadata.legalConstraints ? <Descriptions.Item label={t('Modal.Metadata.legalConstraints')}>{metadata.legalConstraints}</Descriptions.Item> : null }
            {metadata.metadataConstraints ? <Descriptions.Item label={t('Modal.Metadata.metadataConstraints')}>{metadata.metadataConstraints}</Descriptions.Item> : null }
            {metadata.onlineResource ? <Descriptions.Item label={t('Modal.Metadata.onlineResource')}>{metadata.onlineResource}</Descriptions.Item> : null }
            {metadata.orgName ? <Descriptions.Item label={t('Modal.Metadata.orgName')}>{metadata.orgName}</Descriptions.Item> : null }
            {metadata.orgWebsite ? <Descriptions.Item label={t('Modal.Metadata.orgWebsite')}>{metadata.orgWebsite}</Descriptions.Item> : null }
            {metadata.addressDeliveryPoint ? <Descriptions.Item label={t('Modal.Metadata.addressDeliveryPoint')}>{metadata.addressDeliveryPoint}</Descriptions.Item> : null }
            {metadata.addressPostalCode ? <Descriptions.Item label={t('Modal.Metadata.addressPostalCode')}>{metadata.addressPostalCode}</Descriptions.Item> : null }
            {metadata.addressCity ? <Descriptions.Item label={t('Modal.Metadata.addressCity')}>{metadata.addressCity}</Descriptions.Item> : null }
            {metadata.addressCountry ? <Descriptions.Item label={t('Modal.Metadata.addressCountry')}>{metadata.addressCountry}</Descriptions.Item> : null }
            {metadata.personName ? <Descriptions.Item label={t('Modal.Metadata.personName')}>{metadata.personName}</Descriptions.Item> : null }
            {metadata.personEmail ? <Descriptions.Item label={t('Modal.Metadata.personEmail')}>{metadata.personEmail}</Descriptions.Item> : null }
            {metadata.status ? <Descriptions.Item label={t('Modal.Metadata.status')}>{metadata.status}</Descriptions.Item> : null }
            {metadata.timeExtentStart ? <Descriptions.Item label={t('Modal.Metadata.timeExtentStart')}>{metadata.timeExtentStart}</Descriptions.Item> : null }
            {metadata.timeExtentEnd ? <Descriptions.Item label={t('Modal.Metadata.timeExtentEnd')}>{metadata.timeExtentEnd}</Descriptions.Item> : null }
            {metadata.extent ? <Descriptions.Item label={t('Modal.Metadata.extent')} span={2}>
              minX: {metadata.extent.minX?.['#text'] || metadata.extent.minX}
              <br />
              minY: {metadata.extent.minY?.['#text'] || metadata.extent.minY}
              <br />
              maxX: {metadata.extent.maxX?.['#text'] || metadata.extent.maxX}
              <br />
              maxY: {metadata.extent.maxY?.['#text'] || metadata.extent.maxY}
            </Descriptions.Item> : null }
          </Descriptions>
        }
      </Modal>

    );
  }
}

export default Metadata;
