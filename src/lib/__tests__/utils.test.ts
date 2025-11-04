import { cn } from '../utils'

describe('utils', () => {
  describe('cn', () => {
    it('should combine class names correctly', () => {
      const result = cn('class1', 'class2', 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('should handle conditional classes', () => {
      const result = cn('base-class', true && 'conditional-class', false && 'hidden-class')
      expect(result).toBe('base-class conditional-class')
    })

    it('should handle empty strings and falsy values', () => {
      const result = cn('base-class', '', null, undefined, false && 'hidden')
      expect(result).toBe('base-class')
    })
  })
})
