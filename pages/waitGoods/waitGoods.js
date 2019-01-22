import {Api} from '../../utils/api.js';
const api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();



Page({
  data: {
   num:0,
   mainData:[],
   buttonClicked:false,
   searchItem:{
      passage2:['not in','']
   }
  },


  onLoad(options){
    const self = this;
    if(!wx.getStorageSync('token')){
      var token = new Token();
      token.getUserInfo();
    };
    if(options.num){
      self.changeSearch(options.num)
    };
    wx.showShareMenu({
      withShareTicket: true
    });
    this.setData({
      fonts:app.globalData.font
    });
    self.data.paginate = api.cloneForm(getApp().globalData.paginate);
    self.getMainData();
    self.checkRead();
    self.setData({
      web_num: self.data.num
    });
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


  getMainData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self);  
    };
    const postData = {};
    postData.paginate = api.cloneForm(self.data.paginate);
    postData.token = wx.getStorageSync('token');
    postData.searchItem = api.cloneForm(self.data.searchItem);
    postData.searchItem.thirdapp_id = 2;
    postData.searchItem.type = 1;
    postData.searchItem.status = ['in',[0,1]];
    postData.searchItem.pay_status = 1;
    postData.searchItem.transport_status = 1;
    postData.searchItem.user_no = wx.getStorageSync('info').user_no;
    postData.order = {
      create_time:'desc'
    };
    postData.getAfter = {
      store:{
        tableName:'label',
        middleKey:['snap_address','storeId'],
        key:'id',
        searchItem:{
          status:1
        },
        condition:'='
      }
    };
    const callback = (res)=>{
      if(res.solely_code==100000){
        if(res.info.data.length>0){
          self.data.mainData.push.apply(self.data.mainData,res.info.data);
        }else{
          self.data.isLoadAll = true;
          api.showToast('没有更多了','none');
        };
        wx.hideLoading();
        self.setData({
          buttonClicked:false,
          web_mainData:self.data.mainData,
        });  
      }else{
        api.showToast('网络故障','none')
      }
      console.log('getMainData',self.data.mainData)
    };
    api.orderGet(postData,callback);
  },

  phoneCallOne(e) {
    const self = this;
    var index = api.getDataSet(e,'index');
    console.log(e)
    wx.makePhoneCall({
      phoneNumber: self.data.mainData[index].store[0].url,
    })
  },

  phoneCallTwo(e) {
    const self = this;
    var index = api.getDataSet(e,'index');
    wx.makePhoneCall({
      phoneNumber: self.data.mainData[index].snap_address.phone,
    })
  },

  orderUpdate(e){
    const self = this;
    const postData = {};
    postData.token = wx.getStorageSync('token');
    postData.data ={
      transport_status:2,
      order_step:3
    }
    postData.searchItem = {};
    postData.searchItem.id = api.getDataSet(e,'id');
    const callback  = res=>{
      api.showToast('已确认收货','none');
      self.data.mainData = [];
      self.getMainData(true);
    };
    api.orderUpdate(postData,callback);
  },






  menuClick: function (e) {
    const self = this;
    self.setData({
      buttonClicked:true
    });
    const num = e.currentTarget.dataset.num;
    self.changeSearch(num);
  },

  changeSearch(num){
    const self = this;
    self.setData({
      web_num: num
    });
    self.data.searchItem = {}
    if(num=='0'){
      self.data.searchItem.passage2=['not in','']
    }else if(num=='1'){
      self.data.searchItem.passage2=['in','']
    }
    self.setData({
      web_mainData:[],
    });
    self.getMainData(true);
  },

  
  onReachBottom() {
    const self = this;
    if(!self.data.isLoadAll){
      self.data.paginate.currentPage++;
      self.getMainData();
    };
  },

  onShareAppMessage(res,e){
    const self = this;
    var id = api.getDataSet(e,'id');
    var group_no = api.getDataSet(e,'group_no');
     console.log(res)
      if(res.from == 'button'){
        self.data.shareBtn = true;
      }else{   
        self.data.shareBtn = false;
      }
      return {
        title: '巧巧爱家',
        path: 'pages/detail/detail?group_no='+group_no+'&&product_id='+id,
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

   intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  intoPathRedirect(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'redi');
  }, 

})

  