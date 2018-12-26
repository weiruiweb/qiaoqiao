//logs.js
import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp()


Page({
  data: {
    QrData:[]
  },
  onLoad(){
    const self = this;
    self.getQrData();
    this.setData({
      fonts:app.globalData.font
    })
  },

  
  getQrData(){
    const self = this;
    const postData = {};
    postData.token = wx.getStorageSync('token');
    postData.qrInfo = {
      scene:wx.getStorageSync('info').user_no,
      path:'pages/index/index',
    };
    postData.output = 'url';
    postData.ext = 'png';
    const callback = (res)=>{
      console.log(res);
      self.data.QrData = res;
      self.setData({
        web_QrData:self.data.QrData,
      });
      wx.hideLoading();
    };
    api.getQrCode(postData,callback);
 },

  onShareAppMessage(res){
    const self = this;
     console.log(res)
      if(res.from == 'button'){
        self.data.shareBtn = true;
      }else{   
        self.data.shareBtn = false;
      }
      return {
        title: '巧巧爱家',
         path: 'pages/index/index?parent_no='+wx.getStorageSync('info').user_no,
        success: function (res){
          console.log(res);
          console.log(parentNo)
          if(res.errMsg == 'shareAppMessage:ok'){
            console.log('分享成功')
            if (self.data.shareBtn){
              if(res.hasOwnProperty('shareTickets')){
              console.log(res.shareTickets[0]);
                self.data.isshare = 1;
              }else{
                self.data.isshare = 0;
              }
            }
          }else{
            wx.showToast({
              title: '分享失败',
            })
            self.data.isshare = 0;
          }
        },
        fail: function(res) {
          console.log(res)
        }
      }
  },

})
