const app = getApp()
const box = require('../../utils/box.js')
const request = require('../../utils/request.js')
const utils = require('../../utils/utils.js')
const time = require('../../utils/time.js')
"use strict";
const chooseLocation = requirePlugin('chooseLocation');

Page({
  data: {
    searchText: '', //搜索框的值
    instrument_name:'',
    SNlist: [],       //序列号列表（未模糊查询）
    SNlistPlus:[],    
    company_account:'',
    flag1:true,
    flag2:false,
    tips:'',
    sn:[],
    sn_count:'0',
    SN_count:0, //重新进入时计匹配个数
    isAll:false,
    flag_checkAll:false
    //flagCheck:false //false 不显示添加仪器  true 显示添加仪器
  },
  onLoad: function (options) {
    // wx.hideKeyboard();
    console.log(options);
    console.log(options.account)
    var that = this;
    wx.getStorage({//获取本地缓存
      key:"SN_key",
      success:function(res){
        console.log(res.data)
        that.setData({
          sn:res.data
        });
        console.log(that.data.sn)
      }})
      wx.getStorage({//获取本地缓存
        key:"SN_key2",
        success:function(res){
          console.log(res.data)
          that.setData({
            sn:res.data
          });
          console.log(that.data.sn)
        }})
      console.log(that.data.sn)
    that.setData({
      company_account: options.account,
      instrument_name: options.instrument_name
    })
    that.getSNList();
  },
  //添加仪器
  bindAddInstrument: function(){
    wx.navigateTo({
      url: '../addInstrument/addInstrument?instrument_name=' + this.data.instrument_name +'&company_account=' + this.data.company_account
    })
  },
  //获取序列号列表
  getSNList: function () {
    var that = this;
    var data = {
      company_account: that.data.company_account,
      instrument_name: that.data.instrument_name
    }
    console.log(that.data.company_account)
    console.log(that.data.instrument_name)
    request.request_get('/wxapi/getinstrumentSN.hn', data, function (res) {
      console.info('getSNList回调', res)
      if (res) {
        if (res.success) {
          var getSNList = res.result;
          that.setData({
            SNlist: getSNList
          });
          console.log(that.data.SNlist)
          console.log(that.data.sn)
          if(that.data.SNlist.length == 0){
            that.setData({
              tips: '暂无绑定该客户的该类型仪器',
            });
          }
          // sn  = "缓存数组中的值"
          // SNlist = "拿到的数据"
           for (let i = 0; i < that.data.SNlist.length; i++) {
            for (let j = 0; j < that.data.sn.length; j++) {
              if(that.data.SNlist[i].instrument_SN == that.data.sn[j]){
                  console.log("完美匹配");
                  that.data.SNlist[i].checked = true;
                  that.data.SN_count++
              }else{
                  console.log("没有匹配到");
              }
            }
          }
            if(that.data.SN_count == that.data.SNlist.length){
              that.setData({
                isAll:true
              })
            }
            that.setData({
              SNlist: that.data.SNlist,
              sn_count:that.data.SN_count
            })
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
  //利用js进行模糊查询
  searchChangeHandle: function(e) {
    var that = this
    this.setData({
      searchText: e.detail.value
    })
    console.log("input-----"+that.data.searchText)
    var value = e.detail.value;
    var that = this;
    var SNlist = that.data.SNlist;
    var SNlistPlus = that.data.SNlistPlus
    if (value == '' || value == null) {
      console.log('搜索框已经清空了')
      that.setData({
      flag1: true,
      flag2: false,
      tips: ''
      })
    } else {
       //  if (e.detail.cursor) { //e.detail.cursor表示input值当前焦点所在的位置
        var that = this;
        that.setData({
          flag1: false,
          flag2: true,
          tips:''
        })
        var arr = [];
        for (var i = 0; i < SNlist.length; i++) {
          if (SNlist[i].instrument_SN.indexOf(value) >= 0) {
            SNlist[i].checked = false;
            arr.push(SNlist[i]);
          }
        }
        console.log(arr);
        that.setData({
          SNlistPlus: arr
        });
        
        if(that.data.SNlistPlus.length == 0){
          that.setData({
            tips: '没有搜索到该序列号',
          //  flagCheck: true
          });
        }
    }
  },
    //全选 全不选
    checkAll:function(){
      var that = this
      var array = []
      if(that.data.flag1 == true && that.data.flag2 == false){
        console.log("我在这11111")
        for(var i = 0; i <that.data.SNlist.length; i++){  
          that.data.SNlist[i].checked = (!that.data.isAll)
          console.log(that.data.SNlist[i])
          console.log(that.data.SNlist[i].instrument_SN)
          if (that.data.SNlist[i].checked == true) {
            array = array.concat(that.data.SNlist[i].instrument_SN) //字符串数组
          }
        }
      }else if(that.data.flag1 == false && that.data.flag2 == true){
        console.log("我在这22222")
        for(var i = 0; i <that.data.SNlistPlus.length; i++){
          that.data.SNlistPlus[i].checked = (!that.data.isAll)
          if (that.data.SNlistPlus[i].checked == true) {
            array = array.concat(that.data.SNlistPlus[i].instrument_SN)
          }
        }
      }
      that.setData({
        isAll:!that.data.isAll,
        sn:array,
        SNlist: that.data.SNlist,
        SNlistPlus: that.data.SNlistPlus
      })

      if(that.data.isAll == true){
        if(that.data.flag1 == true && that.data.flag2 == false){
          that.setData({
            sn_count:that.data.SNlist.length
          })
        }else if(that.data.flag1 == false && that.data.flag2 == true){
          that.setData({
            sn_count:that.data.SNlistPlus.length
          })
        }
      }else{
        that.setData({
          sn_count:0
        })
      }
      if(that.data.SNlist.length != 0){
        console.log('that.data.SNlist[0].checked='+that.data.SNlist[0].checked)
      }
      console.log('that.data.isAll='+that.data.isAll)
      console.log('that.data.sn.length='+that.data.sn.length)
      console.log(typeof that.data.sn)
      console.log('选中值为：' + that.data.sn)
    },
      
    
    //选中复选框
    checkboxChange:function(e){
      var that = this
      that.setData({
        sn: e.detail.value,
        sn_count:e.detail.value.length
      })

      console.log(that.data.sn.length)
      console.log(typeof that.data.sn)
      console.log('选中值为：' + e.detail.value)
      console.log('111111为：' + that.data.sn)
      console.log('2222222为：' + this.data.sn)

      if(that.data.flag1 == true && that.data.flag2 == false){
        if(that.data.sn.length == that.data.SNlist.length){
          that.setData({
            isAll:true
          })
        }else{
          that.setData({
            isAll:false
          })
        }
      }else if(that.data.flag1 == false && that.data.flag2 == true){
        if(that.data.sn.length == that.data.SNlistPlus.length){
          that.setData({
            isAll:true
          })
        }else{
          that.setData({
            isAll:false
          })
        }
      }
    },
  //确认序列号并返回
  bindCheckSN:function(e){
    // console.log(e.currentTarget.dataset.name)
    var that = this
      let pages = getCurrentPages(); 
      let prevPage = pages[pages.length - 2];   
      console.log(typeof this.data.sn)                        
      prevPage.setData({  
        SN: this.data.sn,
      })
      wx.setStorage({
        key:'SN_key',
        data:this.data.sn
      })
      //清除序列号选中状态缓存2
     wx.removeStorage({
      key: 'SN_key2',
      success (res) {
        console.log(res)
      }  
    })
      console.log(this.data.sn)
      wx.navigateBack({
        delta: 1,
      })
   },
    // 输入框有文字时，点击X清除
    clearSearchHandle() {
    // console.log('hereeeeee')
      this.setData({
          searchText: '',
          tips: ''
      })
      var that = this;
      that.setData({
        flag1: true,   //显示原始列表
        flag2: false   //关闭查询列表
      })
    },
  onShow: function () {
    // wx.hideKeyboard();
    var that = this;
    console.log(that.data.sn)
  },
})
