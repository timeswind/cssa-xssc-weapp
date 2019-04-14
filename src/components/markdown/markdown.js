import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import './markdown.css';
import parser from './parser';
import { observer, inject } from '@tarojs/mobx'
import InfoFooter from '../footerinfo';

@inject('globalStore')
@observer
class Markdown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            parsedData: {},
            quickNavData: []
        }
    }

    componentDidMount() {
        this.parseMd(this.props.md);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.md !== nextProps.md) {
            return true
        }
        if (this.state.parsedData !== nextState.parsedData) {
            return true
        }
        if (this.state.quickNavData !== nextState.quickNavData) {
            return true
        }
        if (this.props.globalStore.toView !== nextState.props.globalStore.toView) {
            return true
        }

        return false
    }

    componentWillReceiveProps(nextProps) {
        if (!nextProps.md) return false;
        this.parseMd(nextProps.md);
    }

    imageClick(event) {
        var url = event.target.dataset.src
        Taro.previewImage({
            current: url,
            urls: [url]
        })
    }

    parseMd(md) {
        var parsedData = parser.parse(md, { "apipath": this.props.apipath, "link": this.props.link });
        this.setState({
            parsedData: parsedData.renderList,
            quickNavData: parsedData.quickNavData
        })
    }

    linkClick(event) {
        event.stopPropagation();
        if ('link' in event.target.dataset) {
            Taro.setClipboardData({ data: event.target.dataset.link })
        }
    }

    innerLinkClick(event) {
        event.stopPropagation();
        if ('link' in event.target.dataset) {
            this.props.innerLinkClick(event.target.dataset.link)
        }
    }

    quickNavClick(event) {
        const { globalStore } = this.props
        event.stopPropagation();
        if ('id' in event.target.dataset) {
            globalStore.setToView(event.target.dataset.id)
        }
    }

    onScroll(event) {
        // console.log(event)
        // const { globalStore } = this.props
        // globalStore.setToView("")
    }

    render() {
        const { globalStore: { windowHeight, toView } } = this.props
        var { type, quickNav, showFooter } = this.props;
        var { parsedData, quickNavData } = this.state;
        return (
            <ScrollView style={'height: ' + windowHeight + 'px;'} scrollY={true} scrollX={false} scrollIntoView={toView} scrollWithAnimation={true} scrollTop='0' onScroll={this.onScroll.bind()} enableBackToTop={true}>
                <View className="wemark_wrapper" id="top">
                    {(quickNav && quickNavData.length !== 0) && (
                        <View style="margin-bottom: 16px">
                            <Text style="display: block; font-size: 16px; font-weight: bold;margin-bottom: 4px">章节内容快速导航</Text>
                            {
                                quickNavData.map((quickNavObj) => (
                                    <Text style="margin-right: 8px; text-decoration: underline;color: #ee5050" onClick={this.quickNavClick.bind()} data-id={quickNavObj.id} key={quickNavObj.id}>{quickNavObj.name}</Text>
                                ))
                            }
                        </View>
                    )}
                    {type === 'wemark' && (
                        parsedData.map((renderBlock, index) => (
                            <View key={index} className={'wemark_block_' + renderBlock.type} id={!!renderBlock.quick_nav_id ? renderBlock.quick_nav_id : 'id' + index}>
                                {renderBlock.isArray ? (
                                    renderBlock.content.map((renderInline, index) => (
                                        <View key={index} style="display: inline">
                                            {(renderInline.type === 'text' || renderInline.type === 'code' || renderInline.type === 'strong' || renderInline.type === 'deleted' || renderInline.type === 'em' || renderInline.type === 'table_th' || renderInline.type === 'table_td')
                                                && (<View style="display: inline">
                                                    {renderInline.data.href ? (
                                                        <Text className={'wemark_inline_' + renderInline.type + ' wemark_inline_link'} selectable="true" data-link={renderInline.data.href} onClick={this.innerLinkClick.bind()}>{renderInline.content}</Text>
                                                    ) : (
                                                            <Text className={'wemark_inline_' + renderInline.type} selectable="true">{renderInline.content}</Text>
                                                        )}
                                                </View>)}
                                            {(renderInline.type && renderBlock.highlight)
                                                && (<Text className={'wemark_inline_code_' + renderInline.type} selectable="true">{renderInline.content}</Text>)}
                                            {(!renderInline.type)
                                                && (<Text className="wemark_inline_code_text" selectable="true">{renderInline}</Text>)}
                                            {(renderInline.type === 'link')
                                                && (<Text className="wemark_inline_link" selectable="true" data-link={renderInline.content} onClick={this.linkClick.bind()}>{renderInline.content}</Text>)}
                                            {(renderInline.type === 'image')
                                                && (<Image mode="widthFix" className="wemark_inline_image" src={renderInline.src} lazy-load="true" data-src={renderInline.src} onClick={this.imageClick.bind()}></Image>)}
                                        </View>
                                    ))
                                ) : (
                                        <View>
                                            {renderBlock.type === 'code' && (<View>{renderBlock.content}</View>)}
                                            {renderBlock.type === 'video' && (<Video class="wemark_block_video" src="{{ renderBlock.src }}" poster="{{ renderBlock.poster }}" controls></Video>)}
                                        </View>
                                    )}
                            </View>
                        ))
                    )
                    }
                </View>
                {showFooter && (
                    <InfoFooter></InfoFooter>
                )}
            </ScrollView>
        )
    }
}

Markdown.defaultProps = {
    md: "#Loading ...",
    type: "wemark",
    highlight: true,
    link: true,
    apiPath: '',
    quickNav: false,
    showFooter: false
};

export default Markdown 