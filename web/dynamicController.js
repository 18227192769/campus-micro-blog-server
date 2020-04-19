const dynamicDao = require("../dao/dynamicDao");
const userDao = require('../dao/userDao');
const multer = require('multer');
const upload = multer({ dest: './resource/img/' });
const fs = require('fs');
const url = require('url');


const path = new Map();
const successInfo = {
    msg: 'ok',
    status: 'success'
}
const failInfo = {
    msg: 'error',
    status: 'fail'
}

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

// 获取评论信息
async function getCommentInfo (id) {
    const commentInfo = await dynamicDao.selectComment(id);
    const promiseTaskArr = commentInfo.map(async item => {
        if (!item) return;
        const commentUserInfo = await dynamicDao.selectUserInfo(item.commentUserPhone);
        return {
            ...item,
            ...commentUserInfo[0]
        }
    })
    const result = await Promise.all(promiseTaskArr);
    return result
}

async function getDynamicInfo (fn, response) {
    // 查询动态
    const result = await fn.targetDao(fn.params);
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
        const commentList = await getCommentInfo(id);
        // 拼接用户数据
        return {
            ...item, 
            ...userInfo[0], 
            imgFilePath: imgSrc, 
            commentList: Object.values(commentList)
        }
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

// 获取动态列表 -- 阅读量最多的5个
function getDynamicInfoByReadNum (request, response) {
    getDynamicInfo({ 
        targetDao: dynamicDao.selectDynamicInfoByReadNum,
        params: null
    }, response);
}
path.set('/getDynamicInfoByReadNum', {
    type: 'get',
    fn: getDynamicInfoByReadNum
})

// 获取全部动态
function getAllDynamic (request, response) {
    dynamicDao.selectAllDynamic().then(result => {
        response.status(200);
        response.write(JSON.stringify({
            ...successInfo,
            data: result
        }))
        response.end();
    })
}
path.set('/getAllDynamic', {
    type: 'get',
    fn: getAllDynamic
})

// 获取用户动态列表
function getDynamicInfoByUserPhone (request, response) {
    const { phone } = url.parse(request.url, true).query;
    getDynamicInfo({ 
        targetDao: dynamicDao.selectDynamicInfoByUserPhone,
        params: phone
    }, response);
}
path.set('/getDynamicInfoByUserPhone', {
    type: 'get',
    fn: getDynamicInfoByUserPhone
})

// 发表动态 & 纯文本
function pushDynamic (request, response) {
    const dynamicInfo = request.body;
    console.log(dynamicInfo);
    dynamicDao.insertDynamic(dynamicInfo)
        .then(async data => {
            console.log(data);
            const result = data.affectedRows && data.affectedRows === 1;
            if (!result) {
                response.status(500)
                response.write( JSON.stringify({
                    msg: 'error',
                    status: 'fail'
                }) )
            }
            const dynamicNumSet = await dynamicDao.countDynamicNum(dynamicInfo.phone);
            userDao.updateUserDynamicNum(dynamicInfo.phone, dynamicNumSet[0].dynamicNum);

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
        .then(async data => {
            const result = data.every(item => item.affectedRows && item.affectedRows === 1);
            if (!result) {
                response.status(500)
                response.write( JSON.stringify({
                    msg: 'error',
                    status: 'fail'
                }) )
            }
            const dynamicNumSet = await dynamicDao.countDynamicNum(dynamicInfo.phone);
            console.log(dynamicNumSet);
            userDao.updateUserDynamicNum(dynamicInfo.phone, dynamicNumSet[0].dynamicNum);

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
        .then(async data => {
            const result = data.every(item => item.affectedRows && item.affectedRows === 1);
            if (!result) {
                response.status(500)
                response.write( JSON.stringify({
                    msg: 'error',
                    status: 'fail'
                }) )
                response.end();
            }
            const dynamicNumSet = await dynamicDao.countDynamicNum(dynamicInfo.phone);
            console.log(dynamicNumSet);
            userDao.updateUserDynamicNum(dynamicInfo.phone, dynamicNumSet[0].dynamicNum);

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

// 转发动态
function refDynamic (request, response) {
    const paramsData = request.body;
    dynamicDao.insertDynamic_ref(paramsData).then(async result => {
        if (result.affectedRows !== 0) {
            // 更新用户动态数
            const dynamicNumSet = await dynamicDao.countDynamicNum(paramsData.phone);
            userDao.updateUserDynamicNum(paramsData.phone, dynamicNumSet[0].dynamicNum);
            response.status(200);
            response.write(JSON.stringify({
                ...successInfo
            }))
        } else {
            response.status(500);
            response.write(JSON.stringify({
                ...failInfo
            }))
        }
        response.end()
    })
}
path.set('/refDynamic', {
    type: 'post',
    fn: refDynamic
})

// 存储大图
function saveBigImage (request, response) {
    const { id, src } = request.body;
    dynamicDao.insertBigImg(id, src).then(result => {
        if (result.affectedRows !== 0) {
            response.status(200);
            response.write(JSON.stringify({
                ...successInfo
            }))
        } else {
            response.status(500);
            response.write(JSON.stringify({
                ...failInfo
            }))
        }
        response.end()
    })
}
path.set('/saveBigImage', {
    type: 'post',
    fn: saveBigImage
})

// 存储九宫格
function saveNineImg (request, response) {
    const { id, srcArr } = request.body;
    dynamicDao.insertNineImg(id, srcArr).then(result => {
        if (result.affectedRows !== 0) {
            response.status(200);
            response.write(JSON.stringify({
                ...successInfo
            }))
        } else {
            response.status(500);
            response.write(JSON.stringify({
                ...failInfo
            }))
        }
        response.end()
    })
}
path.set('/saveNineImg', {
    type: 'post',
    fn: saveNineImg
})

// 发表评论
function pushComment (request, response) {
    const commentData = request.body;
    dynamicDao.insertComment(commentData).then(result => {
        if (result.affectedRows !== 0) {
            response.status(200);
            response.write(JSON.stringify({
                ...successInfo
            }))
        } else {
            response.status(500);
            response.write(JSON.stringify({
                ...failInfo
            }))
        }
        response.end()
    })
}
path.set('/pushComment', {
    type: 'post',
    fn: pushComment
})

// 删除评论
function delComment (request, response) {
    const { id } = request.body;
    dynamicDao.deleteComment(id).then(result => {
        if (result.affectedRows !== 1) {
            response.status(500);
            response.write(JSON.stringify(failInfo));
        } else {
            response.status(200);
            response.write(JSON.stringify(successInfo));
        }
        response.end();
    })
}
path.set('/delComment', {
    type: 'post',
    fn: delComment
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

// 点赞
function addLike (request, response) {
    const { id, likeNum } = request.body;
    dynamicDao.updateDynamicLikeNum(id, likeNum)
        .then(data => {
            if (data.affectedRows && data.affectedRows === 1) {
                response.status(200);
                response.write( JSON.stringify({
                    msg: 'ok',
                    status: 'success'
                }) )
                response.end();
                return;
            }
            response.status(500);
            response.write( JSON.stringify({
                msg: 'error',
                status: 'fail'
            }) )
            response.end();
        })
}
path.set('/addLike', {
    type: 'post',
    fn: addLike
})

// 阅读
function addRead (request, response) {
    const { id, readNum } = request.body;
    dynamicDao.updateDynamicReadNum(id, readNum)
        .then(data => {
            if (data.affectedRows && data.affectedRows === 1) {
                response.status(200);
                response.write( JSON.stringify({
                    msg: 'ok',
                    status: 'success'
                }) )
                response.end();
                return;
            }
            response.status(500);
            response.write( JSON.stringify({
                msg: 'error',
                status: 'fail'
            }) )
            response.end();
        })
}
path.set('/addRead', {
    type: 'post',
    fn: addRead
})

// 获取评论数
function getCommentNum (request, response) {
    const { id } = url.parse(request.url, true).query;
    dynamicDao.getCommentNumById(id).then(result => {
        response.status(200);
        response.write(JSON.stringify({
            ...successInfo,
            data: result[0].commentNum
        }));
        response.end();
    })
}
path.set('/getCommentNum', {
    type: 'get',
    fn: getCommentNum
})

// 获取大图路径
function getBigImg (request, response) {
    const { id } = url.parse(request.url, true).query;
    dynamicDao.getBigImgById(id).then(result => {
        response.status(200);
        response.write(JSON.stringify({
            ...successInfo,
            data: result[0].filepath
        }));
        response.end();
    })
}
path.set('/getBigImg', {
    type: 'get',
    fn: getBigImg
})

function updateRefNum (request, response) {
    const { id, forward_num } = request.body;
    dynamicDao.updateRefNum(id, forward_num).then(result => {
        console.log(result);
    })
}
path.set('/updateRefNum', {
    type: 'post',
    fn: updateRefNum
})

module.exports.path = path