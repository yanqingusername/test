const app = getApp()
const box = require('../../utils/box.js')
const request = require('../../utils/request.js')
"use strict";

Page({
  data: {
    searchText: '', //搜索框的值
    list: [], //客户列表,客户id（未模糊查询）
    listPlus: [],
    account: '',
    flag1: true,
    flag2: false,
    tips: '',
    title: '仪器',
    companyIndex: -1,
    dialogData: {
      title: "确认解绑GPS?",
      titles:  "解绑后将无法恢复",
      cancel: "取消",
      sure: "确认"
    },
    showDialog: false,
    company_account:'',
    instrumentsn: '',
    instrument_name: ''
  },
  onLoad: function (options) {
    var that = this;

    this.setData({
      company_account:options.company_account,
    })
  },
  onShow(){
    this.getCompanyAllInstrument();
  },
  //获取仪器列表
  getCompanyAllInstrument: function () {
    var that = this;
    var data = {
      company_account: that.data.company_account
    }
    request.request_new_test('/position/instrument/getCompanyAllInstrument.hn', data, function (res) {
      if (res) {
        if (res.success) {
          var list = res.result_instrument;
          that.setData({
            list: list
          });

          if (that.data.list.length == 0) {
            that.setData({
              tips: '还没有仪器'
            });
          }
        } else {
          if (res && res.result_instrument.length == 0) {
            that.setData({
              tips: '还没有仪器'
            });
          } else {
            box.showToast(res.msg);
          }
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
        if (list[i].instrument_SN.indexOf(value) >= 0 || list[i].position_SN.indexOf(value) >= 0) {
          arr.push(list[i]);
        }
      }
      console.log(arr);
      that.setData({
        listPlus: arr
      });

      if (that.data.listPlus.length == 0) {
        that.setData({
          tips: '没有搜索到相关结果'
        });
      }
      //}
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
  //选中绑定GPS
  bindCheckGPS: function (e) {
    let instrumentsn = e.currentTarget.dataset.instrumentsn;
    if(instrumentsn){
      wx.navigateTo({
        url: `/pages/gpsBind/index?instrumentsn=${instrumentsn}`
      });
    }
  },
  //解绑GPS
  UniteCheckGPS: function (e) {
    this.setData({
      instrumentsn: e.currentTarget.dataset.instrumentsn,
      showDialog: true
    });
  },
  dialogCancel: function () {
    this.setData({
      showDialog: false
    });
  },
  //确认解绑GPS
  dialogSure: function () {
    this.setData({
      showDialog: false
    });
    this.unbindInstrumentPositionSN();
  },
  unbindInstrumentPositionSN(){
    let that = this;
    var paramData = {
      instrument_SN: that.data.instrumentsn
    }
    request.request_new_test('/position/instrument/unbindInstrumentPositionSN.hn', paramData, function (res) { 
      if (res) {
        if (res.success) {
          wx.showToast({
            title: '解绑成功',
            icon: 'success',
          })
          that.setData({
            searchText: '',
            tips: '',
            flag1: true, //显示原始列表
            flag2: false //关闭查询列表
          })
          that.getCompanyAllInstrument();
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
  },
  //添加仪器
  bindAddInstrument: function(){
    var that = this;
    that.setData({
      searchText: '',
      tips: '',
      flag1: true, //显示原始列表
      flag2: false //关闭查询列表
    });
    wx.navigateTo({
      url: `/pages/addInstrument/addInstrument?instrument_name=${this.data.instrument_name}&company_account=${this.data.company_account}&isMCus=3`
    });
  },
})