import ObjectUtil from '@terrestris/base-util/dist/ObjectUtil/ObjectUtil';

/**
 * A class containing CSW metadata parser by mapping of ISO fields to
 * human-readable keys.
 *
 * @class
 */
export default class MetadataParser {

  /**
   * Parses relevant fields of retrieved metadata record to more comfortable
   * json format
   *
   * @static
   * @memberof MetadataParser
   */
  static parseCswRecord(cswRec: any): any {
    const extent = ObjectUtil.getValue('gmd:EX_GeographicBoundingBox', cswRec);
    let minX, minY, maxX, maxY;
    if (extent) {
      minX = extent['gmd:westBoundLongitude']?.['gco:Decimal'];
      minY = extent['gmd:southBoundLatitude']?.['gco:Decimal'];
      maxX = extent['gmd:eastBoundLongitude']?.['gco:Decimal'];
      maxY = extent['gmd:northBoundLatitude']?.['gco:Decimal'];
    }

    /* eslint-disable max-len */
    return {
      uuid: cswRec['gmd:fileIdentifier']?.['gco:CharacterString'],
      title: ObjectUtil.getValue('gmd:title', cswRec)?.['gco:CharacterString'],
      abstract: ObjectUtil.getValue('gmd:abstract', cswRec)?.['gco:CharacterString'],
      topic: ObjectUtil.getValue('gmd:topicCategory', cswRec)?.['gmd:MD_TopicCategoryCode'],
      referenceDate: ObjectUtil.getValue('gmd:CI_Citation', cswRec)?.['gmd:date']?.['gmd:CI_Date']?.['gmd:date']?.['gco:Date'],
      spatialRepresentationType: ObjectUtil.getValue('gmd:MD_SpatialRepresentationTypeCode', cswRec)?.codeListValue,
      legalConstraints: ObjectUtil.getValue('gmd:MD_LegalConstraints', cswRec)?.['gmd:useLimitation']?.['gco:CharacterString'],
      metadataConstraints: ObjectUtil.getValue('gmd:MD_Constraints', cswRec)?.['gmd:useLimitation']?.['gco:CharacterString'],
      onlineResource: ObjectUtil.getValue('gmd:MD_DigitalTransferOptions', cswRec)?.['gmd:onLine']?.['gmd:CI_OnlineResource']?.['gmd:linkage']?.['gmd:URL'],
      orgName: ObjectUtil.getValue('gmd:organisationName', cswRec)?.['gco:CharacterString'],
      orgWebsite: ObjectUtil.getValue('gmd:CI_OnlineResource', cswRec)?.['gmd:linkage']?.['gmd:URL'],
      addressDeliveryPoint: ObjectUtil.getValue('gmd:deliveryPoint', cswRec)?.['gco:CharacterString'],
      addressPostalCode: ObjectUtil.getValue('gmd:postalCode', cswRec)?.['gco:CharacterString'],
      addressCity: ObjectUtil.getValue('gmd:city', cswRec)?.['gco:CharacterString'],
      addressCountry: ObjectUtil.getValue('gmd:country', cswRec)?.['gco:CharacterString'],
      personName: ObjectUtil.getValue('gmd:individualName', cswRec)?.['gco:CharacterString'],
      personEmail: ObjectUtil.getValue('gmd:electronicMailAddress', cswRec)?.['gco:CharacterString'],
      status: ObjectUtil.getValue('gmd:MD_ProgressCode', cswRec)?.codeListValue,
      timeExtentStart: ObjectUtil.getValue('gml:TimePeriod', cswRec)?.['gml:beginPosition'],
      timeExtentEnd: ObjectUtil.getValue('gml:TimePeriod', cswRec)?.['gml:endPosition'],
      extent: {
        minX,
        minY,
        maxX,
        maxY,
        src: ObjectUtil.getValue('gmd:RS_Identifier', cswRec)?.['gmd:code']?.['gco:CharacterString'],
      },
      featureTypeName: ObjectUtil.getValue('gmd:MD_Identifier', cswRec)?.['gmd:code']?.['gco:CharacterString'],
      featureTypeAttribution: ObjectUtil.getValue('gmd:otherCitationDetails', cswRec)?.['gco:CharacterString'],
      capabilitiesUrl: ObjectUtil.getValue('srv:SV_OperationMetadata', cswRec)?.['srv:connectPoint']?.['gmd:CI_OnlineResource']?.['gmd:linkage']?.['gmd:URL'],
      graphicOverviewUrl: ObjectUtil.getValue('gmd:MD_DataIdentification', cswRec)?.['gmd:graphicOverview']?.['gmd:MD_BrowseGraphic']?.['gmd:fileName']?.['gco:CharacterString'],
      credit: ObjectUtil.getValue('gmd:MD_DataIdentification', cswRec)?.['gmd:credit']?.['gco:CharacterString'],
      supplementalInformation: ObjectUtil.getValue('gmd:MD_DataIdentification', cswRec)?.['gmd:supplementalInformation']?.['gco:CharacterString'],
      serviceType: ObjectUtil.getValue('srv:SV_ServiceIdentification', cswRec)?.['srv:serviceType']
    };
  }
}
