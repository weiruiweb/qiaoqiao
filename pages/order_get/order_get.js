import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();



Page({
  data: {
  	labelData:[],
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
     searchItemTwo:
    {
      thirdapp_id:getApp().globalData.thirdapp_id,
      user_no:wx.getStorageSync('info').user_no
    },

    submitData:{
      name:'',
      phone:'',
      message:'',
      storeId:''
    },
    is_show:false,

    buttonClicked:true,
    order_id:'',
    complete_api:[],
    storeId:0
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
      web_storeId:self.data.storeId,
      fonts:app.globalData.font,
    });
    getApp().globalData.address_id = '';
    self.getLabelData();
    self.createCode()
  },

 
  createCode() {
    const self = this;
    var code = '';
    var codeLength = 6;
    var random = new Array(0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
    for (var i = 0; i < codeLength; i++) {
      var index = Math.floor(Math.random() * 9);
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
    self.getCouponData();
    console.log(self.data.idData)
 
  },


  getLabelData(){
    const self = this;
   
    const postData = {};
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
    };
    postData.getBefore = {
      caseData:{
        tableName:'label',
        searchItem:{
          title:['=',['门店']],
        },
        middleKey:'parentid',
        key:'id',
        condition:'in',
      },
    };
    postData.order = {
      create_time:'normal'
    }
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.labelData.push.apply(self.data.labelData,res.info.data);
      }else{
        api.showToast('暂无可选门店','none');
      }
      console.log(self.data.labelData)
      wx.hideLoading();
      self.setData({
        web_labelData:self.data.labelData,
      });
    };
    api.labelGet(postData,callback);   
  },

  chooseStore(e){
  	const self = this;
  	var id = api.getDataSet(e,'id')
  	self.data.submitData.storeId = id;
  	self.setData({
  	  web_submitData:self.data.submitData,
  	})
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


  getCouponData(){
    const self = this;
    const postData = {};
    postData.token = wx.getStorageSync('token');
    postData.searchItem = api.cloneForm(self.data.searchItemTwo);
    postData.searchItem.id = wx.getStorageSync('couponId');
    if(!wx.getStorageSync('couponId')){
      return
    }
    const callback = (res)=>{

      if(res.info.data.length>0){
        self.data.couponData= res.info.data[0].products[0].snap_product;
        self.data.couponNo  = res.info.data[0].order_no
      };
      self.setData({
        web_couponData:self.data.couponData,
      });  
      self.countTotalPrice();
    };
    api.orderGet(postData,callback);
  },

  userGet(){
  	const self = this;
  	const postData = {};
  	postData.token = wx.getStorageSync('token');
  	if(self.data.user_no){
  		postData.getAfter = {
  			highUser:{
  				tableName:'UserInfo',
  				middleKey:'status',
  				key:'status',
  				searchItem:{
  					status:1,
  					user_no:self.data.user_no
  				},
  				condition:'='
  			}
  		};
  	};
  	const callback = (res)=>{
  		if(res.info.data.length>0){
  			self.data.userData = res.info.data[0]
  		};
  		self.setData({
  			web_userData:self.data.userData
  		});
  		self.getMainData()
  	}
  	api.userGet(postData,callback)
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
      var newObject = api.cloneForm(self.data.submitData);

      delete newObject.message;

      if(!api.checkComplete(self.data.newObject)){
        api.showToast('请补全信息或选择自提点','none')
        self.data.buttonClicked = false;
        return;
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
        for (var i = 0; i < self.data.mainData.length; i++) {  
          console.log('self.data.mainData[i].id',self.data.mainData[i].id)        
          api.deleteFootOne(self.data.mainData[i].id ,'cartData')   
        };     
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
        id:order_id,
      }
    };
    if(self.data.couponData.discount>0){
       postData.coupon = {
        coupon_no:self.data.couponNo,
        price:self.data.couponPrice.toFixed(2)
      };
    };
   
    if(self.data.totalPrice>0){
        postData.wxPay = self.data.totalPrice.toFixed(2);
        postData.wxPayStatus = 0;
    };
     
    if(self.data.mainData[0].product.is_group==1){
      postData.searchItem.status = ['in',[0,1]]
    };
    postData.payAfter = [];
    if(wx.getStorageSync('info').thirdApp.custom_rule[0]&&wx.getStorageSync('info').thirdApp.custom_rule[0].getScoreRatio&&wx.getStorageSync('info').thirdApp.custom_rule[0].getScoreRatio>0){
      postData.payAfter.push({
          tableName:'FlowLog',
          FuncName:'add',
          data:{
            count:self.data.realTotalPrice/wx.getStorageSync('info').thirdApp.custom_rule[0].getScoreRatio,//62.5%
            trade_info:'购物得积分',
            user_no:wx.getStorageSync('info').user_no,
            type:3,
            thirdapp_id:getApp().globalData.thirdapp_id
          }
        });
    };
    if(self.data.user_no&&self.data.userData.highUser[0]&&self.data.userData.highUser[0].balance_ratio&&self.data.userData.highUser[0].balance_ratio>0){
      postData.payAfter.push(
        {
          tableName:'FlowLog',
          FuncName:'add',
          data:{
            count:self.data.realTotalPrice/self.data.userData.highUser[0].balance_ratio,
            trade_info:'分享奖励',
            user_no:self.data.user_no,
            type:2,
            thirdapp_id:getApp().globalData.thirdapp_id
          }
        }
      );
    };
    const callback = (res)=>{
      wx.hideLoading();
      if(res.solely_code==100000){
      if(res.info){
        const payCallback=(payData)=>{
            if(payData==1){
              setTimeout(function(){
                api.pathTo('/pages/user_order/user_order','redi');
              },800)  
            };   
          };
          api.realPay(res.info,payCallback);      
      }
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

   countTotalPrice(){
    const self = this;
    var totalPrice = 0;

    var couponPrice = 0;
    var productsArray = self.data.mainData;
    for(var i=0;i<productsArray.length;i++){
      totalPrice += productsArray[i].product.price*productsArray[i].count;
    };
    self.data.realTotalPrice = totalPrice; 
    console.log(self.data.couponData)

      if(self.data.couponData.type==3){
       if(self.data.couponData.discount>totalPrice){
          api.showToast('优惠券不可用','none');
          wx.removeStorageSync('couponId');
          return;
        };
        totalPrice = totalPrice-self.data.couponData.discount;
        couponPrice = self.data.couponData.discount;
         console.log(totalPrice)
      }else if(self.data.couponData.type==4){
        totalPrice = totalPrice-totalPrice*self.data.couponData.discount/10;
        couponPrice = totalPrice*self.data.couponData.discount/10
      }; 

  

    
    self.data.totalPrice = totalPrice;
    self.data.couponPrice = couponPrice;

    console.log(self.data.couponPrice)
    console.log(self.data.totalPrice)
    self.setData({
 
      web_couponPrice:couponPrice.toFixed(2),
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

  