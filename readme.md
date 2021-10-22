# mini-vue

简易vue
## render 渲染
步骤：vnode-> 真实dom ->挂载 -> patch
#### `h(tag, props, children) `——返回vnode
#### `mount(vnode, root)` ——创建真实dom并挂载
1. tag 创建真实节点，并对vnode.el赋值为该节点（patch才能进行新旧节点props与children的比较）
2. props 将属性添加到该节点上
3. children 若children为字符串，设置该节点内容，否则递归调用本函数
4. 挂载到root
#### `patch(n1, n2)` ——更新节点
1. tag 不相同移除n1再挂载n2，相同进入**props**与**children**的比较
2. props 将n1.el赋给n2.el，保证每个节点都有el可进行比较
+ 更新：n2的key在n1中遍历更新，若key为`'on'`开头，需移除原事件再添加事件（因为传的是匿名函数，即使内容一样，addEventListener也会重复添加事件而不会覆盖事件）
+ 删除：n2的key若在n1中找不到，则删除
3. children 
+ 新旧节点有一方为字符串，直接替换
+ 新旧节点都为数组，则根据数组长度分为3种情况
-= 用Math.min拿到数组公共长度，循环patch(旧，新)
-新>旧  新数组用slice截取出剩余长度并进行遍历，再mount挂载
-新<旧  旧数组用slice截取出剩余长度并进行遍历，再拿到父节点移除该元素

## reactive 响应式
步骤：reactive包裹数据，通过Object.definedProperty(vue2)或proxy(vue3)中的get与set劫持数据，get收集依赖，set调用依赖函数，以达到响应式
#### dep map数据结构
+ targetMap —— WeakMap—— key为对象，存放所有对象的映射
+ depsMap —— Map—— key为属性 存放单对象所有属性的映射
+ dep —— Dep—— 存放单属性所有依赖
#### `activeEffect` 
临时变量，与watchEffect和depend配合添加依赖函数
#### `Dep类` 
+ subscribe 存放依赖函数
+ depend 与get配合收集依赖函数到subscribe 
+ notify 遍历subscribe并执行依赖函数
#### `watchEffect(function)`
被其包裹的函数会自动执行一次，此时会触发get，进而触发depend从而收集到依赖

#### `getDep(target,key)`
根据target与key，从targetMap->depsMap ->dep，层层找到对应的依赖Dep
#### `reactive(raw)`——vue2
通过Object.keys(raw)拿到raw所有key，再一一用Object.definedProperty的get与set进行数据劫持
>【注】Object.definedProperty 劫持的是原数据，需要将劫持的值拿出来做修改，不能直接对原数据进行修改，否则会一直递归get或set
+ getDep通过raw和key拿到dep
+ get调用dep.depend
+ set调用dep.notify
#### `reactive(raw)`——vue3
通过Proxy的get与set进行数据劫持，劫持的是proxy，因此可以在get与set中对原数据进行修改
+ getDep通过target和key拿到dep
+ get调用dep.depend
+ set调用dep.notify
## util
#### `createApp(rootComponent)`
返回一个`mount(selector)`函数
+ 第一次调用：将rootComponent挂载到selector上，并将rootComponent作为旧节点
+ 第n次调用：patch新旧节点，并将新节点的值赋给旧节点

