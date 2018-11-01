import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();


Page({
   data: {

    mainData:[],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const self = this;
    
    self.getMainData();
  },

  getMainData(){
    const self = this;
    self.data.mainData = api.jsonToArray(wx.getStorageSync('collectData'),'unshift');
    self.setData({
      web_mainData:self.data.mainData,
      web_length:self.data.mainData.length
    });
    console.log(self.data.mainData.length)
  },

  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  cancel(e){
    const self = this;
    console.log(api.getDataSet(e,'id'))
    api.deleteFootOne(api.getDataSet(e,'id'),'collectData');
    self.getMainData();
  },


})

  