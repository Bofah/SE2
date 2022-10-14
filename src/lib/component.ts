import { ReaperNode$ } from "./node";

export interface Component<T extends unknown> {
  (props?: T): string | Node | ReaperNode$<HTMLElement> | (string | Node | ReaperNode$<HTMLElement>)[]
}

export function render<T extends unknown>(target: HTMLElement | ReaperNode$<HTMLElement>, component: Component<T>, props?: T){
  const $$node = component(props)

  let targetEl: HTMLElement
  if(target instanceof HTMLElement){
    targetEl = target
  }
  else{
    targetEl = target.node()
  }

  function appendNode(target: HTMLElement, node: string | Node | ReaperNode$<HTMLElement> | (string | Node | ReaperNode$<HTMLElement>)[]){
    if(typeof node === 'string'){
      target.append(node)
    }else if(node instanceof ReaperNode$){
      target.appendChild(node.node())
    }else if(Array.isArray(node)){
      node.forEach(n => {
        appendNode(target, n)
      })
    }else{
      target.append(node)
    }
  }

  appendNode(targetEl, $$node)

}