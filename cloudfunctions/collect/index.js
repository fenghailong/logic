// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
    env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const collection = db.collection('collect');

// 获取笔记
const getCollectionList = async (options) => {
    const result = await collection.where({ pro_id: options.pro_id, user_id: options.user_id }).get();
    console.log(result, '======')
    return result
}

// 添加笔记
const addCollection = async (options) => {
    await collection.add({
        data: {
            pro_id: options.pro_id,
            user_id: options.user_id,
            type: options.type,
            _createTime: Date.now(),
            _updateTime: Date.now()
        }
    })
}

// 删除笔记
const deleteCollection = async (options) => {
    await collection.where({
      pro_id: options.pro_id,
      user_id: options.user_id
    }).remove()
}

exports.main = async (event, context) => {
    const { func, data } = event;
    // const { OPENID, APPID, UNIONID } = cloud.getWXContext();
    let res;
    if (func === 'addCollection') {
        res = await addCollection(data);
    } else if (func === 'deleteCollection') {
        res = await deleteCollection(data);
    } else if (func === 'getCollectionList') {
        res = await getCollectionList(data);
    }
    return res;
}
