# 使用方法

基于小程序的特性，已经参考了 redux 的原理，简单实现了一个小程序的 store 仓库

- 1.响应式更新页面
- 2.使用简单
- 3.代码量少

## 1.安装

在小程序的根目录下载

```js
 npm i minipro-store 或 yarn add minipro-store
```

## 2 引入以及使用

`注意事项：如果出现小程序tabbar页面切换后dispatch无法刷新页面，请在tabbar页面中的onShow执行app.store.connect(this)方法`

小程序使用 npm 包，需要通过 npm 构建，自行百度，构建完成后
App.js 创建一个仓库

```js
import CreateStore from 'minipro-store';
import state from './store/index';
// state 仓库数据， tabBar: []  //tabBar页面的路径：如：pages/index/index，无tabBar页面可不传
const store = new CreateStore({ state, tabBar: [] });
App({
  onLaunch() {},
  store,
});
```

store/index.js

```js
// 这里就是我们的数据全局保存的地方
export default {
  userInfo: {},
  name: '',
};
```

pages/index/index.js

```js
const app = getApp();
Page({
  onLoad() {
    app.store.connect(this);
  },
  onTap() {
    app.store.dispatch({
      name: '我是页面',
    });
  },
});
```

components/index/index.js

```js
const app = getApp();
Component({
  lifetimes: {
    attached: function () {
      app.store.connect(this);
    },
  },
  methods: {
    onTap() {
      app.store.dispatch({
        name: '我是组件',
      });
    },
  },
});
```

### useEffect

很多时候，我们需要监听某个属性是否改变，如，登录成功后，判断 isLogin 是否为 true，然后再发送请求数据
可在页面或组件中写入 useEffect,该函数返回一个数组，第一个参数是一个函数，第二个参数是一个 keys 数组
如下监听 name 的变化，变化后会触发函数的执行

```js
onLoad() {
  app.store.connect(this)
},
useEffect() {
  return [(prev,next) => {
    console.og('prev',prev)  //上一个值
    console.og('next',next)  //修改后的值
  },['name']
}
```

页面和组件的用法一致，都是在页面或组件创建的使用，通过 connect 方法订阅消息
然后通过 dispatch 修改 store 中的数据，并更新页面或组件的数据，diaptch 接受的参数必须是一个对象，
通过 store.state.name 直接修改 state 的数据并不会刷新页面
然后在对应的组件或者页面，可通过 store 变量访问到仓库中的数据
index.wxml

```js
<view>
{{store.name}}
</view>
```

## 更新日志

### 5-12

本次更新，添加了监听某个属性是否更新的功能

```js
// pages/index/index
Page({
  onLoad() {
    app.store.connect(this)
  },
  useEffect((prev,next) => {
    console.og('prev',prev)  //上一个值
    console.og('next',next)  //修改后的值
  },['name'])
})
```

修改了 app.store.effect 的用法

```js
app.store.effect({
  count: count + 1
})
//或
getValue() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        count: 999
      })
    },1000)
  })
},
onClick() {
  app.store.effect(this.getValue())
}
```

### 4-25

本次更新，解决了切换 tabbar 页面后（A -> B, B ->A）,在 tabbar 页面注册的组件无法刷新的问题
new CreateStore 方法进行了改变

```js
new CreateStore(store)

->
new CreateStore({
  state,
  //这是页面的tabber页面的路径,如果定义了tabbar页面，必传，否则会出现tabbar页面的组件数据无法更新的问题
  tabBar: ['pages/index/index']
})
```

### 4-22

本次更新，引入了 effect 方法
使用：

```js
// 参数1，可接受一个action或者一个函数，参数2，修改store数据成功后的回调
async getValue(name) {
  const res = await new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        name: '我是name'
      })
    },1000)
  })
  return res
},
onTap() {
  app.store.effect(() => this.getValue(),(state) => {
      console.log('23',state)
  })
}
```
