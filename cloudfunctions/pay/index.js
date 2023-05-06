// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const collection = db.collection('activateCode');


// 改变用户成为会员
const changeUserToMember = async (id) => {
  let hasUser = await collectionUser.where({ _id: id }).get();
  if (Array.isArray(hasUser.data) && hasUser.data.length === 0) {
    return '用户不存在'
  } else {
    let result = await collectionUser.doc(id).update({
      // data 传入需要局部更新的数据
      data: {
        // 表示将 done 字段置为 true
        isMember: '1'
      }
    })
    console.log(result, '用户已成为会员')
    return '用户已成为会员'
  }
}

exports.main = async (event, context) => {
  const { func, data } = event;
  // const { OPENID, APPID, UNIONID } = cloud.getWXContext();
  let res;
  if (func === 'addActivateRecord') {
    res = await addActivateRecord(data);
  }
  return res;
}
