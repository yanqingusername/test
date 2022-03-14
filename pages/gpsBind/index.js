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
    old_positionsn:'',
    bind_GPS_img:'',
    instrument_sn_img:'',
    position_sn_img:'',
    instrument_sn_List: [],
    position_sn_List:[],
    position_sn_img_old:'',
    isShowInstrument: false,
    isShowPosition: false,
    noinstrumentsn: '',
    nopositionsn: '',
    instrumentSNLength: 12
  },
  onLoad: function (options) {
    this.setData({
      instrumentsn: options.instrumentsn
    });
    this.getInstrumentSNLength();
  },
  getInstrumentSNLength: function () {
    var that = this;
    var params = {}
    request.request_new_test('/instrument/supprot/getInstrumentSNLength.hn', params, function (res) {
      if (res) {
        if (res.success) {
          that.setData({
            instrumentSNLength: res.length
          });
        } else {
          box.showToast(res.msg);
        }
      } else {
        box.showToast("网络不稳定，请重试");
      }
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
    var data = [];
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

            var numberListNew = [];
            var reg = /[^a-z\d]/ig;
            for(let i =0;i< that.data.numberList.length;i++){
              let item = that.data.numberList[i];
              console.log(item.line_content,item.line_content.length)
              if(item.line_content!= null && item.line_content != ""){
                item.line_content = item.line_content.replace(reg, "")
                if(item.line_content.length >= that.data.instrumentSNLength){
                  numberListNew.push(item);
                }
              }  
            }
            that.setData({
              numberList: numberListNew,
              position_sn_List: numberListNew,
            });
          },
          fail: function (res) {
            console.log(res)
          },
        });

        wx.uploadFile({
          url: 'https://www.prohealth-wch.com:8443/flash20AppletBackend/OrderController/upload.hn', //正式服务器
          filePath: tempFilePaths,
          name: 'imageFile',
          formData: data,
          header: {
            "chartset": "utf-8"
          },
          success: function (returnRes) {
            console.log(returnRes)
            var data = JSON.parse(returnRes.data)
            console.log(data.msg)
            that.setData({
              position_sn_img_old: data.msg
            });
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
    if(this.data.companyIndex == -1 || this.data.old_positionsn == ''){
      box.showToast("请选择 GPS SN号");
    } else {
      this.setData({
        isShow: false,
        positionsn: this.data.old_positionsn,
        position_sn_img: this.data.position_sn_img_old
      });
    }
  },
  //隐藏遮罩
  hideCover() {
    this.setData({
      isShow: false,
      old_positionsn: '',
      companyIndex: -1
    });
  },
  bindImg: function () {
    var that = this;
    var data = [];
      wx.chooseImage({
        count:1,
        sizeType: ['original', 'compressed'],
        success: function (res) {
          var filePath = res.tempFilePaths[0];
            wx.uploadFile({
              url: 'https://www.prohealth-wch.com:8443/flash20AppletBackend/OrderController/upload.hn', //正式服务器
              filePath: filePath,
              name: 'imageFile',
              formData: data,
              header: {
                "chartset": "utf-8"
              },
              success: function (returnRes) {
                console.log(returnRes)
                var data = JSON.parse(returnRes.data)
                console.log(data.msg)
                that.setData({
                  bind_GPS_img: data.msg
                });
              },
            })
        }
      })
  },
  bindImg1: function () {
    var that = this;
    var data = [];
      wx.chooseImage({
        count:1,
        sizeType: ['original', 'compressed'],
        success: function (res) {
          var filePath = res.tempFilePaths[0];
            wx.uploadFile({
              url: 'https://www.prohealth-wch.com:8443/flash20AppletBackend/OrderController/upload.hn', //正式服务器
              filePath: filePath,
              name: 'imageFile',
              formData: data,
              header: {
                "chartset": "utf-8"
              },
              success: function (returnRes) {
                console.log(returnRes)
                var data = JSON.parse(returnRes.data)
                console.log(data.msg)
                that.setData({
                  instrument_sn_img: data.msg
                });
              },
            })

            wx.uploadFile({
              //请求后台的路径
              //https://api-cn.faceplusplus.com/imagepp/v2/generalocr
              url: 'https://api-cn.faceplusplus.com/imagepp/v2/generalocr',
              //小程序本地的路径
              filePath: filePath,
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
                  instrument_sn_List: obj.text_info
                });

                var inListNew = [];
                var reg = /[^a-z\d]/ig;
                for(let i =0;i< that.data.instrument_sn_List.length;i++){
                  let item = that.data.instrument_sn_List[i];
                  console.log(item.line_content,item.line_content.length)
                  if(item.line_content!= null && item.line_content != ""){
                    item.line_content = item.line_content.replace(reg, "")
                    if(item.line_content.length >= that.data.instrumentSNLength){
                      inListNew.push(item);
                    }
                  }  
                }
                that.setData({
                  instrument_sn_List: inListNew
                });

              },
              fail: function (res) {
                console.log(res)
              },
            })
        }
      })
  },
  bindImg2: function () {
    var that = this;
    var data = [];
      wx.chooseImage({
        count:1,
        sizeType: ['original', 'compressed'],
        success: function (res) {
          var filePath = res.tempFilePaths[0];
            wx.uploadFile({
              url: 'https://www.prohealth-wch.com:8443/flash20AppletBackend/OrderController/upload.hn', //正式服务器
              filePath: filePath,
              name: 'imageFile',
              formData: data,
              header: {
                "chartset": "utf-8"
              },
              success: function (returnRes) {
                console.log(returnRes)
                var data = JSON.parse(returnRes.data)
                console.log(data.msg)
                that.setData({
                  position_sn_img: data.msg
                });
              },
            })

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
                  position_sn_List: obj.text_info
                });

                var poListNew = [];
                var reg = /[^a-z\d]/ig;
                for(let i =0;i< that.data.position_sn_List.length;i++){
                  let item = that.data.position_sn_List[i];
                  console.log(item.line_content,item.line_content.length)
                  if(item.line_content!= null && item.line_content != ""){
                    item.line_content = item.line_content.replace(reg, "")
                    if(item.line_content.length >= that.data.instrumentSNLength){
                      poListNew.push(item);
                    }
                  }  
                }
                that.setData({
                  position_sn_List: poListNew
                });

              },
              fail: function (res) {
                console.log(res)
              },
            })
        }
      })
  },
  // 提交预约信息
  submit(e) {
    var that = this;
    
    if(that.data.bind_GPS_img == ''){
      box.showToast("请上传仪器、GPS合照")
      return
    }
    if(that.data.instrument_sn_img == ''){
      box.showToast("请上传仪器序列号")
      return
    }
    if(that.data.position_sn_img == ''){
      box.showToast("请上传GPS 序列号")
      return
    }

    let position_sn_List = that.data.position_sn_List;
    let positionsn = this.data.positionsn;
    let isTrue = false;
    let nopositionsn;
    for(let i =0;i< position_sn_List.length;i++){
      if (position_sn_List[i].line_content.indexOf(positionsn) >= 0) {
        isTrue = true;
      }else{
        nopositionsn = position_sn_List[i].line_content;
      }
    }
    if(!isTrue){
      this.setData({
        isShowPosition: true,
        nopositionsn: nopositionsn
      });
      return;
    }
   

    let instrument_sn_List = that.data.instrument_sn_List;
    let instrumentsn = this.data.instrumentsn;
    let isTrueInstrument = false;
    let noinstrumentsn;
    for(let i =0;i< instrument_sn_List.length;i++){
      if (instrument_sn_List[i].line_content.indexOf(instrumentsn) >= 0) {
        isTrueInstrument = true;
      }else{
        noinstrumentsn = instrument_sn_List[i].line_content;
      }
    }
    if(!isTrueInstrument){
      this.setData({
        isShowInstrument: true,
        noinstrumentsn: noinstrumentsn
      });
      return;
    }

    
    var re=/^[A-Za-z0-9]*$/;  
    if(that.data.positionsn == ''){
      box.showToast("请填写/扫描 GPS SN号")
    } else if (re.test(that.data.positionsn) == false) {
      box.showToast("请输入正确的序列号")
    } else {
      var data = {
        instrument_SN: that.data.instrumentsn,
        position_SN: that.data.positionsn,
        bind_GPS_img: that.data.bind_GPS_img,
        instrument_sn_img: that.data.instrument_sn_img,
        position_sn_img: that.data.position_sn_img
      }
      console.log('--->:',data)
      request.request_new_test('/position/instrument/bindInstrumentPositionSN.hn', data, function (res) { 
        if (res) {
          if (res.success) {
            box.showToast('绑定成功')
            wx.navigateBack({
              delta: 1
            });
          } else {
            box.showToast(res.msg)
          }
        }else{
          box.showToast('网络不稳定，请重试')
        }
      });
    }
  }
})