var util = require("../../utils/util.js");
var app = getApp();
var that;
var chatListData = [];
var speakerInterval;
Page({
  data:{
    q:'', //
    content:[],
    defaultCorpus: '你都会什么',
    askWord: '',
    sendButtDisable: true,
    userInfo: {},
    chatList: [],
    scrolltop: '',
    userLogoUrl: '/pages/imgs/user_default.png',
    keyboard: true,
    isSpeaking: false,
    speakerUrl: '/pages/imgs/speaker0.png',
    speakerUrlPrefix: '/pages/imgs/speaker',
    speakerUrlSuffix: '.png',
    filePath: null,
    contactFlag: true,
  },
  onLoad:function(options){
    // 生命周期函数--监听页面加载
    //console.log(util.formatTime(new Date()));
    that = this;
    this.loadContent();
  },
  onReady:function(){
    // 生命周期函数--监听页面初次渲染完成
    
  },
  onShow:function(){
    // 生命周期函数--监听页面显示
    
  },
  onHide:function(){
    // 生命周期函数--监听页面隐藏
    
  },
  onUnload:function(){
    // 生命周期函数--监听页面卸载
    
  },
  onPullDownRefresh: function() {
    // 页面相关事件处理函数--监听用户下拉动作
    
  },
  onReachBottom: function() {
    // 页面上拉触底事件的处理函数
    
  },
  onShareAppMessage: function() {
    // 用户点击右上角分享
    return {
      title: 'title', // 分享标题
      desc: 'desc', // 分享描述
      path: 'path' // 分享路径
    }
  }, 

  inputEvent: function(event) {
      var value = event.detail.value;
      this.setData({q:value});
  },

  // 切换语音输入和文字输入
  switchInputType: function () {
    this.setData({
      keyboard: !(this.data.keyboard),
    })
  },

  // 麦克风帧动画 
  speaking: function () {
    // 话筒帧动画 
    var i = 0;
    that.speakerInterval = setInterval(function () {
      i++;
      i = i % 7;
      that.setData({
        speakerUrl: that.data.speakerUrlPrefix + i + that.data.speakerUrlSuffix,
      });
      console.log("[Console log]:Speaker image changing...");
    }, 300);
  },

  // 按钮按下
  touchdown: function () {
    this.setData({
      isSpeaking: true,
    })
    that.speaking.call();
    console.log("[Console log]:Touch down!Start recording!");
    // 开始录音
    wx.startRecord({
      'success': function (res) {
        var tempFilePath = res.tempFilePath;
        that.data.filePath = tempFilePath;
        console.log("[Console log]:Record success!File path:" + tempFilePath);
        that.voiceToChar();
      },
      'fail': function () {
        console.log("[Console log]:Record failed!");
        wx.showModal({
          title: '录音失败',
          content: '换根手指再试一次！',
          showCancel: false,
          confirmText: '确定',
          confirmColor: '#09BB07',
        })
      },
    })
    setTimeout(function () {
      //结束录音  
      wx.stopRecord()
    }, 60000)
  },

  // 按钮松开
  touchup: function () {
    wx.stopRecord();
    console.log("[Console log]:Touch up!Stop recording!");
    this.setData({
      isSpeaking: false,
      speakerUrl: '/pages/imgs/speaker0.png',
    })
    clearInterval(that.speakerInterval);
  },

  queryAnswer: function() {
      var page = this;
      var q = this.data.q;
      if(q==null || q==='') {
          wx.showToast({
              title: '请输入您的问题',
              icon: 'loading'
          });
      } else {

        /*var datas = page.data.content;
        datas.push({ "isRobot": false, "date": util.formatTime(new Date()), "text": q });

        page.setData({ q: '', content: datas });
        
        
        //请求图灵机器人api获取回答
        app.req('post', 'openapi/api', {
          'data': { 'info': q, 'loc': '杭州', 'userid': '123' },
          'success': function (res) {
            var con = res.text;
            var datas = page.data.content;
            datas.push({ "isRobot": true, "date": util.formatTime(new Date()), "text": con });

            console.log(datas);
            page.setData({ content: datas });

            page.setContent2Storage(datas);
            if (res.url) {
              var datas2 = page.data.content;
              datas2.push({ "isRobot": true, "text": res.url });

              console.log(datas2);
              page.setData({ content: datas2 });

              page.setContent2Storage(datas2);
            }
          },
        });*/
          
        
        //原方法为聚合和问答机器人两个api，都不是很好，所以改掉了
        var appkey = "147c3451003239dcb1ac1dda32660d4e";
        //var appkey = "be9b8d07937b4ca19f08fff44f5b031a";

        var datas = page.data.content;
        datas.push({"isRobot":false, "date": util.formatTime(new Date()), "text":q});

        page.setData({q:'', content:datas});

        var url = "https://op.juhe.cn/robot/index?key="+appkey+"&info="+q;
        //var url = "https://apis.haoservice.com/efficient/robot?info=" + q + "&address=&key=" + appkey;
        wx.request({
          url: url,
          data: {},
          method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          // header: {}, // 设置请求的 header
          success: function(res){
            // success
            if(res.data.error_code=='0') {
                var con = res.data.result.text;
                var datas = page.data.content;
                datas.push({"isRobot":true, "date": util.formatTime(new Date()), "text":con});

                console.log(datas);
                page.setData({content:datas});

                page.setContent2Storage(datas);
            } else {
                wx.showToast({
                    title:res.data.reason, icon:'loading'
                });
            }
            console.log(res);
          }
        })
      }
  },

  // 语音转文字
  voiceToChar: function () {
    var page = this;
    var q = this.data.q;
    var voiceFilePath = that.data.filePath;
    if (voiceFilePath == null) {
      console.log("[Console log]:File path do not exist!");
      wx.showModal({
        title: '录音文件不存在',
        content: '我也不知道哪错了，反正你就再试一次吧！',
        showCancel: false,
        confirmText: '确定',
        confirmColor: '#09BB07',
      })
      return;
    }
    var urls = app.globalData.slikToCharUrl;
    var appkey = app.globalData.NLPAppkey;
    var appsecret = app.globalData.NLPAppSecret;
    var NLPCusid = app.globalData.NLPCusid;
    wx.showLoading({
      title: '语音识别中...',
    })
    wx.uploadFile({
      url: urls,
      filePath: voiceFilePath,
      name: 'file',
      formData: { "appKey": appkey, "appSecret": appsecret, "userId": NLPCusid },
      header: { 'content-type': 'multipart/form-data' },
      success: function (res) {
        wx.hideLoading();
        var data = JSON.parse(res.data);
        var seg = JSON.parse(data.result).seg;
        console.log("[Console log]:Voice to char:" + seg);
        if (seg == null || seg.length == 0) {
          wx.showModal({
            title: '录音识别失败',
            content: "我什么都没听到，你再说一遍！",
            showCancel: false,
            success: function (res) {
            }
          });
          return;
        }
        //var datas2 = page.data.content;
        //datas2.push({ "isRobot": false, "date": util.formatTime(new Date()), "text": seg });

        //console.log(datas2);
        page.setData({ q: seg});

  
        console.log("[Console log]:Add user voice input to chat list");
        that.queryAnswer();
        return;
      },
      fail: function (res) {
        console.log("[Console log]:Voice upload failed:" + res.errMsg);
        wx.hideLoading();
        wx.showModal({
          title: '录音识别失败',
          content: "请你离WIFI近一点再试一次！",
          showCancel: false,
          success: function (res) {
          }
        });
      }
    });
  },


  setContent2Storage: function(data) {
    wx.setStorage({
      key: 'content',
      data: data,
      success: function(res){
        // success
        //console.log("=====保存成功=====");
      }
    })
  },

  loadContent: function() {
    var page = this;
    wx.getStorage({
      key: 'content',
      success: function(res){
        // success
        console.log(res);
        page.setData({content:res.data});
      }
    })
  }
})
