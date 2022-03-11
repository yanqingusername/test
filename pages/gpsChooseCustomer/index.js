const app = getApp()
const box = require('../../utils/box.js')
const request = require('../../utils/request.js')
const utils = require('../../utils/utils.js')
const time = require('../../utils/time.js')
"use strict";

Page({
  data: {
    searchText: '', //搜索框的值
    list: [], //客户列表,客户id（未模糊查询）
    listPlus: [],
    account: '',
    company_name: '',
    // companyIndex:0,
    flag1: true,
    flag2: false,
    tips: '',
    name: '',
    phone: '',
    title: '客户', // 判断是否从客户管理
  },
  onLoad: function (options) {

  },
  onShow() {
    this.getCompanyList();
  },
  //获取客户列表
  getCompanyList: function () {
    var that = this;
    console.log(app.globalData.userInfo.area_id)
    var data = {
      area_id: app.globalData.userInfo.area_id,
    }
    request.request_get('/OrderController/selectCustom.hn', data, function (res) {
      console.info('getCompanyList回调', res)
      if (res) {
        if (res.success) {
          var list = res.msg;
          that.setData({
            list: list
          });
          //that.chooseCustomer(list[0].account)
          //that.searchChangeHandle(); 首次展示无需模糊查询
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  //利用js进行模糊查询
  searchChangeHandle: function (e) {
    this.setData({
      searchText: e.detail.value
    })
    var value = e.detail.value;
    var that = this;
    var list = that.data.list;
    var listPlus = that.data.listPlus
    if (value == '' || value == null) {
      that.setData({
        flag1: true,
        flag2: false,
        tips: ''
      })
    } else {
      //  if (e.detail.cursor) { //e.detail.cursor表示input值当前焦点所在的位置
      var that = this;
      that.setData({
        flag1: false,
        flag2: true,
        tips: ''
      })
      var arr = [];
      for (var i = 0; i < list.length; i++) {
        if (list[i].company_name.indexOf(value) >= 0) {
          arr.push(list[i]);
        }
      }
      console.log(arr);
      that.setData({
        listPlus: arr
      });

      if (that.data.listPlus.length == 0) {
        that.setData({
          tips: '没有搜索到该客户'
        });
      }
      //}
    }
  },

  //选中客户
  bindCheckCompany: function (e) {
    let account = e.currentTarget.dataset.account;
    if (account) {
      wx.navigateTo({
        url: `/pages/gpsManageInstrument/index?company_account=${account}`
      });
    }

  },
  // 输入框有文字时，点击X清除
  clearSearchHandle() {
    this.setData({
      searchText: '',
      tips: ''
    })
    var that = this;
    that.setData({
      flag1: true, //显示原始列表
      flag2: false //关闭查询列表
    })
  },

})