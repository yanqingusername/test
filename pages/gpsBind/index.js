const box = require('../../utils/box.js')
const request = require('../../utils/request.js')
"use strict";

Page({
  data: {
    instrumentsn:'',
    submitState: true,
    positionsn:'',
    numberList:[],
    companyIndex: -1,
    old_positionsn:''
  },
  onLoad: function (options) {
    this.setData({
      instrumentsn: options.instrumentsn
    });
  },
  bindSetData2:function(e){
    this.setData({
      positionsn:e.detail.value
    });
    this.checkSubmitStatus();
  },
  //保存按钮禁用判断
  checkSubmitStatus: function(e){
    if(this.data.positionsn != ''){
      this.setData({
        submitState: false
      })
    }else{
      this.setData({
        submitState: true
      })
    }
  },
  bindOCR: function () {
    let that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original'], //原图
      sourceType: ['album', 'camera'], //支持选取图片
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFilePaths = res.tempFilePaths[0];
        //上传图片
        wx.uploadFile({
          //请求后台的路径
          //https://api-cn.faceplusplus.com/imagepp/v2/generalocr
          url: 'https://api-cn.faceplusplus.com/imagepp/v2/generalocr',
          //小程序本地的路径
          filePath: tempFilePaths,
          //后台获取我们图片的key
          name: 'image_file',
          header: {
            "Content-Type": "multipart/form-data" //必须用此header
          },
          //额外的参数formData
          formData: {
            'api_key': 'gQfz-MnGIuRUbtzJK8wB_x1ZVEc45J0H', //请填写你创建的 apikey
            'api_secret': 'GNl9vID_5KjzzbG2UG51vswvYeb06vnu',
          },
          success: function (res) {
            //上传成功
            console.log(res)
            var obj = JSON.parse(res.data)
            console.log(obj.text_info)
            that.setData({
              isShow: true,
              numberList: obj.text_info
            });
          },
          fail: function (res) {
            console.log(res)
          },
        })
      }
    })
  },
  bindSelect(e){
    let linecontent = e.currentTarget.dataset.linecontent;
    let index = e.currentTarget.dataset.index;
    this.setData({
      old_positionsn: linecontent,
      companyIndex: index
    });
  },
  bindSure(e){
    this.setData({
      isShow: false,
      positionsn: this.data.old_positionsn
    });
  },
  // 提交预约信息
  submit(e) {
    var that = this;
    var re=/^[A-Za-z0-9]*$/;  
    if(that.data.positionsn == ''){
      box.showToast("请填写/扫描 GPS SN号")
    } else if (re.test(that.data.positionsn) == false) {
      box.showToast("请输入正确的序列号")
    } else {
      var data = {
        instrument_SN: that.data.instrumentsn,
        position_SN: that.data.positionsn,
      }
      console.log('--->:',data)
      request.request_new_test('/position/instrument/bindInstrumentPositionSN.hn', data, function (res) { 
        if (res) {
          if (res.success) {
            wx.showToast({
              title: '绑定成功',
              icon: 'success',
            })
            wx.navigateBack({
              delta: 1
            });
          } else {
            wx.showToast({
              title: res.msg,
            })
          }
        }else{
          wx.showToast({
            title: '网络不稳定，请重试',
          })
        }
      });
    }
  }
})