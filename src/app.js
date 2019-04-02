import Taro, { Component } from '@tarojs/taro'
import { Provider, observer, inject } from '@tarojs/mobx'
import Index from './pages/index'

import counterStore from './store/counter'
import globalStore from './store/global'

import './app.css'
import 'taro-ui/dist/style/index.scss'

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5') {
  require('nerv-devtools')
}

const store = {
  counterStore,
  globalStore
}

class App extends Component {

  config = {
    pages: [
      'pages/index/index',
      'pages/xssc'
    ],
    window: {
      backgroundTextStyle: 'light',
      backgroundColor: '#ee5050',
      navigationBarTitleText: 'CSSA 新手手册',
      navigationBarTextStyle: 'black',
      "navigationStyle": "custom"
    }
  }

  componentDidMount() {
    wx.getSystemInfo({
      success: res => {
        let modelmes = res.model
        if (modelmes.search('iPhone X') != -1) {
          store.globalStore.setDevice("iPhone X")
        }
      }
    })
  }

  componentDidShow() { }

  componentDidHide() { }

  componentDidCatchError() { }

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render() {
    return (
      <Provider store={store}>
        <Index />
      </Provider>
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
