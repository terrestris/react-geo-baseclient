import * as React from 'react';

import ToggleButton from '@terrestris/react-geo/dist/Button/ToggleButton/ToggleButton';

interface DefaultLayerLegendAccordionToggleButtonProps {
  tooltip: string,
  shape: string,
  icon: string,
  className: string
};

interface LayerLegendAccordionToggleButtonProps extends Partial<DefaultLayerLegendAccordionToggleButtonProps>{
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
    onToggle: () => { },
    pressed: false
  };

  render() {
    const {
      shape,
      icon,
      className,
      tooltip,
      onToggle,
      pressed
    } = this.props;

    return (
      <ToggleButton
        shape={shape}
        icon={icon}
        className={className}
        tooltip={tooltip}
        onToggle={onToggle}
        pressed={pressed}
      />
    );
  }
}

export default LayerLegendAccordionToggleButton;
