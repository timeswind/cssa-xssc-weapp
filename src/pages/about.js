import { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import mta from 'mta-wechat-analysis';

class About extends Component {

    config = {
        navigationBarTitleText: '关于我们',
        usingComponents: {
            wemark: '../wemark/wemark'
        }
    }

    state = {
        md: `欢迎大家来到宾夕法尼亚州立大学（PSU）！始建于1855年的宾州州立大学是全美最优秀的公立大学之一，有着『美国公立常春藤』的美誉。

作为PSU最具影响力的学生组织以及State College地区唯一受到中国驻美领事馆认证及资助的官方中国学生组织，宾州州立大学中国学生学者联谊会（PSUCSSA）已经连续为来自祖国各地的学生和学者贴心服务17年之久。CSSA \(中国学生学者联合会\) 全称为 Chinese Students and Scholars Association，是所在城市State College中最大的一个华人团体组织，目的是**服务全体中国留学生和学者，增进团结和友谊， 扩大中国文化在校园中的影响。**

在即将到来的入学季，PSUCSSA代表所有在校的中国华人欢迎大家的到来！为了帮助大家在最短的时间里能够快速愉快地融入PSU的大家庭，我们CSSA的全体家庭成员们用心并详尽地为你们编辑了这样一本新生手册。

这本新生手册涵盖了生活、学习、娱乐等诸多方面的实用信息，希望能帮助大家在PSU有一个轻松而难忘的开始！

我们期待在不久之后的将来和大家相聚在美丽的校园，在此也衷心祝愿大家一切顺利！
        `
    }

    componentWillMount() {
        mta.Page.init();
    }

    componentWillReact() { }

    componentDidMount() { }

    componentWillUnmount() { }

    componentDidShow() { }

    componentDidHide() { }

    render() {
        return (
            <View className='index'>
                <Button class="back-botton" onClick={() => wx.navigateBack()}>
                    <Text class="at-icon at-icon-chevron-left" style="font-size:34rpx;color:#fff;font-weight: bold"> 返回</Text>
                </Button>
                <View className="bg-red--cssa index-top-bg" style="padding: 0 0 64rpx 64rpx;text-align: left;height: 400rpx;line-height:800rpx">
                    <Text className="color-deepred--cssa" style="font-size: 1.5rem; font-weight: bold">关于我们</Text>
                </View>
                <View style="text-align:center; padding: 64rpx 32rpx 32rpx 32rpx">
                    <Image src="https://idd.cssapsu.cn/images/部门小萨合集_w1000.png" mode="widthFix" />

                </View>
                <wemark md={this.state.md} link highlight type='wemark' />
            </View >
        )
    }
}

export default About 
