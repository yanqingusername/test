// pages/problemDescription/problemDescription.js
const utils = require('../../utils/utils.js')
Page({

  /**
   * Page initial data
   */
  data: {
    count:0,
    description:'',
    img_arr:[]
  },

  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    var that = this
    wx.getStorage({//获取本地缓存
      key:"key",
      success:function(res){
        console.log(res.data)
        that.setData({
          img_arr:res.data
        });
      }})   

      wx.getStorage({//获取本地缓存
        key:"key_question_desc",
        success:function(res){
          console.log(res.data)
          that.setData({
            description:res.data
          });
          if(that.data.description.length <= 300){
            that.setData({
              count:that.data.description.length
            })
          }else{
            that.setData({
              count:300
            })
          }
        }}) 
        
          console.log(that.data.description)
          console.log(that.data.description.length)
    console.log(options)
  },

textareaAInput:function(e){
  if(e){
    var str = e.detail.value;
    str = utils.checkInput(str);
    if(str.length <= 300){
      this.setData({
        description:str,
        count:str.length
      })
    }else{
      this.setData({
        description:str,
        count:300
      })
    }
  }
},
submit:function(e){
  var that = this
  wx.setStorage({
    key:"key",
    data:that.data.img_arr
  })
  wx.setStorage({
    key:"key_question_desc",
    data:that.data.description
  })
  let pages = getCurrentPages();
  let prevPages = pages[pages.length - 2];
  prevPages.setData({
    question_desc:that.data.description,
    img_arr:that.data.img_arr
  })

  wx.navigateBack({
    delta: 1,
  })
},
//上传图片
  upimg: function () {
    var that = this;
    var data = [];
    if (that.data.img_arr.length < 10) {
      wx.chooseImage({
        count:9-that.data.img_arr.length,
        sizeType: ['original', 'compressed'],
        success: function (res) {
          console.log(res.tempFilePaths)
          console.log(res.tempFilePaths.length)
          var filePath = res.tempFilePaths;
          for (var i = 0; i < filePath.length; i++) {
            wx.uploadFile({
              //url: 'https://8.130.48.31:8080/flash20AppletBackend/OrderController/upload.hn',  // 测试服务器  孙仕豪
              //url: 'https://scldev.coyotebio-lab.com:8443/flash20AppletBackend/OrderController/upload.hn',  // 测试服务器  孙仕豪
              //url : 'http://ygldev.coyotebio-lab.com/flash20AppletBackend/OrderController/upload.hn',  // 测试服务器  于光良
              //url: 'https://8.130.25.5/flash20AppletBackend/OrderController/upload.hn',   // 宋彦睿
              //url: 'https://syrdev.coyotebio-lab.com/flash20AppletBackend/OrderController/upload.hn',   // 宋彦睿
              url: 'https://www.prohealth-wch.com:8443/flash20AppletBackend/OrderController/upload.hn', //正式服务器
              //url: 'http://localhost:8080/flash20AppletBackend/OrderController/upload.hn',// 本地测试
              filePath: filePath[i],
              name: 'imageFile',
              formData: data,
              header: {
                "chartset": "utf-8"
              },
              success: function (returnRes) {
                console.log(returnRes)
                var data = JSON.parse(returnRes.data)
                console.log(data.msg)
                var imgList = [];
                var imgArr = that.data.img_arr;
                for (var i = 0; i < imgArr.length; i++) {
                  imgList.push(imgArr[i])
                }
                imgList.push(data.msg)
                that.setData({
                  img_arr: imgList
                })
                console.log("imgList=" + imgList)
              },
            })
          }
        }
      })
    } else {
      wx.showToast({
        title: '最多上传九张图片',
        icon: 'loading',
        duration: 3000
      });
    }
  },
  // 删除图片
  delImg(e) { //删除图片
    let that = this;
    console.log('点击删除图片===>', e);
    let index = e.currentTarget.dataset.index;
    let imgList = that.data.img_arr;
    wx.showModal({
      title: '提示',
      content: '删除该图片？',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          imgList.splice(index, 1);
          that.setData({
            img_arr: imgList
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
          console.log(that.data.img_arr)
        }
      }
    })
  },
   // 预览图片
  previewImg: function (e) {
    //获取当前图片的下标
    var index = e.currentTarget.dataset.index;
    //所有图片
    var img_arr = this.data.img_arr;
    wx.previewImage({
      //当前显示图片
      current: img_arr[index],
      //所有图片
      urls: img_arr
    })
  },
  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {
    var that = this
   
    // wx.getStorage({//获取本地缓存
    //   key:"key_question_desc",
    //   success:function(res){
    //     console.log(res.data)
    //     that.setData({
    //       description:res.data
    //     });
    //     if(that.data.description.length <= 300){
    //       that.setData({
    //         count:that.data.description.length
    //       })
    //     }else{
    //       that.setData({
    //         count:300
    //       })
    //     }
    //   }}) 
      
    //     console.log(that.data.description)
    //     console.log(that.data.description.length)
  }

})