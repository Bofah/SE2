import { Stack } from "./utils"
interface Subscriber {
  exec: Function
  deps: Set<Set<Subscriber>>
  cleanups: Set<Function>
}

let context = new Stack<Subscriber>()

export function createState<T>(initialValue?: T): [() => T, (v: T) => void] {
  let state = initialValue as T
  let subscribers = new Set<Subscriber>()

  const getter = () => {
    const currReaction = context.peek()
    if(currReaction != null){
      subscribers.add(currReaction)
      currReaction.deps.add(subscribers)
    }
    return state
  }
  const setter = (value: T) => {
    state = value
    for(const sub of [...subscribers]){
      sub.exec()
    }
  }

  return [getter, setter]
}

export function onCleanup(callback: Function){
  const sub = context.peek()
  if(sub != null){
    sub.cleanups.add(callback)
  }
}

export function cleanup(sub: Subscriber){
  for(const dep of sub.deps){
    dep.delete(sub)
  }
  for(const cb of sub.cleanups){
    cb()
  }

  sub.deps.clear()
  sub.cleanups.clear()
}

export function createReaction(callback: Function){
  function exec(){
    cleanup(curr)
    context.push(curr)
    try{
      callback()
    }
    finally{
      context.pop()
    }
  }

  const curr = {
    exec,
    deps: new Set<Set<Subscriber>>(),
    cleanups: new Set<Function>()
  }

  exec()
}

export function createDeferedReaction(callback: Function){
  let timer: number | NodeJS.Timeout | undefined

  createReaction(() => { 
    const curr = context.peek()
    timer = setTimeout(() => {
      if(curr != null) context.push(curr)
      callback()
      context.pop()
    }, 0);
    
    onCleanup(() => {
      clearTimeout(timer);
    })
  })
}

export function createMemo<T extends unknown>(callback: () => T){
  const [state, setState] = createState<T>()
  createReaction(() => setState(callback()))
  
  return state
}