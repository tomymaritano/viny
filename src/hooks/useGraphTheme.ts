import { useTheme } from '../theme/useTheme'

export const useGraphTheme = () => {
  const { theme } = useTheme()

  return {
    node: {
      note: {
        fill: theme === 'dark' ? '#4a5568' : '#e2e8f0',
        stroke: theme === 'dark' ? '#718096' : '#cbd5e0',
        text: theme === 'dark' ? '#f7fafc' : '#1a202c',
      },
      tag: {
        fill: theme === 'dark' ? '#553c9a' : '#d6bcfa',
        stroke: theme === 'dark' ? '#6b46c1' : '#b794f4',
        text: theme === 'dark' ? '#f7fafc' : '#1a202c',
      },
      notebook: {
        fill: theme === 'dark' ? '#2d3748' : '#f7fafc',
        stroke: theme === 'dark' ? '#4a5568' : '#e2e8f0',
        text: theme === 'dark' ? '#f7fafc' : '#1a202c',
      },
      concept: {
        fill: theme === 'dark' ? '#2b6cb0' : '#90cdf4',
        stroke: theme === 'dark' ? '#2c5282' : '#63b3ed',
        text: theme === 'dark' ? '#f7fafc' : '#1a202c',
      },
    },
    edge: {
      reference: {
        stroke: theme === 'dark' ? '#4a5568' : '#cbd5e0',
        strokeWidth: 2,
      },
      similarity: {
        stroke: theme === 'dark' ? '#9f7aea' : '#d6bcfa',
        strokeWidth: 1,
        strokeDasharray: '5,5',
      },
      tag: {
        stroke: theme === 'dark' ? '#48bb78' : '#9ae6b4',
        strokeWidth: 1,
      },
      notebook: {
        stroke: theme === 'dark' ? '#ed8936' : '#fbd38d',
        strokeWidth: 1.5,
      },
    },
    background: theme === 'dark' ? '#1a202c' : '#ffffff',
    grid: theme === 'dark' ? '#2d3748' : '#f7fafc',
    highlight: {
      selected: theme === 'dark' ? '#fbbf24' : '#f59e0b',
      hover: theme === 'dark' ? '#60a5fa' : '#3b82f6',
      connected: theme === 'dark' ? '#34d399' : '#10b981',
    },
  }
}
