import Taro from '@tarojs/taro';

const fetchContent = function (url, callback) {
    Taro.request({
        url: url,
        success: function (data) {
            callback(data.data)
        }
    });
}

const defaultServerEndpoint = "https://idd.cssapsu.cn/"

const catabusApi = {
    proxyServerEndpoint: "https://catabus.cssapsu.cn/v1/",
    RouteDetailsEndPoint: "https://catabus.cssapsu.cn/v1/InfoPoint/rest/RouteDetails/Get/{routeID}?_={timestamp}",
    GetVisibleRoutesEndPoint: "https://catabus.cssapsu.cn/v1/InfoPoint/rest/Routes/GetVisibleRoutes?_={timestamp}",
    GetAllStopsEndPoint: "https://catabus.cssapsu.cn/v1/InfoPoint/rest/Stops/GetAllStops?_={timestamp}",
    TraceFileEndPoint: "https://catabus.cssapsu.cn/v1/InfoPoint/Resources/Traces/{filename}",
    GetAllVehiclesForRouteEndPoint: "https://catabus.cssapsu.cn/v1/InfoPoint/rest/Vehicles/GetAllVehiclesForRoute?routeID={routeID}&_={timestamp}",
    GetStopDeptureEndPoint: "https://catabus.cssapsu.cn/v1/InfoPoint/rest/StopDepartures/Get/{stopID}"
}


module.exports = {
    fetchContent,
    defaultServerEndpoint,
    catabusApi
}
