import { cn } from '../utils'

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2')
  })

  it('handles conditional classes', () => {
    expect(cn('base', true && 'conditional')).toBe('base conditional')
    expect(cn('base', false && 'conditional')).toBe('base')
  })

  it('handles undefined and null values', () => {
    expect(cn('base', undefined, null, 'valid')).toBe('base valid')
  })

  it('merges Tailwind classes correctly', () => {
    // Should merge conflicting classes, keeping the last one
    expect(cn('px-2', 'px-4')).toBe('px-4')
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('handles array of classes', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2')
  })

  it('handles object notation', () => {
    expect(cn({ 'bg-red-500': true, 'text-white': true })).toBe('bg-red-500 text-white')
    expect(cn({ 'bg-red-500': false, 'text-white': true })).toBe('text-white')
  })

  it('handles empty inputs', () => {
    expect(cn()).toBe('')
    expect(cn('')).toBe('')
  })
})
