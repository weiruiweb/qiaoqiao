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
    self.setData({
      web_sForm:self.data.sForm
    })
  },

  search(){
  	const self = this;
  	if(self.data.sForm.passage2){  
      self.data.searchItem.passage2 = self.data.sForm.passage2;
      self.getMainData(true,self.data.sForm.passage2)
      
    }else if(self.data.sForm.passage2==''){
    	delete self.data.searchItem.passage2;
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
        self.data.mainData.push.apply(self.data.mainData,res.info.data)
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有查询到订单','none');
      }
      self.setData({
        web_mainData:self.data.mainData
      })
      console.log('getMainData',self.data.sForm)
    };
    api.orderGet(postData,callback);
  },





  orderUpdate(id){
    const self = this;
    const postData = {};
    postData.token = wx.getStorageSync('threeToken');
    postData.data ={
      transport_status:2,
      order_step:3
    }
    postData.searchItem = {
      id:id,
      user_type:0
    };

    const callback  = (res)=>{
      if(res.solely_code==100000){	
        api.showToast('已确认提货','none')
      }else{
      	api.showToast(res.msg,'none')
      }
      self.data.mainData = [];
      self.data.sForm.title='';
      self.setData({
      	web_sForm:self.data.sForm,
      	web_mainData:self.data.mainData
      })	
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
 
showModel(e){
  const self = this;
  var id = api.getDataSet(e,'id');
    wx.showModal({
       title: '确认提货',
       content: '请确保此订单已提货',
       showCancel: true,//是否显示取消按钮
       cancelText:"取消",//默认是“取消”
       cancelColor:'red',//取消文字的颜色
       confirmText:"确定",//默认是“确定”
       confirmColor: 'red',//确定文字的颜色
       success: function (res) {
          if (res.cancel) {
             //点击取消,默认隐藏弹框
          } else {
             //点击确定
             self.orderUpdate(id)
          }
       },
       fail: function (res) { },//接口调用失败的回调函数
       complete: function (res) { },//接口调用结束的回调函数（调用成功、失败都会执行）
    })
  }
 
})

  