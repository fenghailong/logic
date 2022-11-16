import api from '../api/index.js'

export default {
  methods: {
    getCode () {
      return new Promise((resolve, reject) => {
        console.log("获取code")
        wx.login({
          success: (res) => {
            resolve(res.code);
          },
          fail: (err) => {
            reject(err)
          },
        })
      });
    },
    waitCode () {
      let app = getApp();
      return new Promise((resolve, reject) => {
        let _waitCode = () => {
          let code = app.loginData.code;
          if(code){
            resolve(code)
          }else{
            setTimeout(_waitCode, 500);
          }
        };
        setTimeout(_waitCode, 500);
      });
    },
    async getToken () {
      let app = getApp();
      if(!app.loginData)app.loginData = {};
      if(!app.loginData.tokenStatus)app.loginData.tokenStatus = 'none';
      if(!app.loginData.token)app.loginData.token = '';
      if(app && app.loginData.token){
        app.loginData.tokenStatus = 'complete';
        return app.loginData.token;
      }

      if(app.loginData.tokenStatus == 'loading'){
        return await this.waitCode();
      }
      app.loginData.tokenStatus = 'loading';

      let code = await this.getCode();
      const data = await this.api(api.common.apiLogin, {
        code
      })
      app.loginData.token = data.data.token;
      app.loginData.tokenStatus = 'complete';
      console.log(app.loginData)
      // console.log(data)
      return data.data.token
    },
  }
}
