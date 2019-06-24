import * as React from 'react';

import ToggleButton from '@terrestris/react-geo/dist/Button/ToggleButton/ToggleButton';

interface DefaultLayerLegendAccordionToggleButtonProps {
  shape: string,
  icon: string,
  className: string
};

interface LayerLegendAccordionToggleButtonProps extends Partial<DefaultLayerLegendAccordionToggleButtonProps>{
  onToggle: (pressed: boolean) => void,
  tooltip: string,
  pressed: boolean
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
    onToggle: () => { },
    pressed: false,
    shape: 'circle',
    icon: 'list',
    tooltip: '',
    className: 'react-geo-baseclient-layer-toggle-btn'
  };

  render() {
    const {
      shape,
      icon,
      className,
      onToggle,
      pressed,
      ...passThroughProps
    } = this.props;

    return (
      <ToggleButton
        shape={shape}
        icon={icon}
        className={className}
        onToggle={onToggle}
        pressed={pressed}
        {...passThroughProps}
      />
    );
  }
}

export default LayerLegendAccordionToggleButton;
