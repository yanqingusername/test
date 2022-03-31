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
    company_name: '',
    flag1: true,
    flag2: false,
    tips: '',
    name: '',
    phone: '',
    title: '选择转移目标客户',
    companyIndex: -1,
    dialogData: {},
    showDialog: false,
    instrument_name:'',
    SN:'',
    company_account:'',
    remark:'',
  },
  onLoad: function (options) {
    var that = this;

    this.setData({
      instrument_name:options.instrument_name,
      company_account:options.company_account,
    })

    if(options && options.SN){
      this.setData({
        SN: options.SN,
        remark: options.remark,
        old_SN: options.SN,
        old_remark: options.remark
      });
    }

    that.getCompanyList();
  },
  //确认转移弹框
  bindSubmit: function () {
    if(this.data.company_name){
      let dialogData = {
        title: "确认转移？",
        titles:  this.data.SN + " 转移至 " + this.data.company_name,
        cancel: "取消",
        sure: "确认"
      }
  
      this.setData({
        showDialog: true,
        dialogData: dialogData
      });
    }else {
      box.showToast('请选择转移目标客户');
    }
  },
  //取消
  bindCancel: function () {
    this.setData({
      companyIndex: -1,
      company_name: '',
      account: ''
    });
  },
  dialogCancel: function () {
    this.setData({
      companyIndex: -1,
      company_name: '',
      account: ''
    });
  },
  //确认转移
  dialogSure: function () {
    this.updateInstrumentInfo();
  },
  //获取客户列表
  getCompanyList: function () {
    var that = this;
    var data = {
      area_id: app.globalData.userInfo.area_id,
    }
    request.request_get('/OrderController/selectCustom.hn', data, function (res) {
      if (res) {
        if (res.success) {
          var list = res.msg;
          that.setData({
            list: list
          });
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

  //选中转移客户
  bindCheckCompany: function (e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
      account: e.currentTarget.dataset.account,
      company_name:e.currentTarget.dataset.name,
      address: e.currentTarget.dataset.address,
      locationName:e.currentTarget.dataset.locationname,
      companyIndex: index
    });
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
  updateInstrumentInfo(){
    let that = this;
    var paramData = {
      update_type: '1',
      company_account: that.data.company_account,
      company_account_new: that.data.account,
      instrument_name: that.data.instrument_name,
      instrument_SN: that.data.old_SN,
      instrument_SN_new: that.data.SN,
      instrument_attribute: that.data.old_remark,
      instrument_attribute_new: that.data.remark,
      name: app.globalData.userInfo.name,
      phone: app.globalData.userInfo.phone,
    }
    request.request_new_test('/instrument/supprot/updateInstrumentInfo.hn', paramData, function (res) { 
      if (res) {
        if (res.success) {
          wx.showToast({
            title: '转移成功',
            icon: 'success',
          })
          wx.navigateBack({
            delta: 1,
          });
        } else {
          // wx.showToast({
          //   icon:'none',
          //   title: res.msg,
          // })
          wx.showModal({
            title: '',
            content: res.msg,
            showCancel: false,
            confirmText: '确定',
            success: function (res) {
                if (res.confirm) {
                    
                }
            }
          })
        }
      }else{
        wx.showToast({
          title: '网络不稳定，请重试',
        })
      }
    })
  }
})