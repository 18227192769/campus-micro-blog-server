const dynamicDao = require("../dao/dynamicDao");
const multer = require('multer');
const upload = multer({ dest: './resource/img/' });
const fs = require('fs');
const url = require('url');


const path = new Map();
// 获取话题列表
function getTopicList (request, response) {
    dynamicDao.selectTopicList_topic()
        .then(data => {
            const result = data.map(item => item.topic);
            response.status(200);
            response.write( JSON.stringify({
                msg: 'ok',
                status: 'success',
                result
            }) );
            response.end();
        }, err => {
            console.log(err);
            response.status(500);
            response.write("服务端错误！");
            response.end();
        })
}
path.set('/getTopicList', {
    type: 'get',
    fn: getTopicList
})

// 获取动态列表 -- 阅读量最多的5个
async function getDynamicInfoByReadNum (request, response) {
    // 查询动态
    const result = await dynamicDao.selectDynamicInfoByReadNum();
    if (result.Error) {
        response.status(500);
        response.write( JSON.stringify({
            msg: '服务端错误！',
            status: 'success'
        }) );
        response.end();
        return;
    }
    const resultPromiseSet = result.map(async item => {
        const { phone, id, type } = item;
        // 查询用户数据
        const userInfo = await dynamicDao.selectUserInfo(phone);
        if (userInfo.Error) {
            console.log('查询出错啦！');
            return;
        }
        let imgSrc = [];
        if (type === 'bigImg') {
            imgSrc = await dynamicDao.selectBigImgPath(id);
        }
        if (type === 'nineImg') {
            imgSrc = await dynamicDao.selectNineImgPath(id);
        }
        if (imgSrc.Error) {
            console.log('查询出错啦！');
            return;
        }
        // 拼接用户数据
        return {...item, ...userInfo[0], imgFilePath: imgSrc};
    })
    Promise.all(resultPromiseSet)
        .then(data => {
            response.status(200);
            response.write( JSON.stringify({
                msg: 'ok',
                status: 'success',
                data
            }) );
            response.end();
        })
}
path.set('/getDynamicInfoByReadNum', {
    type: 'get',
    fn: getDynamicInfoByReadNum
})

// 发表动态 & 纯文本
function pushDynamic (request, response) {
    const dynamicInfo = request.body;
    console.log(dynamicInfo);
    dynamicDao.insertDynamic(dynamicInfo)
        .then(data => {
            console.log(data);
            const result = data.affectedRows && data.affectedRows === 1;
            if (!result) {
                response.status(500)
                response.write( JSON.stringify({
                    msg: 'error',
                    status: 'fail'
                }) )
            }
            response.status(200);
            response.write( JSON.stringify({
                msg: 'ok',
                status: 'success'
            }) )
            response.end();
        })
}
path.set('/pushDynamic', {
    type: 'post',
    fn: pushDynamic
})

// 发表动态 & 大图
function pushDynamicBigImg (request, response) {
    const dynamicInfo = request.body;
    const { id } = dynamicInfo;
    console.log(request);
    const { filename, path:src, size } = request.file;
    Promise.all([ dynamicDao.insertDynamic(dynamicInfo), dynamicDao.insertBigImg(id, src) ])
        .then(data => {
            const result = data.every(item => item.affectedRows && item.affectedRows === 1);
            if (!result) {
                response.status(500)
                response.write( JSON.stringify({
                    msg: 'error',
                    status: 'fail'
                }) )
            }
            response.status(200);
            response.write( JSON.stringify({
                msg: 'ok',
                status: 'success'
            }) )
            response.end();
        })
}
path.set('/pushDynamicBigImg', {
    type: 'post-m',
    middleware: upload.single("imgFile"),
    fn: pushDynamicBigImg
})

// 发表动态 & 九宫格
function pushDynamicNineImg (request, response) {
    const dynamicInfo = request.body;
    const { id } = dynamicInfo;
    const srcArr = request.files.map(item => item.path);
    Promise.all([ dynamicDao.insertDynamic(dynamicInfo), dynamicDao.insertNineImg(id, srcArr) ])
        .then(data => {
            const result = data.every(item => item.affectedRows && item.affectedRows === 1);
            if (!result) {
                response.status(500)
                response.write( JSON.stringify({
                    msg: 'error',
                    status: 'fail'
                }) )
            }
            response.status(200);
            response.write( JSON.stringify({
                msg: 'ok',
                status: 'success'
            }) )
            response.end();
        })
}
path.set('/pushDynamicNineImg', {
    type: 'post-m',
    middleware: upload.array("imgFiles"),
    fn: pushDynamicNineImg
})

// 获取图片
function getPic (request, response) {
    const { path } = url.parse(request.url, true).query;
    try {
        const pic = fs.readFileSync(path);
        response.status(200);
        response.write(pic);
        response.end();
    } catch (error) {
        response.status(404);
        response.end();
    }
}
path.set('/getPic', {
    type: 'get',
    fn: getPic
})


module.exports.path = path