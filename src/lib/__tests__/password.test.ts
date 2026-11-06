import { describe, it, expect } from 'vitest'
import { passwordProblem } from '../password'

describe('passwordProblem', () => {
  it('accepts a long enough matching pair', () => {
    expect(passwordProblem('correct horse', 'correct horse')).toBeNull()
  })
  it('rejects short passwords', () => {
    expect(passwordProblem('short', 'short')).toMatch(/at least 8/)
  })
  it('rejects a mismatch', () => {
    expect(passwordProblem('long enough 1', 'long enough 2')).toMatch(/do not match/)
  })
})
