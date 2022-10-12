import * as React from 'react';

import ToggleButton, { ToggleButtonProps } from '@terrestris/react-geo/dist/Button/ToggleButton/ToggleButton';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList } from '@fortawesome/free-solid-svg-icons';

interface DefaultLayerLegendAccordionToggleButtonProps extends ToggleButtonProps {
  icon: string;
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
      className,
      onToggle,
      pressed,
      ...passThroughProps
    } = this.props;

    return (
      <ToggleButton
        shape={shape}
        icon={
          <FontAwesomeIcon
            icon={faList}
          />
        }
        className={className}
        onToggle={onToggle}
        pressed={pressed}
        {...passThroughProps}
      />
    );
  }
}

export default LayerLegendAccordionToggleButton;
