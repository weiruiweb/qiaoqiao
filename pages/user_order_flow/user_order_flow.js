import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();

Page({
  data: {
    currentId:0,
  },
  //事件处理函数
  tab(e){
   this.setData({
      currentId:e.currentTarget.dataset.id
    })
  },

  onLoad(options){
  	const self = this;
  	console.log(options)
  	self.data.id = options.id;
  	self.getMainData()
  },

  getMainData(){
    const self = this;
    const postData = {};
    postData.token = wx.getStorageSync('token');
  	postData.searchItem = {
  		id:self.data.id
  	};
    const callback = (res)=>{
      if(res.solely_code==100000){
        if(res.info.data.length>0){
          self.data.mainData= res.info.data[0];
        }else{
          
          api.showToast('数据错误','none');
        };
        wx.hideLoading();
        self.setData({
          web_mainData:self.data.mainData,
        });  
      }else{
        api.showToast('网络故障','none')
      }
    };
    api.orderGet(postData,callback);
  },

  copyTBL:function(e){
    var self=this;
    wx.setClipboardData({
      data: self.data.mainData.express_info,
      success: function(res) {
        
      }
    });
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

  