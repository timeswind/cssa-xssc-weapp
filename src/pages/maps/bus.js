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
        this.localStoreRouteIdKey = "__maps_catabus_routeid";

        this.didShowState = true

        this.stopIds = [];
        this.currentRouteID = Taro.getStorageSync(this.localStoreRouteIdKey) || -1;
        this.routeIdDic = {};

        this.VehicleRealtimeTimer = null;

        this.vehicleMarkers = []
        this.stopMarkers = []

        this.state = {
            longitude: '-77.859730',
            latitude: '40.803300',
            scale: 13,
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
        let RouteId = this.currentRouteID;
        this.getVisibleRoute();
        this.getRouteDetail(RouteId);
        this.startVehicleRealtimeTimer();
    }

    componentDidShow() {
        if (this.didShowState) {
            this.didShowState = false;
        } else {
            this.updateVehicleRealtime();
        }
    }

    componentWillUnmount() {
        this.stopVehicleRealtimeTimer();
    }

    startVehicleRealtimeTimer() {
        if (this.VehicleRealtimeTimer) {
            return false;
        }
        let speed = 30000; //30秒刷新一次
        let _this = this
        this.VehicleRealtimeTimer = setInterval(function () {
            _this.updateVehicleRealtime()
        }, speed)
    }

    stopVehicleRealtimeTimer() {
        clearInterval(this.VehicleRealtimeTimer);
    }

    updateVehicleRealtime() {
        let RouteId = this.currentRouteID;
        this.getActiveVehiclesLocationForRoute(RouteId)
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
        if (RouteId !== -1) {
            let timestamp = '' + new Date().getTime();
            let url = catabusApi.RouteDetailsEndPoint.replace('{timestamp}', timestamp)
            url = url.replace('{routeID}', RouteId)
            let self = this;
            fetchContent(url, function (data) {
                if ('Color' in data) {
                    self.routeThemeColor = '#' + data.Color;
                }
                if ('RouteTraceFilename' in data) {
                    self.getTraceFile(data.RouteTraceFilename)
                }
                if ('Stops' in data) {
                    var stopMarkers = self.formStopMarkers(data.Stops)
                    var markers = stopMarkers;
                    if ('Vehicles' in data) {
                        let vehicleMarkers = self.formVehicleMarkers(data.Vehicles)
                        markers = vehicleMarkers.concat(stopMarkers)
                    }
                    self.setState({ markers: markers })
                }
            })
        }
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
                        let longStr = splitArray[0];
                        let latStr = splitArray[1];

                        return {
                            longitude: longStr,
                            latitude: latStr
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
        if (RouteId !== -1) {
            let timestamp = '' + new Date().getTime();
            let url = catabusApi.GetAllVehiclesForRouteEndPoint.replace('{timestamp}', timestamp)
            url = url.replace('{routeID}', RouteId)
            let self = this;

            fetchContent(url, function (data) {
                self.displayVehicles(data)
            })
        }
    }

    formStopMarkers(stops) {
        var longitudeSum = 0.0;
        var latitudeSum = 0.0;
        var totalCoordinateCount = 0;

        var stopids = []
        let stopMarkers = stops.map(function (stop) {
            stopids.push(stop.StopId)
            let latStr = stop.Latitude;
            let longStr = stop.Longitude;
            latitudeSum += parseFloat(latStr);
            longitudeSum += parseFloat(longStr);
            totalCoordinateCount++

            var markerData = {
                iconPath: '/images/icons8-marker-40.png',
                id: stop.StopId,
                latitude: latStr,
                longitude: longStr,
                title: stop.Name,
                width: 20,
                height: 20,
                callout: {
                    content: "站点名称\n" + stop.Name,
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

        let centerLongitude = longitudeSum / totalCoordinateCount;
        let centerLatitude = latitudeSum / totalCoordinateCount;
        this.setState({ longitude: centerLongitude, latitude: centerLatitude })
        this.stopIds = stopids;
        this.stopMarkers = stopMarkers;
        return stopMarkers;
    }

    formVehicleMarkers(vehicles) {
        let vehicleMarkers = vehicles.map(function (bus) {
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
        this.vehicleMarkers = vehicleMarkers
        return vehicleMarkers
    }

    displayVehicles(vehicles) {
        let vehicleMarkers = this.formVehicleMarkers(vehicles)
        let stopMarkers = this.stopMarkers;
        var markers = vehicleMarkers.concat(stopMarkers);
        this.setState({ markers: markers })
    }

    routeOnClick(RouteId) {
        this.currentRouteID = RouteId;
        Taro.setStorageSync(this.localStoreRouteIdKey, RouteId);
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
        const { longitude, latitude, scale, visiableRoutes, markers, polylineData, showTimeTable, timetableData } = this.state;
        const routerPageCount = Taro.getCurrentPages().length;

        return (
            <View>
                <MyMap
                    longitude={longitude}
                    latitude={latitude}
                    scale={scale}
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