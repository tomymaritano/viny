import React from 'react'
import { motion } from 'framer-motion'
import { Icons } from '../Icons'

interface SidebarSectionHeaderProps {
  title: string
  isExpanded: boolean
  onToggle: () => void
  onAdd?: () => void
  addTooltip?: string
}

const SidebarSectionHeader: React.FC<SidebarSectionHeaderProps> = ({
  title,
  isExpanded,
  onToggle,
  onAdd,
  addTooltip = `Create new ${title.toLowerCase()}`,
}) => {
  return (
    <div className="flex items-center justify-between px-2 py-1">
      <div
        className="flex items-center gap-1 cursor-pointer flex-1"
        onClick={onToggle}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 0 : -90 }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          <Icons.ChevronDown size={12} className="text-theme-text-muted" />
        </motion.div>
        <span className="text-xs font-medium text-theme-text-muted uppercase tracking-wider">
          {title}
        </span>
      </div>
      {onAdd && (
        <motion.button
          onClick={onAdd}
          className="p-0.5 hover:bg-theme-bg-tertiary/30 rounded transition-colors duration-150"
          title={addTooltip}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icons.Plus
            size={14}
            className="text-theme-text-muted hover:text-theme-text-primary"
          />
        </motion.button>
      )}
    </div>
  )
}

export default SidebarSectionHeader
