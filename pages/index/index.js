import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();


Page({
  data: {
    groupData:[],
    mainData:[],
    labelData:[],
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    circular: true,
    interval: 2000,
    duration: 500,
    previousMargin: 0,
    nextMargin: 0,
    swiperIndex:0,
    img1:0,
    text: '',
    marqueePace: 1,
    marqueeDistance: 0,
    marqueeDistance2: 0,
    marquee2copy_status: false,
    marquee2_margin: 60,
    size: 14,
    orientation: 'left',
    interval1: 20,
    isLoadAll:false,
  },
  run2: function () {
    var self = this;
    var interval1 = setInterval(function () {
      if (-self.data.marqueeDistance2 < self.data.length) {
        self.setData({
          marqueeDistance2: self.data.marqueeDistance2 - self.data.marqueePace,
          marquee2copy_status: self.data.length + self.data.marqueeDistance2 <= self.data.windowWidth + self.data.marquee2_margin,
        });
      } else {
        if (-self.data.marqueeDistance2 >= self.data.marquee2_margin) {
          self.setData({
            marqueeDistance2: self.data.marquee2_margin
          });
          clearInterval(interval1);
          self.run2();
        } else {
          clearInterval(interval1);
          self.setData({
            marqueeDistance2: -self.data.windowWidth
          });
          self.run2();
        }
      }
    }, self.data.interval1);
  },
  //事件处理函数
  swiperChange(e) {
    const that = this;
    that.setData({
      swiperIndex: e.detail.current,
    })
  },

  onShow(){
  	const self = this;
  	self.getSliderData();
    self.checkRead();
  },

  onLoad(options) {
    const self = this;
    self.data.paginate = api.cloneForm(getApp().globalData.paginate);
    console.log(self.data.img1);
    var length = self.data.text.length * self.data.size;
    var windowWidth = wx.getSystemInfoSync().windowWidth;
    self.setData({
      img1:self.data.img1,
      length: length,
      windowWidth: windowWidth,
      marquee2_margin: length < windowWidth ? windowWidth - length : self.data.marquee2_margin
    });
    self.run2();
    self.getMainData();
   	self.getMessageData();
    self.getLabelData();
    
    self.getNoticeData();
    if(options.scene){
      var scene = decodeURIComponent(options.scene)
    };
    
    if(options.parentNo){
      var scene = options.parentNo
    };
   
    if(scene){
      var token = new Token({parent_no:scene});
      token.getUserInfo();
    }else if(!wx.getStorageSync('token')){
      var token = new Token();
      token.getUserInfo();
    };
    
    self.data.scene = scene;
  },


  getMessageData(){
    const self = this;
   
    const postData = {};
 
    postData.token=wx.getStorageSync('token');
    postData.searchItem = {
      user_type:2,
      type:5,
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.messageData = res.info.data[0]
      }
      console.log(self.data.messageData);
      self.setData({
        web_messageData:self.data.messageData,
      });   
    };
    api.messageGet(postData,callback);
  },

  getSliderData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      title:'首页轮播图',
      thirdapp_id:'2'
    };
    const callback = (res)=>{ 
      if(res.info.data.length>0){
        self.data.sliderData = res.info.data[0];
      }
      self.setData({
        web_sliderData:self.data.sliderData,
      });
      
    };
    api.labelGet(postData,callback);
  },

  getLabelData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
      type:3
    };
    postData.order = {
      create_time:'normal'
    };
    postData.getBefore = {
      label:{
        tableName:'label',
        searchItem:{
          title:['=',['商品类别']],
        },
        middleKey:'parentid',
        key:'id',
        condition:'in'
      },
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.labelData.push.apply(self.data.labelData,res.info.data);
      }else{
        api.showToast('没有更多了','none');
      }
      console.log(self.data.labelData)
      wx.hideLoading();
      self.setData({
        web_labelData:self.data.labelData,
      });
    };
    api.labelGet(postData,callback);   
  },

  getMainData(isNew,currentId){
    const self = this;
    var nowTime = Date.parse(new Date());
    if(isNew){
      api.clearPageIndex(self); 
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
      type:1,
      category_id:['NOT IN',[38]]
    };
    postData.getAfter={
      sku:{
        tableName:'sku',
        middleKey:'product_no',
        searchItem:{
          deadline:['>',nowTime],
          status:1
        },
        key:'product_no',
        condition:'=',
      } 
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        for (var i = 0; i < res.info.data.length; i++) {

            self.data.mainData.push.apply(self.data.mainData,res.info.data[i].sku);
        };
      
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有更多了','none');
      };
      wx.hideLoading();
      self.getGroupData();
      self.setData({

        web_mainData:self.data.mainData,
      });  
      
    };
    api.productGet(postData,callback);
  },





  getNoticeData(){
    const self = this;
    const postData = {};
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id
    };
    postData.getBefore = {
      aboutData:{
        tableName:'label',
        searchItem:{
          title:['=',['通知']],
        },
        middleKey:'menu_id',
        key:'id',
        condition:'in',
      },
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.noticeData = res.info.data[0];
      };
      self.setData({
        web_noticeData:self.data.noticeData,
      });
    };
    api.articleGet(postData,callback);
  },

  getGroupData(){
    const self = this;
    var nowTime = Date.parse(new Date());
    const postData = {};
    postData.searchItem = {
      thirdapp_id:getApp().globalData.thirdapp_id,
      type:1
    };
    postData.getBefore = {
      label:{
        tableName:'label',
        searchItem:{
          title:['=',['今日团购']],
        },
        middleKey:'category_id',
        key:'id',
        condition:'in'
      },
    };
    postData.getAfter={
      sku:{
        tableName:'sku',
        middleKey:'product_no',
        searchItem:{
          deadline:['>',nowTime],
          status:1
        },
        key:'product_no',
        condition:'=',
      } 
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        for (var i = 0; i < res.info.data.length; i++) {
          self.data.groupData.push.apply(self.data.groupData,res.info.data[i].sku);
        };
        self.countDown();
      }
      wx.hideLoading();
      if(res.info.data.length>1){
        self.countDownTwo();
      };
      if(res.info.data.length>2){
        self.countDownThree();
      };
      
      self.setData({   
        web_groupData:self.data.groupData,
      });  
      
    };
    api.productGet(postData,callback);
  },



    countDown(){
      const self = this;
      
      self.data.timer=null;
    
      var times = (parseInt(self.data.groupData[0].deadline)-parseInt(Date.parse(new Date())))/1000;
      self.data.timer=setInterval(function(){
        var day=0,
          hour=0,
          minute=0,
          second=0;//时间默认值       
        if(times > 0){
          day = Math.floor(times / (60 * 60 * 24));
          hour = Math.floor(times / (60 * 60)) - (day * 24);
          minute = Math.floor(times / 60) - (day * 24 * 60) - (hour * 60);
          second = Math.floor(times) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
        }
        if (day <= 9) day = '0' + day;
        if (hour <= 9) hour = '0' + hour;
        if (minute <= 9) minute = '0' + minute;
        if (second <= 9) second = '0' + second;
        times--;
 
          self.setData({
            web_day:day,
            web_hour:hour,
            web_minute:minute,
            web_second:second
          })
      },1000);
      if(times<=0){
        clearInterval(self.data.timer);
      }

    },

    countDownTwo(){
      const self = this;
      
      self.data.timer=null;
    
      var times = (parseInt(self.data.groupData[1].deadline)-parseInt(Date.parse(new Date())))/1000;
      self.data.timer1=setInterval(function(){
        var day=0,
          hour=0,
          minute=0,
          second=0;//时间默认值       
        if(times > 0){
          day = Math.floor(times / (60 * 60 * 24));
          hour = Math.floor(times / (60 * 60)) - (day * 24);
          minute = Math.floor(times / 60) - (day * 24 * 60) - (hour * 60);
          second = Math.floor(times) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
        }
        if (day <= 9) day = '0' + day;
        if (hour <= 9) hour = '0' + hour;
        if (minute <= 9) minute = '0' + minute;
        if (second <= 9) second = '0' + second;
        times--;
 
          self.setData({
            web_day1:day,
            web_hour1:hour,
            web_minute1:minute,
            web_second1:second
          })
      },1000);
      if(times<=0){
        clearInterval(self.data.timer);
      }

    },

    countDownThree(){
      const self = this;
      
      self.data.timer=null;
    
      var times = (parseInt(self.data.groupData[2].deadline)-parseInt(Date.parse(new Date())))/1000;
      self.data.timer2=setInterval(function(){
        var day=0,
          hour=0,
          minute=0,
          second=0;//时间默认值       
        if(times > 0){
          day = Math.floor(times / (60 * 60 * 24));
          hour = Math.floor(times / (60 * 60)) - (day * 24);
          minute = Math.floor(times / 60) - (day * 24 * 60) - (hour * 60);
          second = Math.floor(times) - (day * 24 * 60 * 60) - (hour * 60 * 60) - (minute * 60);
        }
        if (day <= 9) day = '0' + day;
        if (hour <= 9) hour = '0' + hour;
        if (minute <= 9) minute = '0' + minute;
        if (second <= 9) second = '0' + second;
        times--;
 
          self.setData({
            web_day2:day,
            web_hour2:hour,
            web_minute2:minute,
            web_second2:second
          })
      },1000);
      if(times<=0){
        clearInterval(self.data.timer);
      }

    },

    checkRead(){
      const self = this;
      const postData = {
        token:wx.getStorageSync('token')
      };
      const callback = (res)=>{
        console.log(res)
        if(res.solely_code==100000){
          self.data.readData = res.info
        };
        self.setData({
          web_readData:self.data.readData
        });
      };
      api.readCheck(postData,callback)
    },

    onReachBottom() {
      const self = this;
      if(!self.data.isLoadAll){
        self.data.paginate.currentPage++;
        self.getMainData();
      };
    },

    onHide (){
    	const self = this;
    	clearInterval(self.data.timer);
    },


  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },
  intoPathRedirect(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'redi');
  }, 
})

  