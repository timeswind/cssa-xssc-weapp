import { Component } from '@tarojs/taro'
import MarkdownReader from '../components/MarkdownReader';
import { observer, inject } from '@tarojs/mobx'

@inject('globalStore')
@observer
class xssc extends Component {

    state = {
        params: {}
    }

    constructor() {
        super();
        this.config = {
            navigationBarTitleText: '新生手册'
        }

        this.readerConfig = {
            apiPath: "https://idd.cssapsu.cn/books/freshman_wiki/",
            menuMarkdownKey: "SUMMARY.md",
            searchDicKey: "search.json",
            pageDicKey: "page_dic.json",
            localStoreSectionKey: "__xxsc_section",
            shareName: " PSU新生手册",
            pathPrefix: "pages/xssc",
            defaultSectionKey: "README.md"
        }

        this.state = {
            params: {}
        }
    }

    componentWillMount() {
        if (this.$router && 'params' in this.$router && Object.keys(this.$router.params).length !== 0) {
            this.setState({ params: this.$router.params })
        }
    }

    onShareAppMessage(res) {
        const { globalStore: { currentSection, currentSectionTitle, toView } } = this.props
        return {
            title: currentSectionTitle + this.readerConfig.shareName,
            path: this.readerConfig.pathPrefix + '?from=share&section=' + currentSection + '&toview=' + toView
        };
    }

    render() {
        return (
            
            <MarkdownReader config={this.readerConfig}
            params={this.state.params}
            showSearchBar={true}
            showFooter={true}></MarkdownReader>
        )
    }
}

export default xssc 
