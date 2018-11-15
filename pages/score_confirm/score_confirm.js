import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();



Page({
  data: {
    mainData:[],
    addressData:[],
    userInfoData:[],
    searchItem:{
      isdefault:1
    },
    buttonClicked: false,
    order_id:'',
  },

  onLoad: function (options) {
    const self = this;
    self.data.id = options.id;
    self.getMainData();
 
    getApp().globalData.address_id = '';
  },

  onShow(){
    const self = this;
    self.data.searchItem = {};
    if(getApp().globalData.address_id){
      self.data.searchItem.id = getApp().globalData.address_id;
    }else{
      self.data.searchItem.isdefault = 1;
    };
    self.getAddressData();
  },

  getAddressData(){
    const self = this;
    const postData = {}
    postData.token = wx.getStorageSync('token');
    postData.searchItem = api.cloneForm(self.data.searchItem);
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.addressData = res.info.data[0]; 
      }
      self.setData({
        web_addressData:self.data.addressData,
      });
    };
    api.addressGet(postData,callback);
  },


  getMainData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
      id:self.data.id
    }
    const callback = (res)=>{
      self.data.mainData = res.info.data[0]
      wx.hideLoading();
      self.setData({
        web_mainData:self.data.mainData,
      });     
    };
    api.productGet(postData,callback);
  },


  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  addOrder(){
    const self = this;
    
   if(!self.data.order_id){
      self.setData({
        buttonClicked: true
      });
      const postData = {
        token:wx.getStorageSync('token'),
        product:[
          {id:self.data.id,count:1}
        ],
        pay:{score:self.data.mainData.price},
        snap_address:self.data.addressData,
        type:1
      };
      if(postData.snap_address.length==0){
          api.showToast('请选择收货地址','none');
         
        }
      const callback = (res)=>{
        if(res&&res.solely_code==100000){
          setTimeout(function(){
            self.setData({
              buttonClicked: false
            })
          }, 1000)         
        }; 
        self.data.order_id = res.info.id
        self.pay(self.data.order_id);     
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
      score:self.data.mainData.price
    };
    const callback = (res)=>{
      wx.hideLoading();
      api.showToast('兑换成功','none')
      if(res.solely_code==100000){
        setTimeout(function(){
          api.pathTo('/pages/user_order/user_order','redi');
        },800) 
      }else{
        api.showToast(res.msg,'none')
      }
         
    };
    api.pay(postData,callback);
  },

})


  