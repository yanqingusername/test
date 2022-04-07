const app = getApp();
const box = require('../../utils/box.js');
const request = require('../../utils/request.js');
"use strict";

Page({
  data: {
    account:'',
    instrument_name:'',
    dialogData: {
      title: "确认转移？",
      titles:  "12244444111 转移至 阿克苏市人民医院",
      cancel: "取消",
      sure: "确认"
    },
    showDialog: false,
    isShow: false, // 编辑仪器选择弹框
    company_result: [],
    recordInfoList: [],
    nameList: [],
    instrument_result_status: [],
    instrument_result_delete: [],

    instrumentsn: '', // 编辑仪器号
    instrumentname: '', // 编辑仪器类型
    remark: '', // 编辑仪器设备类型
  },
  onLoad: function (options) {
    this.setData({
      account: options.account
    });
  },
  onShow(){
    this.getCustodian();
    this.getAllCompanyInfo();
    
    this.getAllRepaireRecordInfo();
  },
  getAllCompanyInfo: function () {
    var that = this;
    var data = {
      "company_account": this.data.account
    }
    request.request_new_test('/instrument/supprot/getAllCompanyInfo.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          that.setData({
            company_result: res.company_result
          });

          if(res && res.instrument_result && res.instrument_result.length > 0){
            let listData = [];
            let listDataDelete = [];
            for(let i = 0; i < res.instrument_result.length;i++){
              let item = res.instrument_result[i];
              if(item.status == 0){
                listData.push(item);
              }else if(item.status == 1){
                listDataDelete.push(item);
              }
            }
            that.setData({
              instrument_result_status: listData,
              instrument_result_delete: listDataDelete
            });
          }else{
            that.setData({
              instrument_result_status: [],
              instrument_result_delete: []
            });
          }
        } else {
          box.showToast(res.msg);
        }
      }
    })
  },
  //获取该公司的联系人列表
  getCustodian: function () {
    var that = this;
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
  getAllRepaireRecordInfo: function () {
    var that = this;
    var data = {
      "company_account": this.data.account
    }
    request.request_new_test('/instrument/supprot/getAllRepaireRecordInfo.hn', data, function (res) {
      console.info('回调', res)
      if (res) {
        if (res.success) {
          that.setData({
             recordInfoList: res.result
          });
        } else {
          // box.showToast(res.msg);
        }
      }
    })
  },
  /**
   * 添加联系人
   */
  bindAddCustodian(){
    wx.navigateTo({
      url: `/pages/addCustodian/addCustodian?account=${this.data.account}&isMCus=1`,
    });
  },
  /**
   * 编辑联系人
   */
  bindUpdateCustodian(e){
    let name = e.currentTarget.dataset.name;
    let phone = e.currentTarget.dataset.phone;
    if(name && phone){
      wx.navigateTo({
        url: `/pages/addCustodian/addCustodian?account=${this.data.account}&isMCus=2&title=编辑联系人&name=${name}&phone=${phone}`,
      });
    }
  },
  //添加仪器
  bindAddInstrument: function(){
    wx.navigateTo({
      url: `/pages/addInstrument/addInstrument?instrument_name=${this.data.instrument_name}&company_account=${this.data.account}&isMCus=1`
    })
  },
  //查看记录
  bindTagLog(e){
    let instrumentsn = e.currentTarget.dataset.instrumentsn;
    if(instrumentsn){
      wx.navigateTo({
        url: `/pages/tagsLog/index?instrumentsn=${instrumentsn}`
      });
    }
  },
  //编辑仪器
  bindUpdateInstrument: function(e){
    let instrumentsn = e.currentTarget.dataset.instrumentsn;
    let instrumentname = e.currentTarget.dataset.instrumentname;
    let remark = e.currentTarget.dataset.remark;
    this.setData({
      instrumentsn: instrumentsn,
      instrumentname: instrumentname,
      remark: remark
    });

    this.setData({
      isShow: true
    });
  },
  /**
    * 编辑仪器选择
    */
  hidePicker: function (e) {
    this.setData({
      isShow: false
    });
  },
  onConfirm: function (e) {
    let indexNumber = e.detail
    let SN = this.data.instrumentsn;
    let remark = this.data.remark;
    let instrument_name = this.data.instrumentname;
    // 跳转编辑仪器页面
    if(indexNumber == 1){
      wx.navigateTo({
        url: `/pages/addInstrument/addInstrument?instrument_name=${instrument_name}&company_account=${this.data.account}&isMCus=2&title=编辑仪器信息&SN=${SN}&remark=${remark}`
      })
    } else if(indexNumber == 2){
      // 跳转转移仪器页面
      wx.navigateTo({
        url: `/pages/manageCustomer/index?instrument_name=${instrument_name}&company_account=${this.data.account}&SN=${SN}&remark=${remark}`
      });
    }
    

    this.setData({
      isShow: false
    });
  },
  /**
   * 编辑客户信息
   */
  bindManageUpdateInstrument(e){
    let item = e.currentTarget.dataset.item;
    item.company_account = this.data.account;
    let jsondata = JSON.stringify(item);
    console.log(item)

    wx.navigateTo({
      url: `/pages/addCustomer/addCustomer?isMCus=2&title=编辑客户信息&jsondata=${jsondata}`,
    })
    // wx.navigateTo({
    //   url: `/pages/manageAddInstrument/index`,
    // });
  },
  dialogCancel() {
    this.setData({
      showDialog: false
    });
  },
  dialogSure() {
    this.setData({
      showDialog: false
    });
  },
  /**
   * 服务记录
   */
  bindRecordInfo(e){
    // let item = e.currentTarget.dataset.item;
    // let jsondata = JSON.stringify(item)
    // wx.navigateTo({
    //   url: `/pages/recordInfoLog/index?jsondata=${jsondata}`
    // });
    let id = e.currentTarget.dataset.id;
    if(id){
      wx.navigateTo({
        url: `/pages/recordInfo/index?id=${id}`
      });
    }
  }
})
