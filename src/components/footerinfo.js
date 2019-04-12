import CSSA_LOGO_2019_red_w400 from "../images/CSSA_LOGO_2019_red_w400.png"
import { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'

export default class FooterInfo extends Component {
    render() {
        return (
            <View>
                <View style="text-align: center;padding-right: 32rpx;font-weight: bold;padding:16px 0;border-top: 1px solid #ddd; border-bottom: 1px solid #ddd">
                    <View>
                        <Text style="color: #999">信息错误？信息不全？</Text>
                    </View>
                    <View>
                        <Text style="color: #999">我们希望得到你的反馈！</Text>
                    </View>
                    <Button className="contact-btn" style="margin: 32rpx 16rpx" open-type='contact'>联系我们</Button>
                </View>
                <View style="margin: 32rpx;">
                    <View style="text-align: center">
                        <Image
                            style="width: 150rpx;height:150rpx;display: inline-block"
                            src={CSSA_LOGO_2019_red_w400}></Image>
                    </View>

                    <View style="margin-top: 16rpx;">
                        <Text style="color: #666;font-weight: bold; font-size: 16px">手册系列文章由历届PSUCSSA、校友以及Penn State Global Office合作编写。</Text>
                        <Text style="color: #666;font-weight: bold; font-size: 16px">关注CSSA公众号与Instagram：pennstatecssa，获取更多生活学习信息。</Text>
                    </View>
                </View>
            </View>
        )
    }
}