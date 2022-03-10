const app = getApp()
const box = require('../../utils/box.js')
const request = require('../../utils/request.js')
"use strict";

Page({
  data: {
    service_result:[],
    title: '设备信息修改记录',
    instrumentsn: '',
  },
  onLoad: function (options) {
    this.setData({
      instrumentsn: options.instrumentsn
    });

    this.getServiceRecordInfo();

  },
  getServiceRecordInfo: function () {
    var that = this;
    var data = {
      "instrument_SN": this.data.instrumentsn
    }
    request.request_new_test('/instrument/supprot/getInstrumentServiceRecordInfo.hn', data, function (res) {
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
          // if(service_result.length == 0){
          //   that.setData({
          //     tips:'暂无设备信息修改记录'
          //   })
          // }
        } else {
            that.setData({
              tips:res.msg
            })
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
    })
  },
})