// @vitest-environment jsdom
import {describe, it, expect} from 'vitest'
import { render } from '../component'
import { create, wrap } from '../node'

describe('Render', () => {
  it('should append a rendered component to a target DOM node', () => {
    const text = 'Hello ghost👻'
    const next = 'Take me away'

    const component = () => (
      [
        create('h1')!.setText(text),
        create('p')!.setText(next)
      ]
    )

    const host = document.createElement('div')
    render(host, component)

    expect(wrap(host)?.children()[0].text()).toBe(text)
    expect(wrap(host)?.children()[1].text()).toBe(next)
  })

  it('should append a rendered component to a target DOM node', () => {
    const text = 'Hello ghost👻'

    const component = () => (
      create('h1')!.setText(text)
    )

    const host$ = create('div')!
    render(host$, component)

    expect(host$.children()[0].text()).toBe(text)
  })

  it('should append a rendered component which returns either a string, a DOM node or a ReaperNode to a target DOM node', () => {
    const node1$ = create('p')!
    const node2 = document.createElement('div')
    const node3 = 'Hello ghost👻'

    const host = document.createElement('div')
    const children = () => wrap(host)!.children()
    expect(children()).toHaveLength(0)

    const component1 = () => node1$
    render(host, component1)
    expect(children()).toHaveLength(1)
    expect(children()[0]).toStrictEqual(node1$)
    
    const component2 = () => node2
    render(host, component2)
    expect(children()).toHaveLength(2)
    expect(children()[1].node()).toStrictEqual(node2)
    
    const component3 = () => node3
    render(node1$.node(), component3)
    expect(node1$.text()).toBe(node3)
  })

  it('should append a rendered component to a target DOM node with the passed props', () => {
    const text = 'Hello ghost👻'

    const component = (props?: {text: string}) => (
      create('h1')!.setText(props?.text ?? '')
    )

    const host = document.createElement('div')
    render(host, component, {text: 'Hello ghost👻'})

    expect(wrap(host)?.children()[0].text()).toBe(text)
  })
})