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
    self.data.paginate = api.cloneForm(getApp().globalData.paginate);
    wx.showLoading();
    if(!wx.getStorageSync('token')){
      var token = new Token();
      token.getUserInfo();
    };
    this.setData({
      fonts:app.globalData.font
    });
    if(options.id==30){
      self.data.searchItem.deadline =['>',nowTime]
    }else if(options.id==34){
      self.data.searchItem.deadline =['<',nowTime]
    };
    self.getMainData()
  },







getMainData(){
    const self = this;
    var nowTime = Date.parse(new Date());
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
      type:1
    };
    postData.getBefore = {
      label:{
        tableName:'label',
        searchItem:{
          title:['=',['今日团购']],
        },
        middleKey:'category_id',
        key:'id',
        condition:'in'
      },
    };
    postData.getAfter={
      sku:{
        tableName:'sku',
        middleKey:'product_no',
        searchItem:{
          deadline:['>',nowTime],
          status:1
        },
        key:'product_no',
        condition:'=',
      } 
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        for (var i = 0; i < res.info.data.length; i++) {

            self.data.mainData.push.apply(self.data.mainData,res.info.data[i].sku);
        };
      
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none');
      };
      wx.hideLoading();
      self.setData({

        web_mainData:self.data.mainData,
      });  
      
    };
    api.productGet(postData,callback);
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


