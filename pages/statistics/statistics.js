import * as echarts from '../../ec-canvas/echarts';
const app = getApp()
var request = require('../../utils/request.js')
var box = require('../../utils/box.js')


let chart1 = null;
let chart2 = null;

Page({
 
  data: {
    today_done:0, //今日已完成
    week_done:0,  //本周已完成
    month_done:0, //本月已完成
    uncatched:0,  //待接单
    ongoing:0,    //进行中
    num1:1,
    num2:1,
    area_status:1,
    service_status:1, //服务类型切换默认值
    time_status:1, //各区域数据切换默认值
    area_count:[],
    area_name:[],
    existData:1, //不为0即可
    ec1: {
      onInit: function (canvas, width, height, dpr) {
        chart1 = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr // new
        });
        canvas.setChart(chart1);
        return chart1;
      }
    },
    ec2: {
      onInit: function (canvas, width, height, dpr) {
        chart2 = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr // new
        });
        canvas.setChart(chart2);
        return chart2;
      }
    }
  },

  getData1(){
    var that = this;
    var area_count = that.data.area_count;
    var area_name = that.data.area_name;
		var data = {
      time_status:that.data.time_status,
      support_id: app.globalData.userInfo.id,
      area_id:app.globalData.userInfo.area_id
		}
		request.request_get('/indexapi/getAreainfo.hn', data, function (res) {
      console.info('回调', res)
      console.info('回调array', res.result)
      
			if (res) {
				if (res.success) {   
          for(var i = 0;i < res.result.length; i++){
            area_count.push(res.result[i].total);
            area_name.push(res.result[i].area_name)
          } 
          that.setData({
            existData:res.result.length
          })
					chart1.setOption({
              tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                  type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                },
                confine: true
              },
              legend: {
                data: [{
                  itemStyle:{
                    color:'#307FF5'
                  }
                }]
              },
              grid: {
                left: '90%',
                right: '90%',
                bottom: '90%',
                top: '100%',
                containLabel: true
              },
              xAxis: [
                {
                  type: 'category',
                  data: area_name,
                  splitLine:{
                    show:true,
                    interval:10,
                    lineStyle:{
                      type:"dashed"
                    }
                  },
                  axisLine: {
                    show:false,
                    lineStyle: {
                      color: '#ABABAB'
                    }
                  },
                  axisTick:{
                    show:false,
                    alignWithLabel: true,
                    interval:10
                  },
                  axisLabel: {
                    interval:0,
                    color: '#ABABAB'
                  }
                }
              ],
              dataZoom: [ 
          //X轴内置滑动
            {
                type: 'inside',  //内置滑动，随鼠标滚轮展示 
                xAxisIndex: [0],
                start: 1,//初始化时，滑动条宽度开始标度
                end: 50  //初始化时，滑动条宽度结束标度
　　　　　　　} ],
              yAxis: [
                {
                  type: 'value',
                  minInterval: 1,
                  axisTick: { show: false },
                  axisLine: {
                    lineStyle: {
                      color: '#ABABAB'
                    }
                  },
                  axisLabel: {
                    color: '#ABABAB'
                  },
                  splitLine:{
                    show:true,
                    lineStyle:{
                      type:"dashed"
                    }
                  }
                }
              ],
              series: [
                {
                  // name: '热度',
                  type: 'bar',
                  barMaxWidth: '30',
                  label: {
                    normal: {
                      show: true,
                      position: 'top'
                    }
                  },
                  data: area_count,
                  itemStyle: {
                    color:'#307FF5',
                    borderRadius:[3,3,3,3]
                  },
                  barWidth:'30%'
                },
              ]
          })
          // box.hideLoading()
				} else {
					box.showToast(res.msg);
				}
			}else{
        box.showToast("网络不稳定，请重试");
      }
    })
  },

  getData2(){
    var that = this;
    console.log('service_status='+that.data.service_status)
		var data = {
      service_status:that.data.service_status,
			support_id: app.globalData.userInfo.id
		}
		request.request_get('/indexapi/getIndexSumInfo.hn', data, function (res) {
      console.info('回调', res)
      console.info(res.month_finish_arr)
			if (res) {
				if (res.success) {
          that.setData({
            today_done:res.today_finish,
            week_done:res.week_finish,
            month_done:res.month_finish,
					  // uncatched:res.allpre,
            ongoing:res.alldoing
          });
          chart2.setOption({
            tooltip: {
              trigger: 'axis',
              axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
              },
              confine: true
            },
            legend: {
              data: [{
                itemStyle:{
                  color:'#307FF5'
                }
              }]
            },
            grid: {
              left: '90%',
              right: '90%',
              bottom: '90%',
              top: '100%',
              containLabel: true
            },
            xAxis: [
              {
                // name:'huuu',
                type: 'category',
                data: ["现场服务", "返厂维修", "装机培训","试剂培训","远程服务"],
                axisLine: {
                  show:false,
                },
                axisTick:{
                  show:false,
                  alignWithLabel: true,
                  interval:0
                },
                axisLabel: {
                  formatter : function(params){
                    var newParamsName = "";// 最终拼接成的字符串
                    var paramsNameNumber = params.length;// 实际标签的个数
                    var provideNumber = 2;// 每行能显示的字的个数
                    var rowNumber = Math.ceil(paramsNameNumber / provideNumber);// 换行的话，需要显示几行，向上取整
                    /**
                    * 判断标签的个数是否大于规定的个数， 如果大于，则进行换行处理 如果不大于，即等于或小于，就返回原标签
                    */
                    // 条件等同于rowNumber>1
                    if (paramsNameNumber > provideNumber) {
                      /** 循环每一行,p表示行 */
                      for (var p = 0; p < rowNumber; p++) {
                        var tempStr = "";// 表示每一次截取的字符串
                        var start = p * provideNumber;// 开始截取的位置
                        var end = start + provideNumber;// 结束截取的位置
                        // 此处特殊处理最后一行的索引值
                        if (p == rowNumber - 1) {
                            // 最后一次不换行
                            tempStr = params.substring(start, paramsNameNumber);
                        } else {
                            // 每一次拼接字符串并换行
                            tempStr = params.substring(start, end) + "\n";
                        }
                        newParamsName += tempStr;// 最终拼成的字符串
                      }
                    } else {
                        // 将旧标签的值赋给新标签
                        newParamsName = params;
                    }
                    //将最终的字符串返回
                    return newParamsName
                 },
                  color: '#ABABAB',
                  interval:0
                },
                splitLine:{
                  show:true,
                  interval:10,
                  lineStyle:{
                    type:"dashed"
                  }
                }
              }
            ],
            yAxis: [
              {
                type: 'value',
                minInterval: 1,
                axisTick: { show: false },
                axisLine: {
                  lineStyle: {
                    color: '#ABABAB'
                  }
                },
                axisLabel: {
                  color: '#ABABAB'
                },
                splitLine:{
                  show:true,
                  lineStyle:{
                    type:"dashed"
                  }
                }
              }
            ],
            series: [
              {
                // name: '热度',
                type: 'bar',
                barMaxWidth: '30',
                label: {
                  normal: {
                    show: true,
                    position: 'top'
                  }
                },
                data: res.finish_arr,
                itemStyle: {
                  color:'#307FF5',
                  borderRadius:[3,3,3,3]
                },
                barWidth:'30%'
              },
            ]
          })
          // box.hideLoading()
				} else {
					box.showToast(res.msg);
				}
			}else{
        box.showToast("网络不稳定，请重试");
      }
    })
    var data = {
      area:app.globalData.userInfo.area_id,
      pageNum: 1, //页数
			pageCount: 6 //每页数据
		}
		request.request_get('/OrderController/getOrderList.hn', data, function (res) {
      console.info('回调', res)
      console.info(res.count)
			if (res) {
				if (res.success) {
          that.setData({
					  uncatched:res.count
					});
				} else {
					box.showToast(res.msg);
				}
			}else{
        box.showToast("网络不稳定，请重试");
      }
    })
  },

  onReady() {
    setTimeout(function () {
    }, 2000);
  },

  changeTime1:function(e){
    // box.showLoading("加载中...")
    var that = this
    console.log(e)
    that.setData({
      num1:e.target.dataset.num1,
      area_count:[],
      area_name:[],
      existData:1 //不为0即可
    })
    if(that.data.num1 == 1){ //今日
      that.setData({
        time_status:1
      })
    }else if(that.data.num1 == 2){ //近7天
      that.setData({
        time_status:2
      })
    }else if(that.data.num1 == 3){ //近30天
      that.setData({
        time_status:3
      })
    }
    this.getData1();
  },
  changeTime2:function(e){
    // box.showLoading("加载中...")
    var that = this
    console.log(e)
    that.setData({
      num2:e.target.dataset.num2
    })
    if(that.data.num2 == 1){ //今日
      that.setData({
        service_status:1
      })
    }else if(that.data.num2 == 2){ //近7天
      that.setData({
        service_status:2
      })
    }else if(that.data.num2 == 3){ //近30天
      that.setData({
        service_status:3
      })
    }
    this.getData2();
  },
  onLoad:function(){
    var that = this;
    // that.getOrderData();
    setTimeout(that.getData1,1000);
    setTimeout(that.getData2,1000);
    
  },
  onShow:function(){
   
  }
});
