/**
 * 创建仓库
 * 使用方法
 * 1.const store = new CreateStore(data),在需要使用的页面或者组件引入store，在onLoad或者attached的时候链接仓库(store.connect(this))
 * 2.wxml文件使用变量store即可访问到数据
 * 3.使用store.state直接修改store的state,不会更新视图，需要使用dispatch(data)
 */
'use strict';
class Store {
  constructor(options) {
    const { state, tabBar } = options;
    this.prevState = state;
    this.state = state || {};
    this.subscribers = {};
    this.tabBar = tabBar || [];
  }
  getState() {
    return this.state;
  }
  reducer(state, action) {
    return {
      ...state,
      ...action,
    };
  }
  dispatch(action) {
    const prevState = JSON.parse(JSON.stringify(this.state));
    this.prevState = prevState;
    this.state = this.reducer(prevState, action);
    Object.entries(this.subscribers).forEach(([pageId, subscribers]) => {
      subscribers.forEach((subscriber) => this.updateCurrent(subscriber));
    });
  }
  subscribe(subscriber) {
    const id = subscriber.__wxWebviewId__;
    this.subscribers[id]
      ? this.subscribers[id].push(subscriber)
      : (this.subscribers[id] = [subscriber]);
  }
  // 链接仓库
  connect(subscriber) {
    this.subscribe(subscriber);
    this.unsubscribe(subscriber);
    this.updateCurrent(subscriber, true);
  }
  // 取消订阅
  unsubscribe(subscriber) {
    const { route } = subscriber;
    if (!this.tabBar.includes(route)) return;
    const pages = getCurrentPages();
    const newSubscribers = {};
    pages.forEach((page) => {
      const id = page.__wxWebviewId__;
      newSubscribers[id] = this.subscribers[id];
    });
    this.newSubscribers = newSubscribers;
  }
  effect(fn) {
    //异步
    Promise.resolve(fn)
      .then((value) => {
        this.dispatch(value);
      })
      .catch();
  }
  // 首次加载，执行页面的useEffect
  mounted(subscriber) {
    if (typeof subscriber.useEffect !== 'function') return;
    const [fn] = subscriber.useEffect();
    fn.apply(subscriber, [this.prevState, this.state]);
  }
  useEffect(subscriber) {
    // 监听某个属性是否更新
    if (typeof subscriber.useEffect !== 'function') return;
    const [fn, keys = []] = subscriber.useEffect();
    const isUpdate =
      keys.length === 0
        ? true
        : keys.some((key) => this.prevState[key] !== this.state[key]);
    isUpdate && fn.apply(subscriber, [this.prevState, this.state]);
  }
  // connect时调用、dispatch时调用
  updateCurrent(subscriber, firstMounted) {
    //  更新当前订阅者数据
    subscriber.setData(
      {
        store: this.state,
      },
      () => {
        firstMounted && this.mounted(subscriber);
        this.useEffect(subscriber);
      },
    );
  }
}
export default Store;
