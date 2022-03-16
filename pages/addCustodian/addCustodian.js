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
    create_name:'',
    isMCus: 0, // 默认为0  1-则代表从客户详情联系人跳转页面(添加联系人) 2-则代表从客户详情联系人跳转页面(编辑联系人) 
    title: '添加联系人',
    old_phone:'', // 编辑联系人  保存之前的联系人电话
    showDialog: false,
    dialogData: {
      title: "确认删除？",
      titles:  "删除后数据将无法恢复",
      cancel: "取消",
      sure: "确认"
    },
    old_name: '',  // 编辑联系人  保存之前的联系人
  },
  onLoad: function (options) {
    var that = this;
    that.setData({
      account: options.account,
      isMCus: options.isMCus,
      title: options.title || '添加联系人'
    });

    if(options && options.name && options.phone){
      console.log(options.name)
      that.setData({
        name: options.name,
        phone: options.phone,
        old_phone: options.phone,
        old_name: options.name
      },()=>{
        this.checkSubmitStatus()
      });
    }

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
      if(that.data.isMCus == 2){
        let params = {
          company_account:account,
          name: name,
          phone: phone,
          old_phone:that.data.old_phone,
          old_name: this.data.old_name
        }
        request.request_new_test('/instrument/supprot/updateCompanyContactInfo.hn', params, function (res) { 
          console.info('createCustodian回调', res)
          if (res) {
            if (res.success) {
              box.showToast('保存成功')
              that.bindCreateCus();
            } else {
              box.showToast(res.msg)
            }
          }else{
            wx.showToast({
              title: '网络不稳定，请重试',
            })
          }
        })
      }else{
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
              box.showToast('保存成功')
              if(that.data.isMCus == 1){
                that.bindCreateCus();
              }else{
                that.bindCreateCustodian();
              }
            } else {
              box.showToast(res.msg)
            }
          }else{
            wx.showToast({
              title: '网络不稳定，请重试',
            })
          }
        })
      }
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
  
   },
   //1-则代表从客户详情联系人跳转页面(添加联系人) 2-则代表从客户详情联系人跳转页面(编辑联系人) 返回
   bindCreateCus(){
     wx.navigateBack({
       delete: 1
     });
   },
   bindShowDialog(){
     this.setData({
      showDialog: true
     });
   },
   dialogCancel(){
    this.setData({
     showDialog: false
    });
  },
  dialogSure(){
    this.setData({
     showDialog: false
    });
    this.deleteCompanyContactInfo();
  },
   deleteCompanyContactInfo(){
    let that = this;
    let params = {
      company_account:this.data.account,
      old_phone:this.data.old_phone,
      old_name: this.data.old_name
    }
    request.request_new_test('/instrument/supprot/deleteCompanyContactInfo.hn', params, function (res) { 
      if (res) {
        if (res.success) {
          box.showToast('删除成功')
          that.bindCreateCus();
        } else {
          box.showToast(res.msg)
        }
      }else{
        wx.showToast({
          title: '网络不稳定，请重试',
        });
      }
    });
   }
})