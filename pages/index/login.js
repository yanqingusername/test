const app = getApp()
var box = require('../../utils/box.js')
var utils = require('../../utils/utils.js')
var request = require('../../utils/request.js')
var login = require('../../utils/login.js')

Page({
    data: {        
        codeBtText: "获取验证码",
        codeBtState: false,
        currentTime: 60,
        phone: "",
        phoneCode: ["", ""], //正确的 手机号 和 验证码
    },

    phoneInput: function (e) {
        var that = this;
        that.setData({
            phone: e.detail.value,
        })
    },

    //***定义60，减少赋值次数
    //******************获取验证码按钮**********************
    getCode: function () {
        var that = this;
        var phone = that.data.phone;
        var currentTime = that.data.currentTime;
        console.log("需要获取验证码的手机号" + phone);
        if (that.data.codeBtState) {
            console.log("还未到达时间");
        } else {
            if (phone == '') {
                box.showToast("请填写手机号")
            } else if (!utils.checkPhone(phone)) {
                box.showToast("手机号有误")
            } else {
                //倒计时,不管验证码发送成功与否，都进入倒计时，防止多次点击造成验证码发送失败**************************
                that.setData({
                    codeBtState: true
                })
                var interval = setInterval(function () {
                    currentTime--;
                    that.setData({
                        codeBtText: currentTime + 's'
                    })
                    if (currentTime <= 0) {
                        clearInterval(interval)
                        that.setData({
                            codeBtText: '重新发送',
                            currentTime: 60,
                            codeBtState: false,
                        })
                    }
                }, 1000);
                
                // 服务器发送验证码***********************
                request.request_get('/support/Verification.hn', { phone: phone }, function (res) {
                    console.info('回调', res)
                    if(res){
                        if(res.success){
                            console.log('验证码发送成功，获取的验证码' + res.code);
                            that.setData({ phoneCode: [phone, res.code] });
                        }else{
                            box.showToast("验证码发送失败");
                        }
                    }
                })
            }
        }
    },

    //************登录*******************
    login: function (e) {
        var that = this, objData = e.detail.value;
        var phone = objData.phone;
        var code = objData.code;
        var phoneCode = that.data.phoneCode;
        console.log('手机号、验证码：',  phone, code);
        
        //***  直接返回 
        // 测试账号登录，免验证码
        if(phone == '13120916260' ){
            login.toLogin(phone); 
            return    
        }else if(phone == '13678901238' ){
            login.toLogin(phone); 
            return    
        }else{
             if(phone == ''){
                box.showToast("请填写手机号");
                return
            }else if(!utils.checkPhone(phone)){
                box.showToast("手机号有误")
                return
            }else if(code == ''){
                box.showToast("请填写验证码");
                return
            }else if(phoneCode[0] == ""){
                //进入这里说明未点击获取验证码
                box.showToast("请获取验证码")
                //box.showToast("验证码错误")
                return
            }else if(phoneCode[0] != phone){
                box.showToast("验证码过期")
                return
            }else if (phoneCode[1] != code) {
                box.showToast("验证码错误")
                return
            }else{
                login.toLogin(phone);     
            }
        }
    }
})
