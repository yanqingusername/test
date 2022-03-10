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
    list: [],       //客户列表,客户id（未模糊查询）
    listPlus:[],    
    account:'',
    company_name:'',
   // companyIndex:0,
    flag1:true,
    flag2:false,
    tips:'',
    name:'',
    phone:'',
    title: '选择客户', // 判断是否从客户管理
    isMCus: 0, // 判断是否从客户管理带过来的参数  默认为0  1代表从客户管理跳转过来
  },
  onLoad: function (options) {
    var that = this;

    this.setData({
      title: options.title,
      isMCus: options.isMCus
    });

    // that.getCompanyList();
  },
  onShow(){
    this.getCompanyList();

  },
  //添加客户
  bindAddCustomer: function(){
    wx.navigateTo({
      url: `/pages/addCustomer/addCustomer?isMCus=${this.data.isMCus}`,
    })
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
    console.log("input-----",e)
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
          tips:''
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
        
        if(that.data.listPlus.length == 0){
          that.setData({
            tips: '没有搜索到该客户'
          });
        }
      //}
    }
    },
  
  //选中客户并返回
  bindCheckCompany:function(e){
    if (this.data.isMCus == 1){
      let account = e.currentTarget.dataset.account;
      let company_name = e.currentTarget.dataset.company_name;
      let address = e.currentTarget.dataset.address;
      let locationname = e.currentTarget.dataset.locationname;
      if(account){
        wx.navigateTo({
          url: `/pages/detailCustomer/index?account=${account}`
        });
      }
    } else {
      var that = this;
      that.setData({
        account: e.currentTarget.dataset.account,
        company_name:e.currentTarget.dataset.name,
        address: e.currentTarget.dataset.address,
        locationName:e.currentTarget.dataset.locationname
      });
      that.bindChooseCustodianAndReturn();//根据account查联系人列表，返回第一个（写到page.data）。
    }
   },
   
   //获取该公司的联系人列表
  bindChooseCustodianAndReturn: function () {
    var that = this;
    console.log(that.data.account)
    console.log("i'm in here")
    var data = {
      account: that.data.account
    }
    request.request_get('/support/getCustomer.hn', data, function (res) {
      console.info('getNameList', res)
      if (res) {
        if (res.success) {
          var nameList = res.msg;
          if(nameList.length != 0){
            that.setData({
              nameList: nameList,
              name: nameList[0].name,
              phone: nameList[0].phone
            });
          }
         
          let pages = getCurrentPages(); 
          let prevPage = pages[pages.length - 2];       
          if(prevPage.data.company_name != that.data.company_name){
            prevPage.setData({  
              SN:[],
              instrument_name:''
            })
          }                
          prevPage.setData({  
            company_name: that.data.company_name,
            account: that.data.account,
            name:that.data.name,
            phone:that.data.phone,
            address:that.data.address,
            locationName:that.data.locationName
          })
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
  bindBack:function(e){
    let pages = getCurrentPages(); 
    let prevPage = pages[pages.length - 2];                           
    prevPage.setData({  
      id: this.data.orderInfo.id
    })
    wx.navigateBack({
      delta: 1,  // 返回上一级页面。
      success: function() {
          console.log('成功！')
      }
      })
    },
  
    // 输入框有文字时，点击X清除
    clearSearchHandle() {
      console.log('hereeeeee')
      this.setData({
          searchText: '',
          tips: ''
      })
      var that = this;
      that.setData({
        flag1: true,   //显示原始列表
        flag2: false   //关闭查询列表
      })
    },

})
