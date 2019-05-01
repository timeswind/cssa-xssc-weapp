import { Component } from '@tarojs/taro'
import { Map } from '@tarojs/components'

class MyMap extends Component {
    static options = {
        addGlobalClass: true
    }

    markerOnTap(event) {
        if (this.props.onMarkerTap !== null) {
            this.props.onMarkerTap(event)
        }
    }

    onTap(event) {
        event.preventDefault();
        event.stopPropagation();
    }

    render() {
        const { fullScreen, longitude, latitude, scale, showBackBotton, height, markers, polyline } = this.props;
        return (
            <Map
                onTap={this.onTap}
                onMarkerTap={this.markerOnTap}
                markers={markers}
                polyline={polyline}
                onClick={this.onTap}
                style={fullScreen ? { height: '100vh', width: '100%' } : { height: height, width: '100%' }}
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
    height: "100vh",
    longitude: '-77.859730',
    latitude: '40.803300',
    scale: 15,
    showBackBotton: false,
    markers: [],
    polyline: [],
    onMarkerTap: null
}

export default MyMap;