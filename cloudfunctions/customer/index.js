// 云函数入口文件
const cloud = require('wx-server-sdk')

const env = 'prod-2gzhco766f4e1e27'

cloud.init({
  env,
});
//<!--下载云存储图片-->
let downLoad = async (event, context) => {
  const res = await cloud.downloadFile({
    fileID: 'cloud://prod-2gzhco766f4e1e27.7072-prod-2gzhco766f4e1e27-1304834920/customer/fenghailong.png', // 图片的File ID，提前通过云开发控制台上传的图片fileId
  })
  const buffer = res.fileContent
  console.log(buffer)
  return buffer
}

//<!--把媒体文件上传到微信服务器-->
let upload = async (Buffer) => {
  return await cloud.openapi.customerServiceMessage.uploadTempMedia({
    type: 'image',
    media: {
      contentType: 'image/png',
      value: Buffer
    }
  })
}

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  if (event.MsgType == 'miniprogrampage') {
    await cloud.openapi.customerServiceMessage.send({
      touser: wxContext.OPENID,
      msgtype: 'text',
      text: {
        content: '收到 MsgType=' + event.MsgType + ';content=' + event.Content,
      },
    })
  } else if (event.MsgType == 'image') {
    let Buffer = await downLoad()
    let meida = await upload(Buffer)
    await cloud.openapi.customerServiceMessage.send({
      "touser": wxContext.OPENID,
      "msgtype": "image",
      "image": {
        "media_id": meida.mediaId
      }
    })
  } else {
    await cloud.openapi.customerServiceMessage.send({
      'touser': wxContext.OPENID,
      'msgtype': 'link',
      'link':{
        'title': '标题1',
        'url': 'https://www.baidu.com',
        'description': '描述',
        'thumb_url': 'url'
      }
    })
  }
  return 'success'
}
