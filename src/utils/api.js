import Taro from '@tarojs/taro';

const fetchContent = function (url, callback) {
    Taro.request({
        url: url,
        success: function (data) {
            callback(data.data)
        }
    });
}

module.exports = {
    fetchContent
}
