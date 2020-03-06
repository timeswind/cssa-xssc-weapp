import Taro, { Component } from '@tarojs/taro';
import { ScrollView, View, Text, CoverView } from '@tarojs/components';
import MyMap from '../../components/map/map';
import { fetchContent, catabusApi } from '../../utils/api';
import { AtList } from "taro-ui"
import { observer, inject } from '@tarojs/mobx'
import markerIcon from'../../images/icons8-marker-40.png';
import busIcon from '../../images/icons8-bus-48.png';
import xmlparser from 'fast-xml-parser'
import InfoFooter from '../../components/footerinfo';

import './bus.css';

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
        this.localStoreTabKey = "__maps_catabus_tab";
        this.localStoreBookmarkRouteIdsKey = "__maps_catabus_bookmark_routeids"

        this.didShowState = true

        this.stopIds = [];
        this.currentRouteID = Taro.getStorageSync(this.localStoreRouteIdKey) || -1;
        this.routeIdDic = {};

        this.VehicleRealtimeTimer = null;

        this.vehicleMarkers = []
        this.stopMarkers = []

        this.tabs = [{
            key: 0,
            name: "RouteBookMark",
            title: "我的收藏"
        }, {
            key: 1,
            name: "AllRoutes",
            title: "所有路线"
        }, {
            key: 2,
            name: "SchoolRoutes",
            title: "校内巴士"
        }]

        this.schoolRouteIds = [55, 57, 51, 53, 62, 64];

        this.state = {
            longitude: '-77.859730',
            latitude: '40.803300',
            scale: 13,
            visiableRoutes: [],
            markers: [],
            polylineData: [],
            showTimeTable: false,
            timetableData: {},
            toview_rid: "",
            activeTabKey: (Taro.getStorageSync(this.localStoreTabKey) !== "") ? Taro.getStorageSync(this.localStoreTabKey) : 1,
            bookmarkRouteIds: this.getbookmarkRouteIds()
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
        Taro.showLoading({
            title: '加载可用巴士路线中',
            mask: true
        })
        fetchContent(url, function (data) {
            Taro.hideLoading();
            let dic = {};
            data.forEach(function (routeItem) {
                dic[routeItem.RouteId] = routeItem
            })
            self.routeIdDic = dic;
            let visiableRoutes = data.map(function (route) {
                if (route.LongName.indexOf(" - ") > 0) {
                    route.LongNameDescription = route.LongName.split(" - ")[1];
                } else {
                    route.LongNameDescription = route.LongName;
                }
                route["rid"] = 'r' + route.RouteId;
                return route;
            })

            self.setState({ visiableRoutes: visiableRoutes })
        })
    }

    getRouteDetail(RouteId) {
        if (RouteId !== -1) {
            let timestamp = '' + new Date().getTime();
            let url = catabusApi.RouteDetailsEndPoint.replace('{timestamp}', timestamp)
            url = url.replace('{routeID}', RouteId)
            let self = this;
            Taro.showLoading({
                title: '加载路线详情中',
                icon: 'loading',
                mask: true
            })
            fetchContent(url, function (data) {
                Taro.hideLoading()
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
        console.log(stopids)
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
        this.setState({ toview_rid: 'r' + RouteId })
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

    markerOnTap = (event) => {
        console.log(this.stopIds)
        let markerID = event.markerId
        if (this.stopIds.indexOf(markerID) >= 0) {
            this.getGetStopDeptureInfos(markerID)
        }
    }

    mapOnTap(event) {
        this.setState({ showTimeTable: false })
    }

    generateStopTimeTable(stopDepartureInfo) {
        if (stopDepartureInfo && 'RouteDirections' in stopDepartureInfo && stopDepartureInfo.RouteDirections.length > 0) {
            var RouteDirections = stopDepartureInfo.RouteDirections;
            let currentRouteID = this.currentRouteID;
            var currentRouteStopDeparture = null
            var otherRouteStopDeparture = []
            let self = this


            RouteDirections.forEach(function (RouteDirection) {
                let departuresData = self.parseDeparturesData(RouteDirection.Departures);
                if (RouteDirection.RouteId === currentRouteID) {
                    currentRouteStopDeparture = {
                        routeName: self.routeIdDic[RouteDirection.RouteId].LongName,
                        color: self.routeIdDic[RouteDirection.RouteId].Color,
                        Departures: departuresData,
                        direction: RouteDirection.Direction
                    }
                } else {
                    let RouteStopDeparture = {
                        routeName: self.routeIdDic[RouteDirection.RouteId].LongName,
                        color: self.routeIdDic[RouteDirection.RouteId].Color,
                        Departures: departuresData,
                        direction: RouteDirection.Direction
                    }
                    otherRouteStopDeparture.push(RouteStopDeparture)
                }
            });


            this.setState({ showTimeTable: true, timetableData: { currentRouteStopDeparture, otherRouteStopDeparture }, toview_rid: "scrolltop" })
        } else {
            Taro.showModal({
                title: "提醒",
                content: "该站点现在没有运行的巴士"
            })
        }

    }

    parseDeparturesData(Departures) {
        if (Departures) {
            let self = this;
            let results = Departures.map(function (departure) {
                departure["depart_time"] = self.toDisplayTime(departure.ETA)
                return departure;
            })
            return results
        } else {
            return []
        }
    }

    toDisplayTime(departureTime) {
        let regex = /(?:\/Date\()(.*)(?:-.*\))/
        let time = departureTime.match(regex)[1];
        let date = new Date();
        date.setTime(time)

        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }

    closeTimeTable() {
        this.setState({ showTimeTable: false })
    }

    tabOnClick(event) {
        event.stopPropagation();
        this.setState({ activeTabKey: event.currentTarget.dataset.key });
        Taro.setStorageSync(this.localStoreTabKey, event.currentTarget.dataset.key);
    }

    getbookmarkRouteIds() {
        var bookMarkRoutes = Taro.getStorageSync(this.localStoreBookmarkRouteIdsKey);
        if (bookMarkRoutes) {
            bookMarkRoutes = JSON.parse(bookMarkRoutes);
            return bookMarkRoutes
        } else {
            return []
        }
    }

    addRouteToBookmark(RouteId) {
        var bookMarkRoutes = Taro.getStorageSync(this.localStoreBookmarkRouteIdsKey);
        if (bookMarkRoutes) {
            bookMarkRoutes = JSON.parse(bookMarkRoutes);
            if (bookMarkRoutes.indexOf(RouteId) === -1) {
                bookMarkRoutes.push(RouteId);
                Taro.setStorageSync(this.localStoreBookmarkRouteIdsKey, JSON.stringify(bookMarkRoutes));
                this.setState({ bookmarkRouteIds: bookMarkRoutes })
            }
        } else {
            let bookMarkRoutes = []
            bookMarkRoutes.push(RouteId);
            Taro.setStorageSync(this.localStoreBookmarkRouteIdsKey, JSON.stringify(bookMarkRoutes));
            this.setState({ bookmarkRouteIds: bookMarkRoutes })

        }

    }

    removeRouteFromBookmark(RouteId) {
        var bookMarkRoutes = Taro.getStorageSync(this.localStoreBookmarkRouteIdsKey);
        bookMarkRoutes = JSON.parse(bookMarkRoutes);
        if (bookMarkRoutes.indexOf(RouteId) > -1) {
            bookMarkRoutes = bookMarkRoutes.filter(function (id) {
                return id !== RouteId
            })
            Taro.setStorageSync(this.localStoreBookmarkRouteIdsKey, JSON.stringify(bookMarkRoutes));
            this.setState({ bookmarkRouteIds: bookMarkRoutes })
        }
    }

    bookMarkIconOnClick(event) {
        event.stopPropagation()
        if ('key' in event.currentTarget.dataset) {
            let RouteId = event.currentTarget.dataset.key;
            let bookmarkRouteIds = this.getbookmarkRouteIds();

            if (bookmarkRouteIds.indexOf(RouteId) > -1) {
                this.removeRouteFromBookmark(RouteId)
            } else {
                this.addRouteToBookmark(RouteId)
            }
        }
    }

    render() {
        const { globalStore: { windowHeight, statusBarHeight } } = this.props
        const { longitude, latitude, scale, visiableRoutes, markers, polylineData, showTimeTable, timetableData, toview_rid, activeTabKey, bookmarkRouteIds } = this.state;
        const routerPageCount = Taro.getCurrentPages().length;

        var routeListData = visiableRoutes;

        routeListData.map(function (route) {
            if (bookmarkRouteIds.indexOf(route.RouteId) > -1) {
                route['bookmark'] = true
            } else {
                route['bookmark'] = false
            }
            return route
        })

        let self = this;
        if (activeTabKey == 2) {
            routeListData = visiableRoutes.filter(function (route) {
                return self.schoolRouteIds.indexOf(route.RouteId) > - 1
            })
        } else if (activeTabKey == 0) {
            routeListData = visiableRoutes.filter(function (route) {
                return bookmarkRouteIds.indexOf(route.RouteId) > - 1
            })
        }
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
                    height={windowHeight / 2 + 'px'}
                    onTap={this.mapOnTap.bind()}>
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
                    scrollIntoView={toview_rid}
                    scrollWithAnimation={true}>
                    {showTimeTable ? (
                        <AtList>
                            <View id="scrolltop"></View>
                            <View style={{ textAlign: 'center', paddingTop: '16px' }}>
                                <Button className="black-theme-button"
                                    onClick={this.closeTimeTable.bind()}>
                                    <Text className='at-icon at-icon-close'
                                        style="font-size:18px;color:#fff;font-weight: bold">关闭时间表</Text>
                                </Button>
                            </View>

                            {timetableData.currentRouteStopDeparture ? (
                                <View>
                                    <View
                                        className="route_card"
                                        style={{ borderLeft: '16px solid #' + timetableData.currentRouteStopDeparture.color }}>
                                        <View className="at-row">
                                            <View className="at-col">

                                                <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>{timetableData.currentRouteStopDeparture.routeName}</Text>
                                            </View>
                                        </View>

                                    </View>
                                    <View className='at-row at-row--wrap'>
                                        {timetableData.currentRouteStopDeparture.Departures.map((data) =>
                                            <View className='at-col at-col-4' key={data.ETALocalTime}>
                                                <View className='timetable-time'>{data.depart_time}</View>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            ) : (
                                    <View className="route_card">
                                        <View className="at-row">
                                            <View className="at-col">
                                                <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>该线路在本站暂时没有运行计划</Text>
                                            </View>
                                        </View>

                                    </View>
                                )}


                            {timetableData.otherRouteStopDeparture.map((RouteStopDeparture) =>
                                <View key={RouteStopDeparture.RouteId}>
                                    <View
                                        className="route_card"
                                        style={{ borderLeft: '16px solid #' + RouteStopDeparture.color }}>
                                        <View className="at-row">
                                            <View className="at-col">
                                                <Text style={{ fontSize: '26px', fontWeight: 'bold', display: 'block', color: '#' + RouteStopDeparture.color }}>{RouteStopDeparture.direction}</Text>
                                                <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>{RouteStopDeparture.routeName}</Text>
                                            </View>
                                        </View>

                                    </View>
                                    <View className='at-row at-row--wrap'>
                                        {RouteStopDeparture.Departures.map((data) =>
                                            <View className='at-col at-col-4' key={data.ETALocalTime}>
                                                <View className='timetable-time'>{data.depart_time}</View>
                                            </View>
                                        )}
                                        {RouteStopDeparture.Departures.length === 0 && (
                                            <View className="at-col" style={{ textAlign: 'center', marginBottom: "32px" }}>
                                                <Text style={{ fontSize: '16px', fontWeight: 'bold', color: "#aaa" }}>该线路在本站暂时没有运行计划</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            )}
                        </AtList>)
                        : (
                            <View>
                                <View id="scrolltop"></View>
                                <View className='at-row tabs'>
                                    {this.tabs.map((tab) =>
                                        <View className={(activeTabKey === tab.key) ? 'at-col tab tab__active' : 'at-col tab'}
                                            key={tab.key}
                                            data-key={tab.key}
                                            style={{ textAlign: 'center' }}
                                            onClick={this.tabOnClick.bind()}>
                                            <Text>{tab.title}</Text>
                                        </View>
                                    )}
                                </View>
                                {routeListData.map((route) =>
                                    <View
                                        id={route.rid}
                                        onClick={() => this.routeOnClick(route.RouteId)} key={route.RouteId}
                                        className="route_card"
                                        style={{ borderLeft: '16px solid #' + route.Color }}>
                                        <View className="at-row">
                                            <View className="at-col">
                                                <Text style={{ fontSize: '26px', fontWeight: 'bold', display: 'block', color: '#' + route.Color }}>{route.RouteAbbreviation}</Text>
                                                <Text style={{ fontSize: '16px', fontWeight: 'bold' }}>{route.LongNameDescription}</Text>
                                            </View>
                                            <View className='at-icon at-icon-star-2' style={{ fontSize: '26px', color: (route.bookmark ? '#ffc107' : "#ddd") }} data-key={route.RouteId} onClick={this.bookMarkIconOnClick.bind()}></View>
                                        </View>

                                    </View>
                                )}
                            </View>
                        )}
                    <InfoFooter></InfoFooter>
                </ScrollView>

            </View >
        )
    }
}

export default CataBusMap;