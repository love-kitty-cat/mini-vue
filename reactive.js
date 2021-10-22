class Dep {
  constructor() {
    this.subscribe = new Set()
  }
  addSubscribe(effect) {
    this.subscribe.add(effect)
  }
  depend() {
    if (activeEffect) {
      this.addSubscribe(activeEffect)
    }
  }
  notify() {
    this.subscribe.forEach(item => {
      item()
    })
  }
}

let activeEffect = null

function watchEffect(foo) {
  activeEffect = foo
  foo()
  activeEffect = null
}

// targetMap 存放所有对象的映射
// depsMap 存放单对象所有属性的映射
// dep 存放单属性所有dep
const targetMap = new WeakMap()

function getDep(target, key) {
  let depsMap = targetMap.get(target)
  // 不存在创建并赋值给targetMap
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Dep()
    depsMap.set(key, dep)
  }
  return dep
}

// vue2
// function reactive(raw) {
//   Object.keys(raw).forEach(key => {
//     const dep = getDep(raw, key)
//     let value = raw[key]

//     Object.defineProperty(raw, key, {
//       get() {
//         dep.depend()
//         return value
//       },
//       set(newVaule) {
//         value = newVaule
//         dep.notify()
//       }
//     })
//   })
//   return raw
// }

// vue3
function reactive(raw) {
  return new Proxy(raw, {
    get(target,key){
      const dep = getDep(target,key)
      dep.depend()
      return target[key]
    },
    set(target,key,newValue){
      const dep = getDep(target,key)
      target[key] = newValue
      dep.notify()
    }
  })
}

const obj = reactive({aaa:'bciji',counter:1})
watchEffect(()=>{
  console.log('obj :>> ', obj.counter * 2);
})
obj.counter++