// pages/createOrder/createOrder.js
const app = getApp()
const box = require('../../utils/box.js')
const request = require('../../utils/request.js')
const utils = require('../../utils/utils.js')
const time = require('../../utils/time.js')
"use strict";
const chooseLocation = requirePlugin('chooseLocation');


Page({

  /**
   * 页面的初始数据
   */
  data: {
    num:'1',
    company_name:'',
    SN:[],
    type:1, //默认现场服务
    account:'',
    list: [],
    order_num: "",
    img_arr:[],
    support_id:'',//接单技术支持id
    service_type:'现场服务',
   // serviceTypeArray: ['请选择服务类型','现场服务','装机培训','返厂维修'],
    serviceIndex: 0,
    // service_status: '',
    instrumentList: [],
    instrumentIndex: 0,
    instrument_status: '',
    instrument_name:'',
    reagentList: [],
    reagentIndex: 0,
    reagent_status: '',
    reagent_name:'',
    address: "",
    locationName: "",
    name: "",
    phone: "",
    //serviceType: "",
    question_desc: "",
    time: '',
    ifAccept: 1,
    supportName: "",
    customerList: [],
    customerIndex: 0,
    companyIndex: 0,
    supportPhone: "",
    submitState: false,
    repair_type:'',
    flag: true,
    pickerConfig: {
      endDate: false,
      column: "minute",
      dateLimit: true,
      initStartTime: time.format_hour(new Date(new Date().getTime())),
      limitStartTime: time.format_hour(new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 3)),
      limitEndTime: time.format_hour(new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 7))
    },
    // 开始时间参数设置
    startIsPickerRender: false,
    startIsPickerShow: false,
    startTime: time.format_hour3(new Date(new Date().getTime())).toString() + ":00",
    startChartHide: false,
    flag_1:true,   //预约时间
    flag_2:true,   //仪器类型
    flag_3:true,   //序列号
    flag_4:false,  //试剂类型
    flag_5:true,    //问题描述
    isUpdate: 0, //是否修改工单   0:默认创建工单   1:修改工单
    update_id: '',
    update_order_num: '',
    title:"创建工单"
  },
  /**
   * 生命周期函数--监听页面加载
   */
  changeType:function(e){
    var that = this
    console.log(e)
    that.setData({
      num:e.target.dataset.num
    })
    if(that.data.num == 1){ //现场服务
      that.setData({
        flag_1:true,   //预约时间
        flag_2:true,   //仪器类型
        flag_3:true,   //序列号
        flag_4:false,  //试剂类型
        flag_5:true,    //问题描述
        type:1,
        service_type:'现场服务'
      })
    }else if(that.data.num == 2){ //返厂维修
      that.setData({
        flag_1:false,
        flag_2:true,
        flag_3:true,
        flag_4:false,
        flag_5:true,
        type:2,
        service_type:'返厂维修'
      })
    }else if(that.data.num == 3){ //装机培训
      that.setData({
        flag_1:true,
        flag_2:true,
        flag_3:true,
        flag_4:false,
        flag_5:false,
        type:3,
        service_type:'装机培训'
      })
    }else if(that.data.num == 4){ //试剂培训
      that.getReagentList()
      that.setData({
        flag_1:true,
        flag_2:false,
        flag_3:false,
        flag_4:true,
        flag_5:false,
        type:4,
        service_type:'试剂培训'
      })
    }else if(that.data.num == 5){ //远程服务
      that.setData({
        flag_1:true,
        flag_2:true,
        flag_3:true,
        flag_4:false,
        flag_5:true,
        type:5,
        service_type:'远程服务'
      })
    }
  },

  onLoad: function (options) {
    var that = this;
   
    if(options && options.isUpdate && options.id && options.ordernum){
      this.setData({
        isUpdate: options.isUpdate,
        update_id: options.id,
        update_order_num: options.ordernum,
        title: '修改工单'
      });
    }

    if(this.data.isUpdate == 1){
      this.getOrderInfo();

      wx.getStorage({//获取本地缓存
        key:"SN_key",
        success:function(res){
          console.log(res.data)
          that.setData({
            SN:res.data
          });
          console.log(that.data.sn)
        }})
    } else {
      that.getOredeNum();
      // that.getCompanyList(); 本页面无需查看客户列表
      // that.getInstrumentList();
      var str = that.getFullTime();
      console.log("str:" + str)

      wx.getStorage({//获取本地缓存
        key:"SN_key",
        success:function(res){
          console.log(res.data)
          that.setData({
            SN:res.data
          });
          console.log(that.data.sn)
        }})


      that.setData({
        supportName: app.globalData.userInfo.name,
        supportPhone: app.globalData.userInfo.phone,
        time: new Date(),
      });
      console.log(app.globalData.userInfo.name)
      console.log(time.format_hour(new Date(new Date().getTime())).split(" "))
    }
  },
  //自定义详细地址
  updateLocation:function(e){
    console.log(e.detail.value)
  
    var str = e.detail.value;
    str = utils.checkInput(str);
    this.setData({
      locationName: str
    })
  },
  change(e) { ///自定义方法 待废弃(客户picker)
    var that = this;
    var list = that.data.list;
    console.log(list[e.detail.value].account)
    this.setData({
      account: that.data.list[e.detail.value].account,
      companyIndex: e.detail.value
    })
    that.chooseCustomer(list[e.detail.value].account);
  },
  // //获取仪器类型列表
  // getInstrumentList: function () {
  //   var that = this;
  //   var data = {}
  //   request.request_get('/wxapi/getinstrumentName.hn', data, function (res) {
  //     console.info('getInstrumentList回调', res)
  //     if (res) {
  //       if (res.success) {
  //         var instrumentList = res.result;
  //         var instrumentHead = {instrument_name:'请选择仪器类型'};
  //         instrumentList.unshift(instrumentHead);
  //         that.setData({
  //           instrumentList: instrumentList,
  //         });
  //         console.log(res);
  //       //that.chooseCustomer(list[0].account)
  //       //that.searchChangeHandle(); 首次展示无需模糊查询
  //       } else {
  //         box.showToast(res.msg);
  //       }
  //     }else{
  //       box.showToast("网络不稳定，请重试");
  //     }
  //   })
  // },
  //获取试剂列表
  getReagentList:function(){
    var that = this;
    var data = {}
    request.request_get('/account/getReagentList.hn',data,function(res){
      console.log('getReagentList回调',res);
      if(res){
        if(res.success){
          var reagentList = res.result;
          var reagentHead = {reagent_name:'请选择试剂类型'}
          reagentList.unshift(reagentHead)
          that.setData({
            reagentList: reagentList
          })
        }else{
         // box.showToast(res.msg);
        }
      }else{
        //box.showToast("网络不稳定，请重试");
      }
    })
  },
  //跳转至客户选择页面
  bindChooseCustomerTest:function(e){
    var that = this
    that.setData({
      flag: true
    })
    wx.navigateTo({
      url: '/pages/chooseCustomer/chooseCustomer'
    })
  },
   //跳转至问题描述页面
  bindProblemDescription:function(e){
    var that = this
    that.setData({
      flag: true
    })
    wx.navigateTo({
      url: '/pages/problemDescription/problemDescription?description='+that.data.question_desc
    })
  },
  //跳转至仪器类型选择页面
  bindChooseInstrument:function(e){
    var that = this
    that.setData({
      flag: true
    })
    wx.navigateTo({
      url: '/pages/chooseInstrument/chooseInstrument?instrument_name='+that.data.instrument_name
    })
  },
  //跳转至序列号选择页面
  bindChooseSN:function(e){
    // wx.hideKeyboard({
    //   success: (res) => {},
    // })
    var that = this
    if(that.data.account == ''){
      wx.showToast({
        icon: 'none',
        title: '请选择客户',
      })
    }else if(that.data.instrument_name == ''){
      wx.showToast({
        icon: 'none',
        title: '请选择仪器类型',
      })
    }else{
      that.setData({
        flag: true
      })
      wx.navigateTo({
        url: '/pages/chooseSN/chooseSN?account=' + this.data.account + '&instrument_name=' + this.data.instrument_name
      })
    }
  },
  //跳转至联系人选择页面
  bindChooseCustodian:function(e){
    var that = this
    if(that.data.account == ''){
      wx.showToast({
        title: '请选择客户',
      })
    }else{
      that.setData({
        flag: true
      })
      wx.navigateTo({
        url: '/pages/chooseCustodian/chooseCustodian?account=' + this.data.account
      })
    }
  },
  // //仪器类型change事件
  // bindPickerChangeInstrument: function (e) {
  //   var that = this;
  //   console.log('picker发送选择改变，携带值为', e.detail.value)
  //   this.setData({
  //     instrumentIndex: e.detail.value,
  //     instrument_status: e.detail.value,
  //     instrumentList: that.data.instrumentList,
  //     instrument_name: that.data.instrumentList[e.detail.value].instrument_name
  //   })
  // },
  //试剂类型change事件
  bindPickerChangeReagent: function (e) {
    var that = this;
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      reagentIndex: e.detail.value,
      reagent_status: e.detail.value,
      reagentList: that.data.reagentList,
      reagent_name: that.data.reagentList[e.detail.value].reagent_name
    })
  },
 
  handleChange: function (e) {
    var that = this;
    if(e.detail.value == true){
      that.setData({
        ifAccept: 1
      })
    }else{
      that.setData({
        ifAccept: 0
      })
    }
  },
  // 时间选择器
  start_time_show: function () {
    this.setData({
      startIsPickerShow: true,
      startIsPickerRender: true,
      startChartHide: true
    })
  },
  start_time_hide: function () {
    this.setData({
      startIsPickerShow: false,
      startChartHide: false
    })
  },
  set_start_time: function (val) {
    console.log(val,val.detail.startTime)
    this.setData({
      startTime: val.detail.startTime.substring(0, 13) + ":00"
    });
  },
  getOredeNum: function () {
    var that = this;
    var random = Math.round(Math.random() * 9999);
    var str1 = that.getFullTime() + random;
    that.setData({
      order_num: str1
    })
  },
  getLocalTime() {
    return new Date().getTime();
  },
  getFullTime() {
    let date = new Date(), //时间戳为10位需*1000，时间戳为13位的话不需乘1000
      Y = date.getFullYear() + '',
      M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1),
      D = (date.getDate() < 10 ? '0' + (date.getDate()) : date.getDate()),
      h = (date.getHours() < 10 ? '0' + (date.getHours()) : date.getHours()),
      m = (date.getMinutes() < 10 ? '0' + (date.getMinutes()) : date.getMinutes()),
      s = (date.getSeconds() < 10 ? '0' + (date.getSeconds()) : date.getSeconds());
    return Y + M + D + h + m + s
  },
  // 提交预约信息
  submit: utils.throttle(function (e) {
    wx.showLoading({
      title: '提交中...',
      mask:true,
      duration:3000
    })
    var that = this;
    if(this.data.isUpdate == 1){
      var ifAccept = that.data.ifAccept;
      var type = that.data.type; 
      var instrument_name = that.data.instrument_name;
      var SN = that.data.SN;
      var reagent_name = that.data.reagent_name;
      if(ifAccept == 1){
        that.setData({
          support_id: that.data.support_id ? that.data.support_id : app.globalData.userInfo.id
        })
      }else{
        that.setData({
          support_id: ''
        })
      }
      if(type == 1 || type == 2 || type == 3 || type == 5){
        that.setData({
          reagent_name:''
        })
        if(instrument_name == ''){
          box.showToast("请选择仪器类型")
          return
        }else if (SN.length == 0){
          box.showToast("请选择序列号")
          return
        }
      }else if(type == 4){
        if(reagent_name == '' ||reagent_name == '请选择试剂类型'){
          box.showToast("请选择试剂类型")
          return
        }
        that.setData({
          instrument_name:'',
          SN:[],
          question_desc:'',
          img_arr:''
        })
      }
      if(type == 2){
        that.setData({
          time:''
        })
      }
      if(type == 3){
        that.setData({
          question_desc:'',
          img_arr:''
        })
      }
      var account = that.data.account;
      var name = that.data.name;
      var phone = that.data.phone;
      var order_num = that.data.order_num;
      var ifAccept = that.data.ifAccept;
      var type = that.data.type; 
      var instrument_name = that.data.instrument_name;
      var SN = that.data.SN;
      var reagent_name = that.data.reagent_name;
      var question_desc = that.data.question_desc;
      var time = that.data.startTime;
      var address = that.data.address;
      var locationName = that.data.locationName;
      var creator_id = that.data.creator_id; // 创建人id
      var create_person = that.data.create_person;
      var img_arr = that.data.img_arr;
      var service_type =  that.data.service_type;
      var support_id = that.data.support_id;
      var company_name = that.data.company_name;
      console.log("userInfo" + app.globalData.userInfo)
      console.log("question_desc=" + question_desc)
      console.log('姓名、手机号、微信号：', account, order_num, type,time, name, phone, address, locationName, creator_id);
      console.log(that.data.SN)
      console.log(typeof that.data.SN)
      if (account == '') {
        box.showToast("请选择客户");
      } else if (name == '') {
        box.showToast("请填写联系人");
      } else if (phone == '') {
        box.showToast("请填写联系电话");
      } else if (!utils.checkContact(phone)) {
        box.showToast("联系电话有误")
      } else if (address == '') {
        box.showToast("请填写所在地区");
      } else if (locationName == '') {
        box.showToast("请填写详细地址");
      } else if (type != 2 && time == '') {
        box.showToast("请选择预约时间");
      }else {
        //account,order_num,service_status, time,status,detailsdetails,  name, phone, address, locationName
        console.log('creator_id='+creator_id,'support_id='+support_id,'service_type='+service_type)
        var data = {
          account: account, //客户公司账号
          company_name:company_name,
          order_num: order_num,
          time: time, // 预约时间
          question_desc: question_desc,// 问题描述
          name: name, // 联系人
          phone: phone, // 手机号
          type: that.data.type, // 1 现场服务  2 返厂维修  3 装机培训  4 试剂培训 5 远程服务
          creator_id: creator_id, 
          address: address,
          locationName: locationName,
          ifAccept: ifAccept,
          repair_type:instrument_name, // 仪器型号
          instrument_sn: SN,
          create_person: create_person,
          imgArr:img_arr,
          reagent_name:reagent_name,
          service_type:service_type,
          support_id:support_id
        }
        console.log('---->:',data)
        request.request_new_test('/instrument/supprot/updateOrderCommonInfo.hn', data, function (res) {
          console.info('回调', res)
          if (res) {
            if (res.success) {  
              wx.navigateBack({
                delta: 1
              });
              // wx.showModal({
              //   title: '成功',
              //   content: '提交成功',
              //   showCancel: false,
              //   confirmText: '确定',
              //   success: function (res) {
              //     if (res.confirm) {
              //       wx.navigateBack({
              //         delta: 1
              //       });
              //     }
              //   }
              // })
            } else {
              console.log(res.msg);
              box.showToast("修改失败，请检查网络连接！");
            }
          }else{
            box.showToast("网络不稳定，请重试");
          }
        })
        wx.hideLoading({
          success: (res) => {},
        })
      }
    }else{
      var ifAccept = that.data.ifAccept;
      var type = that.data.type; 
      var instrument_name = that.data.instrument_name;
      var SN = that.data.SN;
      var reagent_name = that.data.reagent_name;
      if(ifAccept == 1){
        that.setData({
          support_id: app.globalData.userInfo.id
        })
      }else{
        that.setData({
          support_id: ''
        })
      }
      if(type == 1 || type == 2 || type == 3 || type == 5){
        that.setData({
          reagent_name:''
        })
        if(instrument_name == ''){
          box.showToast("请选择仪器类型")
          return
        }else if (SN.length == 0){
          box.showToast("请选择序列号")
          return
        }
      }else if(type == 4){
        if(reagent_name == '' ||reagent_name == '请选择试剂类型'){
          box.showToast("请选择试剂类型")
          return
        }
        that.setData({
          instrument_name:'',
          SN:[],
          question_desc:'',
          img_arr:''
        })
      }
      if(type == 2){
        that.setData({
          time:''
        })
      }
      if(type == 3){
        that.setData({
          question_desc:'',
          img_arr:''
        })
      }
      var account = that.data.account;
      var name = that.data.name;
      var phone = that.data.phone;
      var order_num = that.data.order_num;
      var ifAccept = that.data.ifAccept;
      var type = that.data.type; 
      var instrument_name = that.data.instrument_name;
      var SN = that.data.SN;
      var reagent_name = that.data.reagent_name;
      var question_desc = that.data.question_desc;
      var time = that.data.startTime;
      var address = that.data.address;
      var locationName = that.data.locationName;
      var creator_id = app.globalData.userInfo.id; // 创建人id
      var create_person = app.globalData.userInfo.name;
      var img_arr = that.data.img_arr;
      var service_type =  that.data.service_type;
      var support_id = that.data.support_id;
      var company_name = that.data.company_name;
      console.log("userInfo" + app.globalData.userInfo)
      console.log("question_desc=" + question_desc)
      console.log('姓名、手机号、微信号：', account, order_num, type,time, name, phone, address, locationName, creator_id);
      console.log(that.data.SN)
      console.log(typeof that.data.SN)
      if (account == '') {
        box.showToast("请选择客户");
      } else if (name == '') {
        box.showToast("请填写联系人");
      } else if (phone == '') {
        box.showToast("请填写联系电话");
      } else if (!utils.checkContact(phone)) {
        box.showToast("联系电话有误")
      } else if (address == '') {
        box.showToast("请填写所在地区");
      } else if (locationName == '') {
        box.showToast("请填写详细地址");
      } else if (type != 2 && time == '') {
        box.showToast("请选择预约时间");
      }else {
        //account,order_num,service_status, time,status,detailsdetails,  name, phone, address, locationName
        console.log('creator_id='+creator_id,'support_id='+support_id,'service_type='+service_type)
        var data = {
          account: account, //客户公司账号
          company_name:company_name,
          order_num: order_num,
          time: time, // 预约时间
          question_desc: question_desc,// 问题描述
          name: name, // 联系人
          phone: phone, // 手机号
          type: that.data.type, // 1 现场服务  2 返厂维修  3 装机培训  4 试剂培训 5 远程服务
          creator_id: creator_id, 
          address: address,
          locationName: locationName,
          ifAccept: ifAccept,
          repair_type:instrument_name, // 仪器型号
          instrument_sn: SN,
          create_person: create_person,
          imgArr:img_arr,
          reagent_name:reagent_name,
          service_type:service_type,
          support_id:support_id
        }
        request.request_get('/OrderController/createOrder.hn', data, function (res) {
          console.info('回调', res)
          if (res) {
            if (res.success) {  
              var id = res.msg
              // service_status = service_status == "售后维修" ? 0 : 1;
              wx.showModal({
                title: '成功',
                content: '提交成功',
                showCancel: false,
                confirmText: '确定',
                success: function (res) {
                  if (res.confirm) {
                    if (ifAccept == "0") {
                      wx.setStorage({
                        key:'jumpStatus',
                        data:0
                      })
                      wx.switchTab({
                        url: '../orderList/orderList'
                      });
                      console.log("跳转之后")
                    } else {
                      wx.setStorage({
                        key:'jumpStatus',
                        data:1
                      })
                      wx.switchTab({
                        url: '../myOrder/myOrder?'
                      });
                    }
                  }
                }
              })
            } else {
              console.log(res.msg);
              box.showToast("创建失败，请检查网络连接！");
            }
            // box.hideLoading();
          }else{
            box.showToast("网络不稳定，请重试");
          }
        })
        wx.hideLoading({
          success: (res) => {},
        })
      }
    }
  },3000),

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  //  console.log("*****------------")
    if(this.data.flag == false){
    const location = chooseLocation.getLocation();
    if (location) {
      this.setData({
        address: location.address ? location.address : "",// 所在地区
        locationName: location.name ? location.name : ""  // 详细地址
      });
    }
  }
  },
  onUnload () {
    //清除问题描述中图片描述缓存
    wx.removeStorage({
      key: 'key',
      success (res) {
        console.log(res)
      }
    })
    //清除问题描述缓存
    wx.removeStorage({
      key: 'key_question_desc',
      success (res) {
        console.log(res)
      } 
    })
     //清除序列号选中状态缓存
     wx.removeStorage({
      key: 'SN_key',
      success (res) {
        console.log(res)
      }  
    })
    //清除序列号选中状态缓存2
    wx.removeStorage({
      key: 'SN_key2',
      success (res) {
        console.log(res)
      }  
    })
    // 页面卸载时设置插件选点数据为null，防止再次进入页面，geLocation返回的是上次选点结果
    chooseLocation.setLocation(null);
  },
  //显示地图
  showMap() {
    var that = this
    that.setData({
      flag: false
    })
    //使用在腾讯位置服务申请的key（必填）
    const key = "2SSBZ-BKXKX-FT447-T6O5S-DE3ZV-CIF5L";
    //调用插件的app的名称（必填）
    const referer = "闪测技术支持";
    wx.navigateTo({
      url: 'plugin://chooseLocation/index?key=' + key + '&referer=' + referer
    });
  },
  getOrderInfo: function () {
    var that = this;
    var id = that.data.update_id;
    request.request_new_test('/instrument/supprot/getOrderById.hn', {
      id: id
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
            account: info.company_account,
            company_name: info.company_name,
            order_num: info.order_num,
            time: info.time,
            startTime: info.time,
            question_desc: info.question_desc,
            name: info.name,
            phone: info.phone,
            type: info.type,
            creator_id: info.creator_id, 
            address:info.address,
            locationName:info.locationName,
            ifAccept: info.support_id ? '1' : '0', // 判断是否接单
            instrument_name: info.repair_type,
            SN: info.instrument_SN,
            create_person: info.create_person,
            num: info.type,
            img_arr: info.img_url,
            reagent_name: info.reagent_name,
            service_type:info.service_type,
            support_id: info.support_id
          })

          //问题描述中图片描述缓存
          wx.setStorage({
            key:"key",
            data:that.data.img_arr
          })
          //问题描述缓存
          wx.setStorage({
            key:"key_question_desc",
            data:that.data.question_desc
          })
        } else {
          box.showToast(res.msg);
        }
      }else{
        box.showToast("网络不稳定，请重试");
      }
    })
  },
})