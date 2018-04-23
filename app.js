//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  getUserInfo:function(cb){
    var that = this
    if(this.globalData.userInfo){
      typeof cb == "function" && cb(this.globalData.userInfo)
    }else{
      //调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo
              typeof cb == "function" && cb(that.globalData.userInfo)
            }
          })
        }
      })
    }
  },
  globalData:{
    userInfo:null,
    NLPAppkey: "c3f5b2f4fe2445fcb339cc43e6d8b6aa",
    NLPAppSecret: "42878255d5a54dc2918fb6b542db33da",
    NLPUrl: "https://cn.olami.ai/cloudservice/api",
    NLPCusid: "353313079389284",
    //slikToCharUrl: "https://api.happycxz.com/test/silk2asr/olami/asr",
    slikToCharUrl: "https://api.happycxz.com/wxapp/silk2asr",
  },

  // Request function
  req: function (method, url, arg) {
    let domian = 'https://www.tuling123.com/', data = { 'key': 'a57550a2842242cf82f7fcc96ec97795' }, dataType = 'json';//我的图灵api
    let header = { 'content-type': 'application/x-www-form-urlencoded' };

    if (arg.data) {
      data = Object.assign(data, arg.data);
    }
    if (arg.header) {
      header = Object.assign(header, arg.header);
    }
    if (arg.dataType) {
      dataType = arg.dataType;
    }

    let request = {
      method: method.toUpperCase(),
      url: domian + url,
      data: data,
      dataType: dataType,
      header: header,
      success: function (resp) {
        console.log('response content:', resp.data);

        let data = resp.data;

        typeof arg.success == "function" && arg.success(data);
      },
      fail: function () {
        wx.showToast({
          title: '请求失败,请稍后再试',
          icon: 'success',
          duration: 2000
        });

        typeof arg.fail == "function" && arg.fail();
      },
      complete: function () {
        typeof arg.complete == "function" && arg.complete();
      }
    };
    wx.request(request);
  },
})