import Taro from '@tarojs/taro';

export const fetchContent = function (url, callback) {
    Taro.request({
        url: url,
        success: function (data) {
            callback(data.data)
        },
        fail: function () {
            callback(null)
        }
    });
}

export const defaultServerEndpoint = "https://idd.cssapsu.cn/"

const catabusApiProxyServerEndpoint = "https://catabus.cssapsu.cn/v1/"

export const catabusApi = {
    catabusApiProxyServerEndpoint,
    RouteDetailsEndPoint: `${catabusApiProxyServerEndpoint}InfoPoint/rest/RouteDetails/Get/{routeID}?_={timestamp}`,
    GetVisibleRoutesEndPoint: `${catabusApiProxyServerEndpoint}InfoPoint/rest/Routes/GetVisibleRoutes?_={timestamp}`,
    GetAllStopsEndPoint: `${catabusApiProxyServerEndpoint}InfoPoint/rest/Stops/GetAllStops?_={timestamp}`,
    TraceFileEndPoint: `${catabusApiProxyServerEndpoint}InfoPoint/Resources/Traces/{filename}`,
    GetAllVehiclesForRouteEndPoint: `${catabusApiProxyServerEndpoint}InfoPoint/rest/Vehicles/GetAllVehiclesForRoute?routeID={routeID}&_={timestamp}`,
    GetStopDeptureEndPoint: `${catabusApiProxyServerEndpoint}InfoPoint/rest/StopDepartures/Get/{stopID}`
}

const psuMapApiProxyServerEndpoint = "https://api0.cssapsu.cn/v1/psumap/"
const psuMapAssetsApiProxyServerEndpoint = "https://api0.cssapsu.cn/v1/psumapassets/"

export const psuMapApi = {
    psuMapApiProxyServerEndpoint,
    psuMapAssetsApiProxyServerEndpoint,
    originalEndpoint: "https://api.concept3d.com/",
    categoryBatchChildrensEndpoint: `${psuMapApiProxyServerEndpoint}categories/{categories}?map=1134&batch&children&key=0001085cc708b9cef47080f064612ca5`,
    categoriesChildIdsEndpoint: `${psuMapApiProxyServerEndpoint}categories?childIds&map=1134&noPrivates&key=0001085cc708b9cef47080f064612ca5`,
    rootCategoryEndpoint: `${psuMapApiProxyServerEndpoint}categories/0?map=1134&children&key=0001085cc708b9cef47080f064612ca5`,
    byCategories: [
        {
            category: 'Dinning',
            categoryNameCN: '餐饮',
            endpoint: `${defaultServerEndpoint}maps/psu/dinning.json`,
            copyEndpoint: `${defaultServerEndpoint}maps/psu/dinning.json`
        }
    ]
}
