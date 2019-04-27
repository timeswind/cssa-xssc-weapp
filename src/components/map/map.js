import { Component } from '@tarojs/taro'
import { Map } from '@tarojs/components'

class MyMap extends Component {
    static options = {
        addGlobalClass: true
    }

    render() {
        const { fullScreen, longitude, latitude, scale, showBackBotton } = this.props;
        return (
            <Map onClick={this.onTap}
                style={fullScreen ? { height: '100vh', width: '100%' } : {}}
                longitude={longitude}
                latitude={latitude}
                scale={scale}
                subkey="IOGBZ-G62CX-IBS4Q-ZMOE6-BOFK3-43B7B">
                {showBackBotton && this.props.children}
            </Map>
        )
    }
}

MyMap.defaultProps = {
    fullScreen: true,
    longitude: '-77.859730',
    latitude: '40.803300',
    scale: 15,
    showBackBotton: false
}

export default MyMap;