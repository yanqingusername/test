const app = getApp()
const box = require('../../utils/box.js')
const request = require('../../utils/request.js')
const utils = require('../../utils/utils.js')
const time = require('../../utils/time.js')
"use strict";
const chooseLocation = requirePlugin('chooseLocation');

Page({
  data: {
    nameList:[],
    account:'',
    tips:''
  },
  onLoad: function (options) {
    var that = this;
    console.log(options.account)
    that.setData({
      account: options.account
    })
    that.bindChooseCustodian(); // 获取该公司的联系人列表
  },
  //选中联系人并返回
  bindCheckName:function(e){
    console.log(e.currentTarget.dataset.name)
    console.log(e.currentTarget.dataset.phone)
    let pages = getCurrentPages(); 
    let prevPage = pages[pages.length - 2];                           
    prevPage.setData({  
      name: e.currentTarget.dataset.name,
      phone: e.currentTarget.dataset.phone
    })
    wx.navigateBack({
      delta: 1, 
      })
   },
  //获取该公司的联系人列表
  bindChooseCustodian: function () {
    var that = this;
    console.log(this.data.account)
    var data = {
      "account": this.data.account
    }
    request.request_get('/support/getCustomer.hn', data, function (res) {
      console.info('getNameList', res)
      if (res) {
        if (res.success) {
          var nameList = res.msg;
          that.setData({
            nameList: nameList
          });
          if(nameList.length == 0){
            that.setData({
              tips:'暂无绑定该客户的联系人'
            })
          }
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  //添加联系人
  bindAddCustodian: function(){
    wx.navigateTo({
      url: '../addCustodian/addCustodian?account=' + this.data.account,
    })
  },
  
})