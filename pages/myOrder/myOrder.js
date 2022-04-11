// pages/myOrder/myOrder.js
const app = getApp()
var request = require('../../utils/request.js')
var box = require('../../utils/box.js')

Page({
	data: {
		loadText: '加载更多',
		orderList: [],
		page: 1, //当前页数
		pageSize: 6, //每页六条
		hasMoreData: true,
		tip_temp: '暂无数据',
		TabCur: 0,
		statusList: [ '进行中','已完成', '全部'],
		role: '0', // 0 普通  1 管理员
		order_status: '1', //all全部 ,1进行中, 2已完成
		userInfoID: 0,
		dialogData: {
			title: "确认修改工单？",
			titles: "自己创建的工单只有 1 次修改机会",
			cancel: "取消",
			sure: "确认"
		},
		showDialog: false,

		dialogCloseData: {
			title: "请填写关闭工单原因",
			titles: "关闭工单后数据无法恢复",
			cancel: "取消",
			sure: "确认"
		},
		showCloseDialog: false,
    statusNumber: 0,
    close_order_num: '',

    deleteDialogData: {
			title: "确认删除？",
			titles: "删除后数据将无法恢复",
			cancel: "取消",
			sure: "确认"
		},
		deleteShowDialog: false,
    delete_order_num: '',
	update_order_num: '',
	update_order_id: '',
    isCustom: true,
	isFlag: true,

	dialogCancelData: {
		title: "请填写取消工单原因",
		titles: "取消后在列表中不再展示此工单",
		cancel: "取消",
		sure: "确认"
	},
	showCancelDialog: false,
	cancel_order_num: '',
	isRequest: true
	},

	onLoad: function (options) {
		let role = app.globalData.userInfo.role;
  		if(role != 2){
			var that = this;
			var support_id = app.globalData.userInfo.id;
		
			that.setData({
			  support_id:support_id,
			  page:1,
			  orderList:[],
			  hasMoreData:true,
			  role: role,
			  userInfoID: app.globalData.userInfo.id,
			})
			that.getOrderList(2);
		  }else{
			this.setData({
			  isCustom: false,
			  role: role
			});
		  }
	},
	onShow: function () {
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
			
			if(!this.data.isFlag){
				that.jumpTabSelect(1);
			}
		}
	},
	//跳转专用tabSelect
jumpTabSelect(e) {
  //order_status: '1', //all全部 ,1进行中, 3已完成

  var that = this;
  if(e == 1){ //跳转至已接单
    this.setData({
      TabCur: 0,
      order_status: 1,
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
    that.getOrderList(2);
  }else if (e == 2){ //跳转至已完成
    this.setData({
      TabCur: 1,
      order_status: 2,
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
    that.getOrderList(2);
  }
},
	onReachBottom: function () {
		if(this.data.role != 2){
			console.log('成功下拉+++++++++++')
			var that = this;
			that.getOrderList(2);
		}
	},
	// 获取当前技术支持所属区域内未接单的工单
	getOrderList(number) {
		var that = this;
		console.log(that.data.page)
		var data = {
			phone: app.globalData.userInfo.phone,
			page: that.data.page, //页数
			limit: that.data.pageSize, //每页数据
			order_status: that.data.order_status
		}
		request.request_new_test('/instrument/supprot/getAllPersonOwnOrderInfo.hn', data, function (res) {
			console.info('回调', res)
			if (res) {
				if (res.success) {
					let orderListTemp = that.data.orderList;

					orderListTemp = that.data.page == 1 ? res.result_order : orderListTemp.concat(res.result_order)
					if (that.data.page == 1 && res.result_order.length == 0){
						that.setData({
							alreadyChecked: true
						});
					}else{
						that.setData({
							alreadyChecked: false
						});
					}

					if (res.result_order.length != 0){
						that.setData({
							page: that.data.page + 1
						});
					}

					if(that.data.page > 1 && res.result_order.length == 0){
						// that.setData({
						// 	alreadyChecked_temp: true,
						// 	tip: "没有更多数据了"
						// });
					}
					
					that.setData({
						orderList: orderListTemp,
						statusNumber: res.total_order
					});

					if(number == 1){
						that.setData({
							isRequest: true
						});
					}

				} else {
					if (that.data.page == 1 && res.result_order.length == 0){
						that.setData({
							alreadyChecked: true,
							statusNumber: res.total_order
						});
					}else{
						box.showToast(res.msg);
					}

					if(number == 1){
						that.setData({
							isRequest: true
						});
					}
				}
			} else {
				if(number == 1){
					that.setData({
						isRequest: true
					});
				}
				box.showToast("网络不稳定，请重试");
			}
		})
	},

	toInfo: function (e) {
		var id = e.currentTarget.dataset.id;
		var type = e.currentTarget.dataset.type;
		wx.navigateTo({
			url: `/pages/orderDetail/orderDetail?id=${id}&isMyOrder=1`,
		})
	},
	tabSelect(e) {
		//order_status: '1', //all全部 ,1进行中, 3已完成

		if(this.data.isRequest){
			var status = e.currentTarget.dataset.id;
			console.log("tabSelect " + status)
			var that = this;
			if (status == 0) {
				status = '1';
			} else if (status == 1) {
				status = '2';
			} else {
				status = 'all';
			}
			this.setData({
				TabCur: e.currentTarget.dataset.id,
				order_status: status,
				page: 1,
				orderList: [],
				tip: '',
				alreadyChecked: false,
				isRequest: false
			},()=>{
				that.getOrderList(1);
    		})
		}
	},
	/**
  * 删除工单
  */
  deleteInfo(e) {
   let id = e.currentTarget.dataset.id; //订单id
     this.setData({
      deleteShowDialog: true,
      delete_order_num: id
     });
 },
 deleteDialogCancel() {
   this.setData({
    deleteShowDialog: false
   });
 },
 deleteDialogSure() {
   this.setData({
    deleteShowDialog: false
   });

   var that = this;
		var data = {
			order_num: that.data.delete_order_num,
		}
		request.request_new_test('/instrument/supprot/deleteOrderInfo.hn', data, function (res) {
			if (res) {
				if (res.success) {
					that.setData({
						page: 1,
						orderList: [],
						tip: '',
						alreadyChecked: false
					});
					that.getOrderList(2);
				} else {
					box.showToast(res.msg);
				}
			} else {
				box.showToast("网络不稳定，请重试");
			}
		})

 },
	/**
	 * 修改工单
	 */
	 bindUpdateOrder(e) {
		let id = e.currentTarget.dataset.id; //订单 id
		let order_num = e.currentTarget.dataset.ordernum; //订单  order_num
		// 普通用户只能修改一次 弹框提示
		if (this.data.role == 0) {
			this.setData({
				showDialog: true,
				update_order_id: id,
				update_order_num: order_num
			});
		} else {
			this.setData({
				isFlag: false
			});
			// 管理员可重复修改
			wx.navigateTo({
				url: `/pages/createOrder/createOrder?isUpdate=1&id=${id}&ordernum=${order_num}`
			});
		}
	},
	dialogCancel() {
		this.setData({
			showDialog: false
		});
	},
	dialogSure() {
		this.setData({
			showDialog: false,
			isFlag: false
		});
		wx.navigateTo({
			url: `/pages/createOrder/createOrder?isUpdate=1&id=${this.data.update_order_id}&ordernum=${this.data.update_order_num}`
		});
	},
	/**
	 * 关闭工单
	 */
	bindCloseOrder(e) {
		let id = e.currentTarget.dataset.id; //订单id
		this.setData({
			showCloseDialog: true,
      close_order_num: id
		});
	},
	dialogCloseCancel() {
		this.setData({
			showCloseDialog: false
		});
	},
	dialogCloseSure(e) {
		console.log(e.detail)
		this.setData({
			showCloseDialog: false
		});
		//
		var that = this;
		var data = {
			order_num: that.data.close_order_num,
			close_order_reason: e.detail  //关闭原因
		}
		request.request_new_test('/instrument/supprot/closeOrderInfo.hn', data, function (res) {
			if (res) {
				if (res.success) {
					box.showToast("关闭成功");

					that.setData({
						page: 1,
						orderList: [],
						tip: '',
						alreadyChecked: false
					});
					let closeEmpty = that.selectComponent("#closeOrderId");
    				closeEmpty.empty();
					that.getOrderList(2);
				} else {
					box.showToast(res.msg);
				}
			} else {
				box.showToast("网络不稳定，请重试");
			}
		})
	},
	/**
	 * 取消订单
	 */
	bindCancelOrder(e) {
		let id = e.currentTarget.dataset.id; //订单id
		this.setData({
			showCancelDialog: true,
			cancel_order_num: id
		});
	},
	dialogCancelCancel() {
		this.setData({
			showCancelDialog: false
		});
	},
	dialogCancelSure(e) {
		this.setData({
			showCancelDialog: false
		});
		//
		var that = this;
		var data = {
			id: that.data.cancel_order_num,
			cancel_order_reason: e.detail  //取消工单原因
		}
		request.request_get('/OrderController/cancelOrder.hn', data, function (res) {
			if(res){
				if(res.success){
					that.setData({
						page: 1,
						orderList: [],
						tip: '',
						alreadyChecked: false
					});
					let closeEmpty = that.selectComponent("#cancelOrderId");
					closeEmpty.empty();
					that.getOrderList(2);
				}else{
				  box.showToast(res.msg)
				}
			}else{
				box.showToast('网络不稳定，请重试')
			}
		})
	},
	/**
	 * 
	 * 完成服务
	 */
	formSubmit(e) {
		var that = this;
		wx.showModal({
			title: '确认提交工单？',
			content: '工单提交成功后，将不允许修改',
			showCancel: true,
			confirmText: '确定',
			success: function (res) {
				if (res.confirm) {
					var id = e.currentTarget.dataset.id;
					var formType = e.currentTarget.dataset.value; // 1保存（工单状态：处理中） 2提交（工单状态：已完成）
					var processing_feedback = e.currentTarget.dataset.feedback;
					var sceneArr = e.currentTarget.dataset.scenepic;
					request.request_get('/OrderController/updateOrder.hn', {
						id: id,
						formType: formType,
						processing_feedback: processing_feedback,
						sceneArr: sceneArr
					}, function (res) {
						console.info('回调', res)
						if (res) {
							if (res.success) {
								wx.showModal({
									//title: '是否确定提交工单',
									content: '提交成功',
									showCancel: false,
									confirmText: '确定',
									success: function (res) {
										if (res.confirm) {
											that.setData({
												page: 1,
												orderList: [],
												tip: '',
												alreadyChecked: false
											});
											that.getOrderList(2);
											// wx.setStorage({
											// 	key: 'jumpStatus',
											// 	data: 2
											// })
											// wx.switchTab({
											// 	url: '../myOrder/myOrder'
											// });
										} else {
											that.setData({
												page: 1,
												orderList: [],
												tip: '',
												alreadyChecked: false
											});
											that.getOrderList(2);
											// wx.switchTab({
											// 	url: '../myOrder/myOrder'
											// });
										}
									}
								})
							} else {
								box.showToast("提交失败，请检查网络连接");
							}
						} else {
							box.showToast("网络不稳定，请重试");
						}
					})
				} else if (res.cancel) {
					console.log('用户点击取消')
				}
			}
		})
	},
	// //取消订单
	// bindCancelOrder:function(e){
	// 	var that = this
	// 	wx.showModal({
	// 	  title: '确认取消工单？',
	// 	  content: '取消后在列表中不再展示此工单',
	// 	  showCancel: true,
	// 	  confirmText: '确定',
	// 	  success: function (res) {
	// 		if (res.confirm) {
	// 		  var id = e.currentTarget.dataset.id;
	// 		  request.request_get('/OrderController/cancelOrder.hn',{
	// 			id:id
	// 		  },function(res){
	// 			console.info('cancelOrder回调',res)
	// 			if(res){
	// 			  if(res.success){
	// 				wx.showModal({
	// 				  title: '成功',
	// 				  content: '取消成功',
	// 				  showCancel: false,
	// 				  success: function (res) {
	// 					wx.setStorage({
	// 					  key:'jumpStatus',
	// 					  data:0
	// 					})
	// 					  wx.switchTab({
	// 						url: '../orderList/orderList'
	// 					  });
	// 				  }
	// 				})
	// 			  }else{
	// 				box.showToast(res.msg)
	// 			  }
	// 			}else{
	// 			  box.showToast('网络不稳定，请重试')
	// 			}
	// 		  })
	// 		}else if(res.cancel){
	// 		  console.log('用户点击取消')
	// 		}
	// 	  }
	// 	})
	//},
})