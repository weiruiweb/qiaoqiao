//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
  tapCurrent:0,
  region: ['广东省', '广州市', '海珠区'],
  img:'background:url(/images/vr.png)'
  },
  
  onLoad: function () {
   
  },
   bindDateChange: function(e) {
    this.setData({
      date: e.detail.value
    })
  },
  discount:function(e){
    var current=e.currentTarget.dataset.current;
    this.setData({
      tapCurrent:current
    })
  },
  bindDateChange: function(e) {
    this.setData({
      region: e.detail.value
    })
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
