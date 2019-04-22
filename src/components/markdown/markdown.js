import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import './markdown.css';
import parser from './parser';
import InfoFooter from '../footerinfo';
import { observer, inject } from '@tarojs/mobx'

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

        return false
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.md !== nextProps.md) {
            this.parseMd(nextProps.md);
        }
    }

    imageClick(event) {
        var url = event.target.dataset.src
        Taro.previewImage({
            current: url,
            urls: [url]
        })
    }

    parseMd(md) {
        var parsedData = parser.parse(md, { "imageServerEndpoint": this.props.imageServerEndpoint, "link": this.props.link });
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
        if ('id' in event.target.dataset) {
            this.props.updateToView(event.target.dataset.id)
        }
    }

    onScrollToUpper = () => {
        this.props.updateToView("")
    }

    render() {
        const { globalStore: { windowHeight, toView } } = this.props
        var { type, quickNav, showFooter, scrollView, topOffset, bottomOffset } = this.props;
        var { parsedData, quickNavData } = this.state;
        var scrollViewHeight = windowHeight - topOffset - bottomOffset
        const content = (
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
                                            && (<View className="wemark_inline_image_wrapper">
                                                <Image mode="widthFix" className="wemark_inline_image" src={renderInline.src} lazy-load="true" data-src={renderInline.src} onClick={this.imageClick.bind()}></Image>
                                                <Text className="wemark_image_alt">{renderInline.alt && renderInline.alt}</Text>
                                            </View>)}
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
        )
        return (
            <View>
                {scrollView ? (
                    <ScrollView style={'height: ' + scrollViewHeight + 'px;'}
                        scrollY={true}
                        scrollX={false}
                        scrollIntoView={toView}
                        scrollWithAnimation={true}
                        enableBackToTop={true}
                        onScrollToUpper={this.onScrollToUpper}
                    >
                        {content}
                        {showFooter && (
                            <InfoFooter></InfoFooter>
                        )}
                        <View style={{ height: bottomOffset + "PX" }}></View>
                    </ScrollView>
                ) : (
                        <View>
                            {content}
                            {showFooter && (
                                <InfoFooter></InfoFooter>
                            )}
                            <View style={{ height: bottomOffset + "PX" }}></View>
                        </View>
                    )}
            </View>
        )
    }
}

Markdown.defaultProps = {
    md: "#Loading ...",
    type: "wemark",
    highlight: true,
    link: true,
    imageServerEndpoint: '',
    quickNav: false,
    showFooter: false,
    scrollView: true,
    bottomOffset: 0,
    topOffset: 0
};

export default Markdown 