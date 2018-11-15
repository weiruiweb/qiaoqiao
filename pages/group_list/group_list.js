//logs.js
import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();



Page({
  
  data: {
  

    mainData:[],

    isLoadAll:false,
  
  
  
  },
  
  onLoad(options) {
    const self = this;
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
    var nowTime = Date.parse(new Date());
    if(isNew){
      api.clearPageIndex(self); 
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.searchItem = {
      deadline:['>',nowTime],
      thirdapp_id:getApp().globalData.thirdapp_id,
      is_group:1
    };
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







  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  intoPathRedi(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'redi');
  },

  

})


