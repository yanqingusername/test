// pages/mine/mine.js
const app = getApp()
var request = require('../../utils/request.js')
var box = require('../../utils/box.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    today_done:0,
    uncatched:0,
    ongoing:0,
    userInfo: {},
    name: "",
    area: "",
    role:"",
    //判断小程序的API，回调，参数，组件等是否在当前版本可用。
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    isHide: false,
    service_status:1
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  //获取数据
  getOrderData:function(){
    var that = this;
    var data = {
      support_id: app.globalData.userInfo.id,
      service_status:that.data.service_status
		}
		request.request_get('/indexapi/getIndexSumInfo.hn', data, function (res) {
			console.info('回调', res)
			if (res) {
				if (res.success) {
					that.setData({
            today_done:res.today_finish,
            ongoing:res.alldoing
					});
				} else {
					box.showToast(res.msg);
				}
			}else{
        box.showToast("网络不稳定，请重试");
      }
    })
    var data = {
      area:app.globalData.userInfo.area_id,
      pageNum: 1, //页数
			pageCount: 6 //每页数据
		}
		request.request_get('/OrderController/getOrderList.hn', data, function (res) {
      console.info('回调', res)
      console.info(res.count)
			if (res) {
				if (res.success) {
          that.setData({
					  uncatched:res.count
					});
				} else {
					box.showToast(res.msg);
				}
			}else{
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this;
    
    // 查看是否授权
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: function (res) {
              that.setData({
                userInfo: res.userInfo,
              })
              // 用户已经授权过,不需要显示授权页面,所以不需要改变 isHide 的值
              // 根据自己的需求有其他操作再补充
              // 我这里实现的是在用户授权成功后，调用微信的 wx.login 接口，从而获取code
            }
          });
        } else {
          // 用户没有授权
          // 改变 isHide 的值，显示授权页面
          that.setData({
            isHide: true
          });
        }
      }
    });
    console.log(app.globalData.userInfo)
    that.setData({
      name: app.globalData.userInfo.name,
      area: app.globalData.userInfo.area_ids,
      role:app.globalData.userInfo.role
    })
    if(app.globalData.userInfo.role == 1){
      that.setData({
        area:'全国'
      })
    }
  },

  bindGetUserInfo: function (e) {
    if (e.detail.userInfo) {
      //用户按了允许授权按钮
      var that = this;
      // 获取到用户的信息了，打印到控制台上看下
      console.log("用户的信息如下：");
      console.log(e.detail.userInfo);
      //授权成功后,通过改变 isHide 的值，让实现页面显示出来，把授权页面隐藏起来
      that.setData({
        isHide: false,
        userInfo: e.detail.userInfo
      });
    } else {
      //用户按了拒绝按钮
      wx.showModal({
        title: '警告',
        content: '您点击了拒绝授权，将无法进入小程序，请授权之后再进入!!!',
        showCancel: false,
        confirmText: '返回授权',
        success: function (res) {
          // 用户没有授权成功，不需要改变 isHide 的值
          if (res.confirm) {
            console.log('用户点击了“返回授权”');
          }
        }
      });
    }
  },
  onShow: function(){
    var that = this;
    that.getOrderData();
  },
  // 退出登录
  toExit: function () {
    var data = {
      openid: app.globalData.openid,
    }
    request.request_get('/support/appLogOut.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          wx.reLaunch({
            url: '/pages/index/login',
          })
        } else {
          box.showToast("请检查网络后重试");
        }
      }else{
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  addAccount: function(){
    wx.navigateTo({
      url: '/pages/myInfo/add',
  }) 
  },
  bindStatistics:function(){
    wx.navigateTo({
      url: '/pages/statistics/statistics',
    })
  },
  /**
   * GPS 管理
   */
   bindManageGPS(){
    wx.navigateTo({
      url: `/pages/gpsChooseCustomer/index`
    });
  }

})