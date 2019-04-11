const parser = require('./parser');
import Taro from '@tarojs/taro';

Component({
	properties: {
		md: {
			type: String,
			value: '',
			observer() {
				this.parseMd();
			}
		},
		type: {
			type: String,
			value: 'wemark'
		},
		apipath: {
			type: String,
			value: ''
		},
		link: {
			type: Boolean,
			value: false
		},
		highlight: {
			type: Boolean,
			value: false
		}
	},
	data: {
		parsedData: {},
		richTextNodes: []
	},
	methods: {
		urlonclick: function (event) {
			// copy url to clipboard
			Taro.setClipboardData({
				data: event.currentTarget.dataset.link
			})
		},
		parseMd() {
			if (this.data.md) {
				var parsedData = parser.parse(this.data.md, { "apipath": this.properties.apipath, "link": this.properties.link });

				if (this.data.type === 'wemark') {
					this.setData({ parsedData });
				}
			}
		}
	}
});