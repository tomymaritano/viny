import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Icons from '../Icons'

describe('Icons Component', () => {
  describe('Eye Icon', () => {
    it('renders with default props', () => {
      const { container } = render(<Icons.Eye />)
      const svg = container.querySelector('svg')

      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('width', '16')
      expect(svg).toHaveAttribute('height', '16')
    })

    it('renders with custom size', () => {
      const { container } = render(<Icons.Eye size={24} />)
      const svg = container.querySelector('svg')

      expect(svg).toHaveAttribute('width', '24')
      expect(svg).toHaveAttribute('height', '24')
    })

    it('renders with custom className', () => {
      const { container } = render(<Icons.Eye className="custom-class" />)
      const svg = container.querySelector('svg')

      expect(svg).toHaveClass('custom-class')
    })
  })

  describe('Edit Icon', () => {
    it('renders correctly', () => {
      const { container } = render(<Icons.Edit />)
      const svg = container.querySelector('svg')

      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
      expect(svg).toHaveAttribute('fill', 'none')
      expect(svg).toHaveAttribute('stroke', 'currentColor')
    })
  })

  describe('MoreVertical Icon', () => {
    it('renders with consistent attributes', () => {
      const { container } = render(<Icons.MoreVertical />)
      const svg = container.querySelector('svg')

      expect(svg).toBeInTheDocument()
      expect(svg).toHaveAttribute('stroke-width', '2')
      expect(svg).toHaveAttribute('stroke-linecap', 'round')
      expect(svg).toHaveAttribute('stroke-linejoin', 'round')
    })
  })

  describe('Icon accessibility', () => {
    it('all icons have proper SVG structure', () => {
      const iconNames = ['Eye', 'Edit', 'MoreVertical']

      iconNames.forEach(iconName => {
        const { container } = render(Icons[iconName]({ size: 20 }))
        const svg = container.querySelector('svg')

        expect(svg).toBeInTheDocument()
        expect(svg.tagName).toBe('svg')
      })
    })
  })
})
