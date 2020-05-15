import {
	Api
} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {
	Token
} from '../../utils/token.js';
const token = new Token();



Page({
	data: {
		num: 0,
		mainData: [],
		searchItem: {
			thirdapp_id: '2',
			type: 1,
			status: ['in', [0, 1]]
		},
		buttonClicked: false
	},


	onLoad(options) {
		const self = this;
		if (!wx.getStorageSync('token')) {
			var token = new Token();
			token.getUserInfo();
		};
		self.data.paginate = api.cloneForm(getApp().globalData.paginate);
		if (options.num) {
			self.changeSearch(options.num)
		} else {
			self.getMainData()
		}
		wx.showShareMenu({
			withShareTicket: true
		});
		this.setData({
			fonts: app.globalData.font
		});

	},


	getMainData(isNew) {
		const self = this;
		if (isNew) {
			api.clearPageIndex(self);
		};
		const postData = {};
		postData.paginate = api.cloneForm(self.data.paginate);
		postData.token = wx.getStorageSync('token');
		postData.searchItem = api.cloneForm(self.data.searchItem);
		postData.searchItem.thirdapp_id = getApp().globalData.thirdapp_id;
		postData.searchItem.type = 1;
		postData.searchItem.status = ['in', [0, 1]];
		postData.searchItem.user_no = wx.getStorageSync('info').user_no;
		postData.order = {
			create_time: 'desc'
		}
		const callback = (res) => {
			if (res.solely_code == 100000) {
				if (res.info.data.length > 0) {
					self.data.mainData.push.apply(self.data.mainData, res.info.data);
				} else {
					self.data.isLoadAll = true;
					api.showToast('没有更多了', 'none');
				};
				wx.hideLoading();
				self.setData({
					buttonClicked: false,
					web_mainData: self.data.mainData,
				});
			} else {
				api.showToast('网络故障', 'none')
			}
			console.log('getMainData', self.data.mainData)
		};
		api.orderGet(postData, callback);
	},

	deleteOrder(e) {
		const self = this;
		wx.showModal({
			title: '提示',
			content: '是否要删除该订单？',
			showCancel: true, //是否显示取消按钮
			cancelText: "否", //默认是“取消”
			
			confirmText: "是", //默认是“确定”
			
			success: function(res) {
				if (res.cancel) {
					//点击取消,默认隐藏弹框
				} else {
					//点击确定
					const postData = {};
					postData.token = wx.getStorageSync('token');
					postData.searchItem = {};
					postData.searchItem.id = api.getDataSet(e, 'id');
					const callback = res => {
						api.dealRes(res);
						self.getMainData(true);
					};
					api.orderDelete(postData, callback);
				}
			},
			fail: function(res) {}, //接口调用失败的回调函数
			complete: function(res) {}, //接口调用结束的回调函数（调用成功、失败都会执行）
		})
		
	},

	orderUpdate(e) {
		const self = this;
		wx.showModal({
			title: '提示',
			content: '是否要确认收货？',
			showCancel: true, //是否显示取消按钮
			cancelText: "否", //默认是“取消”
			
			confirmText: "是", //默认是“确定”
			
			success: function(res) {
				if (res.cancel) {
					//点击取消,默认隐藏弹框
				} else {
					//点击确定
					const postData = {};
					postData.token = wx.getStorageSync('token');
					postData.data = {
						transport_status: 2,
						order_step: 3
					}
					postData.searchItem = {};
					postData.searchItem.id = api.getDataSet(e, 'id');
					const callback = res => {
						api.showToast('已确认收货', 'none');
						self.getMainData(true);
					};
					api.orderUpdate(postData, callback);
				}
			},
			fail: function(res) {}, //接口调用失败的回调函数
			complete: function(res) {}, //接口调用结束的回调函数（调用成功、失败都会执行）
		})
		
	},



	pay(e) {
		const self = this;
		var id = api.getDataSet(e, 'id');
		var price = api.getDataSet(e, 'price')
		self.setData({
			buttonClicked: true
		});
		const postData = {
			token: wx.getStorageSync('token'),
			searchItem: {
				id: id
			},
			wxPay: price,
			wxPayStatus: 0
		};
		const callback = (res) => {
			if (res.solely_code == 100000) {
				const payCallback = (payData) => {
					if (payData == 1) {
						api.showToast('支付成功', 'none');
						self.getMainData(true)
					};

				};
				api.realPay(res.info, payCallback);
			}

		};
		api.pay(postData, callback);
	},


	menuClick: function(e) {
		const self = this;
		wx.showLoading();
		self.setData({
			buttonClicked: true
		});
		const num = e.currentTarget.dataset.num;
		self.changeSearch(num);
	},

	changeSearch(num) {
		const self = this;
		this.setData({
			num: num
		});
		self.data.searchItem = {}
		if (num == '0') {

		} else if (num == '1') {
			self.data.searchItem.pay_status = '0';
			self.data.searchItem.order_step = ['in', [0, 4, 5]];
		} else if (num == '2') {
			self.data.searchItem.pay_status = '1';
			self.data.searchItem.transport_status = ['in', [0, 1]];
			self.data.searchItem.order_step = ['in', [0, 4, 5]];
		} else if (num == '3') {
			self.data.searchItem.pay_status = '1';
			self.data.searchItem.transport_status = '2';
			self.data.searchItem.order_step = ['in', [3, 4, 5]];
		} else if (num == '4') {
			self.data.searchItem.order_step = '2';
		}
		self.setData({
			web_mainData: [],
		});
		self.getMainData(true);
	},


	onReachBottom() {
		const self = this;
		if (!self.data.isLoadAll) {
			self.data.paginate.currentPage++;
			self.getMainData();
		};
	},

	onShareAppMessage(res, e) {
		const self = this;
		var id = api.getDataSet(e, 'id');
		var group_no = api.getDataSet(e, 'group_no');
		console.log(res)
		if (res.from == 'button') {
			self.data.shareBtn = true;
		} else {
			self.data.shareBtn = false;
		}
		return {
			title: '巧巧爱家',
			path: 'pages/detail/detail?group_no=' + group_no + '&&product_id=' + id,
			success: function(res) {
				console.log(res);
				console.log(parentNo)
				if (res.errMsg == 'shareAppMessage:ok') {
					console.log('分享成功')
					if (self.data.shareBtn) {
						if (res.hasOwnProperty('shareTickets')) {
							console.log(res.shareTickets[0]);
							self.data.isshare = 1;
						} else {
							self.data.isshare = 0;
						}
					}
				} else {
					wx.showToast({
						title: '分享失败',
					})
					self.data.isshare = 0;
				}
			},
			fail: function(res) {
				console.log(res)
			}
		}
	},

	intoPath(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'nav');
	},

	intoPathRedirect(e) {
		const self = this;
		api.pathTo(api.getDataSet(e, 'path'), 'redi');
	},

})
