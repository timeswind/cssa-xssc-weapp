import CSSA_LOGO_2019_red_w400 from "../images/CSSA_LOGO_2019_red_w400.png"
import { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import './footerinfo.css';

export default class FooterInfo extends Component {
    render() {
        return (
            <View>
                <View className="feedback-wrapper">
                    <View>
                        <Text style="color: #999">信息错误？信息不全？</Text>
                    </View>
                    <View>
                        <Text style="color: #999">我们希望得到你的反馈！</Text>
                    </View>
                    <Button className="contact-btn" style="margin: 32rpx 16rpx" open-type='contact'>联系我们</Button>
                </View>
                <View style="margin: 32rpx;">
                    <View style="text-align: center;margin: 32rpx;">
                        <Image
                            style="width: 150rpx;height:150rpx;display: inline-block"
                            src={CSSA_LOGO_2019_red_w400}></Image>
                    </View>

                    <View style="margin: 16rpx 0 32rpx 0;">
                        <Text style="color: #666;font-weight: bold; font-size: 16px">手册系列文章由历届<Text style="color: #ee5050">PSUCSSA</Text>、校友以及Penn State Global Office合作编写。</Text>
                    </View>
                    <View>
                        <Text className="foot-info-entry-key">微信公众号</Text>
                        <Text className="foot-info-entry-value">留学在宾州州立CSSA</Text>
                    </View>
                    <View>
                        <Text className="foot-info-entry-key">Instagram</Text>
                        <Text className="foot-info-entry-value">pennstatecssa</Text>
                    </View>
                </View>
            </View>
        )
    }
}