import Taro, { Component } from '@tarojs/taro'
import { View, Text, Button, Image } from '@tarojs/components'
import './index.css'
import CSSA_LOGO_2019_white_w400 from "../../images/CSSA_LOGO_2019_white_w400.png"
import { observer, inject } from '@tarojs/mobx'

@inject('globalStore')
@observer
class IndexPage extends Component {

  config = {
    navigationBarTitleText: 'CSSA 新生手册'
  }

  state = {
    year: new Date().getFullYear()
  }

  onShareAppMessage(res) {
    return {
      title: 'Penn State CSSA 新生手册',
      path: 'pages/index/index?from=share'
    };
  }

  navigate = (path) => {
    Taro.navigateTo({
      url: path
    })
  }

  render() {
    return (
      <View className='index container'>
        <View className="bg-red--cssa index-top-bg" style="padding: 0 0 64rpx 64rpx;text-align: left">
          <View className="index-title">
            <Image
              style="width: 150rpx;height:150rpx;display: block"
              src={CSSA_LOGO_2019_white_w400}></Image>
          </View>
          <Text style="font-size:40rpx;color:#fff;font-weight: bold;margin-bottom:16rpx; display: block" onClick={() => this.navigate('/pages/about')}>
            <Text>关于我们</Text>
            <Text class="at-icon at-icon-chevron-right"></Text>
          </Text>
          <Text className="color-deepred--cssa" style="font-size: 32px; font-weight: bold">欢迎来到宾州州立！</Text>
        </View>
        <View className="navigationcard_wrapper" style="margin: 16px">
          <View className="navigationcard freshman-wiki-bg" onClick={() => this.navigate('/pages/xssc')}>
            <Text className="index-card-title">新生手册{this.state.year}</Text>
            <Text style="font-weight: bold; color: #a02727; font-size: 18px;margin-top:4px;display: block">解决你的所有疑惑</Text>
          </View>
        </View>
        <View className="navigationcard_wrapper" style="margin: 16px;margin-top:0;padding-top:0">
          <View className="navigationcard major-wiki-bg" onClick={() => this.navigate('/pages/major_wiki')}>
            <Text className="index-card-title">PSU专业百科</Text>
            <Text style="font-weight: bold; color: #ff6f00; font-size: 18px;margin-top:4px;display: block">和你想的一样吗</Text>
          </View>
        </View>
        {/* <View className="navigationcard_wrapper" style="margin: 16px;margin-top:0;padding-top:0">
          <View className="navigationcard school-map-bg" onClick={() => this.navigate('/pages/maps/school')}>
            <Text className="index-card-title">校园地图</Text>
            <Text style="font-weight: bold; color: #0d47a1; font-size: 18px;margin-top:4px;display: block">好多楼啊</Text>
          </View>
        </View> */}
        <View className="navigationcard_wrapper" style="margin: 16px;margin-top:0;padding-top:0">
          <View className="navigationcard catabus-map-bg" onClick={() => this.navigate('/pages/maps/bus')}>
            <Text className="index-card-title">Catabus</Text>
            <Text style="font-weight: bold; color: #0d47a1; font-size: 18px;margin-top:4px;display: block">巴士线路时刻</Text>
          </View>
        </View>
        <View className="navigationcard_wrapper" style="margin: 16px;margin-top:0;padding-top:0">
          <View className="navigationcard school-map-bg" onClick={() => this.navigate('/pages/maps/school')}>
            <Text className="index-card-title">University Park</Text>
            <Text style="font-weight: bold; color: #0d47a1; font-size: 18px;margin-top:4px;display: block">校园地图</Text>
          </View>
        </View>

        <View style="text-align: right;margin-right: 32rpx;font-weight: bold">
          <View>
            <Text style="color: #999">
              信息错误？信息不全？
        </Text>
          </View>
          <View>
            <Text style="color: #999">
              我们希望得到你的反馈！
        </Text>
          </View>
          <Button class='contact-btn' style="margin-top: 32rpx;margin-right: 16rpx" open-type='contact'>联系我们</Button>

        </View>
        <View style="text-align:left;float:left;margin-top:-200rpx">
          <Image src="https://idd.cssapsu.cn/images/little_sa_with_pig_smile_avatar_h200.png"
            style="width:180rpx;display:inline_block"
            mode="widthFix" />
        </View>

        <View onClick={() => this.navigate('/pages/sitemaps/index')} className="cssa_yearbook_menu_button">
          <Text>索引 Indexes</Text>
        </View>

        <View onClick={() => this.navigate('/pages/yearbook/menu')} className="cssa_yearbook_menu_button">
          <Text>CSSA历年年鉴</Text>
        </View>

      </View>
    )
  }
}

export default IndexPage 
