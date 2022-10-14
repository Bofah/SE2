export function hyphenToCamelCase(text: string){
  return text.replace(/-([a-z])/g, (g) => g[1].toUpperCase())
}

export class Stack<T> {
  private items: T[] = []

  public push(item: T){
    this.items.push(item)
  }

  public pop(): T | undefined{
    return this.items.pop()
  }
  
  public peek(): T | undefined{
    return this.items[this.items.length - 1]
  }
}