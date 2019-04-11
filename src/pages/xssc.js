import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'
import { AtDrawer, AtSearchBar, AtList, AtListItem } from 'taro-ui'
import CSSA_LOGO_2019_red_w400 from "../images/CSSA_LOGO_2019_red_w400.png"
import Markdown from '../components/markdown/markdown';

@inject('globalStore')
@observer
class xssc extends Component {

    constructor() {
        super();
        this.apiPath = "https://idd.cssapsu.cn/books/freshman_wiki/"
        this.menuMarkdownKey = "SUMMARY.md"
        this.searchDicKey = "search.json"
        this.pageDicKey = "page_dic.json"
        this.localStoreSectionKey = "__xxsc_section"
        this.shareName = " PSU新生手册"
        this.pathPrefix = "pages/xssc"
        this.searchDic = {};
        this.pageDic = {};

        this.config = {
            navigationBarTitleText: '新生手册'
        }

        this.state = {
            md: '# 加载中...',
            currentSectionIndex: -1,
            currentSection: Taro.getStorageSync(this.localStoreSectionKey) || 'README.md',
            currentSectionTitle: '',
            drawerShow: false,
            menuData: [],
            menuNameListArray: [],
            searchValue: "",
            searchResults: []
        }
    }



    componentWillMount() {
        if ('section' in this.$router.params) {
            Taro.setStorageSync(this.localStoreSectionKey, this.$router.params.section);
            this.fetchSection(this.$router.params.section);
        } else {
            this.fetchSection(Taro.getStorageSync(this.localStoreSectionKey) || 'README.md')
        }
        this.fetchMenu(this.menuMarkdownKey + '?t=' + new Date().getTime())
        this.fetchSearchDic()
    }

    onShareAppMessage(res) {
        return {
            title: this.state.currentSectionTitle + this.shareName,
            path: this.pathPrefix + '?from=share&section=' + this.state.currentSection
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
        var searchDic = this.searchDic;
        var pageDic = this.pageDic;

        if (process.env.TARO_ENV === 'weapp') {
            wx.reportAnalytics('freshman_wiki_query', {
                freshman_wiki_query: searchTerm
            });
        }

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
        this.setState({ drawerShow: false, searchResults: [] })
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
            self.setState({ drawerShow: false })
            Taro.setStorageSync(self.localStoreSectionKey, section);
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
            self.setState({ menuData: menuDataProcess, menuNameListArray: menuNameListProcess })
        })
    }

    fetchSearchDic() {
        var self = this
        this.fetchContent(this.searchDicKey, function (searchDic) {
            self.searchDic = searchDic;
        })
        this.fetchContent(this.pageDicKey, function (pageDic) {
            self.pageDic = pageDic;
        })
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

    redirectTo = (path) => {
        Taro.redirectTo({
            url: path
        })
    }

    render() {
        const { globalStore: { deviceModel } } = this.props
        const { md, searchValue, drawerShow, searchResults, menuNameListArray } = this.state;
        const bottomBarStyleIphoneX = { width: "100%", position: "fixed", bottom: "0", paddingBottom: "68rpx", height: "44px", background: "#EE5050", display: "flex", flexDirection: "row" }
        const bottomBarStyleNormal = { width: "100%", position: "fixed", bottom: "0px", height: "44px", background: "#EE5050", display: "flex", flexDirection: "row" }
        const searchResultRender = (
            <AtList>
                {searchResults.map((result) =>
                    <AtListItem title={result.title} onClick={this.handleSeachResultClick.bind(this, result.key)} arrow='right' key={result.key} />
                )}
            </AtList>
        )
        return (
            <View className='freshman-manual-index'>
                <AtSearchBar
                    actionName='搜一下'
                    value={searchValue}
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
                    show={drawerShow}
                    mask
                    width={"90%"}
                    onItemClick={(index) => { this.menuClick(index) }}
                    items={menuNameListArray}
                ></AtDrawer>
                <Markdown md={md} link={true} highlight={true} type='wemark' apipath={this.apiPath}></Markdown>
                <View style="margin: 32rpx;">
                    <View style="text-align: center">
                        <Image
                            style="width: 150rpx;height:150rpx;display: inline-block"
                            src={CSSA_LOGO_2019_red_w400}></Image>
                    </View>

                    <View style="margin-top: 16rpx;">
                        <Text style="color: #666;font-weight: bold; font-size: 16px">手册系列文章由历届PSUCSSA、校友以及Penn State Global Office合作编写</Text>
                    </View>
                </View>
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
