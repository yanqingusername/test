const utils = require('../../utils/utils.js')
var box = require('../../utils/box.js')
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showDialog: {
      type: Boolean
    },
    datas: { //----展示参数
      type: Object
    },
    types: {
      type: String
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showDialog: false,
    description: ''
  },
  lifetimes: {
    attached() { // 在组件实例进入页面节点树时执行
    },
    moved() {},
    detached() {
      // 在组件实例被从页面节点树移除时执行
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    dialogCancel() {
      this.setData({
        showDialog: false
      })
      this.triggerEvent('dialogCancel', '')
    },
    dialogSure() {
      this.setData({
        showDialog: false
      })
      this.triggerEvent('dialogSure', '')
    },
    elastic() {
      this.setData({
        showDialog: false
      })
    },
    dialogCloseCancel() {
      this.setData({
        showDialog: false,
        description: ""
      })
      this.triggerEvent('dialogCloseCancel', '')
    },
    dialogCloseSure() {
      if(this.data.description){
        this.setData({
          showDialog: false
        })
        this.triggerEvent('dialogCloseSure', this.data.description)
      }else{
        box.showToast("请填写关闭工单原因");
      }
    },
    textareaAInput: function (e) {
      if (e) {
        var str = e.detail.value;
        str = utils.checkInput(str);
        this.setData({
          description: str
        });
      }
    },
    empty(){
      this.setData({ description: ""});
    }
  }
})