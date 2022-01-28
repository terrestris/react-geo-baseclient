import * as React from 'react';
import {
  Card,
  Col,
  Descriptions,
  Divider,
  Modal,
  Row
} from 'antd';

import MetadataParser from '../../../util/MetadataParser';
import config from '../../../config/config';

import _isEmpty from 'lodash/isEmpty';

import './Metadata.css';

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
    const url = config.getBackendPath() + 'metadata/getRecordByUuid.action?uuid=' + uuid + '&outputFormat=json';
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
   * Generates clickable link for given resource.
   * @param url
   * @returns
   */
  getLink(url: string): React.ReactElement | string {
    if (url.indexOf('http') > -1) {
      return <a className="link" href={url} target='_blank'>Link</a>;
    } else {
      return url;
    }
  }

  /**
   * Generates clicklable e-mail link for given resource.
   * @param email
   * @returns
   */
  getEmail(email: string): React.ReactElement | string {
    const emailRegex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    if (emailRegex.test(email)) {
      return <a className="link" href={`mailto:${email}`}>E-Mail</a>;
    } else {
      return email;
    }
  }

  /**
   * Check if at least one data entry for current metadata block is set.
   * If not, hides the medatada block completely.
   *
   * @param metadataBlock
   * @returns
   */
  checkVisibility(metadataBlock: string): boolean {
    const {
      title,
      abstract,
      topic,
      referenceDate,
      spatialRepresentationType,
      legalConstraints,
      metadataConstraints,
      onlineResource,
      dataSource,
      publications,
      status,
      orgName,
      orgWebsite,
      addressDeliveryPoint,
      addressPostalCode,
      addressCity,
      addressCountry,
      personName,
      personEmail,
      timeExtentStart,
      timeExtentEnd,
      extent
    } = this.state.metadata;

    const {
      minX,
      minY,
      maxX,
      maxY
    } = extent;


    switch (metadataBlock) {
      case 'general':
        return title || abstract || topic || referenceDate ||
          spatialRepresentationType || legalConstraints || metadataConstraints ||
          onlineResource || dataSource || publications || status;
      case 'organisation':
        return orgName || orgWebsite;
      case 'address':
        return addressDeliveryPoint || addressPostalCode || addressCity || addressCountry;
      case 'responsiblePerson':
        return personName || personEmail;
      case 'timeExtent':
        return timeExtentStart || timeExtentEnd;
      case 'extent':
        return extent && (minX || minY || maxX || maxY);
      default:
        break;
    }
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
      dataSource,
      publications,
      status,
      orgName,
      orgWebsite,
      addressDeliveryPoint,
      addressPostalCode,
      addressCity,
      addressCountry,
      personName,
      personEmail,
      timeExtentStart,
      timeExtentEnd,
      extent
    } = metadata;

    return (
      <Modal
        className="metadata-modal"
        visible={true}
        footer={null}
        title={t('Modal.Metadata.modalTitle')}
        onCancel={onCancel}
      >
        {
          !_isEmpty(error) ?
            <div>{error}</div>
            :
            <Row className="left-container" gutter={8}>
              {
                this.checkVisibility('general') &&
                <Col md={24} lg={12}>
                  <Card
                    title={t('Modal.Metadata.generalMetadata')}
                    size="small"
                  >
                    <Descriptions bordered size="small" column={1}>
                      {
                        title &&
                        <DescrItem label={t('Modal.Metadata.title')}
                        >
                          {title}
                        </DescrItem>
                      }
                      {
                        abstract &&
                        <DescrItem label={t('Modal.Metadata.abstract')}>
                          {abstract}
                        </DescrItem>}
                      {
                        topic &&
                        <DescrItem label={t('Modal.Metadata.topic')}>
                          {topic}
                        </DescrItem>
                      }
                      {
                        referenceDate &&
                        <DescrItem label={t('Modal.Metadata.referenceDate')}>
                          {referenceDate || referenceDate['#text']}
                        </DescrItem>
                      }
                      {
                        spatialRepresentationType &&
                        <DescrItem label={t('Modal.Metadata.spatialRepresentationType')}>
                          {spatialRepresentationType}
                        </DescrItem>
                      }
                      {
                        legalConstraints &&
                        <DescrItem label={t('Modal.Metadata.legalConstraints')}>
                          {legalConstraints}
                        </DescrItem>
                      }
                      {
                        metadataConstraints &&
                        <DescrItem label={t('Modal.Metadata.metadataConstraints')}>
                          {metadataConstraints}
                        </DescrItem>
                      }
                      {
                        onlineResource &&
                        <DescrItem label={t('Modal.Metadata.onlineResource')}>
                          {this.getLink(onlineResource)}
                        </DescrItem>
                      }
                      {
                        dataSource &&
                        <DescrItem label={t('Modal.Metadata.dataSource')}>
                          {this.getLink(dataSource)}
                        </DescrItem>
                      }
                      {
                        publications &&
                        <DescrItem label={t('Modal.Metadata.publications')}>
                          {this.getLink(publications)}
                        </DescrItem>
                      }
                      {
                        status &&
                        <DescrItem label={t('Modal.Metadata.status')}>
                          {status}
                        </DescrItem>
                      }
                    </Descriptions>
                  </Card>
                </Col>
              }
              <Col md={24} lg={12} className="right-container">
                {
                  (this.checkVisibility('organisation') || this.checkVisibility('address')) &&
                  <Card
                    title={t('Modal.Metadata.organisation')}
                    size="small"
                  >
                    {
                      this.checkVisibility('organisation') &&
                      <Descriptions bordered size="small" column={1}>
                        {
                          orgName &&
                          <DescrItem label={t('Modal.Metadata.orgName')}>
                            {orgName}
                          </DescrItem>
                        }
                        {
                          orgWebsite &&
                          <DescrItem label={t('Modal.Metadata.orgWebsite')}>
                            {this.getLink(orgWebsite)}
                          </DescrItem>
                        }
                      </Descriptions>
                    }
                    {
                      this.checkVisibility('address') &&
                      <>
                        <Divider orientation="left" plain>
                          {t('Modal.Metadata.address')}
                        </Divider>
                        <Descriptions bordered size="small" column={2}>
                          {
                            addressDeliveryPoint &&
                            <DescrItem label={t('Modal.Metadata.addressDeliveryPoint')}>
                              {addressDeliveryPoint}
                            </DescrItem>
                          }
                          {
                            addressPostalCode &&
                            <DescrItem label={t('Modal.Metadata.addressPostalCode')}>
                              {addressPostalCode}
                            </DescrItem>
                          }
                          {
                            addressCity &&
                            <DescrItem label={t('Modal.Metadata.addressCity')}>
                              {addressCity}
                            </DescrItem>
                          }
                          {
                            addressCountry &&
                            <DescrItem label={t('Modal.Metadata.addressCountry')}>
                              {addressCountry}
                            </DescrItem>
                          }
                        </Descriptions>
                      </>
                    }
                  </Card>
                }
                {
                  this.checkVisibility('responsiblePerson') &&
                  <Card
                    title={t('Modal.Metadata.responsiblePerson')}
                    size="small"
                  >
                    <Descriptions bordered size="small" column={1}>
                      {
                        personName &&
                        <DescrItem label={t('Modal.Metadata.personName')}>
                          {personName}
                        </DescrItem>
                      }
                      {
                        personEmail &&
                        <DescrItem label={t('Modal.Metadata.personEmail')}>
                          {this.getEmail(personEmail)}
                        </DescrItem>
                      }
                    </Descriptions>
                  </Card>
                }
                {
                  this.checkVisibility('timeExtent') &&
                  <Card
                    title={t('Modal.Metadata.timeExtent')}
                    size="small"
                  >
                    <Descriptions bordered size="small" column={2}>
                      {
                        timeExtentStart &&
                        <DescrItem label={t('Modal.Metadata.timeExtentStart')}>
                          {timeExtentStart}
                        </DescrItem>
                      }
                      {
                        timeExtentEnd &&
                        <DescrItem label={t('Modal.Metadata.timeExtentEnd')}>
                          {timeExtentEnd}
                        </DescrItem>
                      }
                    </Descriptions>
                  </Card>
                }
                {
                  this.checkVisibility('extent') &&
                  <Card
                    title={t('Modal.Metadata.extent')}
                    size="small"
                  >
                    <Descriptions bordered size="small" column={2}>
                      <DescrItem label={'minX'}>
                        {extent.minX?.['#text'] || extent.minX}
                      </DescrItem>
                      <DescrItem label={'minY'}>
                        {extent.minY?.['#text'] || extent.minY}
                      </DescrItem>
                      <DescrItem label={'maxX'}>
                        {extent.maxX?.['#text'] || extent.maxX}
                      </DescrItem>
                      <DescrItem label={'maxY'}>
                        {extent.maxY?.['#text'] || extent.maxY}
                      </DescrItem>
                    </Descriptions>
                  </Card>
                }
              </Col>
            </Row>
        }
      </Modal>

    );
  }
}

export default Metadata;
