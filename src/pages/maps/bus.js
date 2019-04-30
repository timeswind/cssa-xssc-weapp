import Taro, { Component } from '@tarojs/taro';
import { ScrollView } from '@tarojs/components';
import MyMap from '../../components/map/map';
import { fetchContent, catabusApi } from '../../utils/api';
import { AtList, AtListItem, AtAccordion } from "taro-ui"
import { observer, inject } from '@tarojs/mobx'
import '../../images/icons8-marker-40.png';
import '../../images/icons8-bus-48.png';
import xmlparser from 'fast-xml-parser'

@inject('globalStore')
@observer
class CataBusMap extends Component {
    static options = {
        addGlobalClass: true
    }
    constructor(props) {
        super(props);
        this.routeThemeColor = "#000000";
        this.stopIds = [];
        this.currentRouteID = -1;
        this.routeIdDic = {};

        this.state = {
            visiableRoutes: [],
            markers: [],
            polylineData: [],
            showTimeTable: false,
            timetableData: {}
        }
    }

    onShareAppMessage(res) {
        return {
            title: 'Catabus 线路时刻',
            path: 'pages/maps/bus?from=share'
        };
    }

    componentDidMount() {
        this.getVisibleRoute();
    }

    getVisibleRoute() {
        let timestamp = '' + new Date().getTime();
        let url = catabusApi.GetVisibleRoutesEndPoint.replace('{timestamp}', timestamp)
        let self = this;
        fetchContent(url, function (data) {
            let dic = {};
            data.forEach(function (routeItem) {
                dic[routeItem.RouteId] = routeItem
            })
            self.routeIdDic = dic;
            self.setState({ visiableRoutes: data })
        })
    }

    getRouteDetail(RouteId) {
        let timestamp = '' + new Date().getTime();
        let url = catabusApi.RouteDetailsEndPoint.replace('{timestamp}', timestamp)
        url = url.replace('{routeID}', RouteId)
        let self = this;
        fetchContent(url, function (data) {
            let stopids = []
            // console.log(data)
            if ('Color' in data) {
                self.routeThemeColor = '#' + data.Color;
            }
            if ('RouteTraceFilename' in data) {
                self.getTraceFile(data.RouteTraceFilename)
            }
            if ('Stops' in data) {
                let markers = data.Stops.map(function (stop) {
                    stopids.push(stop.StopId)
                    var markerData = {
                        iconPath: '/images/icons8-marker-40.png',
                        id: stop.StopId,
                        latitude: stop.Latitude,
                        longitude: stop.Longitude,
                        title: stop.Name,
                        width: 20,
                        height: 20
                    }
                    return markerData;
                })
                self.setState({ markers: markers })
            }
            self.getActiveVehiclesLocationForRoute(RouteId)
            self.stopIds = stopids;
        })
    }

    getTraceFile(filename) {
        let url = catabusApi.TraceFileEndPoint.replace('{filename}', filename)
        let self = this;
        fetchContent(url, function (data) {
            var jsonObj = xmlparser.parse(data);
            let polylinesRaw = jsonObj.kml.Document.Folder.Placemark
            if (polylinesRaw) {
                let polylines = polylinesRaw.map(function (line) {
                    let rawCoordinates = line.LineString.coordinates
                    let rawCoordinatesSplit = rawCoordinates.split(',0 ')
                    let points = rawCoordinatesSplit.map(function (rawArray) {
                        let splitArray = rawArray.split(',');
                        return {
                            longitude: splitArray[0],
                            latitude: splitArray[1]
                        }
                    })

                    let polyline = {
                        points: points,
                        color: self.routeThemeColor,
                        width: 4,
                        dottedLine: false
                    }
                    return polyline
                })
                self.setState({ polylineData: polylines })
            }
        })
    }

    getActiveVehiclesLocationForRoute(RouteId) {
        let timestamp = '' + new Date().getTime();
        let url = catabusApi.GetAllVehiclesForRouteEndPoint.replace('{timestamp}', timestamp)
        url = url.replace('{routeID}', RouteId)
        let self = this;

        fetchContent(url, function (data) {
            let markers = data.map(function (bus) {
                var markerData = {
                    iconPath: '/images/icons8-bus-48.png',
                    id: bus.VehicleId,
                    latitude: bus.Latitude,
                    longitude: bus.Longitude,
                    title: bus.Destination,
                    width: 48,
                    height: 48,
                    anchor: { x: 0.5, y: 0.5 },
                    // label: {
                    //     content: "车内人数：" + bus.OnBoard,
                    //     bgColor: "#ee5050",
                    //     color: "#ffffff",
                    //     padding: 4,
                    //     borderRadius: 8
                    // },
                    callout: {
                        content: bus.Destination + "\n" + "车内人数：" + bus.OnBoard,
                        bgColor: "#ee5050",
                        color: "#ffffff",
                        borderColor: "#a02727",
                        borderWidth: 4,
                        padding: 8,
                        borderRadius: 8
                    }
                }
                return markerData;
            })

            var oldMarkers = self.state.markers;
            var newMarkers = oldMarkers.concat(markers)
            self.setState({ markers: newMarkers })

        })
    }

    routeOnClick(RouteId) {
        this.currentRouteID = RouteId;
        this.getRouteDetail(RouteId);
    }

    backButtonOnClick() {
        if (Taro.getCurrentPages().length >= 2) {
            Taro.navigateBack()
        } else {
            Taro.redirectTo({ url: '/pages/index/index' })
        }
    }

    getGetStopDeptureInfos(stopID) {
        let url = catabusApi.GetStopDeptureEndPoint.replace('{stopID}', stopID)
        let self = this;
        fetchContent(url, function (data) {
            self.generateStopTimeTable(data[0])
        })
    }

    markerOnTap(event) {
        let markerID = event.markerId
        if (this.stopIds.indexOf(markerID) >= 0) {
            this.getGetStopDeptureInfos(markerID)
        }
    }

    generateStopTimeTable(stopDepartureInfo) {
        var RouteDirections = stopDepartureInfo.RouteDirections;
        let currentRouteID = this.currentRouteID;
        var currentRouteStopDeparture = {}
        var otherRouteStopDeparture = []
        let self = this


        RouteDirections.forEach(function (RouteDirection) {
            if (RouteDirection.RouteId === currentRouteID) {
                currentRouteStopDeparture = {
                    routeName: self.routeIdDic[RouteDirection.RouteId].LongName,
                    Departures: RouteDirection.Departures
                }
            } else {
                let RouteStopDeparture = {
                    routeName: self.routeIdDic[RouteDirection.RouteId].LongName,
                    Departures: RouteDirection.Departures
                }
                otherRouteStopDeparture.push(RouteStopDeparture)
            }
        });


        // this.setState({ showTimeTable: true, timetableData: { currentRouteStopDeparture, otherRouteStopDeparture } })

    }

    closeTimeTable() {
        this.setState({ showTimeTable: false })
    }

    render() {
        const { globalStore: { windowHeight, statusBarHeight } } = this.props
        const { visiableRoutes, markers, polylineData, showTimeTable, timetableData } = this.state;
        const routerPageCount = Taro.getCurrentPages().length;
        console.log(timetableData.otherRouteStopDeparture)
        return (
            <View>
                <MyMap
                    markers={markers}
                    polyline={polylineData}
                    showBackBotton={true}
                    fullScreen={false}
                    onMarkerTap={this.markerOnTap.bind()}
                    height={windowHeight / 2 + 'px'}>
                    <CoverView className="coverview-back-botton" onClick={() => this.backButtonOnClick()} style={"top:" + (statusBarHeight + 8) + "px"}>
                        <CoverView style="font-size:16px;color:#fff;font-weight: bold;display:inline">{routerPageCount >= 2 ? '返回' : '首页'}</CoverView>
                    </CoverView>
                </MyMap>
                <ScrollView
                    style={'height: ' + windowHeight / 2 + 'px;'}
                    scrollY={true}
                    scrollX={false}
                    scrollWithAnimation={true}
                    enableBackToTop={true}>
                    {showTimeTable ? (
                        <AtList>
                            <AtListItem title={"关闭时间表"} onClick={this.closeTimeTable.bind()} />
                            <AtAccordion
                                open={true}
                                title={timetableData.currentRouteStopDeparture.routeName}
                            >

                                <AtList hasBorder={false}>
                                    {timetableData.currentRouteStopDeparture.Departures.map((data) =>
                                        <AtListItem title={(new Date(data.ETALocalTime) - new Date()) + '分钟'} arrow='right' key={data.ETALocalTime} />
                                    )}
                                </AtList>
                            </AtAccordion>
                            {timetableData.otherRouteStopDeparture.map((data) =>
                                <AtListItem title={data.routeName} arrow='right' key={data.routeName} />
                            )}
                        </AtList>)
                        : (
                            <AtList>
                                {visiableRoutes.map((route) =>
                                    <AtListItem title={route.LongName} arrow='right' key={route.RouteId} onClick={() => this.routeOnClick(route.RouteId)}
                                        iconInfo={{
                                            size: 25,
                                            color: '#' + route.Color, value: 'star-2',
                                        }} />
                                )}
                            </AtList>
                        )}

                </ScrollView>

            </View >
        )
    }
}

export default CataBusMap;