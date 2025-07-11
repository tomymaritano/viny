import PropTypes from 'prop-types'

const IconButton = ({
  icon: Icon,
  onClick,
  isActive = false,
  title,
  size = 16,
  variant = 'default', // 'default' | 'floating'
  'aria-label': ariaLabel,
  'aria-pressed': ariaPressed,
  'aria-keyshortcuts': ariaKeyshortcuts,
  ...restProps
}) => {
  if (variant === 'floating') {
    return (
      <button
        onClick={onClick}
        className={`p-2 rounded-full transition-all duration-300 border border-white/10 shadow-lg ${
          isActive
            ? 'text-white shadow-[#323D4B]/25'
            : 'text-theme-text-primary hover:scale-105 shadow-[#323D4B]/10'
        }`}
        style={{
          backgroundColor: isActive
            ? 'rgba(50, 61, 75, 0.7)'
            : 'rgba(50, 61, 75, 0.15)',
          '--tw-shadow-color': '#323D4B',
        }}
        onMouseEnter={e => {
          if (!isActive) {
            e.target.style.backgroundColor = 'rgba(50, 61, 75, 0.25)'
          }
        }}
        onMouseLeave={e => {
          if (!isActive) {
            e.target.style.backgroundColor = 'rgba(50, 61, 75, 0.15)'
          }
        }}
        title={title}
        aria-label={ariaLabel || title}
        aria-pressed={ariaPressed}
        aria-keyshortcuts={ariaKeyshortcuts}
        {...restProps}
      >
        <Icon size={size} aria-hidden="true" />
      </button>
    )
  }

  // Default variant (toolbar style)
  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-full transition-all duration-200 border ${
        isActive
          ? 'text-white border-white/20 bg-white/10'
          : 'text-theme-text-secondary hover:text-theme-text-primary border-transparent hover:border-white/10 hover:bg-white/5'
      }`}
      title={title}
      aria-label={ariaLabel || title}
      aria-pressed={ariaPressed}
      aria-keyshortcuts={ariaKeyshortcuts}
      {...restProps}
    >
      <Icon size={size} aria-hidden="true" />
    </button>
  )
}

IconButton.propTypes = {
  icon: PropTypes.elementType.isRequired,
  onClick: PropTypes.func.isRequired,
  isActive: PropTypes.bool,
  title: PropTypes.string,
  size: PropTypes.number,
  variant: PropTypes.oneOf(['default', 'floating']),
}

export default IconButton
