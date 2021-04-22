# 使用方法

- 1.const store = new CreateStore(data),在需要使用的页面或者组件引入 store，在 onLoad 或者 attached 的时候链接仓库(store.connect(this))
- 2.wxml 文件使用变量 store 即可访问到数据
- 3.使用 store.state 直接修改 store 的 state,不会更新视图，需要使用 dispatch(data)
