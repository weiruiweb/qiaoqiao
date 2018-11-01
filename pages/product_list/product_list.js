//logs.js
import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();



Page({
  
  data: {
  
    labelData:[],
    mainData:[],
    currentId:0,
    isLoadAll:false,
    sForm:{
      item:''
    },
    isShow:false,
  
  },
  
  onLoad(options) {
    const self = this;
    wx.showLoading();
    if(!wx.getStorageSync('token')){
      var token = new Token();
      token.getUserInfo();
    };
    this.setData({
      fonts:app.globalData.font
    });
    self.data.id=options.id;
    if(self.data.id){
      self.setData({
        web_currentId:self.data.id,
      }); 
    }else{
      self.setData({
        web_currentId:self.data.currentId,
      }); 
    }
    
    self.data.paginate = api.cloneForm(getApp().globalData.paginate);
    self.getLabelData();
   
  },



  menuTap(e){
    const self = this;
    var currentId = e.currentTarget.dataset.id;
    delete self.data.id;
    self.setData({
      web_currentId:currentId,
    });
    console.log(currentId)
    self.getMainData(true,currentId)
  },



  getMainData(isNew,currentId){
    const self = this;
    if(isNew){
      api.clearPageIndex(self); 
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id
    };
    if(self.data.id){
      postData.searchItem.category_id = self.data.id
    }else if(currentId==0){
      
    }else{
      postData.searchItem.category_id = currentId
    }
    postData.getAfter={
      sku:{
        tableName:'sku',
        middleKey:'product_no',
        key:'product_no',
        condition:'=',
      } 
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        for (var i = 0; i < res.info.data.length; i++) {
            self.data.mainData.push.apply(self.data.mainData,res.info.data[i].sku);
        }
        console.log(self.data.index)
        
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none');
      }
      wx.hideLoading();
      console.log(self.data.mainData)
      self.setData({

        web_mainData:self.data.mainData,
      });  
    };
    api.productGet(postData,callback);
  },


  getLabelData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
      type:3
    };
    postData.order = {
      create_time:'normal'
    }
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.labelData.push.apply(self.data.labelData,res.info.data);
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none');
      }
      console.log(self.data.labelData)
      wx.hideLoading();
      self.setData({
        web_labelData:self.data.labelData,
      });
      self.getMainData();
    };
    api.labelGet(postData,callback);   
  },




  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  intoPathRedi(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'redi');
  },

  sort_show(){
    var isShow =!this.data.isShow;
    this.setData({
      isShow:isShow
    })
  },

})


