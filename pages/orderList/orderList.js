const app = getApp()
var request = require('../../utils/request.js')
var box = require('../../utils/box.js')

Page({
	data: {
		loadText: '加载更多',
		orderListTemp:[],
		orderList: [],
		page:1, //当前页数
		pageSize:6, //每页六条
		hasMoreData:true,
		tip_temp:'暂无数据',
		TabCur: 0,
		status: 1,
		statusList: [ '进行中','待接单', '全部'],
	},

	onLoad: function (options) {
		var that = this;
		that.getOrderList()
	},
	onShow: function () {
		var that = this;
		wx.getStorage({
			key:"jumpStatus",
			success(res){
				if(res.data == 0){
					that.jumpTabSelect(0);
				}
			}
		})
	},
	jumpTabSelect:function(e){
		var that = this;
		if(e == 0){
			that.setData({
				tip:'',
				orderList:[],
				page:1
			})
			wx.removeStorage({
				key: 'jumpStatus',
				success(res){
					console.log(res)
				}
			})
			that.getOrderList();
		}
	},
	onReachBottom: function(){
		console.log('成功下拉+++++++++++')
		var that = this;
		that.getOrderList();
	},
//点击 加载更多 按钮
// setLoading(e) {
// 	let that = this;
// 	// 暂存数据

// 	// 每次加载数据条数(10)
// 	let num = that.data.count++ * 10;
	
// 	var data = {
// 			num: num,
// 			area: that.data.area_id
// 	}
// 	request.request_get('/OrderController/getOrderList.hn', data, function (res) {
// 			console.info('回调', res)
// 			if (res) {
// 					if (res.success) {
// 							let eachData = res.msg.root;
// 							if (eachData.length == 0) {
// 									wx.showToast({
// 											title: '没有更多数据了!~',
// 											icon: 'none'
// 									})
// 							} else {
// 									wx.showToast({
// 											title: '数据加载中...',
// 											icon: 'none'
// 									})
// 							}
// 							var number = res.msg.number.toString();
// 							wx.setTabBarBadge({ //tabBar右上角添加文本
// 									index: 1,//tabBar下标（底部tabBar的位置，从0开始）
// 								text: number, //显示的内容,必须为字符串可通过JSON.toString()将number转为字符串
// 						})
// 							var testListAfter = testlistBefore.concat(eachData)
// 							that.setData({
// 									loading: true,
// 									testList: testListAfter,
// 									loadText: "加载更多",
// 									loading: false,
// 							})
// 					} else {
// 							box.showToast(res.msg);
// 					}
// 			}
// 	})
// },
	// onReachBottom: function(){
	// 	console.log('成功下拉+++++++++++')
	// 	var that = this;
	//   if(that.data.hasMoreData == true){
	// 		console.log('onReachBottom+++++++++++')
	// 	}
	// 	that.getOrderList();
	// },

//*** 
	// 获取当前技术支持所属区域内未接单的工单
	getOrderList: function () {
		var that = this;
		console.log(that.data.page)
		var data = {
			area: app.globalData.userInfo.area_id,
			pageNum: that.data.page, //页数
			pageCount: that.data.pageSize //每页数据
		}
		request.request_get('/OrderController/getOrderList.hn', data, function (res) {
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
          }else if(orderList.length < that.data.pageSize){ //无更多数据
						that.setData({
							hasMoreData:false,
              page: that.data.page + 1,
              tip:"没有更多数据了",
							alreadyChecked:true,
							alreadyChecked_temp:false
						})
					}else{      // 有更多数据
						that.setData({
							hasMoreData:true,
              page: that.data.page + 1,
              tip:"加载中",
							alreadyChecked:true,
							alreadyChecked_temp:false
						})
					}
					orderList = orderListTemp.concat(orderList);
         
          that.setData({
            orderList: orderList
          });
				} else {
					box.showToast(res.msg);
				}
			}else{
        box.showToast("网络不稳定，请重试");
      }
		})
	},

	toInfo: function (e) {
		var id = e.currentTarget.dataset.id;
		var type = e.currentTarget.dataset.type;
			wx.navigateTo({
				url: '/pages/orderDetail/orderDetail?id=' + id,
			})
	},
	onTabItemTap: function (item) {
		console.log(item)
		var that = this;
		that.setData({
			tip:'',
			orderList:[],
			page:1
		})
		that.getOrderList();
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
		  status: status,
		  page:1,
		  orderList:[],
		  tip:'',
		  alreadyChecked:false
		})
		that.getOrderList();
	  },
})