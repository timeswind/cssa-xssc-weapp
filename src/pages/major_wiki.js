import { Component } from '@tarojs/taro'
import MarkdownReader from '../components/MarkdownReader';
import { observer, inject } from '@tarojs/mobx'

@inject('globalStore')
@observer
class xssc extends Component {

    constructor() {
        super();
        this.config = {
            navigationBarTitleText: '新生手册'
        }

        this.readerConfig = {
            apiPath: "https://idd.cssapsu.cn/books/major_wiki/",
            menuMarkdownKey: "SUMMARY.md",
            searchDicKey: "search.json",
            pageDicKey: "page_dic.json",
            localStoreSectionKey: "__major_section",
            shareName: " PSU专业百科",
            pathPrefix: "pages/major_wiki",
            defaultSectionKey: "README.md"
        }

        this.state = {
            params: {}
        }
    }

    componentWillMount() {
        if (Object.keys(this.$router.params).length !== 0) {
            this.setState({ params: this.$router.params })
        }
    }

    onShareAppMessage(res) {
        const { globalStore: { currentSection, currentSectionTitle, toView } } = this.props
        console.log(this.readerConfig.pathPrefix + '?from=share&section=' + currentSection + '&toview=' + toView)
        return {
            title: currentSectionTitle + this.readerConfig.shareName,
            path: this.readerConfig.pathPrefix + '?from=share&section=' + currentSection + '&toview=' + toView
        };
    }

    render() {
        return (
            <MarkdownReader config={this.readerConfig} params={params}></MarkdownReader>
        )
    }
}

export default xssc 
