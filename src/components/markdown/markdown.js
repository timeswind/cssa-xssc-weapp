import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import './markdown.css';
import parser from './parser';

class Markdown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            parsedData: {}
        }
    }

    componentDidMount() {
        this.parseMd(this.props.md);
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
            parsedData
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

    render() {
        var { type } = this.props;
        var { parsedData } = this.state;
        return (
            <View className="wemark_wrapper">
                {type === 'wemark' && (
                    parsedData.map((renderBlock, index) => (
                        <View key={index} className={'wemark_block_' + renderBlock.type}>
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
        )
    }
}

Markdown.defaultProps = {
    md: "#Loading ...",
    type: "wemark",
    highlight: true,
    link: true,
    apiPath: ''
};

export default Markdown 