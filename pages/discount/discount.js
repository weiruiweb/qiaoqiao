import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();

Page({
  data: {
    mainData:[],
    searchItem:{
      thirdapp_id:getApp().globalData.thirdapp_id,
      type:['in',[3,4]]
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
    self.data.paginate = api.cloneForm(getApp().globalData.paginate);
    self.getMainData();
    self.getOrderData()
  },

  getMainData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self);
    }
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.searchItem = api.cloneForm(self.data.searchItem);
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.mainData.push.apply(self.data.mainData,res.info.data);
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none');
      }
      self.data.complete_api.push('getMainData')
      self.setData({
        buttonClicked:false,
      })
      self.setData({
        web_mainData:self.data.mainData,
      });     
      self.checkLoadComplete()
    };
    api.productGet(postData,callback);
  },

  addOrder(e){
    const self = this;
    if(self.data.buttonClicked){
      api.showToast('数据有误请稍等','none');
      setTimeout(function(){
        wx.showLoading();
      },800)   
      return;
    }
    self.data.buttonClicked = true;
    var id = api.getDataSet(e,'id');
    var type = api.getDataSet(e,'type');
    var deadline = api.getDataSet(e,'deadline');
    const postData = {
      token:wx.getStorageSync('token'),
      product:[
        {id:id,count:1}
      ],
      pay:{score:0},
      type:type,
      deadline:deadline
    };
    const callback = (res)=>{
      if(res&&res.solely_code==100000){
        api.showToast('领取成功！','none')
        self.data.buttonClicked = false;    
      }; 
    };
    api.addOrder(postData,callback);
  },

/*  getOrderData(){
    const self = this;
    const postData = {};
    postData.token = wx.getStorageSync('token');
    postData.searchItem = api.cloneForm(self.data.searchItem);
    const callback = (res)=>{
      if(res.info.data.length>0){
        for (var i = 0; i < res.info.data.length; i++) {
          if(res.info.data[i].products[0].snap_product.id)
        }
      }
    };
    api.orderGet(postData,callback);
  },*/


  checkLoadComplete(){
    const self = this;
    var complete = api.checkArrayEqual(self.data.complete_api,['getMainData']);
    if(complete){
      wx.hideLoading();
    };
  },

  onReachBottom: function () {
    const self = this;
    if(!self.data.isLoadAll){
      self.data.paginate.currentPage++;
      self.getMainData();
    };
  },
})