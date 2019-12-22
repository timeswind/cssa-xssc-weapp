import Taro, { Component } from '@tarojs/taro'
import { View, Button, Text } from '@tarojs/components'
import { AtDrawer } from 'taro-ui'
import Markdown from './markdown/markdown';
import ReaderSearchBar from './readerSearchBar';
import BackButton from './backButton';
import { observer, inject } from '@tarojs/mobx'

@inject('globalStore')
@observer
class MarkdownReader extends Component {
    static options = {
        addGlobalClass: true
    }

    constructor(props) {
        super(props);

        //localstorage key
        this.localStoreSectionKey = props.config.localStoreSectionKey
        this.localStoreVersionKey = props.config.localStoreVersionKey

        this.apiPath = props.config.apiPath

        this.contentServerEndpoint = props.config.apiPath
        this.imageServerEndpoint = props.config.apiPath

        this.version = props.config.version || props.params.version || false
        if (this.version && this.version !== 'undefined') {
            this.contentServerEndpoint = this.apiPath + this.version + '/'
            this.imageServerEndpoint = this.apiPath + this.version + '/'
        }

        this.menuMarkdownKey = props.config.menuMarkdownKey
        this.searchDicKey = props.config.searchDicKey
        this.pageDicKey = props.config.pageDicKey


        this.shareName = props.config.shareName
        this.pathPrefix = props.config.pathPrefix
        this.defaultSectionKey = props.config.defaultSectionKey

        this.searchDic = {};
        this.pageDic = {};
        this.menuData = [];
        this.toviewlock = false;

        if (props.memoryLastRead) {
            this.currentSection = Taro.getStorageSync(this.localStoreSectionKey) || this.defaultSectionKey
        } else {
            this.currentSection = this.defaultSectionKey
        }

        this.state = {
            md: '# 加载中...',
            drawerShow: false,
            menuNameListArray: [],
            searchResults: [],
            currentSectionIndex: -2
        }
    }

    componentWillReceiveProps(nextProps) {
        this.handleProps(nextProps)
    }

    handleProps(props) {
        const { params, config } = props
        
        if (params !== null && 'version' in params && params.version !== 'undefined') {
            this.version = params.version
            this.contentServerEndpoint = this.apiPath + params.version + '/'
            this.imageServerEndpoint = this.apiPath + params.version + '/'
        }

        if (params !== null && 'section' in params && params.section !== 'undefined') {
            this.setCurrentSection(params.section)
            // Taro.setStorageSync(config.localStoreSectionKey, params.section);
            this.fetchSection(params.section);
        } else {
            var targetSection;
            if (props.memoryLastRead) {
                targetSection = Taro.getStorageSync(config.localStoreSectionKey) || config.defaultSectionKey
            } else {
                targetSection = config.defaultSectionKey
            }
            if (targetSection && targetSection !== 'undefined') {
                this.fetchSection(targetSection)
            }
        }

        if (params !== null && 'version' in params && params.version !== 'undefined') {
            Taro.setStorageSync(config.localStoreVersionKey, params.version);
        }

        if (Object.keys(this.searchDic).length === 0) {
            this.fetchSearchDic()
        }
        if (this.menuData.length === 0) {
            // this.fetchMenu(config.menuMarkdownKey + '?t=' + new Date().getTime())
            this.fetchMenu(config.menuMarkdownKey)
        }
    }

    

    componentDidMount() {
        this.handleProps(this.props)
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.state.md !== nextState.md) {
            return true
        }

        if (this.state.drawerShow === !nextState.drawerShow) {
            return true
        }

        if (this.state.searchResults !== nextState.searchResults) {
            return true
        }

        if (this.state.menuNameListArray !== nextState.menuNameListArray) {
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
        this.setState({ searchResults: [] })
    }

    componentDidUpdate(prevProps, prevState) {
        const { params, globalStore } = this.props
        if ('toview' in params && !this.toviewlock) {
            globalStore.setToView(params.toview)
            this.toviewlock = true
        } else {
            if (this.state.currentSectionIndex !== prevState.currentSectionIndex) {
                globalStore.setToView("top")
            }
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
        if (menuData.length > 0) {
            menuData.forEach((data) => {
                if (data.key == section) {
                    result = data.value;
                    return;
                }
            })
        }
        return result
    }

    fetchSection(section) {
        if (section) {
            const { globalStore } = this.props
            var self = this;
            const menuData = this.menuData;
            globalStore.setToView("")
            Taro.showLoading({
                title: '加载中...',
                mask: false
            })
            this.fetchContent(section, function (data) {
                Taro.hideLoading()
                if (section !== self.currentSection) {
                    Taro.pageScrollTo({
                        scrollTop: 0,
                        duration: 300
                    });
                }
                self.setCurrentSection(section)
                if (menuData.length > 0) {
                    const currentSectionName = self.findSectionName(menuData, section)
                    const currentSectionIndex = self.findSectionIndex(menuData, section)
                    globalStore.setCurrentSectionTitle(currentSectionName)
                    self.setState({ md: data, currentSectionIndex: currentSectionIndex })
                } else {
                    self.setState({ md: data })
                }
            })
        } else {
            console.error('false section', section)
        }

    }

    setCurrentSection(section) {
        const { globalStore, config } = this.props
        this.currentSection = section
        globalStore.setCurrentSection(section)
        Taro.setStorageSync(config.localStoreSectionKey, section);
    }

    openMenuDrawer = () => {
        if (this.menuData.length === 0) {
            // this.fetchMenu(this.menuMarkdownKey + '?t=' + new Date().getTime())
            this.fetchMenu(this.menuMarkdownKey)
        }
        this.setState({ drawerShow: true })
    }

    onMenuClose = () => {
        this.setState({ drawerShow: false })
    }

    prevSection = () => {
        // if (process.env.TARO_ENV === 'weapp') {
        //     wx.reportAnalytics('freshman_wiki_switch_page', {
        //         op: 'prev',
        //     });
        // }
        var currentSectionIndex = this.findSectionIndex(this.menuData, this.currentSection)
        // console.log(currentSectionIndex)
        if (currentSectionIndex !== -1 && currentSectionIndex !== 0) {
            this.fetchSectionByIndex(currentSectionIndex - 1)
        }
    }

    nextSection = () => {
        // if (process.env.TARO_ENV === 'weapp') {
        //     wx.reportAnalytics('freshman_wiki_switch_page', {
        //         op: 'next',
        //     });
        // }
        var currentSectionIndex = this.findSectionIndex(this.menuData, this.currentSection)
        // console.log(currentSectionIndex)
        if (currentSectionIndex !== -1 && currentSectionIndex !== (this.menuData.length - 1)) {
            this.fetchSectionByIndex(currentSectionIndex + 1)
        }
    }

    fetchSectionByIndex(index) {
        var sectionKey = this.menuData[index]["key"]
        this.fetchSection(sectionKey)
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
        const { globalStore, globalStore: { currentSectionTitle } } = this.props;
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
            if (currentSectionTitle === "" && self.currentSection !== "" && self.menuData.length > 0) {
                var currentSectionTitleFind = self.findSectionName(self.menuData, self.currentSection)
                globalStore.setCurrentSectionTitle(currentSectionTitleFind)
            }

            if (self.state.currentSectionIndex < 0 && self.currentSection !== "" && self.menuData.length > 0) {
                var currentSectionIndexFind = self.findSectionIndex(self.menuData, self.currentSection)
                self.setState({ currentSectionIndex: currentSectionIndexFind })
            }
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
        var url = this.contentServerEndpoint + key;
        Taro.request({
            url: url,
            success: function (data) {
                callback(data.data)
            }
        });
    }

    innerLinkClick(innerlink) {
        if (innerlink) {
            var urlExpression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi;
            var regex = new RegExp(urlExpression);
            if (innerlink.match(regex)) {
                // console.log('is url, copy to clipboard')
                Taro.setClipboardData({ data: innerlink })
            } else {
                // console.log('not url')
                var innerlinkregex = new RegExp(/^\.\./gi)
                if (innerlinkregex.test(innerlink)) {
                    // console.log('is inner link')
                    var sectionKey = innerlink.match(/..\/(.*)/)[1];
                    this.fetchSection(sectionKey)
                } else {
                    var innerlinkregex2 = new RegExp(/.*\.md$/gi)
                    if (innerlinkregex2.test(innerlink)) {
                        // console.log('is inner link, pass test2')
                        this.fetchSection(innerlink)
                    } else {
                        // console.log('not inner link, copy to clipboard')
                        Taro.setClipboardData({ data: innerlink })
                    }
                }
            }
        }
    }

    clearSearchResult() {
        this.setState({ searchResults: [] })
    }

    updateToView(toView) {
        const { globalStore } = this.props
        globalStore.setToView(toView)
    }

    render() {
        const { globalStore: { deviceModel, statusBarHeight }, showSearchBar, showFooter } = this.props
        const { md, drawerShow, searchResults, menuNameListArray, currentSectionIndex } = this.state;
        const bottomBarStyleIphoneX = { width: "100%", position: "fixed", bottom: "0", paddingBottom: "34PX", height: "44PX", background: "#EE5050", display: "flex", flexDirection: "row" }
        const bottomBarStyleNormal = { width: "100%", position: "fixed", bottom: "0px", height: "44PX", background: "#EE5050", display: "flex", flexDirection: "row" }

        return (
            <View className='markdown-reader' style={"padding-top:" + (statusBarHeight + 38) + "px"}>
                {showSearchBar && (
                    <ReaderSearchBar
                        searchResults={searchResults}
                        handleSeachResultClick={sectionKey => this.handleSeachResultClick(sectionKey)}
                        searchOnActionClick={valueToSearch => this.searchOnActionClick(valueToSearch)}
                        clearSearchResult={() => this.clearSearchResult()}></ReaderSearchBar>
                )}
                <BackButton></BackButton>
                <Button class="xssc-share-button" open-type="share" style={deviceModel == "iPhone X" ? { bottom: "92PX" } : { bottom: "52PX" }}>
                    <Text class="at-icon at-icon-share" style="font-size:18px;color:#fff;font-weight: bold">分享</Text>
                </Button>

                <AtDrawer
                    show={drawerShow}
                    mask
                    onClose={this.onMenuClose.bind(this)}
                    width={"90%"}
                    onItemClick={this.menuClick.bind(this)}
                    items={menuNameListArray}
                ></AtDrawer>
                <Markdown
                    md={md}
                    bottomOffset={deviceModel == "iPhone X" ? 78 : 44}
                    link={true}
                    highlight={true}
                    type='wemark'
                    imageServerEndpoint={this.imageServerEndpoint}
                    innerLinkClick={innerlink => this.innerLinkClick(innerlink)}
                    quickNav={true}
                    updateToView={toView => { this.updateToView(toView) }}
                    showFooter={showFooter}
                    topOffset={showSearchBar ? (statusBarHeight + 50 + 38) : (statusBarHeight + 38)}
                >
                </Markdown>

                <View style={deviceModel == "iPhone X" ? bottomBarStyleIphoneX : bottomBarStyleNormal}>
                    <View style="display: flex;flex:1;justify-content: center;font-size: 34rpx;align-items:center;"
                        onClick={this.prevSection}
                        className={currentSectionIndex === 0 ? "reader_bottom_control_inactive" : "reader_bottom_control"}>
                        <Text class="at-icon at-icon-chevron-left" style="font-size:34rpx;color:inherit;font-weight: bold"></Text>
                        <Text style="font-size:34rpx;color: inherit;font-weight: bold">上一章</Text>
                    </View>
                    <View style="display: flex;flex:1;justify-content: center;font-size: 34rpx;align-items:center;" onClick={this.openMenuDrawer}>
                        <Text class="at-icon at-icon-menu" style="font-size:34rpx;color:#fff;font-weight: bold"></Text>
                        <Text style="font-size:34rpx;color:#fff;font-weight: bold">目录</Text>
                    </View>
                    <View style="display: flex;flex:1;justify-content: center;font-size: 34rpx;align-items:center;"
                        onClick={this.nextSection}
                        className={(menuNameListArray.length !== 0 && currentSectionIndex === (menuNameListArray.length - 1)) ? "reader_bottom_control_inactive" : "reader_bottom_control"}>
                        <Text style="font-size:34rpx;font-weight: bold;color: inherit">下一章</Text>
                        <Text class="at-icon at-icon-chevron-right" style="font-size:34rpx;font-weight: bold;color: inherit"></Text>
                    </View>
                </View>
            </View >
        )
    }
}

MarkdownReader.defaultProps = {
    config: {
        localStoreSectionKey: "",
        localStoreVersionKey: ""
    },
    params: {},
    showSearchBar: false,
    showFooter: false,
    memoryLastRead: true
};

export default MarkdownReader 
