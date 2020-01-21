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
		sForm: {
			name: '',
			phone: '',
			detail: '',
			city: '',

		},
		region: '',
		id: '',
		buttonCanClick: true
	},

	onLoad(options) {
		const self = this;
		if (options.id) {
			self.data.id = options.id
			self.getMainData(self.data.id);
		};
		self.setData({
			web_buttonCanClick: self.data.buttonCanClick
		});
		wx.hideLoading();

	},

	getMainData(id) {
		const self = this;
		wx.showLoading();
		const postData = {};
		postData.searchItem = {};
		postData.searchItem.id = id;
		postData.token = wx.getStorageSync('token');
		const callback = (res) => {
			console.log(res);
			self.data.mainData = res;
			self.data.sForm.phone = res.info.data[0].phone;
			self.data.sForm.name = res.info.data[0].name;
			self.data.region = res.info.data[0].city;
			self.data.sForm.detail = res.info.data[0].detail;
			self.data.isdefault = res.info.data[0].isdefault;
			console.log('self.data.isdefault', self.data.isdefault)
			self.setData({
				web_region: self.data.region,
				web_isdefault: self.data.isdefault,
				web_mainData: self.data.sForm,
			})
			wx.hideLoading();
		};
		api.addressGet(postData, callback);
	},

	bindRegionChange(e) {
		const self = this;
		console.log('picker发送选择改变，携带值为', e.detail.value)
		self.data.region = e.detail.value.join('');
		self.data.sForm.city = self.data.region;
		this.setData({
			web_region: self.data.region
		})
	},


	inputChange(e) {
		const self = this;
		api.fillChange(e, self, 'sForm');
		self.setData({
			web_sForm: self.data.sForm,
		});
	},




	addressUpdate() {
		const self = this;
		const postData = {};
		postData.token = wx.getStorageSync('token');
		postData.searchItem = {};
		postData.searchItem.id = self.data.id;
		postData.data = {};
		postData.data = api.cloneForm(self.data.sForm);
		postData.data.isdefault = self.data.isdefault;
		const callback = (data) => {
			
			if (data) {
				api.dealRes(data);
				if (data.solely_code == 100000) {
					setTimeout(function() {
						wx.navigateBack({
							delta: 1
						});
					}, 300);
				}
			};

		};
		api.addressUpdate(postData, callback);
	},


	addressAdd() {
		const self = this;
		const postData = {};
		postData.token = wx.getStorageSync('token');
		postData.data = {};
		postData.data = api.cloneForm(self.data.sForm);
		postData.data.isdefault = self.data.isdefault;
		const callback = (data) => {
			if (data) {
				
				api.dealRes(data);
				if (data.solely_code == 100000) {
					setTimeout(function() {
						wx.navigateBack({
							delta: 1
						});
					}, 300);
				}
			};


		};
		api.addressAdd(postData, callback);
	},


	submit() {
		const self = this;
		
		var phone = self.data.sForm.phone;
		const pass = api.checkComplete(self.data.sForm);
		console.log('self.data.sForm', self.data.sForm)
		if (pass) {
			if (phone.trim().length != 11 || !/^1[3|4|5|6|7|8|9]\d{9}$/.test(phone)) {
				
				api.showToast('手机格式不正确', 'none');
				
			} else {
				if (self.data.id) {
					wx.showLoading();
					self.addressUpdate();
				} else {
					wx.showLoading();
					self.addressAdd();
				}

			}
		} else {
			
			api.showToast('请补全信息', 'none');

		};
	},





	switch2Change(e) {
		const self = this;
		console.log(e)
		if (e.detail.value == true) {
			self.data.isdefault = 1
		} else {
			self.data.isdefault = 0
		}

	}

})
