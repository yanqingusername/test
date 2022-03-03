// pages/addCustomer/addCustomer.js
const app = getApp()
const box = require('../../utils/box.js')
const request = require('../../utils/request.js')
const utils = require('../../utils/utils.js')
const time = require('../../utils/time.js')
"use strict";
const chooseLocation = requirePlugin('chooseLocation');

Page({
  data: {
    instrument_name:'',
    SN:'',
    SNArray:[],
    submitState: true,
    company_account:'',
    create_person:'',
    remark:'',
    ifAccept:0,
    flag_1:false,
    replaced_SN:''
  },
  onLoad: function (options) {
    this.setData({
      instrument_name:options.instrument_name,
      company_account:options.company_account
    })
  },
  //是否为替换机
  handleChange: function (e) {
    var that = this;
    if(e.detail.value == true){
      that.setData({
        flag_1:true
      })
    }else{
      that.setData({
        flag_1:false
      })
    }
  },
  //跳转至序列号选择页面
  bindExclusiveChooseSN:function(e){
    var that = this;
    wx.navigateTo({
      url: '/pages/exclusiveChooseSN/exclusiveChooseSN?account=' + this.data.company_account + '&instrument_name=' + this.data.instrument_name
    })
  },
  bindSetData1:function(e){
    this.setData({
      SN:e.detail.value
    })
    this.checkSubmitStatus()
  },
 
  //保存按钮禁用判断
  checkSubmitStatus: function(e){
    if(this.data.SN != ''){
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
    console.log(e)
    var that = this,
    objData = e.detail.value;
    var SN = objData.SN;
    var remark = objData.remark;
    if(that.data.flag_1 == true){
      if(that.data.replaced_SN == ''){
        wx.showToast({
          icon:'none',
          title: '请选择被替换仪器序列号',
        })
        return;
      }
    }
    if(that.data.flag_1 == false){
      that.setData({
        replaced_SN:''
      })
    }
    console.log('remard='+remark)
    var re=/^[A-Za-z0-9]*$/;  
    
    if(re.test(SN) == false){
      wx.showToast({
        icon:'none',
        title: '请输入正确的序列号',
      })
    } else {
      var data = {
        instrument_sn: SN,
        instrument_name: that.data.instrument_name,
        company_account: that.data.company_account,
        create_person: app.globalData.userInfo.name,
        remark:remark,
        replaced_SN:that.data.replaced_SN
      }
      request.request_get('/wxapi/create_instrument.hn', data, function (res) { 
        console.info('新建仪器回调', res)
        if (res) {
          if (res.success) {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
            })
            that.bindCreateInstrument();
          } else { 
            wx.showToast({
              icon:'none',
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
    //console.log("userInfo" + app.globalData.userInfo)
  },
  
  //新建仪器并返回
  bindCreateInstrument:function(e){
    this.data.SNArray.push(this.data.SN) //为了返回给创建工单页的SN一个数组格式的数据
    let pages = getCurrentPages(); 
    let prevPage = pages[pages.length - 3]; //获取上上个页面栈                          
    prevPage.setData({  
      SN: this.data.SNArray
    })
    console.log(this.data.SN)
    console.log(this.data.SNArray)
    wx.setStorage({
      key:'SN_key2',
      data:this.data.SNArray
    })
    //清除序列号选中状态缓存
    wx.removeStorage({
      key: 'SN_key',
      success (res) {
        console.log(res)
      }  
    })
    wx.navigateBack({
      delta: 2,
    })
   },
  
})