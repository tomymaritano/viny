import React from 'react'
import { Icons } from '../Icons'
import type { User } from '../../stores/slices/authSlice'

interface SidebarFooterProps {
  user: User | null
  onShowUserProfile: () => void
}

const SidebarFooter: React.FC<SidebarFooterProps> = ({
  user,
  onShowUserProfile,
}) => {
  return (
    <div className="mt-auto pt-4 px-2 pb-2 border-t border-theme-border-primary">
      <button
        onClick={onShowUserProfile}
        className="flex items-center gap-2 w-full px-2 py-2 text-xs text-theme-text-muted hover:text-theme-text-secondary hover:bg-theme-bg-tertiary/30 transition-colors duration-150 rounded"
      >
        <Icons.User size={16} />
        <span>Account</span>
        {user && (
          <span className="ml-auto text-[10px] opacity-50 truncate max-w-[100px]">
            {user.email}
          </span>
        )}
      </button>
    </div>
  )
}

export default SidebarFooter
