// pages/addCustodian/addCustodian.js
const app = getApp()
const box = require('../../utils/box.js')
const request = require('../../utils/request.js')
const utils = require('../../utils/utils.js')
const time = require('../../utils/time.js')
"use strict";
const chooseLocation = requirePlugin('chooseLocation');

Page({
  data: {
    name:'',
    phone:'',
    submitState: true,
    account:'',
    create_name:''
  },
  onLoad: function (options) {
    var that = this
    that.setData({
      account: options.account
    })
  
  },
  bindSetData2:function(e){
    this.setData({
      name:e.detail.value
    })
    this.checkSubmitStatus()
  },
  bindSetData3:function(e){
    this.setData({
      phone:e.detail.value
    })
    this.checkSubmitStatus()
  },
  //保存按钮禁用判断
  checkSubmitStatus: function(e){
    if(this.data.name != '' && this.data.phone != ''){
      this.setData({
        submitState: false
      })
    }else{
      this.setData({
        submitState: true
      })
    }
  },
  // 提交预约信息
  submit: function (e) {
  //  console.log(e)
    var that = this,
    objData = e.detail.value;
  
    var name = objData.name;
    var phone = objData.phone;
    var account = that.data.account;
    that.setData({
      name: name,
      phone: phone
    })
    console.log("userInfo" + app.globalData.userInfo)

    if (!utils.checkContact(phone)) {
      box.showToast("手机号格式不正确")
    }else {
      var data = {
        account:account,
        name: name,
        phone: phone,
        create_name:app.globalData.userInfo.name
      }
      request.request_get('/wxapi/addCustodian.hn', data, function (res) { 
        console.info('createCustodian回调', res)
        if (res) {
          if (res.success) {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
            })
            that.bindCreateCustodian();
          } else {
            wx.showToast({
              title: res.msg,
            })
          }
        }else{
          wx.showToast({
            title: '网络不稳定，请重试',
          })
        }
      })
    }
  },
  //新建联系人并返回
  bindCreateCustodian:function(){
    var that = this;
    console.log(that.data.account)
    console.log
    let pages = getCurrentPages(); 
    let prevPage = pages[pages.length - 3]; //获取上上个页面栈                          
    prevPage.setData({  
      name: that.data.name,
      account: that.data.account,
      phone: that.data.phone
    })
    
    wx.navigateBack({
      delta: 2, //返回上上个页面
      })
  
   }
})