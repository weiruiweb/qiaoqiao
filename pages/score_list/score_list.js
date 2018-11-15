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







  getMainData(){
    const self = this;
    var nowTime = Date.parse(new Date());
    const postData = {};
    postData.searchItem = {
      type:1,
      thirdapp_id:getApp().globalData.thirdapp_id,
    };
    postData.order = {
      listorder:'desc'
    }
    postData.getBefore = {
      label:{
        tableName:'label',
        searchItem:{
          title:['=',['积分兑换商品']],
        },
        fixSearchItem:{
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              thirdapp_id:getApp().globalData.thirdapp_id
        },
        middleKey:'category_id',
        key:'id',
        condition:'in'
      },
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.mainData.push.apply(self.data.mainData,res.info.data);
      }else{
        api.showToast('暂无积分兑换商品','none');
      }
      wx.hideLoading();
      console.log(self.data.mainData)
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

  intoPathRedi(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'redi');
  },

  

})


