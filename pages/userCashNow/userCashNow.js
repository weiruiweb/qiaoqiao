import {Api} from '../../utils/api.js';
var api = new Api();

import {Token} from '../../utils/token.js';
const token = new Token();

Page({
  data: {

    submitData:{
      score:'',
      
    }



  },



  onLoad(){
    const self = this;
    self.getUserInfoData();
  },





  changeBind(e){
    const self = this;
    api.fillChange(e,self,'submitData');

    console.log(self.data.submitData);
    self.setData({
      web_submitData:self.data.submitData,
    }); 
  },


  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },


  flowLogAdd(){
    const self = this;
    const postData = {
        token:wx.getStorageSync('token'),
        data:{
          user_no:wx.getStorageSync('info').user_no,
          count:-self.data.submitData.score,
          
          trade_info:'提现',
          status:0,
          type:2
        }
    };
    const callback = (res)=>{
      api.showToast('申请成功','none'); 
        setTimeout(function(){
          wx.navigateBack({
            delta: 1
          })
        },300);
       
    };
    api.flowLogAdd(postData,callback)
  },

  getUserInfoData(){
    const self = this;
    const postData = {};
    postData.token = wx.getStorageSync('token');
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.userData = res.info.data[0].balance
      }
      wx.hideLoading();
    };
    api.userInfoGet(postData,callback);   
  },
  

  submit(){
    const self = this;
    var num = self.data.submitData.score;
    const pass = api.checkComplete(self.data.submitData);
    if(pass){  
      console.log(self.data.userData)
      if(self.data.userData&&parseInt(self.data.userData)>=num){
        if(!(/(^[1-9]\d*$)/.test(num))){
         api.showToast('请输入正整数','none')
        }else{
          self.flowLogAdd();
        }   
      }else{
        api.showToast('佣金不足','none');  
      }   
    }else{
      api.showToast('请补全信息','none');
    };
  },





})
