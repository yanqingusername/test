const app = getApp()
const box = require('../../utils/box.js')
const request = require('../../utils/request.js')
const utils = require('../../utils/utils.js')
const time = require('../../utils/time.js')
"use strict";
const chooseLocation = requirePlugin('chooseLocation');

Page({
  data: {
    searchText: '', //搜索框的值
    instrument_name:'',
    SNlist: [],       //序列号列表（未模糊查询）
    SNlistPlus:[],    
    company_account:'',
    flag1:true,
    flag2:false,
    tips:'',
    sn:[],
    sn_count:'0',
    isAll:false
    //flagCheck:false //false 不显示添加仪器  true 显示添加仪器
  },
  onLoad: function (options) {
    console.log(options);
    console.log(options.account)
    var that = this;
    
    that.setData({
      company_account: options.account,
      instrument_name: options.instrument_name
    })
    that.getSNList();
  },
  //添加仪器
  bindAddInstrument: function(){
    wx.navigateTo({
      url: '../addInstrument/addInstrument?instrument_name=' + this.data.instrument_name +'&company_account=' + this.data.company_account
    })
  },
  //获取序列号列表
  getSNList: function () {
    var that = this;
    var data = {
      company_account: that.data.company_account,
      instrument_name: that.data.instrument_name
    }
    console.log(that.data.company_account)
    console.log(that.data.instrument_name)
    request.request_get('/wxapi/getinstrumentSN.hn', data, function (res) {
      console.info('getSNList回调', res)
      if (res) {
        if (res.success) {
          var getSNList = res.result;
          that.setData({
            SNlist: getSNList
          });
          if(that.data.SNlist.length == 0){
            that.setData({
              tips: '请添加仪器',
             // flagCheck: true
            });
          }
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
  //利用js进行模糊查询
  searchChangeHandle: function(e) {
    this.setData({
      searchText: e.detail.value
    })
    console.log("input-----"+e.detail.value)
    var value = e.detail.value;
    var that = this;
    var SNlist = that.data.SNlist;
    var SNlistPlus = that.data.SNlistPlus
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
          tips:''
        })
        var arr = [];
        for (var i = 0; i < SNlist.length; i++) {
          if (SNlist[i].instrument_SN.indexOf(value) >= 0) {
            SNlist[i].checked = false;
            arr.push(SNlist[i]);
          }
        }
        console.log(arr);
        that.setData({
          SNlistPlus: arr
        });
        if(that.data.SNlistPlus.length == 0){
          that.setData({
            tips: '没有搜索到该序列号',
          //  flagCheck: true
          });
        }
      //}
    }
    }, 
    //选中序列号并返回
    bindCheckSN:function(e){
      let pages = getCurrentPages(); 
      let prevPage = pages[pages.length - 2];                           
      prevPage.setData({  
        replaced_SN: e.currentTarget.dataset.sn
      })
      wx.navigateBack({
        delta: 1, 
      })
    },
    // 输入框有文字时，点击X清除
    clearSearchHandle() {
    // console.log('hereeeeee')
      this.setData({
          searchText: '',
          tips: ''
      })
      var that = this;
      that.setData({
        flag1: true,   //显示原始列表
        flag2: false   //关闭查询列表
      })
     // that.getCompanyList();
    }
})
