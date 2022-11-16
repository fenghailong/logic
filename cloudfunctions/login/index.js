// 云函数入口文件
const cloud = require('wx-server-sdk');
cloud.init({
  env:'gwybbs-0gkv8q1q39862d8c'
});
const db = cloud.database();
const collection = db.collection('users');

const randomName = (prefix = "看客", randomLength = 7) => {
  // 兼容更低版本的默认值写法
  prefix === undefined ? prefix = "" : prefix;
  randomLength === undefined ? randomLength = 8 : randomLength;
  // 设置随机用户名
  // 用户名随机词典数组
  let nameArr = [
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 0],
      ["a", "b", "c", "d", "e", "f", "g", "h", "i", "g", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"]
  ]
  // 随机名字字符串
  let name = prefix;
  // 循环遍历从用户词典中随机抽出一个
  for (var i = 0; i < randomLength; i++) {
      // 随机生成index
      let index = Math.floor(Math.random() * 2);
      let zm = nameArr[index][Math.floor(Math.random() * nameArr[index].length)];
      // 如果随机出的是英文字母
      if (index === 1) {
          // 则百分之50的概率变为大写
          if (Math.floor(Math.random() * 2) === 1) {
              zm = zm.toUpperCase();
          }
      }
      // 拼接进名字变量中
      name += zm;
  }
  // 将随机生成的名字返回
  return name;
}

const login = async (_openid) => {
  let user;
  let hasUser = await collection.where({ wechat_openid: _openid }).get();
  if (Array.isArray(hasUser.data) && hasUser.data.length === 0) {
    await collection.add({
      data: {
        wechat_openid: _openid,
        userInfo: {
          avatarUrl: 'cloud://gwybbs-0gkv8q1q39862d8c.6777-gwybbs-0gkv8q1q39862d8c-1308145583/avatars/avatar.png',
          city: '',
          country: '',
          gender: 0,
          language: 'zh_CN',
          nickName: randomName(),
          province: ''
        }
      }
    });
    hasUser = await collection.where({ wechat_openid: _openid }).get();
    user = hasUser.data;
  } else {
    user = hasUser.data;
  }
  return user;
}


exports.main = async (event, context) => {
  const { OPENID, APPID, UNIONID } = cloud.getWXContext();
  let res;
  res = await login(OPENID);
  return res;
}
