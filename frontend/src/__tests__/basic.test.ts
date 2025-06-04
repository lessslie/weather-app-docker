import { describe, it, expect } from 'vitest'

describe('Frontend Tests', () => {
  it('should pass basic math test', () => {
    expect(2 + 2).toBe(4)
  })

  it('should handle string operations', () => {
    expect('Weather App').toContain('Weather')
  })

  it('should work with arrays', () => {
    const cities = ['Buenos Aires', 'Córdoba', 'Rosario']
    expect(cities).toHaveLength(3)
    expect(cities).toContain('Buenos Aires')
  })
})
