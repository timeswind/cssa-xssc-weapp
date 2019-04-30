import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import BackButton from '../../components/backButton';
import { fetchContent, defaultServerEndpoint } from '../../utils/api';

class FreshmanWiki extends Component {

    state = {
        menuData: []
    }

    componentWillMount() {
        this.fetchMenu('SUMMARY.md');
    }

    componentWillReact() { }

    componentDidMount() { }

    componentWillUnmount() { }

    componentDidShow() { }

    componentDidHide() { }

    navigate = (path) => {
        Taro.navigateTo({
            url: path
        })
    }

    fetchMenu(menuKey) {
        var url = defaultServerEndpoint + 'books/freshman_wiki/' + menuKey;
        var menuDataProcess = [];
        var self = this;
        fetchContent(url, function (data) {
            var lines = data.split('\n');
            lines.splice(0, 2);
            lines.pop();
            lines.pop();
            lines.forEach(function (line) {
                var key = line.match(/\(([^)]+)\)/)[1];
                var value = line.match(/\[([^)]+)\]/)[1];
                var menu_item = {};
                menu_item['key'] = key;
                menu_item['value'] = value;
                menuDataProcess.push(menu_item);
            });
            self.setState({ menuData: menuDataProcess })
        })
    }

    render() {
        const { menuData } = this.state;
        return (
            <View>
                <BackButton></BackButton>

                <View className="bg-red--cssa main-top-bg" style="padding: 0 0 64rpx 64rpx;text-align: left;height: 400rpx;line-height:800rpx">
                    <Text className="color-deepred--cssa" style="font-size: 1.8rem; font-weight: bold">新生手册索引</Text>

                </View>
                {menuData.map((item) =>
                    <View className="index_card_wrapper" style="margin: 16px" key={item.key}>
                        <View className="index_card" onClick={() => this.navigate('/pages/xssc?section=' + item.key)}>
                            <Text className="title">{item.value}</Text>
                        </View>
                    </View>
                )}

            </View >
        )
    }
}

export default FreshmanWiki 
