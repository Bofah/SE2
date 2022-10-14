import {describe, it, expect} from 'vitest'
import {hyphenToCamelCase, Stack} from '../utils'

describe('Hyphen to camel case', () => {
  it('should convert hyphen to camel case', () => {
    expect(hyphenToCamelCase('z-index')).toEqual('zIndex')
  })

  it('should return string without hyphen', () => {
    expect(hyphenToCamelCase('border')).toEqual('border')
  })
})

// TODO: Optimise tests by using beforeAll and afterAll
describe('Stack', () => {
  it('should be able to push', () => {
    const stack = new Stack<number>()
    stack.push(3)
    expect(stack.peek()).toEqual(3)
    stack.push(5)
    expect(stack.peek()).toEqual(5)
  })
  
  it('should be able to pop', () => {
    const stack = new Stack<number>()
    stack.push(3)
    stack.push(5)
    expect(stack.pop()).toEqual(5)
    expect(stack.peek()).toEqual(3)
  })
  
  it('should return undefined if popping from empty stack', () => {
    const stack = new Stack<number>()
    expect(stack.pop()).toEqual(undefined)
    expect(stack.peek()).toEqual(undefined)
  })
})