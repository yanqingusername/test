const app = getApp()
const box = require('../../utils/box.js')
const request = require('../../utils/request.js')
"use strict";

Page({
  data: {
    title: '服务信息记录',
    jsondata: '',
    show_flag1:true,
    show_flag2:false,
  },
  onLoad: function (options) {
    let that = this;
    if(options && options.jsondata){
      let jsondata = JSON.parse(options.jsondata);
      console.log(jsondata)
      this.setData({
        jsondata: jsondata
      });

      var query = wx.createSelectorQuery() 
            query.select('#schedule').boundingClientRect() 
            query.exec((ress) => { 
              that.setData({ 
                H: ress[0].height 
              });
            });
    }
  },
  // 预览图片
  previewImg: function (e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    //所有图片
    var img_arr = this.data.jsondata.scene_pic;
    wx.previewImage({
      //当前显示图片
      current: img_arr[index],
      //所有图片
      urls: img_arr
    })
  },
  //SN号显示全部
  showAll:function(){
    var that = this
    that.setData({
      show_flag1:false,
      show_flag2:true
    },()=>{
      let query = wx.createSelectorQuery() 
      query.select('#schedule').boundingClientRect() 
      query.exec((ress) => { 
        that.setData({ 
          H: ress[0].height 
        });
      });
    })
  },
})