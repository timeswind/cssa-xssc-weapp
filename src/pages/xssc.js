import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'
import { AtDrawer } from 'taro-ui'

@inject('globalStore')
@observer
class xssc extends Component {

    config = {
        navigationBarTitleText: '新生手册',
        usingComponents: {
            wemark: '../wemark/wemark'
        },
    }

    state = {
        md: '# 加载中...',
        currentSectionIndex: -1,
        currentSection: wx.getStorageSync('__xxsc_section') || 'README.md',
        currentSectionTitle: '',
        drawerShow: false,
        menuData: [],
        menuNameListArray: []
    }

    componentWillMount() {
        console.log(this.$router.params)
        if ('section' in this.$router.params) {
            console.log(this.$router.params)
            wx.setStorageSync('__xxsc_section', this.$router.params.section);
            this.fetchSection(this.$router.params.section);
        } else {
            this.fetchSection(wx.getStorageSync('__xxsc_section') || 'README.md')
        }
    }

    onShareAppMessage(res) {
        return {
            title: this.state.currentSectionTitle + ' PSU新生手册',
            path: 'pages/xssc?from=share&section=' + this.state.currentSection
        };
    }

    componentWillReact() { }

    componentDidMount() { }

    componentWillUnmount() { }

    componentDidShow() { }

    componentDidHide() { }

    findSectionNameIndex(menuData, sectionName) {
        var result = -1;
        menuData.forEach((data, index) => {
            if (data.key == sectionName) {
                result = index;
                return;
            }
        })
        return result
    }

    fetchSection(sectionName) {
        var self = this;
        this.fetchContent(sectionName, function (data) {
            self.setState({ md: data, currentSection: sectionName })
            wx.setStorageSync('__xxsc_section', sectionName);
            self.fetchMenu()
        })
    }

    openMenuDrawer = () => {
        this.setState({ drawerShow: true })
    }

    prevSection = () => {
        var currentSectionIndex = this.findSectionNameIndex(this.state.menuData, this.state.currentSection)
        if (currentSectionIndex !== -1 && currentSectionIndex !== 0) {
            this.menuClick(currentSectionIndex - 1)
        }
    }

    nextSection = () => {
        var currentSectionIndex = this.findSectionNameIndex(this.state.menuData, this.state.currentSection)
        if (currentSectionIndex !== -1 && currentSectionIndex !== (this.state.menuData.length - 1)) {
            this.menuClick(currentSectionIndex + 1)
        }
    }


    menuClick(index) {
        var sectionTitle = this.state.menuData[index]["value"]
        var sectionName = this.state.menuData[index]["key"]
        this.fetchSection(sectionName)
        this.setState({ currentSectionTitle: sectionTitle, drawerShow: false })
    }

    fetchMenu() {
        var menuDataProcess = [];
        var menuNameListProcess = [];
        var self = this;
        this.fetchContent('SUMMARY.md', function (data) {
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
                menuNameListProcess.push(value);
                menuDataProcess.push(menu_item);
            });
            self.setState({ menuData: menuDataProcess, menuNameListArray: menuNameListProcess })
        })
    }

    fetchContent(key, callback) {
        var self = this;
        var url = 'https://idd.cssapsu.cn/' + key;
        wx.request({
            url: url,
            success: function (data) {
                if (key !== self.currentSection) {
                    wx.pageScrollTo({
                        scrollTop: 0,
                        duration: 300
                    });
                }
                callback(data.data)
            }
        });
    }

    redirectTo = (path) => {
        Taro.redirectTo({
          url: path
        })
      }

    render() {
        const { globalStore: { deviceModel } } = this.props
        const bottomBarStyleIphoneX = { width: "100%", position: "fixed", bottom: "0", paddingBottom: "68rpx", height: "44px", background: "#EE5050", display: "flex", flexDirection: "row" }
        const bottomBarStyleNormal = { width: "100%", position: "fixed", bottom: "0px", height: "44px", background: "#EE5050", display: "flex", flexDirection: "row" }

        return (
            <View className='freshman-manual-index'>
                <Button class="xssc-home-button" onClick={() => this.redirectTo('/pages/index/index')}>
                    <Text class="at-icon at-icon-home" style="font-size:34rpx;color:#fff;font-weight: bold">首页</Text>
                </Button>
                <Button class="xssc-share-button" open-type="share" style={deviceModel == "iPhone X" ? {} : {bottom: "114rpx"}}>
                    <Text class="at-icon at-icon-share" style="font-size:34rpx;color:#fff;font-weight: bold">分享</Text>
                </Button>

                <AtDrawer
                    show={this.state.drawerShow}
                    mask
                    width={"90%"}
                    onItemClick={(index) => { this.menuClick(index) }}
                    items={this.state.menuNameListArray}
                ></AtDrawer>
                <wemark md={this.state.md} link highlight type='wemark' />
                <View style={deviceModel == "iPhone X" ? bottomBarStyleIphoneX : bottomBarStyleNormal}>
                    <View style="display: flex;flex:1;justify-content: center;font-size: 34rpx;align-items:center;" onClick={this.prevSection}>
                        <Text class="at-icon at-icon-chevron-left" style="font-size:34rpx;color:#fff;font-weight: bold"></Text>
                        <Text style="font-size:34rpx;color:#fff;font-weight: bold">上一章</Text>
                    </View>
                    <View style="display: flex;flex:1;justify-content: center;font-size: 34rpx;align-items:center;" onClick={this.openMenuDrawer}>
                        <Text class="at-icon at-icon-menu" style="font-size:34rpx;color:#fff;font-weight: bold"></Text>
                        <Text style="font-size:34rpx;color:#fff;font-weight: bold">目录</Text>
                    </View>
                    <View style="display: flex;flex:1;justify-content: center;font-size: 34rpx;align-items:center;" onClick={this.nextSection}>
                        <Text style="font-size:34rpx;color:#fff;font-weight: bold">下一章</Text>
                        <Text class="at-icon at-icon-chevron-right" style="font-size:34rpx;color:#fff;font-weight: bold"></Text>
                    </View>
                </View>
            </View >
        )
    }
}

export default xssc 
