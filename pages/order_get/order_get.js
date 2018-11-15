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
    idData:[],
    orderData:[],
    couponData:[],
    couponId:[],
    searchItem:{
      isdefault:1
    },
    submitData:{
      name:'',
      phone:'',
      message:'',
    },
    is_show:false,

    buttonClicked:true,
    order_id:'',
    complete_api:[],

  },

  onLoad() {
    const self = this;
    wx.showLoading();
    if(!wx.getStorageSync('token')){
      var token = new Token();
      token.getUserInfo();
    };
    self.data.paginate = api.cloneForm(getApp().globalData.paginate);
    self.setData({
      fonts:app.globalData.font,
    });
    getApp().globalData.address_id = '';
    /*self.getOrderData();*/
    self.createCode()
  },

 
  createCode() {
    const self = this;
    var code = '';
    var codeLength = 4;
    var random = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z');
    for (var i = 0; i < codeLength; i++) {
      var index = Math.floor(Math.random() * 36);
      code += random[index];
    };
    self.data.code = code;
    self.setData({
      web_code:self.data.code
    })
  },

  onShow(){
    const self = this;
    self.data.searchItem = {};
    if(getApp().globalData.address_id){
      self.data.searchItem.id = getApp().globalData.address_id;
    }else{
      self.data.searchItem.isdefault = 1;
    };
    self.data.mainData = api.jsonToArray(wx.getStorageSync('payPro'),'unshift');

    for (var i = 0; i < self.data.mainData.length; i++) {
      self.data.idData.push(self.data.mainData[i].id)
    }
    self.getMainData();
    
    console.log(self.data.idData)
 
  },






  getMainData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      thirdapp_id:getApp().globalData.mall_thirdapp_id,
      id:['in',self.data.idData]
    }
    const callback = (res)=>{
      for (var i = 0; i < self.data.mainData.length; i++) {
        for (var j = 0; j < res.info.data.length; j++) {
          if(self.data.mainData[i].id == res.info.data[j].id){  
            self.data.mainData[i].product = res.info.data[j]
          }
        }
      };
      self.data.complete_api.push('getMainData')
      self.setData({
        web_mainData:self.data.mainData,
      });
      console.log(self.data.mainData)
      self.countTotalPrice();
      self.checkLoadComplete()   
    };
    api.skuGet(postData,callback);
  },




 

  addOrder(){
    const self = this;
    console.log(self.data.complete_api)
    if(self.data.buttonClicked){
      api.showToast('数据有误请稍等','none');
      setTimeout(function(){
        wx.showLoading();
      },800)   
      return;
    }else if(!self.data.order_id){
      self.data.buttonClicked = true;
      const postData = {
        token:wx.getStorageSync('token'),
        sku:self.data.mainData,
        pay:{
          wxPay:self.data.totalPrice.toFixed(2),
        },
        snap_address:self.data.submitData,
        passage2:self.data.code,
        type:1
      };
      if(self.data.mainData.is_group==1){
        postData.isGroup=true
      };
      console.log('addOrder',self.data.addressData)

      const callback = (res)=>{
        if(res&&res.solely_code==100000){
          setTimeout(function(){
            self.data.buttonClicked = false;
          }, 1000)         
        }; 
        wx.removeStorageSync('payPro');
        wx.removeStorageSync('couponId')
        self.data.order_id = res.info.id
        self.pay(self.data.order_id);     
      };
      api.addOrder(postData,callback);
    }else{
      self.pay(self.data.order_id)

    }   
  },

  mask:function(e){
     this.setData({
      is_show:false,
     })
   },


  show:function(e){
    this.setData({
      is_show:true,
    })
  },



  pay(order_id){
    const self = this;
    var order_id = self.data.order_id;
    const postData = {
      token:wx.getStorageSync('token'),
      searchItem:{
        id:order_id
      },
      wxPay:self.data.totalPrice.toFixed(2),
      wxPayStatus:0
    };
    const callback = (res)=>{
      wx.hideLoading();
      if(res.solely_code==100000){
        
        
         const payCallback=(payData)=>{
          if(payData==1){
            self.show();
            setTimeout(function(){
              api.pathTo('/pages/user_order/user_order','redi');
            },1000)  
          };   
        };
        api.realPay(res.info,payCallback);   
      }else{
        api.showToast('支付失败','none')
      }
         
    };
    api.pay(postData,callback);
  },

  checkLoadComplete(){
    const self = this;
    var complete = api.checkArrayEqual(self.data.complete_api,['getMainData']);
    if(complete){
      wx.hideLoading();
      self.data.buttonClicked = false;
    };
  },
/*
  chooseBuyWay(e){
    const self = this;
    console.log(e)
    var buyType = api.getDataSet(e,'buytype');
    self.data.buyType = buyType;
    console.log(self.data.buyType)
    self.setData({
      web_buyType:self.data.buyType
    });
  },

  checkboxChange(e) {
    const self = this;
    self.data.id = e.detail.value;
    console.log(self.data.id);
    self.data.searchItemTwo.id=6;
    self.getCouponData()
  },*/



  
  countTotalPrice(){
    const self = this;
    var totalPrice = 0;

    var couponPrice = 0;
    var productsArray = self.data.mainData;
    for(var i=0;i<productsArray.length;i++){
      totalPrice += productsArray[i].product.price*productsArray[i].count;
    };
    self.data.totalPrice = totalPrice;
    console.log(self.data.totalPrice)
    self.setData({
      web_totalPrice:totalPrice.toFixed(2)
    });

  },

  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },


  intoPathRedi(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'redi');
  },

  changeBind(e){
    const self = this;
    api.fillChange(e,self,'submitData');
    console.log(self.data.submitData);
    self.setData({
      web_submitData:self.data.submitData,
    });  
  },
})

  