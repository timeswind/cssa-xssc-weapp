import Index from './pages/index/index'
import globalStore from './store/global';

import "taro-ui/dist/style/components/drawer.scss";
import "taro-ui/dist/style/components/list.scss";
import "taro-ui/dist/style/components/icon.scss";
import "taro-ui/dist/style/components/search-bar.scss";
import "taro-ui/dist/style/components/button.scss";
import "taro-ui/dist/style/components/float-layout.scss";
import "taro-ui/dist/style/components/accordion.scss";
import "taro-ui/dist/style/components/flex.scss";

import './app.css';
import Taro, { Component } from '@tarojs/taro'
import { Provider } from '@tarojs/mobx'


// import 'taro-ui/dist/style/index.scss'

// 如果需要在 h5 环境中开启 React Devtools
// 取消以下注释：
if (process.env.NODE_ENV !== 'production' && process.env.TARO_ENV === 'h5') {
  require('nerv-devtools')
}

const store = {
  globalStore
}

class App extends Component {

  constructor() {
    super();
    this.config = {
      pages: [
        'pages/index/index',
        'pages/about',
        'pages/xssc',
        'pages/major_wiki',
        'pages/yearbook/menu',
        'pages/yearbook/reader',
        // 'pages/maps/school',
        'pages/maps/bus',
        'pages/maps/school',
        'pages/sitemaps/index',
        'pages/sitemaps/freshman_wiki',
        'pages/sitemaps/major_wiki'
      ],
      window: {
        backgroundTextStyle: 'light',
        backgroundColor: '#ee5050',
        navigationBarTitleText: 'CSSA 新手手册',
        navigationBarTextStyle: 'black',
        navigationStyle: "custom"
      }
    }
  } 

  componentDidMount() {
    let self = this;
    Taro.getSystemInfo({
      success: res => {
        let modelmes = res.model
        if (modelmes.search('iPhone X') != -1 || modelmes.search('iPhone12') != -1) {
          store.globalStore.setDevice("iPhone X")
        }
        store.globalStore.setWindowHeight(res.windowHeight)
        store.globalStore.setStatusBarHeight(res.statusBarHeight)
      }
    })
  }

  render() {
    return (
      <Provider store={store}>
        <Index />
      </Provider>
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
