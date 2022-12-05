// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env:'prod-2gzhco766f4e1e27'
});
const db = cloud.database();
const collection = db.collection('words');
const _ = db.command

const addWordsList = async (data) => {
  let arr = []
  for (let m = 0; m < data.length; m++) {
    let temp = []
    let obj = {}
    temp = data[m].split("@")
    obj.name = temp[0]
    obj.implication = temp[1]
    obj.count = Number(temp[2])
    obj.type = 1
    obj.tag = "#国考"
    obj._createTime = Date.now(),
    obj._updateTime = Date.now()
    if(temp[3]) {
      obj.synonym = []
      for(let i = 0; i < Number(temp[3]); i++) {
        let tempNext = data[m+1+i].split("@")
        obj.synonym.push(tempNext[0])
      }
    }
    arr.push(obj)
  }
  let obj = {}
  arr = arr.reduce(function(item, next) {
    obj[next.name] ? '' : obj[next.name] = true && item.push(next);
    return item;
  }, []);
  console.log(arr,'添加')
  let pList = []
  for (let n = 0; n < arr.length; n++) {
    let p = new Promise(async (resolve, reject) => {
      const hasWord = await collection.where({ name: arr[n].name }).get()
      if (Array.isArray(hasWord.data) && hasWord.data.length === 0) {
        await addWords(arr[n]);
        resolve('添加')
      } else {
        resolve('重复')
      }
    })
    pList.push(p)
  }
  Promise.all(pList).then((res)=>{
    console.log(res)
  }).catch(err => {
    console.log(err)
  })
}

const importWords = async (data) => {
  let arr = []
  for (let m = 0; m < data.length; m++) {
    let temp = []
    let obj = {}
    temp = data[m].split("@")
    obj.name = temp[0]
    obj.implication = temp[1]
    obj.count = Number(temp[2])
    obj.type = 1
    obj.tag = "#国考"
    obj._createTime = Date.now(),
    obj._updateTime = Date.now()
    if(temp[3]) {
      obj.synonym = []
      for(let i = 0; i < Number(temp[3]); i++) {
        let tempNext = data[m+1+i].split("@")
        obj.synonym.push(tempNext[0])
      }
    }
    arr.push(obj)
  }
  console.log(arr, '更新')
  let pList = []
  for (let n = 0; n < arr.length; n++) {
    let p = new Promise(async (resolve, reject) => {
      const hasWord = await collection.where({ name: arr[n].name }).get()
      if (Array.isArray(hasWord.data) && hasWord.data.length > 0) {
        let result = hasWord.data[0]
        if(result.synonym && result.synonym.length > 0){
          resolve('不用更新')
          return
        }
        await collection.doc(result._id).update({
          data: {
            implication: result.implication.length > arr[n].implication.length ? result.implication : arr[n].implication,
            count: arr[n].count,
            tag: "#国考",
            type: 1,
            _createTime: Date.now(),
            _updateTime: Date.now()
          }
        });
        resolve('更新成功')
      }
    })
    pList.push(p)
  }
  Promise.all(pList).then((res)=>{
    console.log(res)
  }).catch(err => {
    console.log(err)
  })
}

const refreshSynonym = async (data) => {
  let arr = []
  for (let m = 0; m < data.length; m++) {
    let temp = []
    let obj = {}
    temp = data[m].split("@")
    obj.name = temp[0]
    obj.implication = temp[1]
    obj.count = Number(temp[2])
    obj.type = 1
    obj.tag = "#国考"
    obj._createTime = Date.now(),
    obj._updateTime = Date.now()
    if(temp[3]) {
      obj.synonym = []
      for(let i = 0; i < Number(temp[3]); i++) {
        let tempNext = data[m+1+i].split("@")
        obj.synonym.push(tempNext[0])
      }
    }
    arr.push(obj)
  }
  let = pList2 = []
  for (let j = 0; j < arr.length; j++) {
    if(arr[j].synonym && arr[j].synonym.length > 0) {
      let p = new Promise(async (resolve, reject) => {
        arr[j].synonym = await getSynonymWords(arr[j].synonym)
        const hasWord = await collection.where({ name: arr[j].name }).get();
        if (Array.isArray(hasWord.data) && hasWord.data.length === 0) {
          await addWords(arr[j]);
          resolve('再次添加')
        } else {
          let result = hasWord.data[0]
          if(result.synonym && result.synonym.length > 0) {
            resolve('不用更新')
            return
          }
          await collection.doc(result._id).update({
            data: {
              synonym: arr[j].synonym,
            }
          });
          resolve('更新synonym')
        }
      })
      pList2.push(p)
    }
  }
  Promise.all(pList2).then((res)=>{
    console.log(res)
  }).catch(err => {
    console.log(err)
  })
}

const getSynonymWords = async (arr) => {
  const synonymWordList = await collection.where({
    name: _.in(arr)
  }).get();
  console.log(synonymWordList)
  let arrTemp = [];
  synonymWordList.data.forEach(element => {
    arrTemp.push(element._id)
  });
  return arrTemp;
}

const addWords = async (options) => {
  console.log(options,'==============================')
  await collection.add({
    data: {
      name: options.name,
      implication: options.implication,
      count: options.count,
      type: 1,
      tag: "#国考",
      _createTime: Date.now(),
      _updateTime: Date.now()
    }
  })
}


exports.main = async (event, context) => {
  const { func, data } = event;
  const { OPENID, APPID, UNIONID } = cloud.getWXContext();
  let res;
  if (func === 'importWords') {
    res = await importWords(data);
  } else if (func === 'refreshSynonym') {
    res = await refreshSynonym(data);
  } else if (func === 'addWordsList') {
    res = await addWordsList(data);
  }
  return res;
}
