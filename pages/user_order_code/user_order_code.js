import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();

Page({


 

  data: {
    
    mainData:[],
    searchItem:{
      thirdapp_id:getApp().globalData.thirdapp_id,
      user_type:0,
      transport_status:0,
      pay_status:1
    },
    searchItemOr:{},
    sForm:{
      passage2:''
    },
    isLoadAll:false
  },
    

  onLoad(options){
    const self = this;
    self.data.paginate = api.cloneForm(getApp().globalData.paginate);
    self.setData({
      web_mainData:self.data.mainData
    });
    self.getMainData()
  },

  changeBind(e){
    const self = this;
    api.fillChange(e,self,'sForm');
    console.log(self.data.sForm);
    if(self.data.sForm.passage2){  
      self.data.searchItem.passage2 = ['LIKE',['%'+self.data.sForm.passage2+'%']];
      self.getMainData(true,self.data.sForm.passage2)
      
    }else if(self.data.sForm.passage2==''){
      self.getMainData()
    }

  },



  getMainData(isNew,Name){
    const self = this;
    if(isNew){
      api.clearPageIndex(self)
    };
    const postData = {
      paginate:api.cloneForm(self.data.paginate),
      token:wx.getStorageSync('threeToken'),
      searchItem:api.cloneForm(self.data.searchItem),
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.mainData.push.apply(self.data.mainData,res.info.data)
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有查询到订单','none');
      }
      self.setData({
        web_mainData:self.data.mainData
      })
      console.log(self.data.mainData)
    };
    api.orderGet(postData,callback);
  },

  orderUpdate(e){
    const self = this;
    const postData = {};
    postData.token = wx.getStorageSync('threeToken');
    postData.data ={
      transport_status:2,
      order_step:3
    }
    postData.searchItem = {
      id:api.getDataSet(e,'id'),
      user_type:0
    };

    const callback  = res=>{
      api.showToast('已提货','none');

  
    };
    api.orderUpdate(postData,callback);
  },


  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  onReachBottom() {
    const self = this;
    if(!self.data.isLoadAll){
      self.data.paginate.currentPage++;
      self.getMainData();
    };
  },
 

 
})

  