const app = getApp()
const box = require('../../utils/box.js')
const request = require('../../utils/request.js')
const utils = require('../../utils/utils.js')
const time = require('../../utils/time.js')
"use strict";
const chooseLocation = requirePlugin('chooseLocation');

Page({
  data: {
    company_name: "",
    address: "",
    locationName: "",
    name: "",
    phone: "",
    flag: true,
    submitState: true,
    title:'添加客户'
  },
  onLoad: function (options) {
    
  },
  bindSetData:function(e){
    let typestring = e.currentTarget.dataset.typestring;
    this.setData({
      [typestring]:e.detail.value
    });
    this.checkSubmitStatus()
  },
  //保存按钮禁用判断
  checkSubmitStatus: function(e){
    if(this.data.company_name != '' && this.data.name != '' && this.data.phone != '' && this.data.address != '' && this.data.locationName != ''){
      this.setData({
        submitState: false
      })
    }else{
      this.setData({
        submitState: true
      })
    }
  },
  // 保存信息
  submit: function (e) {
    console.log(e)
    var that = this,
    objData = e.detail.value;
    var SN = objData.SN;
    var remark = objData.remark;

    if(remark == '请选择设备属性'){
      remark = '';
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
      wx.showToast({
        icon:'none',
        title: '请输入正确的序列号',
      })
    } else {
      var data = {
        instrument_sn: SN,
        instrument_name: that.data.instrument_name,
        company_account: that.data.company_account,
        create_person: app.globalData.userInfo.name,
        remark:remark,
        replaced_SN:that.data.replaced_SN
      }
      request.request_get('/wxapi/create_instrument.hn', data, function (res) { 
        console.info('新建仪器回调', res)
        if (res) {
          if (res.success) {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
            })
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
    //console.log("userInfo" + app.globalData.userInfo)
  },
  
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
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    //  console.log("*****------------")
      if(this.data.flag == false){
      const location = chooseLocation.getLocation();
      if (location) {
        this.setData({
          address: location.address ? location.address : "",// 所在地区
          locationName: location.name ? location.name : ""  // 详细地址
        });
      }
    }
    },
    onUnload () {
      // 页面卸载时设置插件选点数据为null，防止再次进入页面，geLocation返回的是上次选点结果
      chooseLocation.setLocation(null);
    },
   /**
    * 显示地图
    */
  showMap() {
    var that = this
    that.setData({
      flag: false
    })
    //使用在腾讯位置服务申请的key（必填）
    const key = "2SSBZ-BKXKX-FT447-T6O5S-DE3ZV-CIF5L";
    //调用插件的app的名称（必填）
    const referer = "闪测技术支持";
    wx.navigateTo({
      url: 'plugin://chooseLocation/index?key=' + key + '&referer=' + referer
    });
  },
  //自定义详细地址
  updateLocation:function(e){
    console.log(e.detail.value)
  
    var str = e.detail.value;
    str = utils.checkInput(str);
    this.setData({
      locationName: str
    })
  },
})