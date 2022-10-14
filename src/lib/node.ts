import { createReaction } from './state'
import {hyphenToCamelCase} from './utils'

export class ReaperNode$<T extends HTMLElement>{
  private $$node: HTMLElement
  constructor(node: T | null){
    if(node === null) throw new Error('Expected DOM node but got null | undefined')
    this.$$node = node
  }

  node(){
    return this.$$node as T
  }

  select(selector: string){
    return $(this.$$node, selector)
  }
  selectAll(selector: string){
    return $$(this.$$node, selector)
  }

  // SELECTORS
  parent(){
    try{
      return new ReaperNode$(this.$$node.parentElement)
    }
    catch(e) {return null}
  }
  children(){
    return (Array.from(this.$$node.children) as HTMLElement[]).map(el => new ReaperNode$(el))
  }
  next(){
    try{
      return new ReaperNode$(this.$$node.nextElementSibling as HTMLElement)
    }
    catch(e) {return null}
  }
  prev(){
    try{
      return new ReaperNode$(this.$$node.previousElementSibling as HTMLElement)
    }
    catch(e) {return null}
  }

  // EVENTS
  on(event: keyof HTMLElementEventMap, callback: (e: Event) => any){
    this.$$node.addEventListener(event, callback)
    return this
  }
  off(event: keyof HTMLElementEventMap, callback: (e: Event) => any){
    this.$$node.removeEventListener(event, callback)
    return this
  }

  // CONTENT
  text(){
    return this.$$node.textContent
  }
  setText(text: string | (() => string)){
    if(typeof text === 'string'){
      this.$$node.textContent = text
    }
    else{
      createReaction(() => {
        this.$$node.textContent = text()
      })
    }
    return this
  }
  html(){
    return this.$$node.innerHTML
  }
  setHtml(html: string | (() => string)){
    if(typeof html === 'string'){
      this.$$node.innerHTML = html   
    }
    else{
      createReaction(() => {
        this.$$node.innerHTML = html()
      })
    }
    return this 
  }
  setChildren(nodes: (string | Node | ReaperNode$<HTMLElement>)[] | (() => (string | Node | ReaperNode$<HTMLElement>)[])){
    if(typeof nodes === 'function'){
      createReaction(() => {
        this.$$node.replaceChildren(...nodes().map(node => {
          if(node instanceof ReaperNode$) return node.node()
          return node
        }))
      })
    }
    else{
      this.$$node.replaceChildren(...nodes.map(node => {
        if(node instanceof ReaperNode$) return node.node()
        return node
      }))
    }

    return this
  }
  append(...nodes: (string | Node | ReaperNode$<HTMLElement>)[]){
    this.$$node.append(...nodes.map(node => {
      if(node instanceof ReaperNode$) return node.node()
      return node
    }))

    return this
  }
  prepend(...nodes: (string | Node | ReaperNode$<HTMLElement>)[]){
    this.$$node.prepend(...nodes.map(node => {
      if(node instanceof ReaperNode$) return node.node()
      return node
    }))
    return this
  }
  remove(){
    this.$$node.remove()
    return this
  }

  // CLASSES
  addClass(className: string){
    this.$$node.classList.add(className)
    return this
  }
  removeClass(className: string){
    this.$$node.classList.remove(className)
    return this
  }
  toggleClass(className: string){
    this.$$node.classList.toggle(className)
    return this
  }

  // CSS
  css(property: string){
    const camelCaseProp = hyphenToCamelCase(property) as keyof CSSStyleDeclaration & string

    return this.$$node.style[camelCaseProp]
  }
  setCss(property: string, value: string | (() => string)){
    const camelCaseProp = hyphenToCamelCase(property) as keyof CSSStyleDeclaration

    if(typeof value === 'string'){
      // ! Fix later
      // @ts-ignore
      this.$$node.style[camelCaseProp] = value
    }
    else{
      createReaction(() => {
        // ! Fix later
        // @ts-ignore
        this.$$node.style[camelCaseProp] = value()
      })
    }
    return this
  }
  style(){
    const styleArr = this.$$node.getAttribute('style')?.split(/[\:\;]\s*/).slice(0, -1)

    return styleArr?.reduce((acc: {[key: string]: string}, curr: string, id) => {
      if(id % 2 === 0){
        acc[curr] = styleArr[id + 1]
      }
      return acc
      }
    , {}) ?? {}
  }
  setStyle(styleObj: {[key: string]: string | number | (() => string | number)}){
    for(const [key, value] of Object.entries(styleObj)){
      const camelCaseKey = hyphenToCamelCase(key) as keyof CSSStyleDeclaration

      if(typeof value === 'function'){
        createReaction(() => {
          // ! Fix later
          // @ts-ignore
          this.$$node.style[camelCaseKey] = value()
        })
      }
      else{
        // ! Fix later
        // @ts-ignore
        this.$$node.style[camelCaseKey] = value
      }
    }
    return this
  }

  // ATTRIBUTES
  attr(name: string){
    return this.$$node.getAttribute(name)
  }
  setAttr(name: string, value: string | (() => string)){
    if(typeof value === 'string'){
      this.$$node.setAttribute(name, value)
    }
    else{
      createReaction(() => [
        this.$$node.setAttribute(name, value())
      ])
    }
    return this
  }
  removeAttr(name: string){
    this.$$node.removeAttribute(name)
    return this.$$node.getAttribute(name)
  }

  value(){
    if(this.$$node instanceof HTMLInputElement){
      return this.$$node.value
    }
    else{
      return ''
    }
  }
  setValue(value: string | (() => string)){
    if(this.$$node instanceof HTMLInputElement){
      if(typeof value === 'string'){
        this.$$node.value = value
      }
      else{
        createReaction(() => {
          (this.$$node as HTMLInputElement).value = value()
        })
      }
    }

    return this
  }
  bindValue(state: [get: () => string, set: (v : string) => void]){
    if(this.$$node instanceof HTMLInputElement){
      createReaction(() => {
        (this.$$node as HTMLInputElement).value = state[0]()
      })

      this.$$node.addEventListener('change', (e) => {
        state[1]((e.target as HTMLInputElement).value ?? '')
      })
    }
    return this
  }

  // TRANSITIONS
  // ANIMATIONS
}

export function select(selector: string){
  return $(document, selector)
}

export function selectAll(selector: string){
  return $$(document, selector)
}

export function create(tagName: string){
  return $$$(tagName)
}

export function wrap(el: HTMLElement ){
  return $(document, el)!
}

export function wrapAll(els: HTMLElement | DocumentFragment | HTMLElement[]): ReaperNode$<HTMLElement>[]{
  if(Array.isArray(els)){
    return els.map(el => wrap(el))
  }
  else if(els instanceof DocumentFragment){
    return wrapAll(Array.from(els.children) as HTMLElement[])
  }
  else{
    return [$(document, els)!]
  }
}

// QuerySelector
export function $(parent: HTMLElement | Document, selector: HTMLElement | string): ReaperNode$<HTMLElement> | null{
  if(typeof selector === 'string'){
    try{
      return new ReaperNode$(parent.querySelector(selector))
    }
    catch(e) {return null}
  }
  else if(selector instanceof HTMLElement){
    return new ReaperNode$(selector)
  }
  else return null
}
// QuerySelectorAll
export function $$(parent: HTMLElement | Document, selector: string): ReaperNode$<HTMLElement>[] {
  return (Array.from(parent.querySelectorAll(selector as keyof HTMLElementTagNameMap | string)) as HTMLElement[]).map(el => new ReaperNode$(el))
}
// CreateElement
export function $$$(tagName: string): ReaperNode$<HTMLElement> | null{
  try{
    return new ReaperNode$(document.createElement(tagName))
  }
  catch(e) {return null}
}

// function $$insert<T extends unknown, S extends unknown>(parent: HTMLElement | ReaperNode$<HTMLElement>, value: any, current: any): T | S | (() => T | S){
//   if (value === current) return current;

//   while (typeof current === "function") current = current();

//   const t = typeof value;
//   const $$parent = parent instanceof ReaperNode$ ? parent.node() : parent;

//   if (t === "string" || t === "number") {
//     if (t === "number") value = value.toString();
//     current = $$parent.textContent = value;
//   } 
//   else if (value == null || t === "boolean") {
//     current = $$parent.textContent = "";
//   } 
//   else if (t === "function") {
//     createDeferedReaction(() => (current = $$insert($$parent, (value as Function)(), current)));
//     return () => current;
//   }
//   else if (value instanceof Node) {
//     if (Array.isArray(current)) {
//       $$parent.textContent = "";
//       $$parent.appendChild(value);
//     } else if (current == null || current === "") {
//       $$parent.appendChild(value);
//     } else $$parent.replaceChild(value, $$parent.firstChild);
//     current = value;
//   } 
//   else console.warn(`Skipped inserting ${value}`);

//   return current;
// }