import { describe, it, expect } from 'vitest'
import { 
  ValidationRules, 
  SettingsValidation, 
  validateForm, 
  validateField 
} from '../validation'

describe('Validation Utilities', () => {
  describe('ValidationRules', () => {
    describe('required', () => {
      it('should validate required fields correctly', () => {
        const result = ValidationRules.required('test', 'fieldName')
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
      })

      it('should fail for empty string', () => {
        const result = ValidationRules.required('', 'fieldName')
        expect(result.isValid).toBe(false)
        expect(result.error).toBe('fieldName is required')
      })

      it('should fail for null', () => {
        const result = ValidationRules.required(null, 'fieldName')
        expect(result.isValid).toBe(false)
        expect(result.error).toBe('fieldName is required')
      })

      it('should fail for undefined', () => {
        const result = ValidationRules.required(undefined, 'fieldName')
        expect(result.isValid).toBe(false)
        expect(result.error).toBe('fieldName is required')
      })
    })

    describe('minLength', () => {
      it('should validate minimum length correctly', () => {
        const result = ValidationRules.minLength('hello', 3, 'fieldName')
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
      })

      it('should fail for strings too short', () => {
        const result = ValidationRules.minLength('hi', 5, 'fieldName')
        expect(result.isValid).toBe(false)
        expect(result.error).toBe('fieldName must be at least 5 characters')
      })

      it('should pass for empty string when not required', () => {
        const result = ValidationRules.minLength('', 5, 'fieldName')
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
      })
    })

    describe('maxLength', () => {
      it('should validate maximum length correctly', () => {
        const result = ValidationRules.maxLength('hello', 10, 'fieldName')
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
      })

      it('should fail for strings too long', () => {
        const result = ValidationRules.maxLength('hello world', 5, 'fieldName')
        expect(result.isValid).toBe(false)
        expect(result.error).toBe('fieldName must be no more than 5 characters')
      })
    })

    describe('email', () => {
      it('should validate correct email addresses', () => {
        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'user+tag@example.org'
        ]

        validEmails.forEach(email => {
          const result = ValidationRules.email(email, 'email')
          expect(result.isValid).toBe(true)
          expect(result.error).toBeUndefined()
        })
      })

      it('should fail for invalid email addresses', () => {
        const invalidEmails = [
          'invalid-email',
          'test@',
          '@example.com'
        ]

        invalidEmails.forEach(email => {
          const result = ValidationRules.email(email, 'email')
          expect(result.isValid).toBe(false)
          expect(result.error).toBe('email must be a valid email address')
        })
      })

      it('should pass for empty string', () => {
        const result = ValidationRules.email('', 'email')
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
      })
    })

    describe('url', () => {
      it('should validate correct URLs', () => {
        const validUrls = [
          'https://example.com',
          'http://localhost:3000',
          'https://sub.domain.com/path?query=value'
        ]

        validUrls.forEach(url => {
          const result = ValidationRules.url(url, 'url')
          expect(result.isValid).toBe(true)
          expect(result.error).toBeUndefined()
        })
      })

      it('should fail for invalid URLs', () => {
        const invalidUrls = [
          'not-a-url',
          'just-text'
        ]

        invalidUrls.forEach(url => {
          const result = ValidationRules.url(url, 'url')
          expect(result.isValid).toBe(false)
          expect(result.error).toBe('url must be a valid URL')
        })
      })

      it('should pass for empty string', () => {
        const result = ValidationRules.url('', 'url')
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
      })
    })

    describe('number', () => {
      it('should validate numbers correctly', () => {
        const validNumbers = [42, '42', 0, '0', -5, '-5', 3.14, '3.14']

        validNumbers.forEach(number => {
          const result = ValidationRules.number(number, 'number')
          expect(result.isValid).toBe(true)
          expect(result.error).toBeUndefined()
        })
      })

      it('should fail for invalid numbers', () => {
        const invalidNumbers = ['not-a-number', 'abc', '12abc', 'NaN']

        invalidNumbers.forEach(number => {
          const result = ValidationRules.number(number, 'number')
          expect(result.isValid).toBe(false)
          expect(result.error).toBe('number must be a valid number')
        })
      })

      it('should pass for empty values', () => {
        const emptyValues = ['', null, undefined]

        emptyValues.forEach(value => {
          const result = ValidationRules.number(value, 'number')
          expect(result.isValid).toBe(true)
          expect(result.error).toBeUndefined()
        })
      })
    })

    describe('range', () => {
      it('should validate numbers within range', () => {
        const result = ValidationRules.range(5, 1, 10, 'number')
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
      })

      it('should fail for numbers outside range', () => {
        const result = ValidationRules.range(15, 1, 10, 'number')
        expect(result.isValid).toBe(false)
        expect(result.error).toBe('number must be between 1 and 10')
      })

      it('should accept boundary values', () => {
        const min = ValidationRules.range(1, 1, 10, 'number')
        const max = ValidationRules.range(10, 1, 10, 'number')
        
        expect(min.isValid).toBe(true)
        expect(max.isValid).toBe(true)
      })
    })

    describe('pattern', () => {
      it('should validate patterns correctly', () => {
        const phonePattern = /^\d{3}-\d{3}-\d{4}$/
        const result = ValidationRules.pattern('123-456-7890', phonePattern, 'phone')
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
      })

      it('should fail for invalid patterns', () => {
        const phonePattern = /^\d{3}-\d{3}-\d{4}$/
        const result = ValidationRules.pattern('invalid-phone', phonePattern, 'phone')
        expect(result.isValid).toBe(false)
        expect(result.error).toBe('phone format is invalid')
      })

      it('should use custom error message', () => {
        const pattern = /^\d+$/
        const result = ValidationRules.pattern('abc', pattern, 'field', 'Must be digits only')
        expect(result.isValid).toBe(false)
        expect(result.error).toBe('Must be digits only')
      })
    })
  })

  describe('SettingsValidation', () => {
    describe('general', () => {
      it('should validate language correctly', () => {
        const result = SettingsValidation.general.language('en')
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
      })

      it('should fail for unsupported language', () => {
        const result = SettingsValidation.general.language('invalid-lang')
        expect(result.isValid).toBe(false)
        expect(result.error).toBe('Unsupported language selected')
      })

      it('should validate default notebook', () => {
        const availableNotebooks = ['notebook1', 'notebook2']
        const result = SettingsValidation.general.defaultNotebook('notebook1', availableNotebooks)
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
      })

      it('should fail for non-existent notebook', () => {
        const availableNotebooks = ['notebook1', 'notebook2']
        const result = SettingsValidation.general.defaultNotebook('invalid-notebook', availableNotebooks)
        expect(result.isValid).toBe(false)
        expect(result.error).toBe('Selected notebook does not exist')
      })
    })

    describe('editing', () => {
      it('should validate font size in range', () => {
        const result = SettingsValidation.editing.fontSize(14)
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
      })

      it('should fail for font size out of range', () => {
        const result = SettingsValidation.editing.fontSize(50)
        expect(result.isValid).toBe(false)
        expect(result.error).toBe('Font size must be between 8 and 32')
      })

      it('should validate line height in range', () => {
        const result = SettingsValidation.editing.lineHeight(1.5)
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
      })

      it('should validate tab size in range', () => {
        const result = SettingsValidation.editing.tabSize(4)
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
      })

      it('should validate font family', () => {
        const result = SettingsValidation.editing.fontFamily('Arial, sans-serif')
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
      })

      it('should fail for invalid font family characters', () => {
        const result = SettingsValidation.editing.fontFamily('Invalid<>Font')
        expect(result.isValid).toBe(false)
        expect(result.error).toBe('Font family contains invalid characters')
      })
    })

    describe('themes', () => {
      it('should validate UI theme', () => {
        const result = SettingsValidation.themes.uiTheme('dark')
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
      })

      it('should fail for invalid theme', () => {
        const result = SettingsValidation.themes.uiTheme('invalid-theme')
        expect(result.isValid).toBe(false)
        expect(result.error).toBe('Invalid theme selected')
      })

      it('should validate CSS syntax', () => {
        const css = '.test { color: red; }'
        const result = SettingsValidation.themes.customCSS(css)
        expect(result.isValid).toBe(true)
        expect(result.error).toBeUndefined()
      })

      it('should fail for unmatched braces', () => {
        const css = '.test { color: red;'
        const result = SettingsValidation.themes.customCSS(css)
        expect(result.isValid).toBe(false)
        expect(result.error).toBe('CSS syntax error: unmatched braces')
      })

      it('should warn for large CSS files', () => {
        const largeCss = 'a'.repeat(10001)
        const result = SettingsValidation.themes.customCSS(largeCss)
        expect(result.isValid).toBe(true)
        expect(result.warning).toBe('Large CSS files may impact performance')
      })
    })
  })

  describe('validateForm', () => {
    it('should validate form with all valid fields', () => {
      const values = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25
      }

      const validations = {
        name: (value: string) => ValidationRules.required(value, 'name'),
        email: (value: string) => ValidationRules.email(value, 'email'),
        age: (value: number) => ValidationRules.range(value, 1, 120, 'age')
      }

      const result = validateForm(values, validations)
      expect(result.isValid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should collect all validation errors', () => {
      const values = {
        name: '',
        email: 'invalid-email',
        age: 150
      }

      const validations = {
        name: (value: string) => ValidationRules.required(value, 'name'),
        email: (value: string) => ValidationRules.email(value, 'email'),
        age: (value: number) => ValidationRules.range(value, 1, 120, 'age')
      }

      const result = validateForm(values, validations)
      expect(result.isValid).toBe(false)
      expect(result.errors).toHaveLength(3)
      expect(result.errors).toContain('name is required')
      expect(result.errors).toContain('email must be a valid email address')
      expect(result.errors).toContain('age must be between 1 and 120')
    })

    it('should collect warnings', () => {
      const values = {
        css: 'a'.repeat(10001)
      }

      const validations = {
        css: (value: string) => SettingsValidation.themes.customCSS(value)
      }

      const result = validateForm(values, validations)
      expect(result.isValid).toBe(true)
      expect(result.warnings).toContain('Large CSS files may impact performance')
    })
  })

  describe('validateField', () => {
    it('should validate field with single validator', () => {
      const validators = [(value: string) => ValidationRules.required(value, 'field')]
      const result = validateField('test', validators)
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should validate field with multiple validators', () => {
      const validators = [
        (value: string) => ValidationRules.required(value, 'field'),
        (value: string) => ValidationRules.minLength(value, 5, 'field')
      ]
      const result = validateField('hello world', validators)
      expect(result.isValid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should return first validation error', () => {
      const validators = [
        (value: string) => ValidationRules.required(value, 'field'),
        (value: string) => ValidationRules.minLength(value, 5, 'field')
      ]
      const result = validateField('', validators)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('field is required')
    })

    it('should return error from second validator if first passes', () => {
      const validators = [
        (value: string) => ValidationRules.required(value, 'field'),
        (value: string) => ValidationRules.minLength(value, 10, 'field')
      ]
      const result = validateField('short', validators)
      expect(result.isValid).toBe(false)
      expect(result.error).toBe('field must be at least 10 characters')
    })
  })
})