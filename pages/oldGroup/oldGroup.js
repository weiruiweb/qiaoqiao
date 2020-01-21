//logs.js
import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();



Page({
  
  data: {
  
    searchItem:{
      thirdapp_id:getApp().globalData.thirdapp_id,
      onShelf:1
    },
    mainData:[],
    sForm:{
    	title:''
    },
    isLoadAll:false,
  
  
  
  },
  
  onLoad(options) {
    const self = this;
    var nowTime = Date.parse(new Date());
		self.data.searchItem.deadline=['<',nowTime];
    self.data.paginate = api.cloneForm(getApp().globalData.paginate);
    wx.showLoading();
    if(!wx.getStorageSync('token')){
      var token = new Token();
      token.getUserInfo();
    };
    this.setData({
      fonts:app.globalData.font
    });
   
    self.getMainData()
  },







  getMainData(isNew){
    const self = this;
    
    if(isNew){
      api.clearPageIndex(self); 
    };
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
    wx.hideLoading();
    console.log(self.data.mainData)
    self.setData({
      web_mainData:self.data.mainData,
    });  
    };
    api.skuGet(postData,callback);
  },

  onReachBottom() {
    const self = this;
    if(!self.data.isLoadAll){
      self.data.paginate.currentPage++;
      self.getMainData();
    };
  },

   changeBind(e){
    const self = this;
    api.fillChange(e,self,'sForm');
    console.log(self.data.sForm);
    if(self.data.sForm.title){  
      console.log(666)
      self.data.searchItem.title = ['LIKE',['%'+self.data.sForm.title+'%']];
      self.getMainData(true)
    }else{
      delete self.data.searchItem.title;
      self.getMainData(true)
    }
  },







  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  intoPathRedi(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'redi');
  },

  

})


