import PropTypes from 'prop-types'

const NumberInput = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  className = '',
  placeholder,
}) => (
  <input
    type="number"
    value={value}
    onChange={e => onChange(Number(e.target.value))}
    min={min}
    max={max}
    step={step}
    placeholder={placeholder}
    className={`px-2 py-1 theme-bg-secondary border border-theme-border-primary rounded text-sm text-theme-text-secondary focus:border-theme-accent-primary focus:outline-none w-16 ${className}`}
  />
)

NumberInput.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  className: PropTypes.string,
  placeholder: PropTypes.string,
}

export default NumberInput
