const h = (tag, props, children) => {
  return {
    tag,
    props,
    children
  }
}

const mount = (vnode, root) => {
  // 创建真实节点
  const el = vnode.el = document.createElement(vnode.tag)

  // 添加属性
  for (const key in vnode.props) {
    // on开头添加事件，否则添加属性
    if (key.startsWith('on')) {
      el.addEventListener(key.slice(2).toLowerCase(), vnode.props[key])
    } else {
      el.setAttribute(key, vnode.props[key])
    }
  }

  // 挂载
  // children为字符串停止递归
  if (vnode.children) {
    if (typeof vnode.children === 'string') {
      el.innerHTML = vnode.children

    } else {
      for (const key in vnode.children) {
        mount(vnode.children[key], el)
      }
    }
    root.appendChild(el)
  }
}

// tag -> props -> children
const patch = (n1, n2) => {
  // tag不一样直接替换
  if (n2.tag !== n1.tag) {
    const parrent = n1.el.parentNode
    parrent.removeChild(n1.el)
    mount(n2, parrent)
  } else {
    // 1 取出el对象，并在n2中保存
    const el = n2.el = n1.el

    // 2 取出新旧props
    const oldProps = n1.props || {}
    const newProps = n2.props || {}
    //  更新添加props
    for (const key in newProps) {
      const oldValue = oldProps[key]
      const newValue = newProps[key]
      if (newValue !== oldValue) {
        if (key.startsWith('on')) {
          el.removeEventListener(key, oldValue)
          el.addEventListener(key, newValue)
        } else {
          el.setAttribute(key, newValue)
        }
      }
    }
    // 删除旧值
    for (const key in oldProps) {
      if (!(key in newProps)) {
        if (key.startsWith('on')) {
          el.removeEventListener(key, oldValue)
        } else {
          el.removeAttribute(key)
        }
      }
    }


    // 3 处理children
    const oldChildren = n1.children || []
    const newChildren = n2.children || []

    // 新节点为字符串
    if (typeof newChildren === "string") {
      if (typeof oldChildren === "string") {
        el.textContent = newChildren
      } else {
        el.innerHTML = newChildren
      }
    } else {
      // 新节点为数组，旧节点为字符串
      if (typeof oldChildren === "string") {
        newChildren.forEach(item => {
          mount(item, el)
        })
      } else {
        // 新旧都为数组
        // n1 [a,b,c,d,e]
        // n2 [a,b,c,d]

        // 处理公有长度 
        const commonLength = Math.min(oldChildren.length, newChildren.length)
        for (let i = 0; i < commonLength; i++) {
          patch(oldChildren[i], newChildren[i])
        }

        // new.length > old.length
        if (newChildren.length > oldChildren.length) {
          newChildren.slice(oldChildren.length).forEach(item => {
            mount(item, el)
          })
        }

        // new.length < old.length
        if (newChildren.length < oldChildren.length) {
          oldChildren.slice(newChildren.length).forEach(item => {
            el.removeChild(item.el)
          })
        }
      }
    }

  }
}