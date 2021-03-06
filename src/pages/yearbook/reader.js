import MarkdownReader from '../../components/MarkdownReader';
import { Component } from '@tarojs/taro'
import { observer, inject } from '@tarojs/mobx'
import { View } from '@tarojs/components'

@inject('globalStore')
@observer
class yearbookReader extends Component {

    constructor(props) {
        super(props);
        this.config = {
            navigationBarTitleText: 'PSUCSSA 年鉴'
        }

        this.readerConfig = {
            apiPath: "https://idd.cssapsu.cn/books/yearbook/",
            menuMarkdownKey: "SUMMARY.md",
            localStoreSectionKey: "__yearbook_section",
            localStoreVersionKey: "__yearbook_version",
            shareName: " PSUCSSA 年鉴",
            pathPrefix: "pages/yearbook/reader",
            defaultSectionKey: "README.md"
        }

        this.state = {
            params: {}
        }
    }

    componentWillMount() {
        const { globalStore } = this.props
        if (this.$router && 'params' in this.$router && Object.keys(this.$router.params).length !== 0) {
            this.setState({ params: this.$router.params })
            if ('version' in this.$router.params) {
                globalStore.setYearbookVersion(this.$router.params.version)
            }
        }
    }

    onShareAppMessage(res) {
        const { globalStore: { currentSection, currentSectionTitle, yearbookVersion, toView } } = this.props
        console.log(this.readerConfig.pathPrefix + '?from=share&section=' + currentSection + '&version=' + yearbookVersion + '&toview=' + toView)
        return {
            title: currentSectionTitle + this.readerConfig.shareName,
            path: this.readerConfig.pathPrefix + '?from=share&section=' + currentSection + '&version=' + yearbookVersion + '&toview=' + toView
        };
    }

    render() {
        const { params } = this.state
        return (
            <View>
                {Object.keys(params).length > 0 && (<MarkdownReader config={this.readerConfig} params={params} memoryLastRead={false}></MarkdownReader>)}
            </View>
        )
    }
}

export default yearbookReader