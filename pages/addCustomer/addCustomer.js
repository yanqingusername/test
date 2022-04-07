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
    company_name:'',
    name:'',
    phone:'',
    submitState: true,
    account:'',
    create_person:'',
    areaList:[],
    areaIndex:0,
    area_name:'',
    area_id:'',
    title: '添加客户',
    address: "",
    locationName: "",
    isMCus: 0, // 判断是否从客户管理带过来的参数  默认为0  1代表从客户管理跳转过来  2代表从客户管理-客户详情跳转过来  3GPS管理过来
    company_account: '',
    phone_old: '',
    name_old: '',
    showDialog: false,
    dialogData: {},
  },
  onLoad: function (options) {
    var that = this;
    this.setData({
      isMCus: options.isMCus,
      title: options.title,
    });

    if(options && options.jsondata && this.data.isMCus == 2){
      let jsondata = JSON.parse(options.jsondata)
      this.setData({
        address: jsondata.address,
        area_id: jsondata.area_id,
        company_account: jsondata.company_account,
        company_name: jsondata.company_name,
        locationName: jsondata.locationName,
        name: jsondata.name,
        phone: jsondata.phone,
        phone_old: jsondata.phone,
        name_old: jsondata.name,
      });
    }

    that.getAreaList();
  },
  bindSetData1:function(e){
    var str = e.detail.value;
    str = utils.checkInput(str);
    this.setData({
      company_name:str
    })
    this.checkSubmitStatus()
  },
  bindSetData2:function(e){
    var str = e.detail.value;
    str = utils.checkInputName(str);
    this.setData({
      name:str
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
  //获取大区列表
  getAreaList: function () {
    var that = this;
    var data = {}
    request.request_get('/wxapi/getAreaList.hn', data, function (res) {
      console.info('getAreaList回调', res)
      if (res) {
        if (res.success) {
          var areaList = res.area_id;
          var areaHead = {area_id:0,area_name:'请选择大区类型'};
          areaList.unshift(areaHead);
          that.setData({
            areaList: areaList,
          });
          console.log(res);
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
  //所属大区change事件
  bindPickerChangeArea: function (e) {
    var that = this;
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      areaIndex: e.detail.value,
    // area_status: e.detail.value,
    //  areaList: that.data.areaList,
      area_name: that.data.areaList[e.detail.value].area_name,
      area_id: that.data.areaList[e.detail.value].area_id
    })
  },
  // 提交预约信息
  submitBut: utils.throttle(function (e) {
    console.log(e)
    var that = this;
    // objData = e.detail.value;
  
    var company_name = that.data.company_name;
    var name = that.data.name;
    var phone = that.data.phone;
    that.setData({
      name: name,
      phone: phone
    })
    console.log("userInfo" + app.globalData.userInfo)
    console.log(company_name, name, phone);

    if (!utils.checkContact(phone)) {
      box.showToast("手机号格式不正确")
    }else if(that.data.area_id == '0'){
      box.showToast("请选择所属大区")
    }else{
      if(that.data.isMCus == 3){
        let data = {
          company_name: company_name,
          name: name,
          phone: phone,
          create_person:app.globalData.userInfo.name,
          area_id:that.data.area_id,
          address: that.data.address,
          locationName: that.data.locationName,
        }
        request.request_get('/instrument/supprot/addCompanyInfo.hn', data, function (res) { 
          console.info('CreateCompany回调', res)
          if (res) {
            if (res.success) {
              that.setData({
                account: res.company_account
              })
              wx.showToast({
                title: '保存成功',
                icon: 'success',
              })
              wx.navigateBack({
                delta: 1, //返回上个页面
              });
            } else {
              wx.showToast({
                icon: 'none',
                title: res.msg,
              })
            }
          }else{
            wx.showToast({
              title: '网络不稳定，请重试',
            })
          }
        })
      } else if(that.data.isMCus == 1){
        var params = {
          company_name: company_name,
          name: name,
          phone: phone,
          create_person:app.globalData.userInfo.name,
          area_id:that.data.area_id,
          address: that.data.address,
          locationName: that.data.locationName,
        }
        request.request_new_test('/instrument/supprot/addCompanyInfo.hn', params, function (res) { 
          if (res) {
            if (res.success) {
              that.setData({
                account: res.company_account
              });
              wx.showToast({
                title: '保存成功',
                icon: 'success',
              })
              wx.navigateBack({
                delta: 1, //返回上个页面
              });
            } else {
              wx.showToast({
                icon: 'none',
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

        var paramdata = {
          company_name: that.data.company_name,
          name: that.data.name,
          phone: that.data.phone,
          create_person:app.globalData.userInfo.name,
          area_id: that.data.area_id,
          address: that.data.address,
          locationName: that.data.locationName,
          company_account: that.data.company_account,
          phone_old: that.data.phone_old,
          name_old: that.data.name_old,
        }
        request.request_new_test('/instrument/supprot/updateCompanyInfo.hn', paramdata, function (res) { 
          if (res) {
            if (res.success) {
              wx.showToast({
                title: '保存成功',
                icon: 'success',
              })
              wx.navigateBack({
                delta: 1, //返回上个页面
              });
            } else {
              wx.showToast({
                icon: 'none',
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
          company_name: company_name,
          name: name,
          phone: phone,
          create_person:app.globalData.userInfo.name,
          area_id:that.data.area_id,
          address: that.data.address,
          locationName: that.data.locationName,
          
        }
        request.request_new_test('/instrument/supprot/addCompanyInfo.hn', data, function (res) { 
          console.info('CreateCompany回调', res)
          if (res) {
            if (res.success) {
              that.setData({
                account: res.company_account
              })
              wx.showToast({
                title: '保存成功',
                icon: 'success',
              })
              that.bindCreateCompany();
            } else {
              wx.showToast({
                icon: 'none',
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
  },2000),
  
  //新建客户并返回
  bindCreateCompany:function(){
    var that = this;
    console.log(that.data.account)
    console.log
    let pages = getCurrentPages(); 
    let prevPage = pages[pages.length - 3]; //获取上上个页面栈                          
    prevPage.setData({  
      company_name: that.data.company_name,
      account: that.data.account,
      name: that.data.name,
      phone: that.data.phone,
      address: that.data.address,
      locationName: that.data.locationName,
    })
    
    wx.navigateBack({
      delta: 2, //返回上上个页面
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
        let address = location.address;
        let area_id = 0;
        for(let i = 0; i< this.data.areaList.length;i++){
          let item = this.data.areaList[i]
          if(address.indexOf(item.area_name) >= 0){
            area_id = item.area_id;
          }
        }
        this.setData({
          address: location.address ? location.address : "",// 所在地区
          locationName: location.name ? location.name : "",  // 详细地址
          area_id: area_id
        });
        this.checkSubmitStatus()
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
    this.checkSubmitStatus()
  },
  // 编辑
  editBut: utils.throttle(function (e) {
    let that = this;
    let paramdata = {
      company_account: this.data.company_account
    }
    request.request_new_test('/instrument/supprot/checkCompanyOrder.hn', paramdata, function (res) { 
      if (res) {
        if (res.success) {
          that.setEdit();
        } else {
          if(res.exist_order == 0){
            that.setData({
              showDialog: true,
              dialogData: {
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
  dialogCancel(){
   this.setData({
    showDialog: false
   });
 },
 dialogSure(){
   this.setData({
    showDialog: false
   });
   this.setEdit();
 },
 setEdit(){
  var that = this;
  
  var company_name = that.data.company_name;
  var name = that.data.name;
  var phone = that.data.phone;
  that.setData({
    name: name,
    phone: phone
  })
  console.log("userInfo" + app.globalData.userInfo)
  console.log(company_name, name, phone);

  if (!utils.checkContact(phone)) {
    box.showToast("手机号格式不正确")
  }else if(that.data.area_id == '0'){
    box.showToast("请选择所属大区")
  }else{
    
      var paramdata = {
        company_name: that.data.company_name,
        name: that.data.name,
        phone: that.data.phone,
        create_person:app.globalData.userInfo.name,
        area_id: that.data.area_id,
        address: that.data.address,
        locationName: that.data.locationName,
        company_account: that.data.company_account,
        phone_old: that.data.phone_old,
        name_old: that.data.name_old,
      }
      request.request_new_test('/instrument/supprot/updateCompanyInfo.hn', paramdata, function (res) { 
        if (res) {
          if (res.success) {
            wx.showToast({
              title: '保存成功',
              icon: 'success',
            })
            wx.navigateBack({
              delta: 1, //返回上个页面
            });
          } else {
            wx.showToast({
              icon: 'none',
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
})