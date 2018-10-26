//logs.js
const util = require('../../utils/util.js')
const app = getApp()


Page({
  data: {
    gender:0,
  },
  onLoad: function () {
   
  },
  gender(e){
   this.setData({
      gender:e.currentTarget.dataset.gender
    })
  },
})
