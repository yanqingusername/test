// pages/myOrder/myOrder.js
const app = getApp()
var request = require('../../utils/request.js')
var box = require('../../utils/box.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderList: [],
    setInter: '', 
    support_id:"",
    TabCur: 0,
    status: 1,
    statusList: [ '已接单','已完成', '用户评价'],
    orderListTemp:[],
		page:1, //当前页数
		pageSize:6, //每页六条
    hasMoreData:true,
    alreadyChecked:false,
    tip:"暂无数据",
		tip_temp:'暂无数据',
    role: '',
    isCustom: true
  },

  onShow:function(){
    if(this.data.role != 2){
      var that = this;
      console.log('成功onshow+++++++++++')
      wx.getStorage({//获取本地缓存
        key:"jumpStatus",
        success:function(res){
          console.log(res.data);
          if(res.data == 1){
            that.jumpTabSelect(1);
          } else if (res.data == 2){
            that.jumpTabSelect(2);
          }
        }})	
    }
},
onLoad:function(){
  let role = app.globalData.userInfo.role;
  if(role != 2){
    var that = this;
    var support_id = app.globalData.userInfo.id;
    
    that.setData({
      support_id:support_id,
      page:1,
      orderList:[],
      hasMoreData:true,
      role: role
    })
    that.getOrderList();
  }else{
    this.setData({
      isCustom: false,
      role: role
    });
  }
  
},
onReachBottom: function(){
  if(this.data.role != 2){
    console.log('成功下拉+++++++++++')
    var that = this;
  
    that.getOrderList();
  }
},

//跳转专用tabSelect
jumpTabSelect(e) {
  var that = this;
  if(e == 1){ //跳转至已接单
    this.setData({
      TabCur: 0,
      status: 1,
      page:1,
      orderList:[],
      tip:''
    })
    //清除跳转标识缓存
    wx.removeStorage({
      key: 'jumpStatus',
      success (res) {
        console.log(res)
      }
    })
    that.getOrderList();
  }else if (e == 2){ //跳转至已完成
    this.setData({
      TabCur: 1,
      status: 2,
      page:1,
      orderList:[],
      tip:''
    })
    //清除跳转标识缓存
    wx.removeStorage({
      key: 'jumpStatus',
      success (res) {
        console.log(res)
      }
    })
    that.getOrderList();
  }
},

  tabSelect(e) {
    var status = e.currentTarget.dataset.id;
    console.log("tabSelect "+status)
    var that = this;
    if (status == 0) {
      status = 1
    } else if (status == 1) {
      status = 2;
    } else {
      status = 3;
    }
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60,
      status: status,
      page:1,
      orderList:[],
      tip:'',
      alreadyChecked:false
    })
    that.getOrderList();
  },
  toInfo:function(e){
		var id = e.currentTarget.dataset.id;
			wx.navigateTo({
				url: '/pages/orderDetail/orderDetail?id=' + id,
			})
		
	},

  getOrderList: function () {
    var that = this;
    console.log('当前页数='+that.data.page)
		console.log('orderList='+that.data.orderList)
		console.log('hasMoreData='+that.data.hasMoreData)
    console.log('status='+that.data.status)
    var status = that.data.status;
    var support_id = that.data.support_id;
    var data = {
      support_id: support_id,
      status: status, //订单类型
      pageNum: that.data.page, //页数
			pageCount: that.data.pageSize //每页数据
    }
    request.request_get('/support/getMyOrder.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
					var orderListTemp = that.data.orderList;
          var orderList = res.msg;
          if(orderList.length == 0 && that.data.page == 1 ){
            that.setData({
              tip:"暂无数据",
              alreadyChecked:true,
							alreadyChecked_temp:true
						})
          }else if(orderList.length < that.data.pageSize){
						that.setData({
							hasMoreData:false,
              page: that.data.page + 1,
              tip:"没有更多数据了",
              alreadyChecked:true,
							alreadyChecked_temp:false
						})
					}else{
						that.setData({
							hasMoreData:true,
              page: that.data.page + 1,
              tip:"加载中",
              alreadyChecked:true,
							alreadyChecked_temp:false
						})
					}
					orderList = orderListTemp.concat(orderList);
          // orderList.sort(function(a, b) {
					// 	return b.time < a.time ? 1 : -1 //正序
          // })
          that.setData({
            orderList: orderList
          });
          console.log(that.data.orderList)
          console.log(orderList)
          console.log(orderList.length)
          console.log(that.data.existData)
        } else {
          box.showToast(res.msg);
        }
      }
    })
  },
})