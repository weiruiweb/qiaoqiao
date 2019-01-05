import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();

Page({
  data: {

    submitData:{
      content:'',
      type:1,
    },


  },
  //事件处理函数


  onLoad(options){
    const self = this;
    self.data.id = options.id;
    self.data.orderItem_id = options.orderItem_id;
    console.log(self.data.id);
    self.getMainData()
  },


  getMainData(){
    const self = this;

    const postData = {};
    
    postData.token=wx.getStorageSync('token');
    postData.searchItem = {
      id:self.data.id
    };
    postData.searchItem.thirdapp_id = getApp().globalData.thirdapp_id;

    const callback = (res)=>{
      if(res.solely_code==100000){
        if(res.info.data.length>0){
          for (var i = 0; i < res.info.data[0].products.length; i++) {
            if(res.info.data[0].products[i].id==self.data.orderItem_id){
              self.data.mainData = res.info.data[0].products[i].snap_product;
              break;
            };
          };
        }else{
          api.showToast('数据错误','none');
        };

        self.setData({
          web_mainData:self.data.mainData,
        });  
      }else{
        api.showToast('网络故障','none')
      };
    };
    api.orderGet(postData,callback);
  },

  messageAdd(){
    const self = this;
    
    const postData = {};
    postData.token =wx.getStorageSync('token');
    postData.data = api.cloneForm(self.data.submitData);
    postData.data.relation_id = self.data.mainData.id;
    postData.data.relation_table = 'sku';
    console.log(postData)
    postData.saveAfter = [{
      tableName:'OrderItem',
      FuncName:'update',
      searchItem:{
        id:self.data.orderItem_id
      },
      data:{
        isremark:1,
        user_no:wx.getStorageSync('info').user_no,
        thirdapp_id:getApp().globalData.thirdapp_id
      }
    }]
    const callback = (data)=>{  
      if(data.solely_code == 100000){
        api.showToast('评价成功','none',1000);
        setTimeout(function(){
          api.pathTo('/pages/user/user','rela')
        }, 1000)
      }else{
        api.showToast('评价失败','none');
      };
    };
    api.messageAdd(postData,callback);  
  },

  submit(){
    const self = this;
    const pass = api.checkComplete(self.data.submitData);
    if(pass){
        self.messageAdd(); 
    }else{
      api.showToast('请补全信息','none');
    };
  },




  changeBind(e){
    const self = this;
    api.fillChange(e,self,'submitData');
  
    self.setData({
      web_submitData:self.data.submitData,
    }); 
    console.log(self.data.submitData)
  },

 
  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  intoPathRedi(e){
    const self = this;
    wx.navigateBack({
      delta:1
    })
  },
  intoPathRedirect(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'redi');
  }, 
 
})

  