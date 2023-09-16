const cloud = require('wx-server-sdk');
cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();

// 获取所有记录
const getAllMessages = async (data) => {
  const countResult = await db.collection('messages').where({isUse: '2'}).count()
  const total = countResult.total
  // 计算需分几次取
  const batchTimes = Math.ceil(total / 100)
  // 承载所有读操作的 promise 的数组
  const tasks = []
  for (let i = 0; i < batchTimes; i++) {
    const promise = db.collection('messages').where({isUse: '2'}).skip(i * 100).limit(100).get()
    tasks.push(promise)
  }
  // 等待所有
  let result = (await Promise.all(tasks)).reduce((acc, cur) => {
    if(acc.length <= 0) acc.data = []
    if(cur.length <= 0) cur.data = []
    return {
      data: acc.data.concat(cur.data),
      errMsg: acc.errMsg,
    }
  },[])
  result.data = result.data || [] // 处理 没有数据时 reduce 结果 undefined 的情况
  return result
}

const sendMessage = async () => {
  let result = await getAllMessages();
  let messageList = result.data.filter(function(item,index,self){
    return self.findIndex(el=>(el.wechat_openid==item.wechat_openid && item.isUse === '2' && item._createTime < 1694570709610))===index
    // return self.findIndex(el=>(el.wechat_openid==item.wechat_openid && item.isUse === '2'))===index
  })
  // messageList=messageList.slice(0,1)
  console.log(messageList)
  for(var i =0;i<messageList.length;i++){
    sendMessageItem(messageList[i])
  }
}

const sendMessageItem = async (item) => {
  try {
    const result = await cloud.openapi.subscribeMessage.send({
      "touser": item.wechat_openid,
      "page": 'pages/index/index',
      "lang": 'zh_CN',
      "data": {
        "thing1": {
          "value": '8000G网课大礼包'
        },
        "thing2": {
          "value": '230篇人民日报精读解析'
        },
        "thing5": {
          "value": '会员联系客服立刻领取'
        }
      },
      "templateId": item.templateId,
      "miniprogramState": 'formal'
      // formal/正式版（默认）；trial/体验版；developer/开发版
    })
    console.log(result,'==========')
    await db.collection('messages').where({
      wechat_openid: item.wechat_openid,
      _id: item._id
    }).update({
      // data 传入需要局部更新的数据
      data: {
        isUse: '1'
      }
    })
    console.log(result,'==========')
    return result
  } catch (err) {
    return err
  }
}

const addMessage = async (data, OPENID) => {
  try {
    const result = await db.collection('messages').add({
      data: {
        wechat_openid: OPENID,
        user_id: data.user_id,
        templateId: data.templateId,
        isUse: '2',
        _createTime: Date.now(),
        _updateTime: Date.now()
      },
    });
    console.log(result)
    return result;
  } catch (err) {
    return err;
  }
};

exports.main = async (event, context) => {
  const { func, data } = event;
  const { OPENID } = cloud.getWXContext();
  let res;
  if (func === 'addMessage') {
    res = await addMessage(data, OPENID);
  } else if (func === 'sendMessage') {
    res = await sendMessage(data, OPENID);
  }
  return res;
}
