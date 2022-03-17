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
		statusList: ['待接单', '进行中', '全部'],
		role: '0', // 0 普通  1 管理员
		order_status: '0', //all全部,0待接单,1进行中
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

		isShowClose: false, // 更多弹框
		indexClose: -1, // 更多弹框 index
		supportList: [],
		order_id: '', // 派单参数 订单id
		order_num: '', // 派单参数 订单id
		order_type: '', // 派单参数 订单id
		close_order_num: '',
		update_order_num: '',
		update_order_id: '',
		total_order_admin_not: 0,
		total_order_admin_now: 0,
		isFlag: true
	},

	onLoad: function (options) {
		var that = this;
		let role = app.globalData.userInfo.role;
		that.setData({
			role: role,
			userInfoID: app.globalData.userInfo.id,
		});
		if(role != 2){
			that.getOrderList()
		}

	},
	onShow: function () {
		if(this.data.role != 2){
			var that = this;
			wx.getStorage({
				key: "jumpStatus",
				success(res) {
					if (res.data == 0) {
						that.jumpTabSelect(0);
					}
				}
			})

			if(!this.data.isFlag){
				that.jumpTabSelect(0);
			}

			that.getSupport();
		}
	},
	jumpTabSelect: function (e) {
		var that = this;
		if (e == 0) {
			that.setData({
				tip: '',
				orderList: [],
				page: 1
			})
			wx.removeStorage({
				key: 'jumpStatus',
				success(res) {
					console.log(res)
				}
			})
			that.getOrderList();
		}
	},
	onReachBottom: function () {
		console.log('成功下拉+++++++++++')
		var that = this;
		that.getOrderList();
	},
	// 获取当前技术支持所属区域内未接单的工单
	getOrderList: function () {
		var that = this;
		console.log(that.data.page)
		var data = {
			phone: app.globalData.userInfo.phone,
			page: that.data.page, //页数
			limit: that.data.pageSize, //每页数据
			order_status: that.data.order_status
		}
		request.request_new_test('/instrument/supprot/getAllPersonOrderInfo.hn', data, function (res) {
			console.info('回调', res)
			if (res) {
				if (res.success) {
					let orderListTemp = that.data.orderList;

					orderListTemp = that.data.page == 1 ? res.result_order : orderListTemp.concat(res.result_order)
					if (that.data.page == 1 && res.result_order.length == 0){
						that.setData({
							alreadyChecked: true
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
						total_order_admin_not: res.total_order_admin_not,
						total_order_admin_now: res.total_order_admin_now
					});
				} else {
					box.showToast(res.msg);
				}
			} else {
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
			tip: '',
			orderList: [],
			page: 1
		})
		that.getOrderList();
	},
	tabSelect(e) {
		//order_status: '0', //all全部,0待接单,1进行中

		var status = e.currentTarget.dataset.id;
		console.log("tabSelect " + status)
		var that = this;
		if (status == 0) {
			status = "0";
		} else if (status == 1) {
			status = "1";
		} else {
			status = 'all';
		}
		this.setData({
			TabCur: e.currentTarget.dataset.id,
			order_status: status,
			page: 1,
			orderList: [],
			tip: '',
			alreadyChecked: false
		})
		that.getOrderList();
	},
	/**
	 * 接单
	 */
	bindAcceptOrder(e) {
		let id = e.currentTarget.dataset.id; //订单id
		var supportId = app.globalData.userInfo.id;

		request.request_new_test('/instrument/supprot/Orders.hn', {
			id: id,
			supportId: supportId
		}, function (res) {
			console.info('回调', res)
			if (res) {
				if (res.success) {
					wx.showModal({
						title: '成功',
						content: '接单成功',
						showCancel: false,
						confirmText: '确定',
						success: function (res) {
							if (res.confirm) {
								wx.setStorage({
									key: 'jumpStatus',
									data: 1
								})
								wx.switchTab({
									url: '../myOrder/myOrder'
								});
							} else {
								wx.switchTab({
									url: '../myOrder/myOrder'
								});
							}
						}
					})
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
		let order_num = e.currentTarget.dataset.ordernum; //订单 order_num
		this.setData({
			isShowClose: false
		})
		// 普通用户只能修改一次 弹框提示
		if (this.data.role == 0) {
			this.setData({
				showDialog: true,
				update_order_num: order_num,
				update_order_id: id
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
		let id = e.currentTarget.dataset.id; //订单order_num
		this.setData({
			isShowClose: false,
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
					that.setData({
						page: 1,
						orderList: [],
						tip: '',
						alreadyChecked: false
					  });
					that.getOrderList();
				} else {
					box.showToast(res.msg);
				}
			} else {
				box.showToast("网络不稳定，请重试");
			}
		})
	},
	/**
	 * 更多按钮
	 */
	bindMore(e) {
		this.setData({
			isShowClose: !this.data.isShowClose,
			indexClose: e.currentTarget.dataset.index
		});
	},
	/**
	 * 派单人员列表
	 */
	getSupport: function () {
		var that = this;
		var data = {
			address: that.data.address
		}
		console.info('address=' + that.data.address)
		request.request_get('/OrderController/selectSupport.hn', data, function (res) {
			console.info('getSupport回调', res)

			if (res) {
				if (res.success) {
					var supportList = res.msg;
					that.setData({
						supportList: supportList
					});
				} else {
					box.showToast(res.msg);
				}
			} else {
				box.showToast("网络不稳定，请重试");
			}
		})
	},
	/**
	 * 派单
	 */
	nothing(e) {
		this.setData({
			order_id: e.currentTarget.dataset.id,
			order_num: e.currentTarget.dataset.ordernum,
			order_type: e.currentTarget.dataset.ordertype,
		});
	},
	onObjArrayPickerChange(e) {
		var that = this;
		console.log('picker onObjArrayPickerChange发送选择改变，携带值为', e.detail.value)
		var supportList = that.data.supportList;
		console.log(that.data.supportList)
		var support_id = supportList[e.detail.value].id; // 被派单技术支持id
		var support_phone = supportList[e.detail.value].phone;
		var support_name = supportList[e.detail.value].name;
		var id = that.data.order_id; //订单id
		var order_num = that.data.order_num;
		var type = that.data.order_type;
		var name = app.globalData.userInfo.name; //派单人姓名

		var data = {
			supportId: support_id,
			id: id,
			type: type,
			name: name,
			support_phone: support_phone,
			support_name: support_name,
			order_num: order_num
		}
		request.request_new_test('/instrument/supprot/dispatch.hn', data, function (res) {
			console.info('回调', res)
			if (res) {
				if (res.success) {
					wx.showModal({
						title: '成功',
						content: '派单成功',
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
								that.getOrderList();
							} else {
								that.setData({
									page: 1,
									orderList: [],
									tip: '',
									alreadyChecked: false
								  });
								that.getOrderList();
							}
						}
					})
				} else {
					box.showToast(res.msg);
				}
			} else {
				box.showToast("网络不稳定，请重试");
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
					var id = that.data.id;
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
											that.getOrderList();
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
											that.getOrderList();
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
})