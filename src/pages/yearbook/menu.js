import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'

@inject('globalStore')
@observer
class YearBookMenu extends Component {

    apiPath = "https://idd.cssapsu.cn/books/yearbook/"
    menuKey = 'bookname.data'

    config = {
        navigationBarTitleText: 'CSSA年鉴目录',
    }

    state = {
        list: []
    }

    componentWillMount() { }

    componentWillReact() { }

    componentDidMount() {
        var self = this;
        this.fetchContent(this.menuKey, function (data) {
            self.mountMenu(data)
        })
    }

    componentWillUnmount() { }

    componentDidShow() { }

    componentDidHide() { }

    mountMenu(menuRawData) {
        var menuList = menuRawData.split('\n')
        menuList = menuList.filter((name) => {
            return name !== ""
        })
        this.setState({ list: menuList })
    }

    fetchContent(key, callback) {
        var self = this;
        var url = this.apiPath + key;
        Taro.request({
            url: url,
            success: function (data) {
                if (key !== self.currentSection) {
                    Taro.pageScrollTo({
                        scrollTop: 0,
                        duration: 300
                    });
                }
                callback(data.data)
            }
        });
    }

    navigate = (path) => {
        Taro.navigateTo({
            url: path
        })
    }

    render() {
        const { list } = this.state;
        const { globalStore: { statusBarHeight } } = this.props

        return (
            <View>
                <Button class="back-botton" onClick={() => Taro.navigateBack()} style={"top:" + (statusBarHeight + 8) + "px"}>
                    <Text class="at-icon at-icon-chevron-left" style="font-size:34rpx;color:#fff;font-weight: bold">返回</Text>
                </Button>
                <View className="bg-red--cssa main-top-bg" style="padding: 0 0 64rpx 64rpx;text-align: left;height: 400rpx;line-height:800rpx">
                    <Text className="color-deepred--cssa" style="font-size: 1.8rem; font-weight: bold">CSSA历年年鉴</Text>

                </View>
                {list.map((name) =>
                    <View className="navigationcard_wrapper" style="margin: 16px" key={name}>
                        <View className="navigationcard" onClick={() => this.navigate('/pages/yearbook/reader?version=' + name)}>
                            <Text className="title">{name === "master" ? "年鉴简介" : name}</Text>
                            <Text style="font-weight: bold; color: #a02727; font-size: 18px;margin-top:4px;display: block">Penn State CSSA</Text>
                        </View>
                    </View>
                )}

            </View >
        )
    }
}

export default YearBookMenu 
