import React, {
  useState
} from 'react';

import {
  faDownload
} from '@fortawesome/free-solid-svg-icons';
import {
  FontAwesomeIcon
} from '@fortawesome/react-fontawesome';

import {
  Alert,
  Button,
  Form,
  Input
} from 'antd';

import {
  FormProps
} from 'antd/lib/form/Form';

// import OlLayerGroup from 'ol/layer/Group';
// import OlLayer from 'ol/layer/Layer';
import OlMap from 'ol/Map';
// import OlSource from 'ol/source/Source';

import {
  useTranslation
} from 'react-i18next';

// import Logger from '@terrestris/base-util/dist/Logger';

// import MapUtil from '@terrestris/ol-util/dist/MapUtil/MapUtil';

// import CustomFieldInput from './CustomFieldInput';
// import LayoutSelect from './LayoutSelect';
// import OutputFormatSelect from './OutputFormatSelect';
// import ResolutionSelect from './ResolutionSelect';

import './PrintForm.less';

export interface Layout {
  name: string;
  attributes: any[];
}

export interface PrintFormProps extends Omit<FormProps, 'form'> {
  map?: OlMap;
  layerBlackList?: string[];
  outputFormats?: string[];
  layouts?: Layout[];
  // printManager: MapFishPrintV3Manager;
}

export const PrintForm: React.FC<PrintFormProps> = ({
  layerBlackList = [],
  map,
  ...restProps
}): JSX.Element => {
  const [form] = Form.useForm();
  const [title, setTitle] = useState<string>('');
  const {
    t
  } = useTranslation();

  const [loading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // const legendFilter = (l: OlLayer<OlSource>) => {
  //   const layerName = l.get('name');
  //   const notBlacklisted = !layerBlackList.includes(layerName);
  //   const notHidden = !l.get('hideLegendInPrint');
  //   const visible = l.getVisible() && MapUtil.layerInResolutionRange(l, map);
  //   const printableLayer = !(l instanceof OlLayerGroup);

  //   if (notBlacklisted && notHidden && visible && printableLayer) {
  //     const res = map.getView().getResolution();
  //     if (res) {
  //       l.set('customPrintLegendParams', {
  //         SCALE: MapUtil.getScaleForResolution(res, 'm')
  //       });
  //     }
  //     return true;
  //   }
  //   return false;
  // };

  const onDownloadClick = async () => {
    debugger
    return;
  };

  const onAlertClose = () => {
    setErrorMsg(null);
  };

  const layout = {
    labelCol: {
      span: 8
    },
    wrapperCol: {
      span: 16
    }
  };

  return (
    <div className="print">
      {
        errorMsg &&
        <Alert
          className="print-alert"
          message={errorMsg}
          type="error"
          closable
          showIcon
          onClose={onAlertClose}
        />
      }
      <Form
        form={form}
        className="print-form"
        layout="horizontal"
        {...layout}
        {...restProps}
      >
        <Form.Item
          name="title"
          label={'PrintForm.title'}
          initialValue={t('PrintForm.initialTitle')}
        >
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="placeholder"
            maxLength={50}
          />
        </Form.Item>
        <Form.Item
          name="comment"
          label={t('PrintForm.comment')}
        >
          {/* <CustomFieldInput
            maxLength={200}
            placeholder={t('PrintForm.commentPlaceholder')}
          /> */}
        </Form.Item>
        <Form.Item
          name="layout"
          label={t('PrintForm.layout')}
        >
          {/* <LayoutSelect
            printManager={printManager}
          /> */}
        </Form.Item>
        <Form.Item
          name="dpi"
          label={t('PrintForm.dpi')}
          initialValue={72}
        >
          {/* <ResolutionSelect
            printManager={printManager}
            placeholder={t('PrintForm.resolutionPlaceholder')}
          /> */}
        </Form.Item>
        <Form.Item
          name="format"
          label={t('PrintForm.format')}
          initialValue="pdf"
        >
          {/* <OutputFormatSelect
            // printManager={printManager}
            outputFormats={['pdf', 'png']}
            placeholder={'PrintForm.outputFormatPlaceholder'}
          /> */}
        </Form.Item>
      </Form>
      <Button
        className='print-button tool-menu-button'
        disabled={false}
        icon={<FontAwesomeIcon icon={faDownload} />}
        loading={loading}
        onClick={onDownloadClick}
      >
        {t('PrintForm.downloadBtnText')}
      </Button>
    </div>
  );
};

export default PrintForm;
