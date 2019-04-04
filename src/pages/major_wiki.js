import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'
import { AtDrawer, AtSearchBar, AtList, AtListItem } from 'taro-ui'

@inject('globalStore')
@observer
class majorWiki extends Component {

    apiPath = "https://idd.cssapsu.cn/books/major_wiki/"
    menuMarkdownKey = "SUMMARY.md"
    searchDicKey = "search.json"
    pageDicKey = "page_dic.json"
    localStoreSectionKey = "__major_section"

    config = {
        navigationBarTitleText: '专业百科',
        usingComponents: {
            wemark: '../wemark/wemark'
        },
    }

    state = {
        md: '# 加载中...',
        currentSectionIndex: -1,
        currentSection: wx.getStorageSync(this.localStoreSectionKey) || 'README.md',
        currentSectionTitle: '',
        drawerShow: false,
        menuData: [],
        menuNameListArray: [],
        searchValue: "",
        searchDic: {},
        pageDic: {},
        searchResults: []
    }

    componentWillMount() {
        if ('section' in this.$router.params) {
            wx.setStorageSync(this.localStoreSectionKey, this.$router.params.section);
            this.fetchSection(this.$router.params.section);
        } else {
            this.fetchSection(wx.getStorageSync(this.localStoreSectionKey) || 'README.md')
        }
        this.fetchMenu(this.menuMarkdownKey + '?t=' + new Date().getTime())
        this.fetchSearchDic()
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

    searchOnChange(newValue) {
        var update = { searchValue: newValue }
        if (newValue == '') {
            update["searchResults"] = []
        }
        this.setState(update)
    }

    searchOnActionClick() {
        var searchTerm = this.state.searchValue;
        var searchDic = this.state.searchDic;
        var pageDic = this.state.pageDic;

        if (searchTerm in searchDic) {
            var rawResult = JSON.parse(JSON.stringify(searchDic[searchTerm]))
            rawResult.forEach((raw, index) => [
                rawResult[index] = { key: pageDic[raw][1], title: pageDic[raw][0] }
            ])
            this.setState({ searchResults: rawResult })
        } else {
            this.setState({ searchResults: [] })
        }
    }

    handleSeachResultClick(sectionKey, e) {
        e.stopPropagation();
        this.fetchSection(sectionKey)
        this.setState({ drawerShow: false })
    }

    findSectionIndex(menuData, section) {
        var result = -1;
        menuData.forEach((data, index) => {
            if (data.key == section) {
                result = index;
                return;
            }
        })
        return result
    }

    findSectionName(menuData, section) {
        var result = "";
        menuData.forEach((data, index) => {
            if (data.key == section) {
                result = data.value;
                return;
            }
        })
        return result
    }

    fetchSection(section) {
        var self = this;
        const menuData = this.state.menuData;
        this.fetchContent(section, function (data) {
            const currentSectionName = self.findSectionName(menuData, section)
            const currentSectionIndex = self.findSectionIndex(menuData, section)
            self.setState({ md: data, currentSection: section, currentSectionTitle: currentSectionName, currentSectionIndex: currentSectionIndex, drawerShow: false })
            wx.setStorageSync(self.localStoreSectionKey, section);
        })
    }

    openMenuDrawer = () => {
        if (this.state.menuData == []) {
            this.fetchMenu(this.menuMarkdownKey + '?t=' + new Date().getTime())
        }
        this.setState({ drawerShow: true })
    }

    prevSection = () => {
        var currentSectionIndex = this.findSectionIndex(this.state.menuData, this.state.currentSection)
        if (currentSectionIndex !== -1 && currentSectionIndex !== 0) {
            this.menuClick(currentSectionIndex - 1)
        }
    }

    nextSection = () => {
        var currentSectionIndex = this.findSectionIndex(this.state.menuData, this.state.currentSection)
        if (currentSectionIndex !== -1 && currentSectionIndex !== (this.state.menuData.length - 1)) {
            this.menuClick(currentSectionIndex + 1)
        }
    }


    menuClick(index) {
        var section = this.state.menuData[index]["key"]
        this.fetchSection(section)
    }

    fetchMenu(menuKey) {
        var menuDataProcess = [];
        var menuNameListProcess = [];
        var self = this;
        this.fetchContent(menuKey, function (data) {
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
            console.log(menuDataProcess)
            self.setState({ menuData: menuDataProcess, menuNameListArray: menuNameListProcess })
        })
    }

    fetchSearchDic() {
        var self = this
        this.fetchContent(this.searchDicKey, function (searchDic) {
            console.log(searchDic)
            self.setState({ searchDic: searchDic })

        })
        this.fetchContent(this.pageDicKey, function (pageDic) {
            console.log(pageDic)
            self.setState({ pageDic: pageDic })
        })
    }

    fetchContent(key, callback) {
        var self = this;
        var url = this.apiPath + key;
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
        const searchResultRender = (
            <AtList>
                {this.state.searchResults.map((result) =>
                    <AtListItem title={result.title} onClick={this.handleSeachResultClick.bind(this, result.key)} arrow='right' key={result.key} />
                )}
            </AtList>
        )
        return (
            <View className='freshman-manual-index'>
                <AtSearchBar
                    actionName='搜一下'
                    value={this.state.searchValue}
                    onChange={this.searchOnChange.bind(this)}
                    onActionClick={this.searchOnActionClick.bind(this)}
                />
                {searchResultRender}
                <Button class="xssc-home-button" onClick={() => this.redirectTo('/pages/index/index')}>
                    <Text class="at-icon at-icon-home" style="font-size:34rpx;color:#fff;font-weight: bold">首页</Text>
                </Button>
                <Button class="xssc-share-button" open-type="share" style={deviceModel == "iPhone X" ? {} : { bottom: "114rpx" }}>
                    <Text class="at-icon at-icon-share" style="font-size:34rpx;color:#fff;font-weight: bold">分享</Text>
                </Button>

                <AtDrawer
                    show={this.state.drawerShow}
                    mask
                    width={"90%"}
                    onItemClick={(index) => { this.menuClick(index) }}
                    items={this.state.menuNameListArray}
                ></AtDrawer>
                <wemark md={this.state.md} link highlight type='wemark' apipath={this.apiPath} />
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

export default majorWiki 
