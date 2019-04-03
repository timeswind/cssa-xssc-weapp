const parser = require('./parser');

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
			wx.setClipboardData({
				data: event.currentTarget.dataset.link
			})
		},
		parseMd() {
			if (this.data.md) {
				var parsedData = parser.parse(this.data.md);

				if (this.data.type === 'wemark') {
					this.setData({parsedData});
				}
			}
		}
	}
});