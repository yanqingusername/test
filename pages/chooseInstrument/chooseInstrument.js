
const box = require('../../utils/box.js')
const request = require('../../utils/request.js')
const utils = require('../../utils/utils.js')
"use strict";


Page({
  data: {
    instrumentList: [],
    tips:'',
    instrument_name:'',
    flag_1:true,
    instrument_name_temp:''
  },
  onLoad: function (options) {
    var that = this;
    console.log(options) 
    that.setData({
      instrument_name: options.instrument_name
    })
    that.getInstrumentList();
  },
  //获取仪器类型列表
  getInstrumentList: function () {
    var that = this;
    var data = {}
    request.request_get('/wxapi/getinstrumentName.hn', data, function (res) {
      console.info('getInstrumentList回调', res)
      if (res) {
        if (res.success) {
          var instrumentList = res.result;
          var other = {instrument_name:'其他'}
          instrumentList.push(other)
          that.setData({
            instrumentList: instrumentList,
          });
           // sn  = "缓存数组中的值"
          // SNlist = "拿到的数据"
          for (let i = 0; i < that.data.instrumentList.length; i++) {
            if(that.data.instrumentList[i].instrument_name == that.data.instrument_name){
                console.log("完美匹配");
                that.data.instrumentList[i].checked = true;
            }else{
                console.log("没有匹配到");
            }     
          }
          that.setData({
            instrumentList: instrumentList,
          });
        } else {
          box.showToast(res.msg);
        }
      }else{
        box.showToast("网络不稳定，请重试");
      }
    })
  },
  textareaAInput:function(e){
    var str = e.detail.value;
    str = utils.checkInput(str);
    this.setData({
      instrument_name_temp:str
    })
    wx.onMemoryWarning(function () {
      console.log('onMemoryWarningReceive')
    })
  },
  //选中仪器
  radioChange:function(e){
    var that = this;
    console.log(e)
    that.setData({
      instrument_name:e.detail.value
    })
    console.log(that.data.instrument_name)
    if(that.data.instrument_name == '其他'){
      that.setData({
        flag_1:false
      })
    }else{
      that.setData({
        flag_1:true
      })
    }
   },
   
  //完成按钮
  bindBack:function(e){
    var that = this;
    let pages = getCurrentPages(); 
    let prevPage = pages[pages.length - 2];  
    if(this.data.instrument_name == '其他'){   
      if(this.data.instrument_name_temp == ''){
        wx.showToast({
          icon:'none',
          title: '请填写仪器类型名称'
        })
        return;
      }else{   // 选择其他，且输入有效内容
          if(prevPage.data.instrument_name != that.data.instrument_name_temp){
            prevPage.setData({  
              SN:[],
            })
            //清除序列号选中状态缓存
           wx.removeStorage({
            key: 'SN_key',
            success (res) {
              console.log(res)
            }  
          })
          //清除序列号选中状态缓存2
          wx.removeStorage({
            key: 'SN_key2',
            success (res) {
              console.log(res)
            }  
          })
          }    
          prevPage.setData({  
            instrument_name: this.data.instrument_name_temp
          })
          // wx.navigateBack({
          //   delta: 1,  // 返回上一级页面
          //   })
      } 
    }else{ //未选中其他
      if(prevPage.data.instrument_name != that.data.instrument_name){
        prevPage.setData({  
          SN:[],
        })
        //清除序列号选中状态缓存
       wx.removeStorage({
        key: 'SN_key',
        success (res) {
          console.log(res)
        }  
        })
        //清除序列号选中状态缓存2
        wx.removeStorage({
          key: 'SN_key2',
          success (res) {
            console.log(res)
          }  
        })
      }
      prevPage.setData({  
          instrument_name: this.data.instrument_name
      })
    }
    wx.navigateBack({
      delta: 1,  // 返回上一级页面
      })
    }
 
})
