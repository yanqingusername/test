// 查看手机号是否正确
function checkPhone(phone) {
  	var phoneReg = /^1\d{10}$/;
  	if (phone.length != 11) {
      	return false
  	} else if (!phoneReg.test(phone)) {
            return false
  	} else {
      	return true
  	}
}
// 支持7——11位数字联系方式
function checkContact(contact){
    var contactReg = /^\d{7,11}$/;
    if(!contactReg.test(contact)){
        return false
    }else{
        return true
    }
}
// 获取当前时间
function now_time(){
	var date = new Date();
	const year = date.getFullYear()
  	const month = date.getMonth() + 1
 	const day = date.getDate()
  	const hour = date.getHours()
  	const minute = date.getMinutes()
  	const second = date.getSeconds()
  	return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

// 元素是否在数组中
function isInArray(arr,value){
    for(var i = 0; i < arr.length; i++){
        if(value == arr[i].value){
			return true;
        }
    }
    return false;
}
const formatTime = date => {
	const year = date.getFullYear()
	const month = date.getMonth() + 1
	const day = date.getDate()
	const hour = date.getHours()
	const minute = date.getMinutes()
	const second = date.getSeconds()
	return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
	n = n.toString()
	return n[1] ? n : '0' + n
}

function http_get(controller, data, cb) {
    var url = apiurl + controller;
    wx.request({
        url: url,
        data: data,
        method: 'GET',
        success: function (res) {
            return typeof cb == "function" && cb(res.data)
        },
        fail: function (res) {
            wx.showModal({
                title: "提示",
                showCancel: false,
                content: '请求超时,请检查网络！',
                success: function () {
                    console.log('request networkTimeout')
                }
            })
            return typeof cb == "function" && cb(false)
        }
    })
}

// 设置 FormData 因小程序 request不能使用formatdata
function _setFormData (dic) {
	var form_data_str = "";
		for (var i in dic){
			form_data_str += 
				'\r\n--XXX' +
				'\r\nContent-Disposition: form-data; name="' + i + '"' +
				'\r\n' +
				'\r\n'+ dic[i];
		}
	form_data_str += "\r\n--XXX--";
	return form_data_str;
}
// 参数配置
//var apiurl = 'http://localhost:8080/flash20AppletBackend/OrderController'         // 本地测试
//var apiurl = 'http://47.95.207.149:8080/flash20AppletBackend/OrderController'    // 测试服务器
var apiurl = 'https://www.prohealth-wch.com:8443/flash20AppletBackend'    //正式服务器

function upload_file(controller, file, name, data, cb) {
    var url = apiurl + controller;
    // 对data中的数据进行encodeURI处理
    for(var a in data){
        data[a] = encodeURI(data[a]);
		}
		console.log(data)
		console.log(file)
    wx.uploadFile({
        url: url,
        filePath: file,
        name: name,
        formData: data,
        header:{"chartset":"utf-8"},
        success: function (res) {
            var data = JSON.parse(res.data)
            return typeof cb == "function" && cb(data)
        },
        fail: function (res) {
            wx.showModal({
                title: "提示",
                showCancel: false,
                content: '请求超时,请检查网络！',
                success: function () {
                    console.log('request networkTimeout')
                }
            })
            return typeof cb == "function" && cb(false)
        }
    })
}

function   upload (controller,file,name,data,cb ) {
    var that = this
    var url = apiurl + controller;
    for (var i = 0; i < file.length; i++) {
        if(file[i] == ""){
            continue
        }
      wx.uploadFile({
        url: url,
        filePath: file[i],
        name: name,
        formData: data,
        header:{"chartset":"utf-8"},
        success: function (res) {
          console.log(res)
          var data = JSON.parse(res.data)
          return typeof cb == "function" && cb(data)
        },
        fail: function (res) {
            wx.showModal({
                title: "提示",
                showCancel: false,
                content: '请求超时,请检查网络！',
                success: function () {
                    console.log('request networkTimeout')
                }
            })
            return typeof cb == "function" && cb(false)
        }
      })
    }

  }

//自定义弹框
function showToast(title,icon,duration) {
  var icon = arguments[1] ? arguments[1] : 'none';
  var duration = arguments[2] ? arguments[2] : 3000;
  wx.showToast({
      title: title,
      icon: icon,
      duration: duration,
      mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
  })
}
// 禁止输入表情或特殊字符
function checkInput(str){
    var reg = /[^a-zA-Z0-9\u4e00-\u9fa5\u3002\uff0c\uff1a\uff08\uff09\uff1f\u201c\u201d\u3001\uff01,/.!:()?_""—-]/g;
    str =  str.replace(reg,"");
    return str;
}
/*函数节流*/
function throttle(fn, interval) {
    var enterTime = 0;//触发的时间
    var gapTime = interval || 3000 ;//间隔时间，如果interval不传，则默认300ms
    return function() {
      var context = this;
      var backTime = new Date();//第一次函数return即触发的时间
      if (backTime - enterTime > gapTime) {
        fn.call(context,arguments);
        enterTime = backTime;//赋值给第一次触发的时间，这样就保存了第二次触发的时间
      }
    };
  }

module.exports = {
    checkPhone: checkPhone,
    checkContact: checkContact,
    now_time:now_time,
    isInArray:isInArray,
    formatTime: formatTime,
    http_get:http_get,
    showToast:showToast,
    upload_file:upload_file,
    upload:upload,
    checkInput:checkInput,
    throttle:throttle
}
