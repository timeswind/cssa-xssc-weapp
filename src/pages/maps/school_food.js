import Taro, { Component } from '@tarojs/taro';
import { CoverView, ScrollView } from '@tarojs/components';
import MyMap from '../../components/map/map';
import { observer, inject } from '@tarojs/mobx';
import { fetchContent, psuMapApi } from '../../utils/api';

import './school_food.css';


@inject('globalStore')
@observer
class SchoolFoodMap extends Component {
    static options = {
        addGlobalClass: true
    }
    constructor(props) {
        super(props);
        this.dataApiPath = ""
        this.state = {
            longitude: '-77.859730',
            latitude: '40.803300',
            scale: 14,
            diningListDataByCategory: [],
            markers: []
        }
    }

    componentDidMount() {
        this.fetchSchoolFoodData()
    }

    fetchSchoolFoodData() {
        let url = psuMapApi.byCategories[0].endpoint;
        let self = this;
        fetchContent(url, function (data) {
            console.log(data)

            let markers = self.formDinningMarkers(data)
            self.setState({ diningListDataByCategory: data, markers: markers })
        })
    }

    formDinningMarkers(categories) {
        let markers = []
        categories.forEach(function (category) {
            if ('children' in category && 'locations' in category.children) {
                let locations = category.children.locations
                locations.forEach(function (location) {
                    var newMarker = {
                        iconPath: '/images/icons8-marker-40.png',
                        id: location.id,
                        latitude: location.lat,
                        longitude: location.lng,
                        title: location.name,
                        width: 20,
                        height: 20,
                        callout: {
                            content: location.name,
                            bgColor: "#ee5050",
                            color: "#ffffff",
                            borderColor: "#a02727",
                            borderWidth: 4,
                            padding: 8,
                            borderRadius: 8
                        }
                    }
                    markers.push(newMarker)
                })
            }
        })
        return markers;
    }

    backButtonOnClick() {
        if (Taro.getCurrentPages().length >= 2) {
            Taro.navigateBack()
        } else {
            Taro.redirectTo({ url: '/pages/index/index' })
        }
    }

    render() {
        const { globalStore: { windowHeight, statusBarHeight } } = this.props
        const { longitude, latitude, scale, markers, diningListDataByCategory } = this.state;
        const routerPageCount = Taro.getCurrentPages().length;
        return (
            <View>
                <MyMap
                    longitude={longitude}
                    latitude={latitude}
                    scale={scale}
                    markers={markers}
                    height={windowHeight / 2 + 'px'}
                    showBackBotton={true}
                    fullScreen={false}>
                    <CoverView className="coverview-back-botton" onClick={() => this.backButtonOnClick()} style={"top:" + (statusBarHeight + 8) + "px"}>
                        <CoverView style="font-size:16px;color:#fff;font-weight: bold;display:inline">{routerPageCount >= 2 ? '返回' : '首页'}</CoverView>
                    </CoverView>
                </MyMap>
                <ScrollView
                    style={'height: ' + windowHeight / 2 + 'px;'}
                    scrollY={true}
                    scrollX={false}
                    scrollWithAnimation={true}
                    enableBackToTop={true}
                    scrollWithAnimation={true}>

                    {diningListDataByCategory.map((category) =>
                        <View key={category.catId}>
                            {category.children.locations && (
                                <View
                                    id={category.catId}
                                    className="school_food_card">
                                    <View className="at-col">
                                        <View className="at-col">
                                            <Text style={{ fontSize: '20px', fontWeight: 'bold', display: 'block', color: '#a02727' }}>{category.name}</Text>
                                        </View>
                                        {category.children.locations.map((location) =>
                                            <View key={location.id}>
                                                <Text>{location.name}</Text>
                                            </View>
                                        )}
                                    </View>

                                </View>
                            )}
                        </View>
                    )}
                </ScrollView>
            </View>
        )
    }
}

export default SchoolFoodMap;