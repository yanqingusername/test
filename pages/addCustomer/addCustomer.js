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
    company_name:'',
    name:'',
    phone:'',
    submitState: true,
    account:'',
    create_person:'',
    areaList:[],
    areaIndex:0,
    area_name:'',
    area_id:''
    

  },
  onLoad: function (options) {
    var that = this;
    that.getAreaList();
  },
  bindSetData1:function(e){
    var str = e.detail.value;
    str = utils.checkInput(str);
    this.setData({
      company_name:str
    })
    this.checkSubmitStatus()
  },
  bindSetData2:function(e){
    var str = e.detail.value;
    str = utils.checkInput(str);
    this.setData({
      name:str
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
    if(this.data.company_name != '' && this.data.name != '' && this.data.phone != ''){
      this.setData({
        submitState: false
      })
    }else{
      this.setData({
        submitState: true
      })
    }
  },
  //获取大区列表
  getAreaList: function () {
    var that = this;
    var data = {}
    request.request_get('/wxapi/getAreaList.hn', data, function (res) {
      console.info('getAreaList回调', res)
      if (res) {
        if (res.success) {
          var areaList = res.area_id;
          var areaHead = {area_id:0,area_name:'请选择大区类型'};
          areaList.unshift(areaHead);
          that.setData({
            areaList: areaList,
          });
          console.log(res);
        //that.chooseCustomer(list[0].account)
        //that.searchChangeHandle(); 首次展示无需模糊查询
        } else {
          box.showToast(res.msg);
        }
      }else{
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  //所属大区change事件
  bindPickerChangeArea: function (e) {
    var that = this;
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      areaIndex: e.detail.value,
    // area_status: e.detail.value,
    //  areaList: that.data.areaList,
      area_name: that.data.areaList[e.detail.value].area_name,
      area_id: that.data.areaList[e.detail.value].area_id
    })
  },
  // 提交预约信息
  submit: function (e) {
    console.log(e)
    var that = this,
    objData = e.detail.value;
  
    var company_name = objData.company_name;
    var name = objData.name;
    var phone = objData.phone;
    that.setData({
      name: name,
      phone: phone
    })
    console.log("userInfo" + app.globalData.userInfo)
    console.log(company_name, name, phone);

    if (!utils.checkContact(phone)) {
      box.showToast("手机号格式不正确")
    }else if(that.data.area_id == '0'){
      box.showToast("请选择所属大区")
    }else{
      var data = {
        company_name: company_name,
        name: name,
        phone: phone,
        create_person:app.globalData.userInfo.name,
        area_id:that.data.area_id
      }
      request.request_get('/wxapi/CreateCompany.hn', data, function (res) { 
        console.info('CreateCompany回调', res)
        if (res) {
          if (res.success) {
            that.setData({
              account: res.company_account
            })
            wx.showToast({
              title: '保存成功',
              icon: 'success',
            })
            that.bindCreateCompany();
          } else {
            wx.showToast({
              icon: 'none',
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
  
  //新建客户并返回
  bindCreateCompany:function(){
    var that = this;
    console.log(that.data.account)
    console.log
    let pages = getCurrentPages(); 
    let prevPage = pages[pages.length - 3]; //获取上上个页面栈                          
    prevPage.setData({  
      company_name: that.data.company_name,
      account: that.data.account,
      name: that.data.name,
      phone: that.data.phone
    })
    
    wx.navigateBack({
      delta: 2, //返回上上个页面
      })
   }
})