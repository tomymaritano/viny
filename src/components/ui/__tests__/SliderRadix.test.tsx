import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { vi } from 'vitest'
import {
  Slider,
  SliderWithLabels,
  RangeSlider,
  VolumeSlider,
  SteppedSlider,
  LegacyRangeSlider,
} from '../SliderRadix'

describe('Slider Component', () => {
  describe('Basic Slider', () => {
    test('renders slider', () => {
      render(<Slider defaultValue={[50]} />)

      const slider = screen.getByRole('slider')
      expect(slider).toBeInTheDocument()
    })

    test('handles value changes', () => {
      const handleChange = vi.fn()
      render(<Slider defaultValue={[50]} onValueChange={handleChange} />)

      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '75' } })

      expect(handleChange).toHaveBeenCalled()
    })

    test('supports disabled state', () => {
      render(<Slider defaultValue={[50]} disabled />)

      const slider = screen.getByRole('slider')
      expect(slider).toBeDisabled()
    })

    test('applies custom className', () => {
      render(<Slider defaultValue={[50]} className="custom-slider" />)

      const slider = screen.getByRole('slider')
      expect(slider.closest('.custom-slider')).toBeInTheDocument()
    })

    test('handles min and max values', () => {
      render(<Slider defaultValue={[25]} min={0} max={100} />)

      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('aria-valuemin', '0')
      expect(slider).toHaveAttribute('aria-valuemax', '100')
      expect(slider).toHaveAttribute('aria-valuenow', '25')
    })
  })

  describe('SliderWithLabels', () => {
    test('renders slider with label', () => {
      render(<SliderWithLabels label="Volume" defaultValue={[50]} />)

      expect(screen.getByText('Volume')).toBeInTheDocument()
      expect(screen.getByText('50')).toBeInTheDocument()
    })

    test('renders slider with description', () => {
      render(
        <SliderWithLabels
          label="Volume"
          description="Adjust the audio volume level"
          defaultValue={[50]}
        />
      )

      expect(screen.getByText('Volume')).toBeInTheDocument()
      expect(
        screen.getByText('Adjust the audio volume level')
      ).toBeInTheDocument()
    })

    test('hides value when showValue is false', () => {
      render(
        <SliderWithLabels
          label="Volume"
          defaultValue={[50]}
          showValue={false}
        />
      )

      expect(screen.getByText('Volume')).toBeInTheDocument()
      expect(screen.queryByText('50')).not.toBeInTheDocument()
    })

    test('shows range when showRange is true', () => {
      render(
        <SliderWithLabels
          label="Volume"
          defaultValue={[50]}
          min={0}
          max={100}
          showRange
        />
      )

      expect(screen.getByText('0')).toBeInTheDocument()
      expect(screen.getByText('100')).toBeInTheDocument()
    })

    test('uses custom formatValue function', () => {
      const formatValue = (value: number) => `${value}%`
      render(
        <SliderWithLabels
          label="Volume"
          defaultValue={[50]}
          formatValue={formatValue}
        />
      )

      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    test('applies different sizes', () => {
      const { rerender } = render(
        <SliderWithLabels label="Test" defaultValue={[50]} size="sm" />
      )

      let track = screen
        .getByRole('slider')
        .querySelector('[data-radix-slider-track]')
      expect(track).toHaveClass('h-1')

      rerender(<SliderWithLabels label="Test" defaultValue={[50]} size="lg" />)
      track = screen
        .getByRole('slider')
        .querySelector('[data-radix-slider-track]')
      expect(track).toHaveClass('h-3')
    })
  })

  describe('RangeSlider', () => {
    test('renders range slider with dual values', () => {
      render(<RangeSlider label="Price Range" defaultValue={[25, 75]} />)

      expect(screen.getByText('Price Range')).toBeInTheDocument()
      expect(screen.getByText('25 - 75')).toBeInTheDocument()
    })

    test('renders two thumbs', () => {
      render(<RangeSlider defaultValue={[25, 75]} />)

      const sliders = screen.getAllByRole('slider')
      expect(sliders).toHaveLength(2)
    })

    test('hides values when showValues is false', () => {
      render(
        <RangeSlider
          label="Price Range"
          defaultValue={[25, 75]}
          showValues={false}
        />
      )

      expect(screen.getByText('Price Range')).toBeInTheDocument()
      expect(screen.queryByText('25 - 75')).not.toBeInTheDocument()
    })

    test('uses custom formatValue function', () => {
      const formatValue = (value: number) => `$${value}`
      render(
        <RangeSlider
          label="Price Range"
          defaultValue={[25, 75]}
          formatValue={formatValue}
        />
      )

      expect(screen.getByText('$25 - $75')).toBeInTheDocument()
    })
  })

  describe('VolumeSlider', () => {
    test('renders volume slider with icon', () => {
      render(<VolumeSlider defaultValue={[50]} />)

      const icon = screen.getByRole('button')
      expect(icon).toBeInTheDocument()
    })

    test('hides icon when showIcon is false', () => {
      render(<VolumeSlider defaultValue={[50]} showIcon={false} />)

      expect(screen.queryByRole('button')).not.toBeInTheDocument()
    })

    test('shows volume value', () => {
      render(<VolumeSlider defaultValue={[50]} />)

      expect(screen.getByText('50')).toBeInTheDocument()
    })

    test('handles mute functionality', () => {
      const handleMutedChange = vi.fn()
      render(
        <VolumeSlider
          defaultValue={[50]}
          muted={false}
          onMutedChange={handleMutedChange}
        />
      )

      const muteButton = screen.getByRole('button')
      fireEvent.click(muteButton)

      expect(handleMutedChange).toHaveBeenCalledWith(true)
    })

    test('shows muted state', () => {
      render(<VolumeSlider defaultValue={[50]} muted={true} />)

      expect(screen.getByText('0')).toBeInTheDocument()
    })

    test('renders with label', () => {
      render(<VolumeSlider label="Master Volume" defaultValue={[50]} />)

      expect(screen.getByText('Master Volume')).toBeInTheDocument()
    })
  })

  describe('SteppedSlider', () => {
    const steps = [
      { value: 0, label: 'Low' },
      { value: 50, label: 'Medium' },
      { value: 100, label: 'High' },
    ]

    test('renders stepped slider with steps', () => {
      render(<SteppedSlider steps={steps} defaultValue={[50]} />)

      expect(screen.getByText('Low')).toBeInTheDocument()
      expect(screen.getByText('Medium')).toBeInTheDocument()
      expect(screen.getByText('High')).toBeInTheDocument()
    })

    test('shows current step label', () => {
      render(
        <SteppedSlider label="Quality" steps={steps} defaultValue={[50]} />
      )

      expect(screen.getByText('Quality')).toBeInTheDocument()
      expect(screen.getByText('Medium')).toBeInTheDocument()
    })

    test('hides steps when showSteps is false', () => {
      render(
        <SteppedSlider steps={steps} defaultValue={[50]} showSteps={false} />
      )

      expect(screen.queryByText('Low')).not.toBeInTheDocument()
      expect(screen.queryByText('Medium')).not.toBeInTheDocument()
      expect(screen.queryByText('High')).not.toBeInTheDocument()
    })

    test('highlights current step', () => {
      render(<SteppedSlider steps={steps} defaultValue={[50]} />)

      const mediumStep = screen.getByText('Medium')
      expect(mediumStep).toHaveClass('text-theme-accent-primary')
    })
  })

  describe('LegacyRangeSlider', () => {
    test('renders legacy range slider', () => {
      render(<LegacyRangeSlider value={50} />)

      const slider = screen.getByRole('slider')
      expect(slider).toBeInTheDocument()
      expect(screen.getByText('50')).toBeInTheDocument()
    })

    test('renders with label', () => {
      render(<LegacyRangeSlider value={50} label="Volume" />)

      expect(screen.getByText('Volume')).toBeInTheDocument()
    })

    test('calls onChange when value changes', () => {
      const handleChange = vi.fn()
      render(<LegacyRangeSlider value={50} onChange={handleChange} />)

      const slider = screen.getByRole('slider')
      fireEvent.change(slider, { target: { value: '75' } })

      expect(handleChange).toHaveBeenCalledWith(75)
    })

    test('supports disabled state', () => {
      render(<LegacyRangeSlider value={50} disabled />)

      const slider = screen.getByRole('slider')
      expect(slider).toBeDisabled()
    })

    test('handles min, max, and step values', () => {
      render(<LegacyRangeSlider value={50} min={0} max={100} step={5} />)

      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('min', '0')
      expect(slider).toHaveAttribute('max', '100')
      expect(slider).toHaveAttribute('step', '5')
    })
  })

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(<Slider defaultValue={[50]} min={0} max={100} />)

      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('aria-valuemin', '0')
      expect(slider).toHaveAttribute('aria-valuemax', '100')
      expect(slider).toHaveAttribute('aria-valuenow', '50')
    })

    test('supports keyboard navigation', () => {
      const handleChange = vi.fn()
      render(<Slider defaultValue={[50]} onValueChange={handleChange} />)

      const slider = screen.getByRole('slider')
      slider.focus()

      fireEvent.keyDown(slider, { key: 'ArrowRight' })
      expect(handleChange).toHaveBeenCalled()
    })

    test('supports aria-label', () => {
      render(<Slider defaultValue={[50]} aria-label="Volume control" />)

      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('aria-label', 'Volume control')
    })

    test('supports aria-describedby', () => {
      render(
        <div>
          <Slider defaultValue={[50]} aria-describedby="slider-description" />
          <div id="slider-description">Adjust the volume level</div>
        </div>
      )

      const slider = screen.getByRole('slider')
      expect(slider).toHaveAttribute('aria-describedby', 'slider-description')
    })
  })
})

describe('Slider Integration', () => {
  test('works with controlled state', () => {
    const ControlledSlider = () => {
      const [value, setValue] = React.useState([50])

      return (
        <div>
          <SliderWithLabels
            label="Volume"
            value={value}
            onValueChange={setValue}
          />
          <div>Current value: {value[0]}</div>
        </div>
      )
    }

    render(<ControlledSlider />)

    expect(screen.getByText('Volume')).toBeInTheDocument()
    expect(screen.getByText('Current value: 50')).toBeInTheDocument()
  })

  test('works with form integration', () => {
    const FormExample = () => {
      const [volume, setVolume] = React.useState([50])
      const [quality, setQuality] = React.useState([1])

      const qualitySteps = [
        { value: 0, label: 'Low' },
        { value: 1, label: 'Medium' },
        { value: 2, label: 'High' },
      ]

      return (
        <form>
          <SliderWithLabels
            label="Volume"
            value={volume}
            onValueChange={setVolume}
          />
          <SteppedSlider
            label="Quality"
            steps={qualitySteps}
            value={quality}
            onValueChange={setQuality}
          />
        </form>
      )
    }

    render(<FormExample />)

    expect(screen.getByText('Volume')).toBeInTheDocument()
    expect(screen.getByText('Quality')).toBeInTheDocument()
    expect(screen.getByText('Medium')).toBeInTheDocument()
  })

  test('handles edge cases', () => {
    const { rerender } = render(<Slider defaultValue={[0]} min={0} max={100} />)

    let slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '0')

    rerender(<Slider defaultValue={[100]} min={0} max={100} />)
    slider = screen.getByRole('slider')
    expect(slider).toHaveAttribute('aria-valuenow', '100')
  })

  test('supports multiple sliders', () => {
    render(
      <div>
        <SliderWithLabels label="Master Volume" defaultValue={[75]} />
        <SliderWithLabels label="Music Volume" defaultValue={[50]} />
        <SliderWithLabels label="Effects Volume" defaultValue={[25]} />
      </div>
    )

    expect(screen.getByText('Master Volume')).toBeInTheDocument()
    expect(screen.getByText('Music Volume')).toBeInTheDocument()
    expect(screen.getByText('Effects Volume')).toBeInTheDocument()

    const sliders = screen.getAllByRole('slider')
    expect(sliders).toHaveLength(3)
  })

  test('works with dynamic ranges', () => {
    const DynamicRangeSlider = () => {
      const [range, setRange] = React.useState([20, 80])
      const [min, setMin] = React.useState(0)
      const [max, setMax] = React.useState(100)

      return (
        <div>
          <button onClick={() => setMax(200)}>Expand Range</button>
          <RangeSlider
            label="Dynamic Range"
            value={range}
            onValueChange={setRange}
            min={min}
            max={max}
          />
        </div>
      )
    }

    render(<DynamicRangeSlider />)

    expect(screen.getByText('Dynamic Range')).toBeInTheDocument()
    expect(screen.getByText('20 - 80')).toBeInTheDocument()
  })
})
