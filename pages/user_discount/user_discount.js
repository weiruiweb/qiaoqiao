//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
  currentId:0,
  },
  
  onLoad: function () {
   
  },
  tab:function(e){
    var current=e.currentTarget.dataset.id;
    this.setData({
      currentId:current
    })
  }
})
