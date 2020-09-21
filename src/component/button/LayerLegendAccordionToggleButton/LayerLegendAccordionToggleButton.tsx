import * as React from 'react';

import ToggleButton, { ToggleButtonProps } from '@terrestris/react-geo/dist/Button/ToggleButton/ToggleButton';

interface DefaultLayerLegendAccordionToggleButtonProps extends ToggleButtonProps {
  iconName: string;
  className: string;
}

interface LayerLegendAccordionToggleButtonProps extends Partial<DefaultLayerLegendAccordionToggleButtonProps> {
  onToggle: (pressed: boolean) => void;
  tooltip: string;
  pressed: boolean;
}

interface LayerLegendAccordionToggleButtonState {
}

/**
 *
 * @class LayerLegendAccordionToggleButton
 * @extends {React.PureComponent<LayerLegendAccordionToggleButtonProps, LayerLegendAccordionToggleButtonState>}
 */
class LayerLegendAccordionToggleButton extends
  React.PureComponent<LayerLegendAccordionToggleButtonProps, LayerLegendAccordionToggleButtonState> {


  /**
   *
   * @param The default props
   */
  public static defaultProps: LayerLegendAccordionToggleButtonProps = {
    onToggle: () => { },
    pressed: false,
    shape: 'circle',
    iconName: 'fas fa-list',
    tooltip: '',
    className: 'react-geo-baseclient-layer-toggle-btn'
  };

  /**
   * Create the LayerLegendAccordionToggleButton.
   *
   * @constructs LayerLegendAccordionToggleButton
   */
  constructor(props: LayerLegendAccordionToggleButtonProps) {
    super(props);
  }

  render() {
    const {
      shape,
      iconName,
      className,
      onToggle,
      pressed,
      ...passThroughProps
    } = this.props;

    return (
      <ToggleButton
        shape={shape}
        iconName={iconName}
        className={className}
        onToggle={onToggle}
        pressed={pressed}
        {...passThroughProps}
      />
    );
  }
}

export default LayerLegendAccordionToggleButton;
