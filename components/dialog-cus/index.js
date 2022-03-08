Component({
  /**
   * 组件的属性列表
   */
  properties: {
    showDialog: {
      type: Boolean
    },
    datas: {  //----展示参数
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
    showDialog:false, 
  },
  lifetimes: {
    attached() {// 在组件实例进入页面节点树时执行
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
    dialogCancel(){
      this.setData({showDialog:false})
      this.triggerEvent('dialogCancel', '')
    },
    dialogSure(){
      this.setData({showDialog:false})
      this.triggerEvent('dialogSure', '')
    },
    elastic(){
      this.setData({showDialog:false})
    },
  }
})
