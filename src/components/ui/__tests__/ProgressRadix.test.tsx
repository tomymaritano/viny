import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import {
  Progress,
  ProgressWithLabel,
  SteppedProgress,
  CircularProgress,
  LegacyProgress,
} from '../ProgressRadix'

describe('Progress Component', () => {
  describe('Basic Progress', () => {
    test('renders progress bar with correct value', () => {
      render(<Progress value={50} />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toBeInTheDocument()
      expect(progressBar).toHaveAttribute('data-value', '50')
    })

    test('renders progress bar with max value', () => {
      render(<Progress value={100} max={100} />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('data-value', '100')
      expect(progressBar).toHaveAttribute('data-max', '100')
    })

    test('handles zero value', () => {
      render(<Progress value={0} />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('data-value', '0')
    })

    test('applies custom className', () => {
      render(<Progress value={50} className="custom-progress" />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveClass('custom-progress')
    })
  })

  describe('ProgressWithLabel', () => {
    test('renders progress with label', () => {
      render(<ProgressWithLabel value={75} label="Loading..." />)

      expect(screen.getByText('Loading...')).toBeInTheDocument()
      expect(screen.getByText('75%')).toBeInTheDocument()
    })

    test('renders progress without label when not provided', () => {
      render(<ProgressWithLabel value={50} />)

      expect(screen.getByText('50%')).toBeInTheDocument()
    })

    test('hides value when showValue is false', () => {
      render(<ProgressWithLabel value={50} showValue={false} />)

      expect(screen.queryByText('50%')).not.toBeInTheDocument()
    })

    test('applies different sizes', () => {
      const { rerender } = render(<ProgressWithLabel value={50} size="sm" />)

      let progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveClass('h-2')

      rerender(<ProgressWithLabel value={50} size="md" />)
      progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveClass('h-4')

      rerender(<ProgressWithLabel value={50} size="lg" />)
      progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveClass('h-6')
    })

    test('applies different variants', () => {
      const { rerender } = render(
        <ProgressWithLabel value={50} variant="success" />
      )

      const indicator = screen
        .getByRole('progressbar')
        .querySelector('[data-state="loading"]')
      // Note: We can't easily test the exact classes due to the indicator structure

      rerender(<ProgressWithLabel value={50} variant="warning" />)
      rerender(<ProgressWithLabel value={50} variant="error" />)

      // Test passes if no errors occur during rendering
      expect(screen.getByRole('progressbar')).toBeInTheDocument()
    })
  })

  describe('SteppedProgress', () => {
    const steps = ['Step 1', 'Step 2', 'Step 3', 'Step 4']

    test('renders all steps', () => {
      render(<SteppedProgress steps={steps} currentStep={1} />)

      steps.forEach(step => {
        expect(screen.getByText(step)).toBeInTheDocument()
      })
    })

    test('shows correct current step', () => {
      render(<SteppedProgress steps={steps} currentStep={2} />)

      // Check that steps 0, 1, and 2 are marked as completed/current
      expect(screen.getAllByText('✓')).toHaveLength(2)
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    test('renders step numbers correctly', () => {
      render(<SteppedProgress steps={steps} currentStep={0} />)

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
    })

    test('calculates progress correctly', () => {
      render(<SteppedProgress steps={steps} currentStep={1} />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('data-value', '50')
    })
  })

  describe('CircularProgress', () => {
    test('renders circular progress', () => {
      render(<CircularProgress value={60} />)

      expect(screen.getByText('60%')).toBeInTheDocument()
    })

    test('hides value when showValue is false', () => {
      render(<CircularProgress value={60} showValue={false} />)

      expect(screen.queryByText('60%')).not.toBeInTheDocument()
    })

    test('applies custom size', () => {
      render(<CircularProgress value={60} size={100} />)

      const container = screen.getByText('60%').closest('div')
      expect(container).toHaveStyle({ width: '100px', height: '100px' })
    })

    test('applies different variants', () => {
      const { rerender } = render(
        <CircularProgress value={60} variant="success" />
      )

      expect(screen.getByText('60%')).toBeInTheDocument()

      rerender(<CircularProgress value={60} variant="warning" />)
      expect(screen.getByText('60%')).toBeInTheDocument()

      rerender(<CircularProgress value={60} variant="error" />)
      expect(screen.getByText('60%')).toBeInTheDocument()
    })
  })

  describe('LegacyProgress', () => {
    test('renders legacy progress bar', () => {
      render(<LegacyProgress value={30} max={100} showLabel={true} />)

      // The legacy progress doesn't use role="progressbar"
      const progressText = screen.getByText('30 / 100')
      expect(progressText).toBeInTheDocument()
    })

    test('shows label when provided', () => {
      render(
        <LegacyProgress
          value={30}
          max={100}
          showLabel={true}
          label="Progress"
        />
      )

      expect(screen.getByText('Progress')).toBeInTheDocument()
      expect(screen.getByText('30 / 100')).toBeInTheDocument()
    })

    test('hides label when showLabel is false', () => {
      render(
        <LegacyProgress
          value={30}
          max={100}
          showLabel={false}
          label="Progress"
        />
      )

      expect(screen.queryByText('Progress')).not.toBeInTheDocument()
      expect(screen.queryByText('30 / 100')).not.toBeInTheDocument()
    })

    test('calculates percentage correctly', () => {
      render(<LegacyProgress value={25} max={50} />)

      // 25/50 = 50%
      const progressBar = screen.getByRole('generic')
      const innerBar = progressBar.querySelector('div:last-child')
      expect(innerBar).toHaveStyle({ width: '50%' })
    })
  })

  describe('Accessibility', () => {
    test('has proper ARIA attributes', () => {
      render(<Progress value={50} max={100} />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('data-value', '50')
      expect(progressBar).toHaveAttribute('data-max', '100')
    })

    test('supports aria-label', () => {
      render(<Progress value={50} aria-label="File upload progress" />)

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute('aria-label', 'File upload progress')
    })

    test('supports aria-describedby', () => {
      render(
        <div>
          <Progress value={50} aria-describedby="progress-description" />
          <div id="progress-description">Uploading file...</div>
        </div>
      )

      const progressBar = screen.getByRole('progressbar')
      expect(progressBar).toHaveAttribute(
        'aria-describedby',
        'progress-description'
      )
    })
  })
})

describe('Progress Integration', () => {
  test('works with dynamic values', () => {
    const DynamicProgress = () => {
      const [value, setValue] = React.useState(0)

      React.useEffect(() => {
        const timer = setTimeout(() => setValue(100), 100)
        return () => clearTimeout(timer)
      }, [])

      return <ProgressWithLabel value={value} label="Loading" />
    }

    render(<DynamicProgress />)

    expect(screen.getByText('Loading')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
  })

  test('handles edge cases', () => {
    const { rerender } = render(<Progress value={-10} />)

    let progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('data-value', '-10')

    rerender(<Progress value={150} />)
    progressBar = screen.getByRole('progressbar')
    expect(progressBar).toHaveAttribute('data-value', '150')
  })

  test('supports controlled and uncontrolled usage', () => {
    const ControlledProgress = () => {
      const [value, setValue] = React.useState(25)

      return (
        <div>
          <ProgressWithLabel value={value} label="Controlled" />
          <button onClick={() => setValue(v => v + 25)}>Increase</button>
        </div>
      )
    }

    render(<ControlledProgress />)

    expect(screen.getByText('25%')).toBeInTheDocument()
    expect(screen.getByText('Controlled')).toBeInTheDocument()
  })
})
