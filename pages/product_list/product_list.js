//logs.js
import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();



Page({
  
  data: {
    groupData:[],
    labelData:[],
    mainData:[],
    currentId:0,
    isLoadAll:false,
    
    isShow:false,
    buttonClicked:false,
    sForm:{
      title:''
    },
    searchItem:{
      thirdapp_id:getApp().globalData.thirdapp_id
    }
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



  menuTap(e){
    const self = this;
    var currentId = e.currentTarget.dataset.id;
    delete self.data.id;
    self.setData({
      buttonClicked: true,
      web_currentId:currentId,
    });
    console.log(currentId)
    self.getMainData(true,currentId)
  },
  mask(e){
    const self =this;
    self.setData({
      isShow: false,
    });
  },


  getMainData(isNew,currentId){
    const self = this;
    var nowTime = Date.parse(new Date());
    if(isNew){
      api.clearPageIndex(self); 
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.searchItem = api.cloneForm(self.data.searchItem);
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
        searchItem:{
          deadline:['>',nowTime]
        },
        key:'product_no',
        condition:'=',
      } 
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        for (var i = 0; i < res.info.data.length; i++) {
            self.data.mainData.push.apply(self.data.mainData,res.info.data[i].sku);
        }
 
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none');
      }
      wx.hideLoading();
      console.log(self.data.mainData)
      self.setData({

        buttonClicked: false,
        web_mainData:self.data.mainData
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
    };
    postData.getBefore = {
      label:{
        tableName:'label',
        searchItem:{
          title:['=',['商品类别']],
        },
        middleKey:'parentid',
        key:'id',
        condition:'in'
      },
    };
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

  sort_show(){
    var isShow =!this.data.isShow;
    this.setData({
      isShow:isShow
    })
  },

})


