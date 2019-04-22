import Taro, { Component } from '@tarojs/taro';
import { CoverView } from '@tarojs/components';
import MyMap from '../../components/map/map';
import { observer, inject } from '@tarojs/mobx';
import { fetchContent } from '../../utils/api';

@inject('globalStore')
@observer
class SchoolMap extends Component {
    static options = {
        addGlobalClass: true
    }
    constructor(props) {
        super(props);
        this.dataApiPath = ""

    }

    componentDidMount() {
        fetchContent("https://idd.cssapsu.cn/books/yearbook/README.md", (result)=> {
            console.log(result)
        })
    }

    backButtonOnClick() {
        if (Taro.getCurrentPages().length >= 2) {
            Taro.navigateBack()
        } else {
            Taro.redirectTo({ url: '/pages/index/index' })
        }
    }
    render() {
        const { globalStore: { statusBarHeight } } = this.props;
        const routerPageCount = Taro.getCurrentPages().length;
        return (
            <View>
                <MyMap showBackBotton={true}>
                    <CoverView class="xssc-home-button" onClick={() => this.backButtonOnClick()} style={"top:" + (statusBarHeight + 8) + "px"}>
                        <CoverView class="at-icon at-icon-home" style="font-size:16px;color:#fff;font-weight: bold">{routerPageCount >= 2 ? '返回' : '首页'}</CoverView>
                    </CoverView>
                </MyMap>
            </View>
        )
    }
}

export default SchoolMap;