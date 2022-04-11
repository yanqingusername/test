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
    replaced_SN:'',
    isMCus: 0, // 默认为0  1-则代表从客户详情设备信息跳转页面(添加仪器) 2-则代表从客户详情设备信息跳转页面(编辑仪器)  3-GPS管理过来
    title: '添加仪器',
    // remarkList: [
    //   {"reagent_name":'请选择设备属性'},
    //   {"reagent_name":'自有'},
    //   {"reagent_name":'备用机'},
    //   {"reagent_name":'试用机'},
    //   {"reagent_name":'投放机'},
    //   {"reagent_name":'新机'}
    // ],
    remarkList: [
      {instrument_attribute_id:"0",instrument_attribute_name:'请选择设备属性'}
    ],
    remarkIndex: 0,
    old_SN:'',
    old_remark:'',
    showDialog: false,
    dialogData: {
      title: "确认删除？",
      titles:  "删除后数据将无法恢复",
      cancel: "取消",
      sure: "确认"
    },
    showEditDialog: false,
    dialogEditData: {},
    showDeleteDialog: false,
    dialogDeleteData: {},
  },
  onLoad: function (options) {
    this.setData({
      instrument_name:options.instrument_name,
      company_account:options.company_account,
      isMCus: options.isMCus,
      title: options.title || '添加仪器'
    })

    if(options && options.SN){
      // let remarkIndex = 0;
      // if(options.remark){
      //   for(let i=0;i<this.data.remarkList.length;i++){
      //     let reagent_name = this.data.remarkList[i].instrument_attribute_name;
      //     if(options.remark == reagent_name){
      //       remarkIndex = i;
      //     }
      //   }
      // }
      this.setData({
        SN: options.SN,
        remark: options.remark,
        old_SN: options.SN,
        old_remark: options.remark
      },()=>{
        this.checkSubmitStatus()
      });
    }
  },
  onShow(){
    this.getInstrumentAttributeList();
  },
  getInstrumentAttributeList(){
    let that = this;
    let data = {}
    request.request_new_test('/instrument/supprot/getInstrumentAttributeList.hn', data, function (res) { 
      if (res) {
        if (res.success) {
          // var remarkList = res.result;
          // var remarkListHead = {instrument_attribute_id:"0",instrument_attribute_name:'请选择设备属性'};
          // remarkList.unshift(remarkListHead);
          // that.setData({
          //   remarkList: remarkList
          // });

          var remarkList = that.data.remarkList.concat(res.result);
          that.setData({
            remarkList: remarkList
          });

          if(that.data.remark){
            let remarkIndex = 0;
              for(let i=0;i<that.data.remarkList.length;i++){
                let reagent_name = that.data.remarkList[i].instrument_attribute_name;
                if(that.data.remark == reagent_name){
                  remarkIndex = i;
                }
              }
              that.setData({
                remarkIndex: remarkIndex
              });
          }
        } else { 
          box.showToast(res.msg)
        }
      }else{
        box.showToast('网络不稳定，请重试')
      }
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
    if(this.data.instrument_name != '' && this.data.SN != ''){
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
  submitBut: utils.throttle(function (e) {
    console.log(e)
    var that = this;
    // objData = e.detail.value;
    var SN = that.data.SN;
    let remark = this.data.remark;

    if(remark == '请选择设备属性' || remark == ''){
      // remark = '';
      box.showToast('请选择设备属性');
      return;
    }

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
      box.showToast('请输入正确的序列号')
    } else {

      // 根据isMCus来判断
      if(that.data.isMCus == 3){
        // 3-则代表从GPS跳转页面(添加仪器) 

        var params = {
          instrument_sn: SN,
          instrument_name: that.data.instrument_name,
          company_account: that.data.company_account,
          create_person: app.globalData.userInfo.name,
          phone: app.globalData.userInfo.phone,
          remark:remark,
          replaced_SN:that.data.replaced_SN
        }
        request.request_get('/wxapi/create_instrument.hn', params, function (res) { 
          console.info('新建仪器回调', res)
          if (res) {
            if (res.success) {
              box.showToast('保存成功',"",1000)
              setTimeout(()=>{
                wx.navigateBack({
                  delta: 1
                });
              },1200)
            } else { 
              box.showToast(res.msg)
            }
          }else{
            box.showToast('网络不稳定，请重试')
          }
        })

      } else if(that.data.isMCus == 1){
        // 1-则代表从客户详情设备信息跳转页面(添加仪器) 

        var params = {
          instrument_sn: SN,
          instrument_name: that.data.instrument_name,
          company_account: that.data.company_account,
          create_person: app.globalData.userInfo.name,
          phone: app.globalData.userInfo.phone,
          remark:remark,
          replaced_SN:that.data.replaced_SN
        }
        request.request_get('/wxapi/create_instrument.hn', params, function (res) { 
          console.info('新建仪器回调', res)
          if (res) {
            if (res.success) {
              box.showToast('保存成功',"",1000)
              setTimeout(()=>{
                wx.navigateBack({
                  delta: 1
                });
              },1200)
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

      } else if(that.data.isMCus == 2){
        // 2-则代表从客户详情设备信息跳转页面(编辑仪器)
        var paramData = {
          update_type: '0',
          company_account: that.data.company_account,
          instrument_name: that.data.instrument_name,
          instrument_SN: that.data.old_SN,
          instrument_SN_new: SN,
          instrument_attribute: that.data.old_remark,
          instrument_attribute_new: remark,
          name: app.globalData.userInfo.name,
          phone: app.globalData.userInfo.phone,
        }
        request.request_new_test('/instrument/supprot/updateInstrumentInfo.hn', paramData, function (res) { 
          if (res) {
            if (res.success) {
              box.showToast('编辑成功',"",1000)
              setTimeout(()=>{
                wx.navigateBack({
                  delta: 1
                });
              },1200)
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

      } else {
        var data = {
          instrument_sn: SN,
          instrument_name: that.data.instrument_name,
          company_account: that.data.company_account,
          create_person: app.globalData.userInfo.name,
          phone: app.globalData.userInfo.phone,
          remark:remark,
          replaced_SN:that.data.replaced_SN
        }
        request.request_get('/wxapi/create_instrument.hn', data, function (res) { 
          console.info('新建仪器回调', res)
          if (res) {
            if (res.success) {
              box.showToast('保存成功',"",1000)
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
    }     
    //console.log("userInfo" + app.globalData.userInfo)
  },2000),
  
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
   /**
    * 客户详情设备信息跳转页面(添加仪器)
    */
   bindAddType(){
     wx.navigateTo({
       url: `/pages/chooseInstrument/chooseInstrument?instrument_name=${this.data.instrument_name}`
     });
   },
   /**
    * GPS跳转页面(添加仪器)
    */
    bindAddTypeGPS(){
      wx.navigateTo({
        url: `/pages/chooseInstrument/chooseInstrument?instrument_name=${this.data.instrument_name}&isMCus=3`
      });
    },
   /**
    * 由原来的备注 ---> 设备属性
    */
   bindSelectrRemark: function (e) {
    var that = this;
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      remarkIndex: e.detail.value,
      remark: that.data.remarkList[e.detail.value].instrument_attribute_name
    })
  },
  bindShowDialog: utils.throttle(function (e) {
    let that = this;
    let paramdata = {
      company_account: that.data.company_account,
      instrument_name: that.data.instrument_name,
      instrument_SN: that.data.old_SN,
    }
    request.request_new_test('/instrument/supprot/checkInstrumentOrder.hn', paramdata, function (res) { 
      if (res) {
        if (res.success) {
          that.setData({
            showDialog: true
           });
        } else {
          if(res.exist_order == 0){
            that.setData({
              showDeleteDialog: true,
              dialogDeleteData: {
                title: "确认删除且数据无法恢复？",
                titles:  res.msg,
                cancel: "取消",
                sure: "确认"
              },
            });
          }else{
            box.showToast(res.msg)
          }
        }
      }else{
        wx.showToast({
          title: '网络不稳定，请重试',
        })
      }
    })
   },2000),
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
   let paramData = {
      company_account: that.data.company_account,
      instrument_name: that.data.instrument_name,
      instrument_SN: that.data.old_SN,
      instrument_SN_new: that.data.SN,
      instrument_attribute: that.data.old_remark,
      instrument_attribute_new: that.data.remark,
      name: app.globalData.userInfo.name,
      phone: app.globalData.userInfo.phone,
   }
   request.request_new_test('/instrument/supprot/deleteInstrumentInfo.hn', paramData, function (res) { 
     if (res) {
       if (res.success) {
        box.showToast('删除成功',"",1000)
        setTimeout(()=>{
          wx.navigateBack({
            delta: 1
          });
        },1200)
       } else {
        box.showToast(res.msg)
       }
     }else{
        box.showToast('网络不稳定，请重试')
     }
   });
  },
   // 编辑
   editBut: utils.throttle(function (e) {
    let that = this;
    let paramdata = {
      company_account: that.data.company_account,
      instrument_name: that.data.instrument_name,
      instrument_SN: that.data.old_SN,
    }
    request.request_new_test('/instrument/supprot/checkInstrumentOrder.hn', paramdata, function (res) { 
      if (res) {
        if (res.success) {
          that.setEdit();
        } else {
          if(res.exist_order == 0){
            that.setData({
              showEditDialog: true,
              dialogEditData: {
                title: "确认修改？",
                titles:  res.msg,
                cancel: "取消",
                sure: "确认"
              },
            });
          }else{
            box.showToast(res.msg)
          }
        }
      }else{
        wx.showToast({
          title: '网络不稳定，请重试',
        })
      }
    })
  },2000),
  dialogEditCancel(){
   this.setData({
    showEditDialog: false
   });
 },
 dialogEditSure(){
   this.setData({
    showEditDialog: false
   });
   this.setEdit();
 },
 // 编辑
  setEdit(){
    console.log(e)
    var that = this;
    // objData = e.detail.value;
    var SN = that.data.SN;
    let remark = this.data.remark;

    if(remark == '请选择设备属性' || remark == ''){
      // remark = '';
      box.showToast('请选择设备属性');
      return;
    }

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
      box.showToast('请输入正确的序列号')
    } else {
      // 2-则代表从客户详情设备信息跳转页面(编辑仪器)
      var paramData = {
        update_type: '0',
        company_account: that.data.company_account,
        instrument_name: that.data.instrument_name,
        instrument_SN: that.data.old_SN,
        instrument_SN_new: SN,
        instrument_attribute: that.data.old_remark,
        instrument_attribute_new: remark,
        name: app.globalData.userInfo.name,
        phone: app.globalData.userInfo.phone,
      }
      request.request_new_test('/instrument/supprot/updateInstrumentInfo.hn', paramData, function (res) { 
        if (res) {
          if (res.success) {
            box.showToast('编辑成功',"",1000)
            setTimeout(()=>{
              wx.navigateBack({
                delta: 1
              });
            },1200)
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
  },
  dialogDeleteCancel(){
   this.setData({
    showDeleteDialog: false
   });
 },
 dialogDeleteSure(){
   this.setData({
    showDeleteDialog: false
   });
   this.deleteCompanyContactInfo();
 },
  
})