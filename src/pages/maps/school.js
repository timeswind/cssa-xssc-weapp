import Taro, { Component } from '@tarojs/taro';
import { CoverView, ScrollView, View, Text } from '@tarojs/components';
import MyMap from '../../components/map/map';
import { observer, inject } from '@tarojs/mobx';
import { fetchContent, psuMapApi } from '../../utils/api';

import './school.css';


@inject('globalStore')
@observer
class SchoolFoodMap extends Component {
    static options = {
        addGlobalClass: true
    }
    constructor(props) {
        super(props);
        this.dataApiPath = ""

        this.categoryChildMap = {};
        this.fetchRootCategoriesComplete = false;
        this.fetchCategoriesChildIdsMapComplete = false;

        this.state = {
            longitude: '-77.859730',
            latitude: '40.803300',
            scale: 14,
            listDataByCategory: [],
            rootCategories: [],
            showMenu: true,
            markers: [],
            toview_rid: ""
        }
    }

    componentDidMount() {
        Taro.showLoading({
            title: '加载中',
            mask: true
        })
        this.fetchRootCategories()
        // this.fetchSchoolFoodData()
    }

    fetchCategoryBatchChildrens(categories) {
        Taro.showLoading({
            title: '加载中',
            mask: true
        })
        let url = psuMapApi.categoryBatchChildrensEndpoint.replace('{categories}', categories)
        let self = this;
        fetchContent(url, function (data) {
            let markers = self.formLocationMarkers(data)
            Taro.hideLoading()
            self.setState({ listDataByCategory: data, markers: markers, showMenu: false, toview_rid: "scrolltop" })
        })
    }

    fetchCategoriesChildIdsMap() {
        let url = psuMapApi.categoriesChildIdsEndpoint;
        let self = this;
        fetchContent(url, function (data) {
            self.fetchCategoriesChildIdsMapComplete = true;
            self.categoryChildMap = data;
            if (self.fetchRootCategoriesComplete) {
                Taro.hideLoading()
            }
        })
    }

    fetchRootCategories() {
        let url = psuMapApi.rootCategoryEndpoint;
        let self = this;
        fetchContent(url, function (data) {
            self.fetchRootCategoriesComplete = true;
            if ('children' in data && 'categories' in data.children) {
                self.setState({ rootCategories: data.children.categories })
                if (self.fetchCategoriesChildIdsMapComplete) {
                    Taro.hideLoading()
                }
            }
        })
        this.fetchCategoriesChildIdsMap()
    }

    // fetchSchoolFoodData() {
    //     let url = psuMapApi.byCategories[0].endpoint;
    //     let self = this;
    //     fetchContent(url, function (data) {
    //         console.log(data)

    //         let markers = self.formLocationMarkers(data)
    //         self.setState({ listDataByCategory: data, markers: markers })
    //     })
    // }

    formLocationMarkers(categories) {
        if (categories && categories.length > 0) {
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
                                borderRadius: 8,
                                display: 'BYCLICK'
                            }
                        }
                        markers.push(newMarker)
                    })
                }
            })
            return markers;
        } else {
            return []
        }

    }

    focusMarkerByLocationId(locationId) {
        let oldMarkers = this.state.markers
        var markerlatitude = this.state.latitude
        var markerlongitude = this.state.longitude
        var scale = this.state.scale

        var newMarkers = oldMarkers.map(function (marker) {
            if (marker.id == locationId) {
                marker.callout.display = 'ALWAYS'
                markerlatitude = marker.latitude
                markerlongitude = marker.longitude
                scale = 18;
            } else {
                marker.callout.display = 'BYCLICK'
            }
            return marker
        })

        this.setState({ scale: scale, latitude: markerlatitude, longitude: markerlongitude, markers: newMarkers })
    }

    backButtonOnClick() {
        if (Taro.getCurrentPages().length >= 2) {
            Taro.navigateBack()
        } else {
            Taro.redirectTo({ url: '/pages/index/index' })
        }
    }

    listLocationOnClick = (event) => {
        if ('key' in event.target.dataset) {
            this.focusMarkerByLocationId(event.target.dataset.key)
        }
    }


    listRootCategoryOnClick = (event) => {
        console.log(event)
        if ('key' in event.currentTarget.dataset) {
            let rootCategoryId = event.currentTarget.dataset.key
            if (rootCategoryId in this.categoryChildMap && this.categoryChildMap[rootCategoryId].length > 0) {
                this.fetchCategoryBatchChildrens(this.categoryChildMap[rootCategoryId])
            }
        }
    }

    showMenu() {
        this.setState({ showMenu: true, toview_rid: "scrolltop" })
    }

    render() {
        const { globalStore: { windowHeight, statusBarHeight } } = this.props
        const { longitude, latitude, scale, markers, listDataByCategory, showMenu, rootCategories, toview_rid } = this.state;
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
                    scrollIntoView={toview_rid}
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

                    {showMenu ? (
                        <View>
                            <View id="scrolltop"></View>
                            <Text style={{ fontSize: '24px', fontWeight: 'bold', display: 'block', color: '#1b1b1b', margin: '16px' }}>设施类别</Text>
                            {rootCategories.map((category) =>
                                <View key={category.catId} data-key={category.catId} onClick={this.listRootCategoryOnClick.bind()}>

                                    <View
                                        data-key={category.catId}
                                        id={category.catId}
                                        className="school_food_card">
                                        <View className="at-col">
                                            <View className="at-col category_title" style={{ paddingBottom: 0 }}>
                                                <Text style={{ fontSize: '20px', fontWeight: 'bold', display: 'block', color: '#a02727' }}>{category.name}</Text>
                                            </View>
                                        </View>

                                    </View>
                                </View>
                            )}
                        </View>
                    ) : (
                            <View>
                                <View id="scrolltop"></View>
                                <View style={{ textAlign: 'center', paddingTop: '16px' }}>
                                    <Button className="black-theme-button"
                                        onClick={this.showMenu.bind()}>
                                        <Text className='at-icon at-icon-close'
                                            style="font-size:18px;color:#fff;font-weight: bold">返回主目录</Text>
                                    </Button>
                                </View>
                                {listDataByCategory.map((category) =>
                                    <View key={category.catId}>
                                        {category.children.locations && (
                                            <View
                                                id={category.catId}
                                                className="school_food_card">
                                                <View className="at-col">
                                                    <View className="at-col category_title">
                                                        <Text style={{ fontSize: '20px', fontWeight: 'bold', display: 'block', color: '#a02727' }}>{category.name}</Text>
                                                    </View>
                                                    {category.children.locations.map((location) =>
                                                        <View key={location.id} data-key={location.id} onClick={this.listLocationOnClick.bind()}
                                                            className="item_title">
                                                            <Text data-key={location.id}>{location.name}</Text>
                                                        </View>
                                                    )}
                                                </View>

                                            </View>
                                        )}
                                    </View>
                                )}
                            </View>
                        )}


                </ScrollView>
            </View >
        )
    }
}

export default SchoolFoodMap;