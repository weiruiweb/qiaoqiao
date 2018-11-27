	import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();


Page({


  data: {
    messageData:[],
    mainData:[],
    chooseId:[],
    tabCurrent:0,
    isShow:false,
    labelData:[],
    complete_api:[],
    keys:[],
    values:[],
    skuData:{},
    count:1,
    id:'',
    sku_item:[],
    choose_sku_item:[],
    buttonType:'',
    buttonClicked:true,
    img:"background:url('/images/small.png')",
  },
  
  onLoad(options){
    const self = this;
    console.log(self.data.skuData);
    self.data.paginate = getApp().globalData.paginate;
    wx.showLoading();
    if(!wx.getStorageSync('token')){
      var token = new Token();
      token.getUserInfo();
    };
    self.setData({
      fonts:app.globalData.font,
      web_count:self.data.count
    });
    if(options.id){
      self.data.id = options.id
    }else if(options.product_id){
    	self.data.id = options.product_id
    };
    self.getMainData();
    self.getMessageData();
    if(wx.getStorageSync('collectData')[self.data.id]){
      self.setData({
        url: '/images/collect_a.png',
      });
    }else{
      self.setData({
        url: '/images/collect.png',
      });
    };
    wx.showShareMenu({
      withShareTicket: true
    });
    if(options.scene){
      var scene = decodeURIComponent(options.scene)
    };
    if(options.group_no){
      self.data.scene = options.group_no
    };
    if(options.user_no){
    	self.data.user_no = options.user_no
    };
    console.log(self.data.scene)
  	
  },



  collect(){
    const self = this;  
    if(self.data.buttonClicked){
      api.showToast('数据有误请稍等','none');
      setTimeout(function(){
        wx.showLoading();
      },800)   
      return;
    };
    const id = self.data.id;
    if(wx.getStorageSync('collectData')&&wx.getStorageSync('collectData')[id]){
      api.deleteFootOne(id,'collectData');
      self.setData({
        url: '/images/collect.png',
      });
    }else{
      api.footOne(self.data.mainData,'id',100,'collectData');  
      self.setData({
        url: '/images/collect_a.png',
      });
    };
  },

  getMainData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
    };
    postData.getBefore={
      sku:{
        tableName:'sku',
        searchItem:{
          id:['in',[self.data.id]]
        },
        fixSearchItem:{
          status:1
        },
        key:'product_no',
        middleKey:'product_no',
        condition:'in',
      } 
    };
    postData.getAfter={
      sku:{
        tableName:'sku',
        middleKey:'product_no',
        key:'product_no',
        condition:'=',
        searchItem:{
          status:['in',[1]]
        },
      } 
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.mainData = res.info.data[0];
        for(var key in self.data.mainData.label){
          if(self.data.mainData.sku_array.indexOf(parseInt(key))!=-1){
            self.data.labelData.push(self.data.mainData.label[key])
          };    
        };
        
        for (var i = 0; i < self.data.mainData.sku.length; i++) {
          if(self.data.mainData.sku[i].id==self.data.id){
            self.data.skuData = api.cloneForm(self.data.mainData.sku[i]);
          };
          self.data.choose_sku_item.push.apply(self.data.choose_sku_item,self.data.mainData.sku[i].sku_item);
        };

        self.data.sku_item = self.data.skuData.sku_item;
        self.data.mainData.content = api.wxParseReturn(res.info.data[0].content).nodes;
        self.data.complete_api.push('getMainData');

      }else{
        api.showToast('商品信息有误','none');
      };
      console.log(self.data.skuData)
      self.setData({
        web_skuData:self.data.skuData,
        web_labelData:self.data.labelData,
        web_mainData:self.data.mainData,
        web_sku_item:self.data.sku_item,
        web_choose_sku_item:self.data.choose_sku_item,
      });
      console.log('self.data.labelData',self.data.labelData)
      self.checkLoadComplete();
    };
    api.productGet(postData,callback);
  },



  counter(e){
    const self = this;
    if(self.data.buttonClicked){
      api.showToast('数据有误请稍等','none');
      setTimeout(function(){
        wx.showLoading();
      },800)   
      return;
    };
    if(api.getDataSet(e,'type')=='+'){
      self.data.count++;
    }else if(self.data.skuData.count > '1'){
      self.data.count--;
    }
    self.data.skuData.count = self.data.count
    self.setData({
      web_count:self.data.count,
      web_skuData:self.data.skuData,
    });
    self.countTotalPrice();
  },

  bindManual(e) {
    const self = this;
    var count = e.detail.value;
    self.setData({
      web_count:count
    });
  },



  countTotalPrice(){  
    const self = this;
    var totalPrice = 0;
    totalPrice += self.data.count*parseFloat(self.data.skuData.price);
    self.data.totalPrice = totalPrice;
    self.setData({
      web_totalPrice:self.data.totalPrice.toFixed(2)
    });
  },

  

  selectModel(e){
    const self = this;
    if(self.data.buttonClicked){
      api.showToast('数据有误请稍等','none');
      setTimeout(function(){
        wx.showLoading();
      },800)   
      return;
    };
    self.data.buttonType = api.getDataSet(e,'type');
    console.log( self.data.buttonType)
    var isShow = !self.data.isShow;
    self.setData({
      web_buttonType:self.data.buttonType,
      isShow:isShow
    })
  },

  addCart(){
    const self = this;
    self.data.skuData.count = self.data.count;
    self.data.skuData.isSelect = true;
    console.log(self.data.skuData);
    if(self.data.skuData.id !=''&&self.data.skuData.id !=undefined){
      api.footOne(self.data.skuData,'id',100,'cartData'); 
      api.showToast('已加入购物车啦','none')
    }else{
      api.showToast('请完善信息','none')
    }
    this.setData({
      isShow:false,
    })
  },

  goBuy(){
    const self = this;
    const callback = (user,res) =>{ 
      const skuDatas = [];
      skuDatas.push({
        id:self.data.id,
        count:self.data.count
      });
      console.log(skuDatas);
      if(self.data.skuData.id !=''&&self.data.skuData.id !=undefined){
        wx.setStorageSync('payPro',skuDatas);
       
        api.pathTo('/pages/order_confirm/order_confirm?group_no='+self.data.scene+'&&user_no='+self.data.user_no,'nav')
      }else{
        api.showToast('请完善信息','none')
      }
    };
    api.getAuthSetting(callback);


  },



  chooseSku(e){
    const self = this;
    const callback = (user,res) =>{ 
        if(self.data.buttonClicked){
        api.showToast('数据有误请稍等','none');
        setTimeout(function(){
          wx.showLoading();
        },800)   
        return;
      };
      self.data.skuData = {};
      self.data.id = '';
      
      self.data.count = 1;
      delete self.data.totalPrice;
      var id = api.getDataSet(e,'id');
      
      if(self.data.choose_sku_item.indexOf(id)==-1){
        return;
      };
      self.data.choose_sku_item = [];
      var parentid = api.getDataSet(e,'parentid');
      var sku = self.data.mainData.label[parentid];

      for(var i=0;i<sku.child.length;i++){
        if(self.data.sku_item.indexOf(sku.child[i].id)!=-1){
          self.data.sku_item.splice(self.data.sku_item.indexOf(sku.child[i].id), 1);
        };
        self.data.choose_sku_item.push(sku.child[i].id);
      };

      
      for (var i = 0; i < self.data.mainData.sku.length; i++) {
        if(self.data.mainData.sku[i].sku_item.indexOf(parseInt(id))!=-1){
          self.data.choose_sku_item.push.apply(self.data.choose_sku_item,self.data.mainData.sku[i].sku_item);  
        };
      };

      for(var i=0;i<self.data.sku_item.length;i++){
        if(self.data.choose_sku_item.indexOf(parseInt(self.data.sku_item[i]))==-1){
          self.data.sku_item.splice(i, 1); 
        };
      };
      self.data.sku_item.push(id);

      for(var i=0;i<self.data.mainData.sku.length;i++){ 
        if(JSON.stringify(self.data.mainData.sku[i].sku_item.sort())==JSON.stringify(self.data.sku_item.sort())){
          self.data.id = self.data.mainData.sku[i].id;
          self.data.skuData = api.cloneForm(self.data.mainData.sku[i]);
        };   
      };
      self.setData({
        web_totalPrice:'',
        web_count:self.data.count,
        web_sku_item:self.data.sku_item,
        web_skuData:self.data.skuData,
        web_choose_sku_item:self.data.choose_sku_item,
      });
    };
    api.getAuthSetting(callback);
    
    
  },

  onShareAppMessage(res){
    const self = this;
    if(self.data.buttonClicked){
      api.showToast('数据有误请稍等','none');
      setTimeout(function(){
        wx.showLoading();
      },800)   
      return;
    };
     console.log(res)
      if(res.from == 'button'){
        self.data.shareBtn = true;
      }else{   
        self.data.shareBtn = false;
      }
      return {
        title: '纯粹科技',
        path: 'pages/detail/detail?id='+self.data.id+'&&user_no='+wx.getStorageSync('info').user_no,
        success: function (res){
          console.log(res);
          console.log(parentNo)
          if(res.errMsg == 'shareAppMessage:ok'){
            console.log('分享成功')
            if (self.data.shareBtn){
              if(res.hasOwnProperty('shareTickets')){
              console.log(res.shareTickets[0]);
                self.data.isshare = 1;
              }else{
                self.data.isshare = 0;
              }
            }
          }else{
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

  getMessageData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self); 
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.token = wx.getStorageSync('token');
    postData.searchItem = {
      relation_id:self.data.id,
      type:2
    };
    postData.order = {
      create_time:'desc'
    };
    postData.getAfter = {
      user:{
        tableName:'user',
        middleKey:'user_no',
        key:'user_no',
        searchItem:{
          status:1
        },
        condition:'='
      }
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.messageData.push.apply(self.data.messageData,res.info.data);
      }else{
        self.data.isLoadAll = true;
      
      };
      wx.hideLoading();
      self.setData({
        web_count:self.data.messageData.length,
        web_messageData:self.data.messageData,
      });  
    };
    api.messageGet(postData,callback);
  },

  onReachBottom() {
    const self = this;
    if(!self.data.isLoadAll){
      self.data.paginate.currentPage++;
      self.getMainData();
    };
  },



  checkLoadComplete(){
    const self = this;
    var complete = api.checkArrayEqual(self.data.complete_api,['getMainData']);
    if(complete){
      wx.hideLoading();
      self.data.buttonClicked = false;
    };
  },

  select_this(e){
    const self = this;
    self.data.tabCurrent = api.getDataSet(e,'current');
    self.setData({
      tabCurrent:self.data.tabCurrent
    })
  },

  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  close(){
    const self = this;
    self.setData({
      isShow:false
    })
  },

})
