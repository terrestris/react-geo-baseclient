import * as React from 'react';
import { Modal, Descriptions } from 'antd';

import MetadataParser from '../../../util/MetadataParser';
import config from '../../../config/config';

import './Metadata.css';

import _isEmpty from 'lodash/isEmpty';

const DescrItem = Descriptions.Item;

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

    if (_isEmpty(metadata)) {
      return null;
    }

    const {
      title,
      abstract,
      topic,
      referenceDate,
      spatialRepresentationType,
      legalConstraints,
      metadataConstraints,
      onlineResource,
      orgName,
      orgWebsite,
      addressDeliveryPoint,
      addressPostalCode,
      addressCity,
      addressCountry,
      personName,
      personEmail,
      status,
      timeExtentStart,
      timeExtentEnd,
      extent
    } = metadata;

    /* eslint-disable max-len */
    return (
      <Modal
        className="metadata-modal"
        visible={true}
        footer={null}
        title={t('Modal.Metadata.modalTitle')}
        onCancel={onCancel}
      >
        {!_isEmpty(error) ?
          <div>{error}</div>
          :
          <Descriptions bordered>
            {title ? <DescrItem label={t('Modal.Metadata.title')}>{title}</DescrItem> : null}
            {abstract ? <DescrItem label={t('Modal.Metadata.abstract')} span={2}>{abstract}</DescrItem> : null}
            {topic ? <DescrItem label={t('Modal.Metadata.topic')}>{topic}</DescrItem> : null}
            {referenceDate ? <DescrItem label={t('Modal.Metadata.referenceDate')}>{referenceDate['#text']}</DescrItem> : null}
            {spatialRepresentationType ? <DescrItem label={t('Modal.Metadata.spatialRepresentationType')}>{spatialRepresentationType}</DescrItem> : null}
            {legalConstraints ? <DescrItem label={t('Modal.Metadata.legalConstraints')}>{legalConstraints}</DescrItem> : null}
            {metadataConstraints ? <DescrItem label={t('Modal.Metadata.metadataConstraints')}>{metadataConstraints}</DescrItem> : null}
            {onlineResource ? <DescrItem label={t('Modal.Metadata.onlineResource')}>{onlineResource}</DescrItem> : null}
            {orgName ? <DescrItem label={t('Modal.Metadata.orgName')}>{orgName}</DescrItem> : null}
            {orgWebsite ? <DescrItem label={t('Modal.Metadata.orgWebsite')}>{orgWebsite}</DescrItem> : null}
            {addressDeliveryPoint ? <DescrItem label={t('Modal.Metadata.addressDeliveryPoint')}>{addressDeliveryPoint}</DescrItem> : null}
            {addressPostalCode ? <DescrItem label={t('Modal.Metadata.addressPostalCode')}>{addressPostalCode}</DescrItem> : null}
            {addressCity ? <DescrItem label={t('Modal.Metadata.addressCity')}>{addressCity}</DescrItem> : null}
            {addressCountry ? <DescrItem label={t('Modal.Metadata.addressCountry')}>{addressCountry}</DescrItem> : null}
            {personName ? <DescrItem label={t('Modal.Metadata.personName')}>{personName}</DescrItem> : null}
            {personEmail ? <DescrItem label={t('Modal.Metadata.personEmail')}>{personEmail}</DescrItem> : null}
            {status ? <DescrItem label={t('Modal.Metadata.status')}>{status}</DescrItem> : null}
            {timeExtentStart ? <DescrItem label={t('Modal.Metadata.timeExtentStart')}>{timeExtentStart}</DescrItem> : null}
            {timeExtentEnd ? <DescrItem label={t('Modal.Metadata.timeExtentEnd')}>{timeExtentEnd}</DescrItem> : null}
            {extent ? <DescrItem label={t('Modal.Metadata.extent')} span={2}>
              minX: {extent.minX?.['#text'] || extent.minX}
              <br />
              minY: {extent.minY?.['#text'] || extent.minY}
              <br />
              maxX: {extent.maxX?.['#text'] || extent.maxX}
              <br />
              maxY: {extent.maxY?.['#text'] || extent.maxY}
            </DescrItem> : null}
          </Descriptions>
        }
      </Modal>

    );
  }
}

export default Metadata;
