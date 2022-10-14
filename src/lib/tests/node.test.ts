// @vitest-environment jsdom
import {describe, it, expect, vi} from 'vitest'
import {$, $$, $$$, ReaperNode$, create, select, selectAll, wrap, wrapAll} from '../node'
import { createState } from '../state'

// TODO: Rewrite tests by using beforeEach and afterEach
describe('Query selector', () =>{
  it('should select a single element and wrap it with ReaperNode', () => {
    const host = document.createElement('div')
    const child = document.createElement('p')
    host.appendChild(child)
    document.body.appendChild(host)

    let node$ = $(host, 'p')!
    expect(node$.node()).toBe(child)
    
    node$ = $(document, host)!
    expect(node$.node()).toBe(host)
    document.body.removeChild(host)
  })

  it('should select a single element and wrap it with ReaperNode using document as parent', () => {
    const host = document.createElement('div')
    const child = document.createElement('p')
    host.appendChild(child)
    document.body.appendChild(host)

    const node$ = select('p')
    expect(node$!.node()).toBe(child)
    document.body.removeChild(host)
  })
  
  it('should return null if no element is found', () => {
    const host = document.createElement('div')
    const child = document.createElement('p')
    host.appendChild(child)
    document.body.appendChild(host)
    
    expect($(host, 'span')).toBeNull()
    expect(select('span')).toBeNull()
    document.body.removeChild(host)
  })

})

describe('Query selector all', () =>{
  it('should select arrray of elements and wrap them with ReaperNode', () => {
    const host = document.createElement('div')
    const child1 = document.createElement('p')
    const child2 = document.createElement('p')
    host.append(child1, child2)
    document.body.appendChild(host)

    let node$ = $$(host, '*')
    expect(node$).toHaveLength(2)
    expect(node$[0].node()).toBe(child1)
    
    document.body.removeChild(host)
  })

  it('should select arrray of elements and wrap them with ReaperNode with document as the parent', () => {
    const host = document.createElement('div')
    const child1 = document.createElement('p')
    const child2 = document.createElement('p')
    host.append(child1, child2)
    document.body.appendChild(host)

    const node$ = selectAll('p')
    expect(node$).toHaveLength(2)
    expect(node$[0].node()).toBe(child1)
    document.body.removeChild(host)
  })

  it('should return empty array if no element is found', () => {
    const host = document.createElement('div')
    const child = document.createElement('p')
    host.appendChild(child)
    document.body.appendChild(host)
    
    expect($$(host, 'span')).toHaveLength(0)
    expect(selectAll('span')).toHaveLength(0)
    document.body.removeChild(host)
  })

})

describe('Create element', () => {
  it('should create a new element and wrap it with ReaperNode', () => {
    let node$ = $$$('p')
    expect(node$!.node().tagName).toBe('P')
    
    node$ = create('span')
    expect(node$!.node().tagName).toBe('SPAN')
  })
  
  it('should return null if invalid element is parsed', () => {
    expect(create('div#container')).toBeNull()
  })
})

describe('Wrapper', () => {
  it('should wrap a DOM node in ReaperNode', () => {
    const host = document.createElement('div')
    const child = document.createElement('p')
    host.appendChild(child)
    document.body.appendChild(host)
    
    const node$ = wrap(host)
    expect(node$).toBeInstanceOf(ReaperNode$)
    expect(node$.node()).toBe(host)
    document.body.removeChild(host)
  })

  it('should wrap a DOM fragment or array of nodes in ReaperNode', () => {
    const host = document.createDocumentFragment()
    const other1 = document.createElement('em')
    const other2 = document.createElement('b')

    host.append(other1, other2)
    
    let nodes$ = wrapAll([other1, other2])
    expect(nodes$).toHaveLength(2)
    expect(nodes$[0]).toBeInstanceOf(ReaperNode$)
    expect(nodes$[0].node()).toBe(other1)
    
    nodes$ = wrapAll(host)
    expect(nodes$).toHaveLength(2)
    expect(nodes$[1]).toBeInstanceOf(ReaperNode$)
    expect(nodes$[1].node()).toBe(other2)
    
    nodes$ = wrapAll(other2)
    expect(nodes$).toHaveLength(1)
    expect(nodes$[0]).toBeInstanceOf(ReaperNode$)
    expect(nodes$[0].node()).toBe(other2)
    
  })
})

describe('ReaperNode', () => {
  it('should be a instace a reaper node which wraps a DOM node', () => {
    const node$ = new ReaperNode$(document.createElement('span'))
    expect(node$).toBeInstanceOf(ReaperNode$)
    expect(node$.node()).toBeInstanceOf(HTMLElement)
  })

  it('should throw an error when instaced with null', () => {
    expect(() => new ReaperNode$(null)).toThrowError()
  })

  it('should have a prototype select that selects a single element which is a descendant of node', () => {
    const host = document.createElement('div')
    const child = document.createElement('p')
    host.appendChild(child)
    document.body.appendChild(host)
    
    const node$ = new ReaperNode$(host)
    const child$ = node$.select('p')
    expect(child$!.node()).toBe(child)
    document.body.removeChild(host)
  })

  it('should have a prototype selectAll that selects array of elements which are descendants of node', () => {
    const host = document.createElement('div')
    const child1 = document.createElement('p')
    const child2 = document.createElement('p')
    host.append(child1, child2)
    document.body.appendChild(host)

    const node$ = new ReaperNode$(host)
    const children$ = node$.selectAll('p')
    expect(children$).toHaveLength(2)
    expect(children$[0].node()).toBe(child1)
    document.body.removeChild(host)
  })
  

  it('should have a parent prototype that returns parent element wrapped with ReaperNode or null', () => {
    const host = document.createElement('div')
    const child = document.createElement('p')
    host.appendChild(child)

    const node$ = new ReaperNode$(child)
    expect(node$.parent()).toBeInstanceOf(ReaperNode$)
    expect(node$.parent()!.node()).toBe(host)
    expect((new ReaperNode$(document.documentElement)).parent()).toBeNull()
  })

  it('should have a children prototype that returns array of ReaperNode children', () => {
    const host = document.createElement('div')
    const child1 = document.createElement('p')
    const child2 = document.createElement('span')
    host.append(child1, child2)

    const node$ = new ReaperNode$(host)
    const children$$ = node$.children()!

    expect(children$$).toHaveLength(2)
    expect(children$$[1].node()).toBe(child2)

    expect(children$$[1].children()).toHaveLength(0)
  })

  it('should have a next prototype that returns next Element sibling wrapped in ReaperNode or null', () => {
    const host = document.createElement('div')
    const child1 = document.createElement('p')
    const child2 = document.createElement('span')
    host.append(child1, child2)

    const node1$ = new ReaperNode$(child1)
    const node2$ = new ReaperNode$(child2)

    expect(node1$.next()).toBeInstanceOf(ReaperNode$)
    expect(node1$.next()).toStrictEqual(node2$)
    expect(node2$.next()).toBeNull()
  })

  it('should have a prev prototype that returns previous Element sibling wraped in ReaperNode or null', () => {
    const host = document.createElement('div')
    const child1 = document.createElement('p')
    const child2 = document.createElement('span')
    host.append(child1, child2)

    const node1$ = new ReaperNode$(child1)
    const node2$ = new ReaperNode$(child2)

    expect(node1$.prev()).toBeNull()
    expect(node2$.prev()).toBeInstanceOf(ReaperNode$)
    expect(node2$.prev()).toStrictEqual(node1$)
  })

  it('should have an on prototype that adds event listener', () => {
    const node$ = new ReaperNode$(document.createElement('div'))
    const callback = vi.fn()

    node$.on('click', callback)
    node$.node().click()
    expect(callback).toHaveBeenCalled()
  })

  it('should have an off prototype that removes event listener', () => {
    const node$ = new ReaperNode$(document.createElement('div'))
    const callback = vi.fn()

    node$.on('click', callback)
    node$.node().click()
    expect(callback).toHaveBeenCalled()
    
    node$.off('click', callback)
    node$.node().click()
    node$.node().click()
    expect(callback).toHaveBeenCalledTimes(1)
  })


  it('should have a text prototype that returns the text content of the node', () => {
    const node$ = new ReaperNode$(document.createElement('div'))
    node$.node().textContent = 'Hello guys👻'
    expect(node$.text()).toBe('Hello guys👻')
  })

  it('should have a setText prototype that updates the text content of the node', () => {
    const node$ = new ReaperNode$(document.createElement('div'))
    expect(node$.text()).toBe('')
    node$.setText('Hello guys👻')
    expect(node$.text()).toBe('Hello guys👻')
    
    const [name, setName] = createState('Kobby')
    node$.setText(() => `Hello ${name()}`)
    expect(node$.text()).toBe('Hello Kobby')
    setName('Tim')
    expect(node$.text()).toBe('Hello Tim')
  })

  it('should have an html prototype that returns the inner html of the node', () => {
    const node$ = new ReaperNode$(document.createElement('div'))
    node$.node().innerHTML = '<h1>Hello guys👻</h1>'
    expect(node$.html()).toBe('<h1>Hello guys👻</h1>')
  })

  it('should have a setHtml prototype that updates the inner html of the node', () => {
    const node$ = new ReaperNode$(document.createElement('div'))
    expect(node$.html()).toBe('')
    node$.setHtml('<h1>Hello guys👻</h1>')
    expect(node$.html()).toBe('<h1>Hello guys👻</h1>')

    const [name, setName] = createState('Kobby')
    node$.setHtml(() => `<h1>Hello ${name()}</h1>`)
    expect(node$.html()).toBe('<h1>Hello Kobby</h1>')
    setName('Tim')
    expect(node$.html()).toBe('<h1>Hello Tim</h1>')
  })

  it('should have a setChildren prototype that updates the children of the node', () => {
    const node$ = new ReaperNode$(document.createElement('div'))
    const child1$ = new ReaperNode$(document.createElement('p'))
    const child2$ = new ReaperNode$(document.createElement('span'))
    
    expect(node$.children()).toStrictEqual([])
    node$.setChildren([child1$, child2$])
    expect(node$.children()).toStrictEqual([child1$, child2$])
    
    const child3$ = new ReaperNode$(document.createElement('h1'))
    node$.setChildren([child3$])
    expect(node$.children()).toStrictEqual([child3$])
    
    const [list, setList] = createState(['books', 'pens'])
    node$.setChildren(() => list().map(item => create('li')!.setText(item)))
    expect(node$.children()).toHaveLength(2)
    
    setList([...list(), 'pencils'])
    expect(node$.children()).toHaveLength(3)
  })

  it('should have an append prototype that appends a DOM node, text or ReaperNode to the node', () => {
    const node$ = new ReaperNode$(document.createElement('div'))
    node$.setHtml('<h1>Hello guys👻</h1>')

    const child1 = document.createElement('p')
    const child2 = 'I am Kobby'
    const child3$ = new ReaperNode$(document.createElement('span'))
    node$.append(child1, child2, child3$)

    expect(node$.children()).toHaveLength(3)
    expect(node$.children()![1].node()).toBe(child1)
    expect(node$.children()![2]).toStrictEqual(child3$)
  })

  it('should have an prepend prototype that prepends a DOM node, text or ReaperNode to the node', () => {
    const node$ = new ReaperNode$(document.createElement('div'))
    node$.setHtml('<h1>Hello guys👻</h1>')

    const child1 = document.createElement('p')
    const child2 = 'I am Kobby'
    const child3$ = new ReaperNode$(document.createElement('span'))
    node$.prepend(child1, child2, child3$)

    expect(node$.children()).toHaveLength(3)
    expect(node$.children()![0].node()).toBe(child1)
    expect(node$.children()![1]).toStrictEqual(child3$)
  })

  it('should have a remove prototype that removes the node from the DOM', () => {
    const host = document.createElement('div')
    const child = document.createElement('p')
    host.appendChild(child)

    const node$ = new ReaperNode$(child)
    node$.remove()
    expect(host.children).toHaveLength(0)
  })


  it('should have an addClass prototype that adds a class to the node', () => {
    const node$ = new ReaperNode$(document.createElement('div'))
    node$.addClass('test')
    expect(node$.node().classList.contains('test')).toBe(true)
    node$.addClass('👻')
    expect(node$.node().classList.contains('👻')).toBe(true)
  })

  it('should have a removeClass prototype that removes a class from the node', () => {
    const node$ = new ReaperNode$(document.createElement('div'))
    node$.addClass('test')
    expect(node$.node().classList.contains('test')).toBe(true)
    node$.removeClass('test')
    expect(node$.node().classList.contains('test')).toBe(false)
  })

  it('should have a toggleClass prototype that toggles a class on the node', () => {
    const node$ = new ReaperNode$(document.createElement('div'))
    node$.toggleClass('test')
    expect(node$.node().classList.contains('test')).toBe(true)
    node$.toggleClass('test')
    expect(node$.node().classList.contains('test')).toBe(false)
  })


  it('should have a css prototype that returns the computed style of the node', () => {
    const node$ = new ReaperNode$(document.createElement('div'))
    node$.node().style.width = '100px'
    expect(node$.css('width')).toBe('100px')
    expect(node$.css('color')).toBe('')
  })

  it('should have a setCss prototype that updates the style of the node', () => {
    const node$ = new ReaperNode$(document.createElement('div'))
    node$.setCss('width', '100px')
    expect(node$.css('width')).toBe('100px')

    const [height, setHeight] = createState('200vh')
    node$.setCss('height', () => height())
    expect(node$.css('height')).toBe('200vh')
    setHeight('10em')
    expect(node$.css('height')).toBe('10em')
  })
  
  it('should have a style prototype that returns the style of the node or an empty object', () => {
    const node$ = new ReaperNode$(document.createElement('div'))
    expect(node$.style()).toStrictEqual({})
    
    node$.setCss('width', '100px')
    expect(node$.style()).toStrictEqual({width: '100px'})
  })
  
  it('should have a setStyle prototype that sets the style of the node', () => {
    const node$ = new ReaperNode$(document.createElement('div'))
    expect(node$.css('color')).toBe('')

    const style = {
      width: '100px',
      color: 'red'
    }
    
    node$.setStyle(style)
    expect(node$.css('color')).toBe('red')
    expect(node$.css('width')).toBe('100px')
    
    const [count, setCount] = createState(1)
    const reactStyle = {
      width: () => `${10 * count()}em`,
      height: () => `${20 * count()}em`,
      color: 'green'
    }
    node$.setStyle(reactStyle)

    expect(node$.css('width')).toBe('10em')
    expect(node$.css('height')).toBe('20em')
    expect(node$.css('color')).toBe('green')
    
    setCount(3)
    expect(node$.css('width')).toBe('30em')
    expect(node$.css('height')).toBe('60em')
    expect(node$.css('color')).toBe('green')
  })

  it('should have an attr prototype that returns the value of the attribute', () => {
    const node$ = new ReaperNode$(document.createElement('div'))
    node$.node().setAttribute('profile', '👻')
    expect(node$.attr('profile')).toBe('👻')
  })

  it('should have a setAttr prototype that updates the value of the attribute', () => {
    const node$ = new ReaperNode$(document.createElement('div'))
    expect(node$.attr('profile')).toBeNull()
    node$.setAttr('profile', '👻')
    expect(node$.attr('profile')).toBe('👻')

    const [status, setStatus] = createState('❌')
    node$.setAttr('title', () => `status: ${status()}`)
    expect(node$.attr('title')).toBe('status: ❌')
    setStatus('✔')
    expect(node$.attr('title')).toBe('status: ✔')
  })

  it('should have a removeAttr prototype that removes the attribute', () => {
    const node$ = new ReaperNode$(document.createElement('div'))
    node$.node().setAttribute('profile', '👻')
    expect(node$.attr('profile')).toBe('👻')
    node$.removeAttr('profile')
    expect(node$.attr('profile')).toBeNull()
  })

  it('should have a value prototype that returns the value of the node', () => {
    const node$ = new ReaperNode$(document.createElement('input'))
    const test$ = new ReaperNode$(document.createElement('p'))
    expect(node$.value()).toBe('')
    expect(test$.value()).toBe('')

    node$.node().value = '👻';
    (test$.node() as HTMLInputElement).value = '👻'
    expect(node$.value()).toBe('👻')
    expect(test$.value()).toBe('')
  })

  it('should have a setValue prototype that sets the value of the node', () => {
    const node$ = new ReaperNode$(document.createElement('input'))
    expect(node$.value()).toBe('')

    node$.setValue('👻')
    expect(node$.value()).toBe('👻')
    
    const [name, setName] = createState('Kobby')
    node$.setValue(() => name())
    expect(node$.value()).toBe('Kobby')
    setName('Tim')
    expect(node$.value()).toBe('Tim')
  })

  it('should have a bindValue prototype that binds the value of a node to a state', () => {
    const node$ = new ReaperNode$(document.createElement('input'))
    expect(node$.value()).toBe('')
    
    const [name, setName] = createState('Kobby')
    node$.bindValue([name, setName])
    expect(node$.value()).toBe('Kobby')
    setName('Tim')
    expect(node$.value()).toBe('Tim')
    
    node$.node().value = 'Bob'
    expect(name()).toBe('Tim')
    node$.node().dispatchEvent(new InputEvent('change'))
    expect(name()).toBe('Bob')
  })
})