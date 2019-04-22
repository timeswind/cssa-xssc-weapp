import Taro, { Component } from '@tarojs/taro'
import { Button } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'

@inject('globalStore')
@observer
class BackButton extends Component {
    static options = {
        addGlobalClass: true
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
            <Button className="xssc-home-button"
                onClick={() => this.backButtonOnClick()}
                style={"top:" + (statusBarHeight + 8) + "px"}>
                <Text className={routerPageCount >= 2 ? "at-icon at-icon-chevron-left" : "at-icon at-icon-home"}
                    style="font-size:16px;color:#fff;font-weight: bold">{routerPageCount >= 2 ? '返回' : '首页'}</Text>
            </Button>
        )
    }
}

BackButton.defaultProps = {}

export default BackButton;