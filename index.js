/**
 * 创建仓库
 * 使用方法
 * 1.const store = new CreateStore(data),在需要使用的页面或者组件引入store，在onLoad或者attached的时候链接仓库(store.connect(this))
 * 2.wxml文件使用变量store即可访问到数据
 * 3.使用store.state直接修改store的state,不会更新视图，需要使用dispatch(data)
 */
"use strict";
import isPlainObject from "./utils/isPlainObject";
const isFn = (fn) => typeof fn === "function";
class CreateStore {
  constructor({ state, tabBar }) {
    this.listeners = {};
    this.state = state;
    this.tabBar = tabBar || [];
    this.ignores = [];
    this.id = null;
  }
  updateState(newState) {
    this.state = newState;
  }
  getState() {
    return this.state;
  }
  reducer(previousState, action) {
    return {
      ...previousState,
      ...action,
    };
  }
  publish() {
    Object.values(this.listeners).forEach((item) => {
      item.forEach((listener) =>
        listener.setData({
          store: this.state,
        })
      );
    });
  }
  async effect(fn, callback) {
    let action = {};
    if (isFn(fn)) {
      action = await fn();
    }
    if (isPlainObject(fn)) {
      action = action;
    }
    this.dispatch(action);
    typeof callback === "function" && callback(this.state);
  }
  dispatch(action) {
    //修改数据，更新视图
    if (!isPlainObject(action)) {
      throw new Error(`
        action 必须是一个普通对象
      `);
    }
    const newState = this.reducer(this.state, action);
    if (newState) {
      this.updateState(newState);
      this.publish();
    }
  }
  subscribe(listener) {
    const id = listener.__wxWebviewId__;
    if (this.listeners[id]) {
      this.listeners[id].push(listener);
    } else {
      this.listeners[id] = [listener];
    }
  }
  // 链接仓库
  connect(listener) {
    // console.log('链接store的pageId:',listener.__wxWebviewId__)
    this.subscribe(listener); //添加观察者
    if (listener.route) {
      this.filter(listener); //过滤被销毁的页面的观察者
    }
    this.publishCurrent(listener); //修改数据
  }
  //页面或组件链接store后修改数据
  publishCurrent(listener) {
    listener.setData({
      store: this.state,
    });
  }
  filter(listener) {
    const pages = getCurrentPages();
    const mapListeners = {};
    if (this.tabBar.includes(listener.route)) {
      this.ignores.push(listener.__wxWebviewId__);
    }
    pages.forEach((page) => {
      const id = page.__wxWebviewId__;
      mapListeners[id] = this.listeners[id];
      this.ignores.forEach((i) => {
        mapListeners[i] = this.listeners[i];
      });
    });
    this.listeners = mapListeners;
  }
}

export default CreateStore;
