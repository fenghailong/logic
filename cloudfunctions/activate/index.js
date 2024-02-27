// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const collectionCode = db.collection('activateCode');
const collectionRecord = db.collection('activateRecord');
const collectionUser = db.collection('user');

// 激活模块
const addActivateRecord = async (options) => {
  let codeType = await checkActivateCode(options.activate_code_id);
  if (codeType) {
    let hasRecord = await collectionRecord.where({ user_id: options.user_id, activate_code_id: options.activate_code_id}).get();
    if (Array.isArray(hasRecord.data) && hasRecord.data.length === 0) {
      let result = await collectionRecord.add({
        data: {
          user_id: options.user_id,
          activate_code_id: options.activate_code_id,
          type: codeType,
          _createTime: Date.now(),
          _updateTime: Date.now()
        }
      })
      console.log(result, '增加记录')
      await changeUserToMember(options.user_id, codeType);
      return '激活成功'
    } else {
      return '已激活'
    }
  } else {
    return '激活失败'
  }
}
// 检查激活码是否被使用
const checkActivateCode = async (activate_code_id) => {
  let hasCode = await collectionCode.where({ _id: activate_code_id}).get();
  if (Array.isArray(hasCode.data) && hasCode.data.length === 0) {
    console.log(hasCode, '激活码错误')
    return false
  } else {
    console.log(hasCode.data)
    if (hasCode.data[0].isUse === '2') {
      console.log(hasCode, '激活码已被使用')
      return false
    } else {
      await collectionCode.doc(activate_code_id).update({
        data: {
          isUse: '2'
        }
      })
      console.log(hasCode, '激活码使用成功')
      return hasCode.data[0].type
    }
  }
}
// 改变用户成为会员
const changeUserToMember = async (id, codeType) => {
  let hasUser = await collectionUser.where({ _id: id }).get();
  if (Array.isArray(hasUser.data) && hasUser.data.length === 0) {
    return '用户不存在'
  } else {
    if(codeType){
      let openTime = Date.now()
      let closeTime
      if( codeType === '1') {
        closeTime = Date.now() + 31 * 24 * 60 * 60 * 1000
      }else if (codeType === '2') {
        closeTime = Date.now() + 6 * 31 * 24 * 60 * 60 * 1000
      }else if (codeType === '3') {
        closeTime = Date.now() + 12 * 31 * 24 * 60 * 60 * 1000
      }else if (codeType === '4') {
        closeTime = Date.now() + 99 * 12 * 31 * 24 * 60 * 60 * 1000
      }
      console.log(openTime)
      console.log(closeTime)
      let result = await collectionUser.doc(id).update({
        // data 传入需要局部更新的数据
        data: {
          // 表示将 done 字段置为 true
          isMember: '1',
          openTime,
          closeTime
        }
      })
      console.log(result, '用户已成为会员')
      return '用户已成为会员'
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
