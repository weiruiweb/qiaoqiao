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
      type:['in',[3,4]],

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
   
  },

  getMainData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self);
    };
    var endTime = Date.parse(new Date());
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.searchItem = api.cloneForm(self.data.searchItem);
    postData.searchItem.deadline=['>',endTime];
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
    if(!self.data.order_id){
    wx.showLoading();
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
    self.data.price =  api.getDataSet(e,'price');

    const postData = {
      token:wx.getStorageSync('token'),
      product:[
        {id:id,count:1}
      ],
      pay:{score:self.data.price},
      type:type,
      deadline:deadline
    };
    const callback = (res)=>{
      if(res&&res.solely_code==100000){
        self.data.order_id = res.info.id
        self.pay(self.data.order_id);     
        self.data.buttonClicked = false;    
      }; 
    };
      api.addOrder(postData,callback);
    }else{
      self.pay(self.data.order_id)
    } 
  },

    

  pay(order_id){
    const self = this;
    var order_id = self.data.order_id;
    const postData = {
      token:wx.getStorageSync('token'),
      searchItem:{
        id:order_id
      },
      score:self.data.price
    };
    const callback = (res)=>{
     
       wx.hideLoading();
      if(res.solely_code==100000){
        api.showToast('兑换成功','none')
      }else{
        api.showToast(res.msg,'none')
      }
         
    };
    api.pay(postData,callback);
  },


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