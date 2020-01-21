import {Api} from '../../utils/api.js';
var api = new Api();
const app = getApp();
import {Token} from '../../utils/token.js';
const token = new Token();

Page({


 

  data: {
    
    mainData:[],
    searchItem:{
      thirdapp_id:getApp().globalData.thirdapp_id,
      user_type:0,
      transport_status:1,
      pay_status:1,
      type:1,
      passage2:['not in','']
    },
    searchItemOr:{},
    sForm:{
      passage2:''
    },
    submitData:{
      passage4:''
    },
    isLoadAll:false
  },
    

  onLoad(options){
    const self = this;
    self.data.paginate = api.cloneForm(getApp().globalData.paginate);
    self.setData({
      web_mainData:self.data.mainData
    });
    if(wx.getStorageSync('threeInfo').user_type==2){
      self.getMainData() 
    }
  },

  changeBind(e){
    const self = this;
    api.fillChange(e,self,'sForm');
    console.log(self.data.sForm);
    self.setData({
      web_sForm:self.data.sForm
    })
  },

  search(){
  	const self = this;
  	if(self.data.sForm.passage2){  
      self.data.searchItem.passage2 = self.data.sForm.passage2;
      self.getMainData(true)
      
    }else if(self.data.sForm.passage2==''){
      if(wx.getStorageSync('threeInfo').user_type==1){
        api.showToast('请输入取货码','none');
        return
      };
      if(wx.getStorageSync('threeInfo').user_type==2){
        delete self.data.searchItem.passage2;
        self.getMainData(true)
      }
      
    }
  },



  getMainData(isNew){
    const self = this;
    if(isNew){
      api.clearPageIndex(self)
    };
    const postData = {
      paginate:api.cloneForm(self.data.paginate),
      token:wx.getStorageSync('threeToken'),
      searchItem:api.cloneForm(self.data.searchItem),
    };
    postData.getAfter = {
      user:{
        tableName:'user',
        middleKey:'user_no',
        key:'user_no',
        searchItem:{
          status:1
        },
        condition:'='
      }
    };
    const callback = (res)=>{
      if(res.info.data.length>0){
        self.data.mainData.push.apply(self.data.mainData,res.info.data);
      }else{
        self.data.isLoadAll = true;
        api.showToast('没有查询到订单','none');
      }
      self.setData({
        web_mainData:self.data.mainData
      })
      console.log('getMainData',self.data.mainData)
    };
    api.orderGet(postData,callback);
  },





  orderUpdate(id){
    const self = this;
    const postData = {};
    postData.token = wx.getStorageSync('threeToken');
    postData.data ={
      transport_status:2,
      order_step:3
    }
    postData.searchItem = {
      id:id,
      user_type:0
    };

    const callback  = (res)=>{
      if(res.solely_code==100000){	
        api.showToast('已确认提货','none')
      }else{
      	api.showToast(res.msg,'none')
      }
      self.data.mainData = [];
      self.data.sForm.title='';
      self.setData({
      	web_sForm:self.data.sForm,
      	web_mainData:self.data.mainData
      })	
    };
    api.orderUpdate(postData,callback);
  },


  fillForm(e){
    const self = this;
    var index = api.getDataSet(e,'index');
    var content = api.getDataSet(e,'content');
    console.log('index',index);
    self.data.id = self.data.mainData[index].id;
    self.data.submitData.passage4 = content;
    self.data.mainData[index].passage4 = self.data.mainData[index].passage4 +'\r\n'+content;
    self.setData({
      web_submitData:self.data.submitData,
      web_mainData:self.data.mainData
    });  
  },



  textareaBind(e){
    const self = this;
    var index = api.getDataSet(e,'index');
    console.log('index',index);
  
    self.data.id = self.data.mainData[index].id;
    api.fillChange(e,self,'submitData');
    self.data.mainData[index].passage4 = self.data.submitData.passage4;
    console.log('self.data.submitData',self.data.submitData);
    console.log('self.data.id',self.data.id);
    self.setData({
      web_submitData:self.data.submitData,
    });  
  },


   orderUpdateTwo(e){
    const self = this;
		
    var index = api.getDataSet(e,'index');
    console.log(index)
    var id = api.getDataSet(e,'id');
		if(self.data.mainData[index].order_step==4){
			api.showToast('此订单为团购单，并且还未成团','none');
			return;
		};
    if(id!=self.data.id){
      console.log('id',id);
      console.log('self.data.id',self.data.id);
      api.showToast('错误提交','none');
      return;
    };
		
    const postData = {};
    postData.token = wx.getStorageSync('threeToken');
    postData.data ={
      passage4:self.data.mainData[index].passage4
    }
    postData.searchItem = {
      id:self.data.id,
      user_type:0
    };
    wx.showModal({
       title: '确认部分核销',
       content: '是否部分核销此订单',
       showCancel: true,//是否显示取消按钮
       cancelText:"取消",//默认是“取消”
       cancelColor:'#ff0000',//取消文字的颜色
       confirmText:"确定",//默认是“确定”
       confirmColor: '#ff0000',//确定文字的颜色
       success: function (res) {
          if (res.cancel) {
             //点击取消,默认隐藏弹框
          } else {
            const callback  = (res)=>{
		      if(res.solely_code==100000){  
		        api.showToast('已添加备注','none')
		      }else{
		        api.showToast(res.msg,'none')
		      }
		      self.data.mainData = [];
		      self.data.sForm.title='';
		      self.setData({
		        web_sForm:self.data.sForm,
		      });
		       
		      if(wx.getStorageSync('threeInfo').user_type==2){
		        self.getMainData(true) 
		      };

		    };
		    api.orderUpdate(postData,callback);
          }
       },
       fail: function (res) { },//接口调用失败的回调函数
       complete: function (res) { },//接口调用结束的回调函数（调用成功、失败都会执行）
    })

  },


  intoPath(e){
    const self = this;
    api.pathTo(api.getDataSet(e,'path'),'nav');
  },

  onReachBottom() {
    const self = this;
    if(!self.data.isLoadAll){
      self.data.paginate.currentPage++;
      self.getMainData();
    };
  },
 
showModel(e){
  const self = this;
  var id = api.getDataSet(e,'id');
	var index = api.getDataSet(e,'index');
	if(self.data.mainData[index].order_step==4){
		api.showToast('此订单为团购单，并且还未成团','none');
		return;
	};
    wx.showModal({
       title: '确认核销',
       content: '是否核销此订单',
       showCancel: true,//是否显示取消按钮
       cancelText:"取消",//默认是“取消”
       cancelColor:'#ff0000',//取消文字的颜色
       confirmText:"确定",//默认是“确定”
       confirmColor: '#ff0000',//确定文字的颜色
       success: function (res) {
          if (res.cancel) {
             //点击取消,默认隐藏弹框
          } else {
             //点击确定
             self.orderUpdate(id)
          }
       },
       fail: function (res) { },//接口调用失败的回调函数
       complete: function (res) { },//接口调用结束的回调函数（调用成功、失败都会执行）
    })
  }
 
})

  