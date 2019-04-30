import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import BackButton from '../../components/backButton';

class Sitemaps extends Component {

    config = {
        navigationBarTitleText: 'CSSA年鉴目录',
    }

    state = {
        list: [
            {
                name: "新生手册",
                path: "/pages/sitemaps/freshman_wiki"
            },
            {
                name: "专业百科",
                path: "/pages/sitemaps/major_wiki"
            }
        ]
    }

    componentWillMount() { }

    componentWillReact() { }

    componentDidMount() {

    }

    componentWillUnmount() { }

    componentDidShow() { }

    componentDidHide() { }



    navigate = (path) => {
        Taro.navigateTo({
            url: path
        })
    }

    render() {
        const { list } = this.state;

        return (
            <View>
                <BackButton></BackButton>

                <View className="bg-red--cssa main-top-bg" style="padding: 0 0 64rpx 64rpx;text-align: left;height: 400rpx;line-height:800rpx">
                    <Text className="color-deepred--cssa" style="font-size: 1.8rem; font-weight: bold">索引 Indexes</Text>

                </View>
                {list.map((item) =>
                    <View className="navigationcard_wrapper" style="margin: 16px" key={item.name}>
                        <View className="navigationcard" onClick={() => this.navigate(item.path)}>
                            <Text className="title">{item.name}</Text>
                            <Text style="font-weight: bold; color: #a02727; font-size: 18px;margin-top:4px;display: block">条目索引</Text>
                        </View>
                    </View>
                )}

            </View >
        )
    }
}

export default Sitemaps 
