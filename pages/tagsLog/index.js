const app = getApp()
const box = require('../../utils/box.js')
const request = require('../../utils/request.js')
"use strict";

Page({
  data: {
    service_result:[
      {
        "title": '编辑仪器',
        "title4": '10:30',
        "title5": '10-11',
        "items": [
          {"title1": '设备属性：自有'},
          {"title1": '原设备属性：投放机'},
          {"title1": '修改人员：李四'},
        ]
      },
      {
        "title": '编辑仪器',
        "title4": '10:30',
        "title5": '10-11',
        "items": [
          {"title1": '设备属性：自有'},
          {"title1": '原设备属性：投放机'},
          {"title1": '修改人员：李四'},
        ]
      },
      {
        "title": '编辑仪器',
        "title4": '10:30',
        "title5": '10-11',
        "items": [
          {"title1": '设备属性：自有'},
          {"title1": '原设备属性：投放机'},
          {"title1": '修改人员：李四'},
        ]
      },
      {
        "title": '编辑仪器',
        "title4": '10:30',
        "title5": '10-11',
        "items": [
          {"title1": '设备属性：自有'},
          {"title1": '原设备属性：投放机'},
          {"title1": '修改人员：李四'},
        ]
      }
    ],
    title: '设备信息修改记录',
    instrumentsn: '',
    // service_result: []
  },
  onLoad: function (options) {
    this.setData({
      instrumentsn: options.instrumentsn
    });

    var that = this;
    var query = wx.createSelectorQuery() 
            query.select('#schedule').boundingClientRect() 
            query.exec((ress) => { 
              that.setData({ 
                H: ress[0].height 
              });
            });
    
    // this.getServiceRecordInfo();

  },
  getServiceRecordInfo: function () {
    var that = this;
    var data = {
      "instrument_SN": "233443333222222123444"  //this.data.instrumentsn
    }
    request.request_new_test('/instrument/supprot/getInstrumentServiceRecordInfo.hn', data, function (res) {
      console.info('getNameList', res)
      if (res) {
        if (res.success) {
          var service_result = res.service_result;
          that.setData({
            service_result: service_result
          });
          if(service_result.length > 0){
            var query = wx.createSelectorQuery() 
            query.select('#schedule').boundingClientRect() 
            query.exec((ress) => { 
              that.setData({ 
                H: ress[0].height 
              });
            });
          }
          if(service_result.length == 0){
            that.setData({
              tips:'暂无设备信息修改记录'
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
})