//logs.js
import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();


Page({

  /**
   * 页面的初始数据
   */
  data: {
    is_show:false,
    mainData:[],
    idData:[],
    messageData:[],
    relationData:[],
    isLoadAll:false,
    buttonClicked:false
  },
    

  onLoad(options){
    const self = this;
    wx.showLoading();
    if(!wx.getStorageSync('token')){
      var token = new Token();
      token.getUserInfo();
    };
    self.setData({
      buttonClicked:self.data.buttonClicked
    });
    self.data.paginate = api.cloneForm(getApp().globalData.paginate);
    self.data.id = options.id;
    self.getMessageData();
    self.relationGet()
  },

  relationGet(){
    const self = this;
    const postData = {};
    
    postData.searchItem = {
   
      relation_two:wx.getStorageSync('info').user_no,
      thirdapp_id:getApp().globalData.thirdapp_id,
      
    }
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.relationData.push.apply(self.data.relationData,res.info.data);
        for (var i = 0; i < self.data.relationData.length; i++) {
          self.data.idData.push(self.data.relationData[i].id)
        };
      };
      self.setData({
        web_relationData:self.data.relationData
      });
    };
    api.relationGet(postData,callback);
  },



  getMessageData(){
    const self = this;
    const postData = {};
    postData.paginate = self.data.paginate;
    postData.token=wx.getStorageSync('token');
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
      type:6,
      user_no:wx.getStorageSync('info').user_no 
    };
    postData.searchItemOr = {
      type:5,
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.messageData.push.apply(self.data.messageData,res.info.data)
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none')
      };
      console.log(self.data.messageData);
      wx.hideLoading();
      self.setData({
        web_messageData:self.data.messageData,
      });   
    };
    api.messageGet(postData,callback);
  },


  getMessageOne(){
    const self = this;
    const postData = {};
    postData.token=wx.getStorageSync('token');
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
      id:self.data.id,
      user_type:['in',[0,2]]
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.messageOneData = res.info.data[0];
        self.data.messageOneData.content = api.wxParseReturn(res.info.data[0].content).nodes;
      }
      console.log(self.data.messageOneData);
     
      for (var i = 0; i < self.data.idData.length; i++) {
        if(self.data.id ===  self.data.idData.length[i]){
           self.data.isRead = true;
        }else{
          self.data.isRead = false;
        };  
      };
      if(!self.data.isRead){
        self.relationAdd()
      }else{
        self.data.buttonClicked = false;
        self.setData({
          buttonClicked:self.data.buttonClicked
        });  
      };
      wx.hideLoading();
      self.setData({
        web_messageOneData:self.data.messageOneData,
      });   
    };
    api.messageGet(postData,callback);
  },

  relationAdd(){
    const self = this;
    const postData = {};
    postData.data = {
      relation_one:self.data.messageOneData.id,
      relation_two:wx.getStorageSync('info').user_no,
      thirdapp_id:getApp().globalData.thirdapp_id,
      type:self.data.messageOneData.type
    }
    const callback = (res)=>{
      self.data.buttonClicked = false;
      self.setData({
        buttonClicked:self.data.buttonClicked
      });
    };
    api.relationAdd(postData,callback);
  },

  mask:function(e){
    const self = this;
     self.setData({
      is_show:false,
     })
   },


  show:function(e){
    const self = this;
    wx.showLoading();
    self.data.buttonClicked = true;
    self.setData({
      buttonClicked:self.data.buttonClicked
    });
    var id = api.getDataSet(e,'id');
    self.data.id = id;
    self.getMessageOne();
    self.setData({
      is_show:true,
    })

  },

  onReachBottom() {
    const self = this;
    if(!self.data.isLoadAll){
      self.data.paginate.currentPage++;
      self.getMessageData();
    };
  },
  

})

