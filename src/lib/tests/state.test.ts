import {describe, it, expect, vi, beforeAll} from 'vitest'
import {createState, createReaction, createMemo, createDeferedReaction} from '../state'

describe('Create state', () => {
  let count: () => number
  let setCount: (value: number) => void

  beforeAll(() => {
    [count, setCount] = createState(0)
  })

  it('should create a state and return a getter', () => {
    expect(count()).toEqual(0)
  })

  it('should create a state and return a setter', () => {
    setCount(1)
    expect(count()).toEqual(1)
  })
})

describe('Create reaction', () => {
  it('should create an reaction and call it', () => {
    const callback = vi.fn()
    createReaction(callback)
    expect(callback).toHaveBeenCalled()
  })

})

describe('Create state and reaction', () => {
  it('should rerun reaction callback when state dependency changes', () => {
    const callback = vi.fn()
    const [count, setCount] = createState(0)
    createReaction(() => {
      count()
      callback()
    })
    expect(callback).toHaveBeenCalledTimes(1)

    setCount(1)
    setCount(8)
    expect(callback).toHaveBeenCalledTimes(3)
  })

  it('should rerun reaction callback once when state dependency changes', () => {
    const callback = vi.fn()
    const [count, setCount] = createState(0)
    createReaction(() => {
      count()
      count()
      count()
      count()
      callback()
    })
    expect(callback).toHaveBeenCalledTimes(1)

    setCount(1)
    setCount(8)
    expect(callback).toHaveBeenCalledTimes(3)
  })

  it('should recalculate dependencies anytime reaction runs', () => {
    const getInvisible = vi.fn()
    const getVisible = vi.fn()

    const [count, setCount] = createState(0)
    const [visible, setVisible] = createState(false)
    
    createReaction(() => {
      if(visible()){
        count()
        getVisible()
      }
      else{
        getInvisible()
      }
    })
    
    expect(getVisible).toHaveBeenCalledTimes(0)
    expect(getInvisible).toHaveBeenCalledTimes(1)
    
    setCount(1)
    expect(getVisible).toHaveBeenCalledTimes(0)
    expect(getInvisible).toHaveBeenCalledTimes(1)
    
    setVisible(true)
    expect(getVisible).toHaveBeenCalledTimes(1)
    expect(getInvisible).toHaveBeenCalledTimes(1)
    
    setCount(2)
    expect(getVisible).toHaveBeenCalledTimes(2)
    expect(getInvisible).toHaveBeenCalledTimes(1)
  })
})

describe('Create defered reaction', async () => {
  it('should create an reaction that is defered to the end of the event loop', async () => {
    const [a, setA] = createState(2)
    const [b, setB] = createState(5)

    const syncCallback = vi.fn()
    const deferCallback = vi.fn()

    createReaction(() => {
      a() * b()
      syncCallback()
    })

    createDeferedReaction(() => {
      a() * b()
      deferCallback()
    })

    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    expect(syncCallback).toHaveBeenCalledTimes(1)
    expect(deferCallback).toHaveBeenCalledTimes(0)
    setA(9)
    setB(10)

    await delay(100)
    expect(syncCallback).toHaveBeenCalledTimes(3)
    expect(deferCallback).toHaveBeenCalledTimes(1)
    
    setA(9)
    setB(10)
    await delay(10)
    expect(syncCallback).toHaveBeenCalledTimes(5)
    expect(deferCallback).toHaveBeenCalledTimes(2)
  })
})

describe('Create memo', () => {
  it('should create a state and return a getter', () => {
    const [count] = createState(10)
    const memo = createMemo(() => count())
    expect(memo()).toEqual(10)
  })
  
  it('should update derived state only when its dependencies change', () => {
    const veryExpensiveComputation = vi.fn()

    const [count, setCount] = createState(10)
    const derived = () => {
      veryExpensiveComputation()
      return count()
    }
    
    expect(veryExpensiveComputation).toHaveBeenCalledTimes(0)
    derived()
    derived()
    derived()
    expect(veryExpensiveComputation).toHaveBeenCalledTimes(3)

    const memoized = createMemo(derived)

    expect(veryExpensiveComputation).toHaveBeenCalledTimes(4)
    memoized()
    memoized()
    memoized()
    expect(veryExpensiveComputation).toHaveBeenCalledTimes(4)
    
    setCount(count() + 1)
    expect(veryExpensiveComputation).toHaveBeenCalledTimes(5)
  })
})