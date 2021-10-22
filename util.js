function createApp(rootComponent) {
  return {
    mount(selector) {
      const container = document.querySelector(selector)
      let isMounted = false
      let oldNode = null

      // 用watchEffect添加dep，使其响应式
      // mount：挂载时用到了counter，触发proxy的get,收集到dep
      // patch：counter改变触发proxy的set，notify 依次执行subscribe的方法
      watchEffect(() => {
        if (!isMounted) {
          // debugger
          oldNode = rootComponent.render()
          mount(oldNode, container)
          isMounted = true
        } else {
          newNode = rootComponent.render()
          patch(oldNode, newNode)
          oldNode = newNode
        }
      })
    }
  }
}