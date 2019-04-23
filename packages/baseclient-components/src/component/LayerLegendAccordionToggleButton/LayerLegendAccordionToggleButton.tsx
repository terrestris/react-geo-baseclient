import * as React from 'react';

import {
  ToggleButton
} from '@terrestris/react-geo';

interface DefaultLayerLegendAccordionToggleButtonProps {

};

interface LayerLegendAccordionToggleButtonProps extends Partial<DefaultLayerLegendAccordionToggleButtonProps>{
  t: (arg: string) => string;
  onToggle: (pressed: boolean) => void;
  pressed: boolean;
}

interface LayerLegendAccordionToggleButtonState {

}

/**
 *
 * @class LayerLegendAccordionToggleButton
 * @extends {React.PureComponent<LayerLegendAccordionToggleButtonProps, LayerLegendAccordionToggleButtonState>}
 */
class LayerLegendAccordionToggleButton extends React.PureComponent<LayerLegendAccordionToggleButtonProps, LayerLegendAccordionToggleButtonState> {

  /**
   * Create the LayerLegendAccordionToggleButton.
   *
   * @constructs LayerLegendAccordionToggleButton
   */
  constructor(props: LayerLegendAccordionToggleButtonProps) {
    super(props);
  }

  /**
   *
   * @param The default props
   */
  public static defaultProps: LayerLegendAccordionToggleButtonProps = {
    t: (t: string) => t,
    onToggle: () => { },
    pressed: false
  };

  render() {
    const {
      t,
      onToggle,
      pressed
    } = this.props;

    return (
      <ToggleButton
        icon="list"
        shape="circle"
        className="react-geo-baseclient-layer-toggle-btn"
        tooltip={t('LayerLegendAccordion.collapseAccordionTooltipText')}
        onToggle={onToggle}
        pressed={pressed}
      />
    );
  }
}

export default LayerLegendAccordionToggleButton;
