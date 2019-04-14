import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'
import { AtDrawer } from 'taro-ui'
import Markdown from './markdown/markdown';
import ReaderSearchBar from './readerSearchBar';

@inject('globalStore')
@observer
class MarkdownReader extends Component {
    static options = {
        addGlobalClass: true
    }

    constructor(props) {
        super(props);
        this.apiPath = props.config.apiPath
        this.menuMarkdownKey = props.config.menuMarkdownKey
        this.searchDicKey = props.config.searchDicKey
        this.pageDicKey = props.config.pageDicKey
        this.localStoreSectionKey = props.config.localStoreSectionKey
        this.shareName = props.config.shareName
        this.pathPrefix = props.config.pathPrefix
        this.defaultSectionKey = props.config.defaultSectionKey
        this.version = props.config.version || false
        this.searchDic = {};
        this.pageDic = {};
        this.menuData = [];
        this.toviewlock = false;

        this.state = {
            md: '# 加载中...',
            currentSectionIndex: -1,
            currentSection: Taro.getStorageSync(this.localStoreSectionKey) || this.defaultSectionKey,
            currentSectionTitle: '',
            drawerShow: false,
            menuNameListArray: [],
            searchResults: []
        }
    }

    componentWillReceiveProps(nextProps) {
        console.log('componentWillReceiveProps')
        this.handleProps(nextProps)
    }

    handleProps(props) {
        const { params, config } = props
        if ('version' in params) {
            this.version = params.version
        }

        if ('section' in params) {
            Taro.setStorageSync(config.localStoreSectionKey, params.section);
            this.fetchSection(params.section);
        } else {
            var targetSection = Taro.getStorageSync(config.localStoreSectionKey) || config.defaultSectionKey
            if (targetSection) {
                this.fetchSection(targetSection)
            }
        }

        if (Object.keys(this.searchDic).length === 0) {
            this.fetchSearchDic()
        }
        if (this.menuData.length === 0) {
            this.fetchMenu(config.menuMarkdownKey + '?t=' + new Date().getTime())
        }
    }

    componentDidMount() {
        this.handleProps(this.props)
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.state.md !== nextState.md) {
            return true
        }

        if (this.state.drawerShow !== nextState.drawerShow) {
            return true
        }

        if (this.state.searchResults !== nextState.searchResults) {
            return true
        }

        if (this.props.params !== nextProps.params) {
            return true
        }

        return false
    }

    searchOnActionClick(valueToSearch) {
        var searchTerm = valueToSearch;
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

    handleSeachResultClick(sectionKey) {
        this.fetchSection(sectionKey)
        this.setState({ drawerShow: false, searchResults: [] })
    }

    componentDidUpdate() {
        const { params, globalStore } = this.props
        if ('toview' in params && !this.toviewlock) {
            globalStore.setToView(params.toview)
            this.toviewlock = true
        } else {
            globalStore.setToView("top")
        }
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
        menuData.forEach((data) => {
            if (data.key == section) {
                result = data.value;
                return;
            }
        })
        return result
    }

    fetchSection(section) {
        const { globalStore } = this.props
        var self = this;
        const menuData = this.menuData;
        this.fetchContent(section, function (data) {
            const currentSectionName = self.findSectionName(menuData, section)
            const currentSectionIndex = self.findSectionIndex(menuData, section)
            globalStore.setCurrentSectionTitle(currentSectionName)
            globalStore.setCurrentSection(section)
            self.setState({ md: data, currentSection: section, currentSectionTitle: currentSectionName, currentSectionIndex: currentSectionIndex, drawerShow: false })
            self.setState({ drawerShow: false })
            Taro.setStorageSync(self.localStoreSectionKey, section);
        })
    }

    openMenuDrawer = () => {
        if (this.menuData.length === 0) {
            this.fetchMenu(this.menuMarkdownKey + '?t=' + new Date().getTime())
        }
        this.setState({ drawerShow: true })
    }

    prevSection = () => {
        if (process.env.TARO_ENV === 'weapp') {
            wx.reportAnalytics('freshman_wiki_switch_page', {
                op: 'prev',
            });
        }
        var currentSectionIndex = this.findSectionIndex(this.menuData, this.state.currentSection)
        if (currentSectionIndex !== -1 && currentSectionIndex !== 0) {
            this.fetchSectionByIndex(currentSectionIndex - 1)
        }
    }

    nextSection = () => {
        if (process.env.TARO_ENV === 'weapp') {
            wx.reportAnalytics('freshman_wiki_switch_page', {
                op: 'next',
            });
        }
        var currentSectionIndex = this.findSectionIndex(this.menuData, this.state.currentSection)
        if (currentSectionIndex !== -1 && currentSectionIndex !== (this.menuData.length - 1)) {
            this.fetchSectionByIndex(currentSectionIndex + 1)
        }
    }

    fetchSectionByIndex(index) {
        var section = this.menuData[index]["key"]
        this.fetchSection(section)
    }


    menuClick(index) {
        if (process.env.TARO_ENV === 'weapp') {
            wx.reportAnalytics('freshman_wiki_switch_page', {
                op: 'menu',
            });
        }
        this.fetchSectionByIndex(index)
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
            self.menuData = menuDataProcess;
            self.setState({ menuNameListArray: menuNameListProcess })
        })
    }

    fetchSearchDic() {
        const { showSearchBar } = this.props
        if (showSearchBar && this.searchDicKey && this.pageDic) {
            var self = this
            this.fetchContent(this.searchDicKey, function (searchDic) {
                self.searchDic = searchDic;
            })
            this.fetchContent(this.pageDicKey, function (pageDic) {
                self.pageDic = pageDic;
            })
        }
    }

    fetchContent(key, callback) {
        var self = this;
        var url = this.apiPath;
        if (this.version) {
            url = this.apiPath + this.version + '/'
        }
        url = url + key
        const { globalStore } = this.props
        globalStore.setToView("")
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

    innerLinkClick(innerlink) {
        var innerlinkregex = new RegExp(/^../g)
        if (innerlinkregex.test(innerlink)) {
            var sectionKey = innerlink.match(/..\/(.*)/)[1];
            this.fetchSection(sectionKey)
        }
    }

    clearSearchResult() {
        this.setState({ searchResults: [] })
    }

    render() {
        const { globalStore: { deviceModel }, showSearchBar } = this.props
        const { md, drawerShow, searchResults, menuNameListArray } = this.state;
        const bottomBarStyleIphoneX = { width: "100%", position: "fixed", bottom: "0", paddingBottom: "68rpx", height: "44px", background: "#EE5050", display: "flex", flexDirection: "row" }
        const bottomBarStyleNormal = { width: "100%", position: "fixed", bottom: "0px", height: "44px", background: "#EE5050", display: "flex", flexDirection: "row" }

        return (
            <View className='freshman-manual-index'>
                {showSearchBar && (
                    <ReaderSearchBar
                        searchResults={searchResults}
                        handleSeachResultClick={sectionKey => this.handleSeachResultClick(sectionKey)}
                        searchOnActionClick={valueToSearch => this.searchOnActionClick(valueToSearch)}
                        clearSearchResult={() => this.clearSearchResult()}></ReaderSearchBar>
                )}
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
                <Markdown md={md} link={true} highlight={true} type='wemark' apipath={this.apiPath}
                    innerLinkClick={innerlink => this.innerLinkClick(innerlink)}
                    quickNav={true}
                    showFooter={true}></Markdown>

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

MarkdownReader.defaultProps = {
    config: {
        localStoreSectionKey: ""
    },
    params: {},
    showSearchBar: false
};

export default MarkdownReader 
