import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();

Page({
  data: {
    num:0,
    mainData:[],
    searchItem:{
      standard:['>',Date.parse(new Date())]
    },
    buttonClicked:false,
    isLoadAll:false,
    complete_api:[]
  },
  
  onLoad() {
    const self = this;
    wx.showLoading();
    if(!wx.getStorageSync('token')){
      var token = new Token();
      token.getUserInfo();
    };
    self.setData({
      web_num:self.data.num
    });
    self.data.paginate = api.cloneForm(getApp().globalData.paginate);
    self.getOrderData()
  },

  getOrderData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self);
    }
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.token = wx.getStorageSync('token');
    postData.searchItem = api.cloneForm(self.data.searchItem);
    postData.searchItem.thirdapp_id = getApp().globalData.thirdapp_id;
    postData.searchItem.type = ['in',[3,4]];
    postData.searchItem.user_no = wx.getStorageSync('info').user_no;
    postData.searchItem.pay_status = 1;
    
    postData.order = {
      create_time:'desc'
    }
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.mainData.push.apply(self.data.mainData,res.info.data);
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none');
      }
      self.data.complete_api.push('getOrderData')
      self.setData({
        buttonClicked:false,
      })
      self.setData({
        web_mainData:self.data.mainData,
      });     
      self.checkLoadComplete()
    };
    api.orderGet(postData,callback);
  },

  menuClick: function (e) {
    const self = this;
    self.setData({
      buttonClicked:true,
    })
    const num = e.currentTarget.dataset.num;
    self.changeSearch(num);
  },


  changeSearch(num){
    const self = this;
    self.setData({
      web_num: num
    });
    var endTime = Date.parse(new Date());
    console.log(endTime)
    self.data.searchItem = {};
    if(num=='0'){
      self.data.searchItem.standard = ['>',endTime]
    }else if(num=='1'){
      self.data.searchItem.standard = ['>',endTime]
      self.data.searchItem.order_step = '0';
    }else if(num=='2'){
      self.data.searchItem.standard = ['>',endTime]
      self.data.searchItem.order_step = '1'
    }else if(num=='3'){
      self.data.searchItem.standard = ['<',endTime]
    }
    self.setData({
      web_mainData:[],
    });
    self.getOrderData(true);
  },

  choose(e){
    const self = this;
    var index = api.getDataSet(e,'index');
	console.log('index',index)
	var endTime = Date.parse(new Date());
	if(self.data.mainData[index].order_step==1){
		api.showToast('优惠券已使用','none');
		return
	};
	if(self.data.mainData[index].standard<endTime){
		api.showToast('优惠券已失效','none');
		return
	};
    wx.setStorageSync('couponId',self.data.mainData[index].id);
    wx.navigateBack({
      delta:1
    })
  },

  



  checkLoadComplete(){
    const self = this;
    var complete = api.checkArrayEqual(self.data.complete_api,['getOrderData']);
    if(complete){
      wx.hideLoading();
    };
  },

  onReachBottom: function () {
    const self = this;
    if(!self.data.isLoadAll){
      self.data.paginate.currentPage++;
      self.getOrderData();
    };
  },
})


