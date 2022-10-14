import './style.css'
import { create, createState, render, select } from "./lib";
import type { ReaperNode, Component } from "./lib";

const Counter = (props?: {value: number}) => {
  const [count, setCount] = createState(props?.value ?? 0)

  return (
    create('button')!.addClass('btn')
      .on('click', () => setCount(count() + 1))
      .append(
        create('span')!.setText(() => `Count: ${count()}`)
      )
  )
}

const Clock = () => {
  const [date, setDate] = createState(new Date())
  
  const hours = () => date().getHours()
  const mins = () => date().getMinutes()
  const secs = () => date().getSeconds()
  
  setInterval(() => setDate(new Date()), 1000)

  return (
    create('p')!
      .append(
        create('span')!
          .setText(() => `${hours().toString().padStart(3, '0')}`),
        ': ',
        create('span')!
          .setText(() => `${mins().toString().padStart(3, '0')}`),
        ': ',
        create('span')!
          .setText(() => `${secs().toString().padStart(3, '0')}`)
      )
      .setStyle({
        fontSize: '3em',
        fontFamily: 'Georgia'
      })
  )
}

const HexGenerator = (props?: {value: number}) => {
  const [color, setColor] = createState(props?.value ?? 0x0055ff)
  const colorHex = () => `#${color().toString(16).padStart(7, '0')}`

  return (
    create('div')!.setCss('position', 'relative')
      .append(
        create('p')!
          .setText(() => colorHex())
          .setStyle({
            margin: '0.2em', 
            padding: '0.26em 1em', 
            position: 'absolute', 
            top: '-2em', cursor: 'copy',
            backgroundColor: () => colorHex()
          })
          .setAttr('title', 'Copy 🎨')
          .on('click',() => {
            navigator.clipboard.writeText(colorHex())
          }),
          
        create('button')!.addClass('btn')
          .setText('Random color')
          .on('click', () => setColor(Math.round(Math.random() * 0xffffff)))
      )
  )
}

interface Todo{
  text: string,
  completed: boolean
}

const TodoList = () => {
  const [todos, setTodos] = createState<Todo[]>([])
  const [todo, setTodo] = createState('')

  function addTodo(e:Event){
    e.preventDefault()
    if(todo() === '') return
    setTodos([...todos(), {text: todo(), completed: false}])
    setTodo('')
  }

  return (
    create('div')!.append(
      create('form')!.append(
        create('input')!
          .bindValue([todo, setTodo])
        ,
        create('button')!.addClass('btn').setText('Add')
      )
        .setCss('display', 'flex')
        .on('submit', addTodo)
      ,
      create('ul')!.setChildren(() => {
        if(todos().length === 0) {
          return [create('p')!.setText('No todos available')]
        }
        else{
          return (
            todos().map(t => (
              create('li')!.append(
                create('button')!.setText('✔')
                  .on('click', () => {
                    setTodos(todos().filter(tt => (
                      tt.text !== t.text
                    )))
                  })
                ,
                create('p')!.setText(t.text)
                  .setStyle({
                    textDecoration: t.completed ? 'line-through': '',
                    color: t.completed ? '#999': '#333',
                  })
              )
                .setCss('display', 'flex')
            )) 
          )
        }
      })
    )
  )
}

function setupDemo<T>(name: string, component: Component<T>, target$: ReaperNode<HTMLElement>, props?: T) {
  target$.prepend(create('div')!.addClass('showcase'))
  target$.prepend(create('h3')!.setText(name))
  render(target$.select('.showcase')!, component, props)

  // target$.append(
  //   create('div')!.addClass('code')
  //     .append(create('pre')!)
  //     .append(create('code')!)
  //     .setText(`${component.toString()}`)
  // )
}

setupDemo('Counter', Counter, select('#counter')!)
setupDemo('Clock', Clock, select('#clock')!)
setupDemo('Hex generator', HexGenerator, select('#hex-generator')!)
setupDemo('Todo list', TodoList, select('#todo-list')!)
