import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();

Page({
  data: {
  	searchItem:{
      status:['in',[0,1,-1]]
  	},
    currentId:0,
    mainData:[],
    buttonClicked:false,
    num:0
  },
  //事件处理函数
  onShow(){
    const self = this;
    self.getMainData();
  },

  onLoad(options){
  	const self = this;
  	self.data.paginate  = api.cloneForm(getApp().globalData.paginate);
  	
  	self.setData({
  		num: self.data.num
  	})
  },

  getMainData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self);  
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.token = wx.getStorageSync('token');
    postData.searchItem = api.cloneForm(self.data.searchItem);
    postData.searchItem.thirdapp_id = getApp().globalData.thirdapp_id;
    postData.searchItem.type=2;
    postData.searchItem.count = ['<','0'];
   
    postData.order = {
      create_time:'desc',
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.mainData.push.apply(self.data.mainData,res.info.data);
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','fail')
      };
      self.setData({
      		buttonClicked:false,
          web_mainData:self.data.mainData,
       });
      wx.hideLoading();
    };
    api.flowLogGet(postData,callback);
  },

   menuClick: function (e) {
    const self = this;
    self.setData({
      buttonClicked:true
    });
    const num = e.currentTarget.dataset.num;
    self.changeSearch(num);
  },

  changeSearch(num){
    const self = this;
    this.setData({
      num: num
    });
    self.data.searchItem = {}
    if(num=='0'){
      self.data.searchItem.status = ['in',[0,1,-1]]
    }else if(num=='1'){
     	self.data.searchItem.status = 0
    }else if(num=='2'){
     	self.data.searchItem.status = 1
    }else if(num=='3'){
      self.data.searchItem.status = -1
    };
    self.setData({
      web_mainData:[],
    });
    self.getMainData(true);
  },

  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },
})

  