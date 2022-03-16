// pages/orderInfo/orderInfo.js
const request = require('../../utils/request.js')
const box = require('../../utils/box.js')
const utils = require('../../utils/utils.js')
const app = getApp()
var QQMapWX = require('../../utils/qqmap-wx-jssdk.js');
var qqmapsdk;


Page({

  /**
   * 页面的初始数据
   */
  data: {
    id: "", //订单id
    type: '',
    area_id: "",
    locationName: "",
    address: "",
    concreteType:'',
    ifDone: "",
    status: "",
    account: "",
    img_arr: [], //接单图片
    scene_arr: [],//现场拍照
    ifDone: "",
    formdata: '',
    // service_status: "售后维修",
    processing_feedback: "",
    repairType: "",
    // endSubmit: "",
    role: "",
    supportList: [],
    rangekey: 0,
    customerList: [],
    info: "",
    show_flag1:true,
    show_flag2:false,
    creator_id:0,
    userInfoID:0,

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
    close_order_num: '',

    deleteDialogData: {
			title: "确认删除？",
			titles: "删除后数据将无法恢复",
			cancel: "取消",
			sure: "确认"
		},
		deleteShowDialog: false,
    delete_order_num: '',
    reagent_count: "",
    update_order_num: '',
    update_order_id: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    console.log('id:' + options.id)
    
    let id = options.id;
    qqmapsdk = new QQMapWX({
      key: '2SSBZ-BKXKX-FT447-T6O5S-DE3ZV-CIF5L' //这里自己的secret秘钥进行填充
    });
    that.setData({
      id: id,
      role:app.globalData.userInfo.role,
      userInfoID:app.globalData.userInfo.id,
    })
    that.getOrderInfo();
  },
  onShow(){
    if(this.data.flag == false){
      this.getOrderInfo();
    }
  },
  //SN号显示全部
  showAll:function(){
    var that = this
    that.setData({
      show_flag1:false,
      show_flag2:true
    })
  },
  change(e) { ///自定义方法
    console.log('change', e.detail.id)
    this.setData({
      account: e.detail.id
    })
  },
  //取消订单
  cancelOrder:function(){
    var that = this
    wx.showModal({
      title: '确认取消工单？',
      content: '取消后在列表中不再展示此工单',
      showCancel: true,
      confirmText: '确定',
      success: function (res) {
        if (res.confirm) {
          var id = that.data.id;
          request.request_get('/OrderController/cancelOrder.hn',{
            id:id
          },function(res){
            console.info('cancelOrder回调',res)
            if(res){
              if(res.success){
                wx.showModal({
                  title: '成功',
                  content: '取消成功',
                  showCancel: false,
                  success: function (res) {
                    wx.setStorage({
                      key:'jumpStatus',
                      data:0
                    })
                      wx.switchTab({
                        url: '../orderList/orderList'
                      });
                  }
                })
              }else{
                box.showToast(res.msg)
              }
            }else{
              box.showToast('网络不稳定，请重试')
            }
          })
        }else if(res.cancel){
          console.log('用户点击取消')
        }
      }
    })
  },
  autoGetLocation() {
    var that = this;
    qqmapsdk.geocoder({
      address: that.data.address + that.data.locationName,
      success: function (res) {
        console.log(res)
        console.log("latitude" + res.result.location.lng)
        console.log("longitude" + res.result.location.lat)
        console.log("name" + that.data.locationName)
        console.log("address" + that.data.address)
        wx.openLocation({ //​使用微信内置地图查看位置。
          latitude: res.result.location.lat, //要去的纬度-地址
          longitude: res.result.location.lng, //要去的经度-地址
          name: that.data.locationName,
          address: that.data.address,
          type: 'gcj02',
          scale: 18
        })
      },
      complete: res => {
        console.log(res)
      }
    })
  },
  //客户状态change事件
  bindPickerChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      customIndex: e.detail.value,
      custom_status: e.detail.value
    })
  },

  getOrderInfo: function () {
    var that = this;
    var id = that.data.id;
    // var type = that.data.type;
    // console.log('type='+type)
    console.log('id='+id)
    request.request_new_test('/instrument/supprot/getOrderById.hn', {
      id: id
      // type: type
    }, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          var info = res.msg;
          var imgArr = info.img_url;
          console.log('img_url=' + imgArr)
          var sceneArr = info.scene_pic;
          console.log('scene_pic=' + sceneArr)
          that.setData({
            address:info.address,
            locationName:info.locationName,
            processing_feedback:info.processing_feedback,
            type: info.type,
            img_arr: imgArr, //接单图片
            scene_arr: sceneArr, //现场拍照
            account: info.company_account,
            status: info.status,
            // endSubmit: endSubmit,
            customerList: info.customer_img,
            info: info,
            creator_id: info.creator_id,
            service_type:info.service_type,
            reagent_count: info.reagent_count
          })
          if(that.data.status == 0){
            that.getSupport();
          }
          
          console.log('creator_id' + that.data.creator_id)
          console.log('app.globalData.userInfo.id' + app.globalData.userInfo.id)
 
        } else {
          box.showToast(res.msg);
        }
      }else{
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  phoneCall: function () {
    var that = this;
    wx.makePhoneCall({
      phoneNumber: that.data.info.phone,
      success: function () {
        console.log("成功拨打电话")
      },
    })
  },
  //接单
  accept: function () {
    var that = this;
    var id = that.data.id; //订单id
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
                  key:'jumpStatus',
                  data:1
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
      }else{
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  //派单
  onObjArrayPickerChange(e) {
    var that = this;
    console.log('picker onObjArrayPickerChange发送选择改变，携带值为', e.detail.value)
    var supportList = that.data.supportList;
    console.log(that.data.supportList)
    var support_id = supportList[e.detail.value].id; // 被派单技术支持id
    var support_phone = supportList[e.detail.value].phone;
    var support_name = supportList[e.detail.value].name;
    var id = that.data.id; //订单id
    var order_num = that.data.info.order_num;
    var type = that.data.type;
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
                wx.setStorage({
                  key:'jumpStatus',
                  data:0
                })
                wx.switchTab({
                  url: '../orderList/orderList'
                });
              } else {
                wx.switchTab({
                  url: '../orderList/orderList'
                });
              }
            }
          })
        } else {
          box.showToast(res.msg);
        }
      }else{
        box.showToast("网络不稳定，请重试");
      }
    })
  },

  handleChange: function (e) {
    var that = this;
    console.log(e)
    var ifDone = e.detail.value == 1 ? true : false;
    that.setData({
      ifDone: ifDone
    })
    console.log(that.data.ifDone)
  },
  bindSetData:function(e){
    this.setData({
      reagent_count:e.detail.value
    });
  },
  //保存
  formSubmitSave: function (e) {
    var that = this;
    var id = that.data.id;
    var formType = e.currentTarget.dataset.value; // 1保存（工单状态：处理中） 2提交（工单状态：已完成）
    var processing_feedback = that.data.processing_feedback;
    var sceneArr = that.data.scene_arr;
    var reagent_count = that.data.reagent_count;
    console.log(processing_feedback)
    request.request_new_test('/instrument/supprot/updateOrder.hn', {
      id: id,
      formType: formType,
      // service_status: service_status,
      processing_feedback: processing_feedback,
      sceneArr: sceneArr,
      reagent_count: reagent_count
    }, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          console.log(processing_feedback)
          // wx.hideLoading({}) 
          wx.showModal({
            //title: '是否确定保存工单',
            content: '保存成功',
            showCancel: false,
            confirmText: '确定',
            success: function (res) {
              if (res.confirm) {
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
          box.showToast("保存失败，请检查网络连接");
        }
      }else{
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  //完成服务
  formSubmit: function (e) {
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
          var processing_feedback = that.data.processing_feedback;
          var sceneArr = that.data.scene_arr;
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
                      wx.setStorage({
                        key:'jumpStatus',
                        data:2
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
                box.showToast("提交失败，请检查网络连接");
              }
            }else{
              box.showToast("网络不稳定，请重试");
            }
          })
        } else if(res.cancel){
          console.log('用户点击取消')
        }
      }
    })
    
    
  },
  searchInput: function (e) {
    this.setData({
      remark: e.detail.value
    })
  },

  bindprocessing_feedback: function (e) {
    if (e.detail.value != "") {
      var str = e.detail.value;
      str = utils.checkInput(str);
      this.setData({
        processing_feedback: str
      })
    }
  },

  delScene(e) { //删除现场拍照
    let that = this;
    console.log('点击删除图片===>', e);
    let index = e.currentTarget.dataset.index;
    let sceneList = that.data.scene_arr;
    wx.showModal({
      title: '提示',
      content: '删除该图片？',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          sceneList.splice(index, 1);
          that.setData({
            scene_arr: sceneList
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  },
  
   // 预览现场拍照
  previewScene: function (e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    //所有图片
    var scene_arr = this.data.scene_arr;
    wx.previewImage({
      //当前显示图片
      current: scene_arr[index],
      //所有图片
      urls: scene_arr
    })
  },
  // 预览图片
  previewImg: function (e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    //所有图片
    var img_arr = this.data.img_arr;
    wx.previewImage({
      //当前显示图片
      current: img_arr[index],
      //所有图片
      urls: img_arr
    })
  },
  // 预览图片
  previewImgTwo: function (e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    //所有图片
    var img_arr = this.data.info.reviews_img;
    wx.previewImage({
      //当前显示图片
      current: img_arr[index],
      //所有图片
      urls: img_arr
    })
  },
  // 预览图片
  previewImgCustom: function (e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    //所有图片
    var img_arr = this.data.customerList;
    wx.previewImage({
      //当前显示图片
      current: img_arr[index],
      //所有图片
      urls: img_arr
    })
  },
  getSupport: function () {
    var that = this;
    var data = {
      address: that.data.address
    }
    console.info('address='+that.data.address)
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
      }else{
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  bindCopy: function(){
    wx.setClipboardData({
      data: this.data.info.order_num,
      success (res) {
        wx.getClipboardData({
          success (res) {
            wx.showToast({
              title: '内容已复制',
            })
            console.log(res.data) // data
          }
        })
      }
    })
  },
  upScene: function () {
    var that = this;
    var data = [];
    if (that.data.scene_arr.length < 10) {
      wx.chooseImage({
        count:9-that.data.scene_arr.length,
        sizeType: ['original', 'compressed'],
        success: function (res) {
          console.log('choose回调成功')
          var filePath = res.tempFilePaths;
          for (var i = 0; i < filePath.length; i++) {
            wx.uploadFile({
              //url: 'https://8.130.48.31:8080/flash20AppletBackend/OrderController/upload.hn',  // 测试服务器  孙仕豪
              //url: 'https://scldev.coyotebio-lab.com:8443/flash20AppletBackend/OrderController/upload.hn',   // 孙仕豪
              //url : 'http://8.130.55.156:8080/flash20AppletBackend/OrderController/upload.hn',  // 测试服务器  于光良
              //url: 'https://8.130.25.5/flash20AppletBackend/OrderController/upload.hn',   // 宋彦睿
              //url: 'https://syrdev.coyotebio-lab.com/flash20AppletBackend/OrderController/upload.hn',   // 宋彦睿
              url: 'https://www.prohealth-wch.com:8443/flash20AppletBackend/OrderController/upload.hn', //正式服务器
              //url: 'http://localhost:8080/flash20AppletBackend/OrderController/upload.hn',// 本地测试
              filePath: filePath[i],
              name: 'imageFile',
              formData: data,
              header: {
                "chartset": "utf-8"
              },
              success: function (returnRes) {
                console.log('上传成功')
                console.log(returnRes)
                console.log(returnRes.data)
                console.log(returnRes.msg)
                var data = JSON.parse(returnRes.data)
                var sceneList = [];
                var sceneArr = that.data.scene_arr;
                for (var i = 0; i < sceneArr.length; i++) {
                  sceneList.push(sceneArr[i])
                  console.log(sceneArr[i])
                }
                sceneList.push(data.msg)
                that.setData({
                  scene_arr: sceneList
                })
                console.log("sceneList=" + sceneList)
              },
              fail:function(returnRRR){
                console.log('上传失败')
              }
            })
          }
        }
      })
    } else {
      wx.showToast({
        title: '最多上传九张图片',
        icon: 'loading',
        duration: 3000
      });
    }
  },
  /**
	 * 更多按钮
	 */
	bindMore(e) {
		this.setData({
			isShowClose: !this.data.isShowClose
		});
	},
  /**
	 * 修改工单
	 */
	bindUpdateOrder(e) {
		let id = e.currentTarget.dataset.id; //订单 id 
    let order_num = e.currentTarget.dataset.ordernum;
    this.setData({
      isShowClose: false
    })
		// 普通用户只能修改一次 弹框提示
		if (this.data.role == 0) {
			this.setData({
				showDialog: true,
        update_order_id: id,
				update_order_num: order_num,
        flag: false
			});
		} else {
      this.setData({
        flag: false
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
      flag: false
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
          wx.navigateBack({
            delta: 1,
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
          wx.navigateBack({
            delta: 1,
          })
         } else {
           box.showToast(res.msg);
         }
       } else {
         box.showToast("网络不稳定，请重试");
       }
     })
 
  },
})