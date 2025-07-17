import React from 'react'
import { Icons } from '../Icons'
import IconButton from './IconButton'
import StandardDropdown from './StandardDropdown'

type SortField = 'title' | 'date' | 'updated' | 'notebook'
type SortDirection = 'asc' | 'desc'

interface SortDropdownProps {
  currentSortBy: SortField
  currentSortDirection: SortDirection
  onSort: (field: SortField, direction: SortDirection) => void
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  currentSortBy,
  currentSortDirection,
  onSort
}) => {
  const getIcon = () => {
    if (currentSortBy === 'title') {
      return currentSortDirection === 'asc' ? Icons.ArrowUpAZ : Icons.ArrowDownAZ
    }
    if (currentSortBy === 'date') {
      return Icons.FileText
    }
    if (currentSortBy === 'updated') {
      return Icons.Clock
    }
    return Icons.ArrowDownAZ
  }

  const getCurrentValue = () => {
    return `${currentSortBy}-${currentSortDirection}`
  }

  const handleSelect = (value: string) => {
    const [field, direction] = value.split('-') as [SortField, SortDirection]
    onSort(field, direction)
  }

  const sections = [
    {
      title: 'Sort by',
      options: [
        {
          value: 'title-asc',
          label: 'Title: A → Z',
          icon: <Icons.ArrowUpAZ size={14} />
        },
        {
          value: 'title-desc',
          label: 'Title: Z → A',
          icon: <Icons.ArrowDownAZ size={14} />
        },
        {
          value: 'date-desc',
          label: 'Date Created: New → Old',
          icon: <Icons.FileText size={14} />
        },
        {
          value: 'date-asc',
          label: 'Date Created: Old → New',
          icon: <Icons.FileText size={14} />
        },
        {
          value: 'updated-desc',
          label: 'Date Updated: New → Old',
          icon: <Icons.Clock size={14} />
        },
        {
          value: 'updated-asc',
          label: 'Date Updated: Old → New',
          icon: <Icons.Clock size={14} />
        }
      ]
    }
  ]

  return (
    <StandardDropdown
      trigger={
        <IconButton
          icon={getIcon()}
          title="Sort and filter options"
          size={16}
          variant="default"
          aria-label="Sort and filter options"
          data-testid="sort-dropdown-trigger"
        />
      }
      sections={sections}
      onSelect={handleSelect}
      selectedValue={getCurrentValue()}
      width={200}
      position="bottom-left"
      data-testid="sort-dropdown"
    />
  )
}

export default SortDropdown