const app = getApp()
var box = require('../../utils/box.js')
var utils = require('../../utils/utils.js')
var request = require('../../utils/request.js')

Page({
    data: {
        roleList: ['技术支持', '管理员'],
        areaIndex: 0,
        areaName: "",
        roleIndex: 0,
        chooseArray: [],
        chooseList: [],
        area_ids: "",
        areaList: [],
        multiple: true
    },

    onLoad: function () {
        var that = this;
        that.getArea();
    },
    add: function (e) {
        var that = this,
            objData = e.detail.value;
        var name = objData.name;
        var phone = objData.phone;

        //var area = that.data.areaList[that.data.areaIndex];
        var area = that.data.area_ids;
        var role = that.data.roleIndex
        console.log('姓名、手机号、微信号：', name, phone, area, role);

        if (name == '') {
            box.showToast("请填写姓名");
            return
        } else if (phone == '') {
            box.showToast("请填写手机号");
            return
        } else if (!utils.checkPhone(phone)) {
            box.showToast("手机号有误")
            return
        } else if (area.length == 0) {
            box.showToast("请选择大区");
            return
        } else {
            var data = {
                name: name,
                phone: phone,
                role: role,
                area: area
            }
            request.request_get('/support/addSupport.hn', data, function (res) {
                console.info('回调', res)
                if (res) {
                    if (res.success) {
                        wx.showModal({
                            title: '成功',
                            content: '添加成功',
                            showCancel: false,
                            confirmText: '确定',
                            success: function (res) {
                                if (res.confirm) {
                                    wx.navigateBack();
                                }
                            }
                        })
                    } else {
                        box.showToast(res.msg);
                    }
                }else{
                    box.showToast("网络不稳定，请重试");
                  }
            })
        }
    },
    bindPickerChange: function (e) {
        console.log('bindPickerChange发送选择改变，携带值为', e.detail.value)
        this.setData({
            areaIndex: e.detail.value
        })
    },
    bindPickerChangeRole: function (e) {
        console.log('bindPickerChangeRole发送选择改变，携带值为', e.detail.value)
        this.setData({
            roleIndex: e.detail.value
        })
    },
    choose(e) {
        var that = this;
        var areaArray = that.data.chooseList;
        var chooseArray = e.detail.chooseArray;
        var areaName = "";

        for (var i = 0; i < chooseArray.length; i++) {
            for (var j = 0; j < areaArray.length; j++) {
                if (chooseArray[i] == areaArray[j].value) {
                    areaName += areaArray[j].name + ";"
                }
            }
        }
        console.log("areaName:" + areaName)
        this.setData({
            chooseArray: e.detail.chooseArray,
            areaName: areaName
        })
        console.log(this.data.chooseArray);
    },
    getArea: function () {
        var that = this;
        var data = {};
        request.request_get('/support/getArea.hn', data, function (res) {
            console.info('回调', res)
            if (res) {
                if (res.success) {

                    that.setData({
                        areaList: res.msg
                    })
                } else {
                    box.showToast(res.msg);
                }
            }else{
                box.showToast("网络不稳定，请重试");
              }
        })
    },
    // 选择SN号*******************
    hideModal(e) {
        this.setData({
            modalName: null
        })
    },

    chooseArea: function () {
        var that = this;
        var areaList = that.data.areaList;
        var chooseList = that.data.chooseList;
        for (var a in areaList) {
            var value = areaList[a].value;
            if (utils.isInArray(chooseList, value)) {
                areaList[a].checked = true;
            } else {
                areaList[a].checked = false;
            }
        }
        console.log("展示的区域信息");
        console.log(areaList);
        var modalName = "chooseArea";
        that.setData({
            modalName: modalName,
            areaList: areaList
        });
    },
    ChooseCheckbox(e) {
        var that = this;
        var areaList = that.data.areaList;
        var value = e.currentTarget.dataset.value;
        console.log("value"+value)
        areaList[value].checked = !areaList[value].checked;
        that.setData({
            areaList: areaList
        });
    },

    comfirmArea: function () {
        var that = this;
        var chooseList = [];
        var areaList = that.data.areaList;
        for (var a in areaList) {
            if (areaList[a].checked) {
                chooseList.push(areaList[a]);
            }
        }
        console.log("确定的区域");
        console.log(chooseList);
        var areaName = "";
        var area_ids = "";
        for (var i in chooseList) {
            areaName += chooseList[i].name + ";";
            area_ids += chooseList[i].value + ";";
        }
        that.setData({
            chooseList: chooseList,
            modalName: null,
            areaName: areaName,
            area_ids: area_ids
        });

    },

})