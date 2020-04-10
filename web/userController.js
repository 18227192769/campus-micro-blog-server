const userDao = require('../dao/userDao');
const cipher = require('../tools/cipher');
const url = require('url');
const multer = require('multer');
const fs = require('fs');

const upload = multer({ dest: './resource/img/' })

const path = new Map();

const successInfo = {
    msg: 'ok',
    status: 'success'
}
const failInfo = {
    msg: 'error',
    status: 'fail'
}

// 注册
function userRegister (request, response) {
    const userInfo = request.body;
    console.log(userInfo);
    userDao.insertUserInfo(userInfo, (result) => {
        let responseObj = null;
        if (result) {
            responseObj = result;
        } else {
            responseObj = {
                status: 'success',
                msg: 'register success'
            }
        } 
        response.status(200);
        response.write( JSON.stringify( responseObj ) );
        response.end();
    })
}

path.set('/userRegister', {
    type: 'post',
    fn: userRegister
})

// 检验用户昵称唯一性
function checkUserNick (request, response) {
    const { userNick } = url.parse(request.url, true).query;
    userDao.isAlready_userNick(userNick, (result) => {
        response.status(200);
        response.write( JSON.stringify({
            status: 'success',
            msg: 'ok',
            result
        }) );
        response.end();
    })
}
path.set('/checkUserNick', {
    type: 'get',
    fn: checkUserNick
})
// 检验手机号唯一性
function checkPhone (request, response) {
    const { phone } = url.parse(request.url, true).query;
    userDao.isAlready_phone(phone, (result) => {
        response.status(200);
        response.write( JSON.stringify({
            status: 'success',
            msg: 'ok',
            result
        }) );
        response.end();
    })
}
path.set('/checkPhone', {
    type: 'get',
    fn: checkPhone
})


// 登录
function userLogin (request, response) {
    response.setHeader('Content-type', 'application/json;charset=utf-8');
    const { phone, password } = url.parse(request.url, true).query;
    userDao.login(phone, (data) => {
        let responseObj = 1;
        if (!data.length) {
            responseObj = {
                status: 'fail',
                msg: 'the user is not exit'
            }
        } else {
            const deCodePassword = cipher.getDeCodeData(data[0].password);
            let msg = 'password error';
            if (password === deCodePassword) {
                msg = 'login success';
                userDao.selectUserInfo(phone, (data) => {
                    responseObj = {
                        status: 'success',
                        msg,
                        data
                    }
                    response.write( JSON.stringify(responseObj) );
                    response.end();
                })
                return;
            }
            responseObj = {
                status: 'fail',
                msg
            }
        }
        response.write( JSON.stringify(responseObj) );
        response.end();
    })
}

path.set('/userLogin', {
    type: 'get',
    fn: userLogin
})

// 查询用户信息
function selectUserInfo (request, response) {
    response.setHeader('Content-type', 'application/json;charset=utf-8');
    const { phone } = url.parse(request.url, true).query;
    userDao.selectUserInfo(phone, (data) => {
        response.write( JSON.stringify({
            msg: 'ok',
            status: 'success',
            data
        }) )
        response.status(200);
        response.end();
    })
}
path.set('/selectUserInfo', {
    type: 'get',
    fn: selectUserInfo
})

// 设置用户信息
function setUserInfo (request, response) {
    const userInfo = request.body;
    userDao.saveUserInfo(userInfo, (data) => {
        response.write( JSON.stringify({
            msg: 'ok',
            status: 'success'
        }) )
        response.end();
    })
}
path.set('/setUserInfo', {
    type: 'post',
    fn: setUserInfo
})

// 更新用户头像
async function setUserImage (request, response) {
    const { phone, type } = request.body;
    const { path: imageFile } = request.file;

    let resultPromise = null;
    let lastImageFile = null;
    if (type === 'userImage') {
        lastImageFile = await userDao.selectUserAvatarImage(phone);
        resultPromise = userDao.updateUserAvatarImage(phone, imageFile);
    } else if (type === 'backImage') {
        lastImageFile = await userDao.selectUserbackImage(phone);
        resultPromise = userDao.updateUserbackImage(phone, imageFile);
    }
    // 如果之前存在头像则将之前的头像图片删除掉
    const lastImagePath = lastImageFile[0].userImage;
    if (lastImagePath) {
        fs.unlink(`./${lastImagePath}`, (err, data) => {
            if (err) {
                console.log(err);
            }
            console.log(data);
        })
    } 
    // 更新图片的异步任务
    resultPromise.then(data => {
        if (data.affectedRows === 1) {
            response.status(200);
            response.write( JSON.stringify({
                msg: 'ok',
                status: 'success',
                data: {
                    imageFile
                }
            }) )
            response.end();
            return;
        }
        response.status(404);
        response.write( JSON.stringify({
            msg: 'error',
            status: 'fail'
        }) )
        response.end();
    })
}
path.set('/setUserImage', {
    type: 'post-m',
    middleware: upload.single("imageFile"),
    fn: setUserImage
});

// 关注
async function concernUser (request, response) {
    const { id, userPhone, concernUserPhone } = request.body;
    // 添加关注
    const concernResult = await userDao.inserConcern(id, userPhone, concernUserPhone);
    // 统计关注数
    const concernNumSet = await userDao.countConcernNum(userPhone);
    // 更新关注数
    userDao.updateUserConcernNum(concernNumSet[0].concernNum, userPhone); 
    // 被关注者添加粉丝
    const fansResult = await userDao.inserFans(id, concernUserPhone, userPhone);
    // 统计粉丝数
    const fansNumSet = await userDao.countFansNum(concernUserPhone);
    // 更新粉丝数
    userDao.updateUserFansNum(fansNumSet[0].fansNum, concernUserPhone); 

    if (concernResult.affectedRows !== 1 || fansResult.affectedRows !== 1) {
        response.status(500);
        response.write(JSON.stringify(failInfo));
    } else {
        response.status(200);
        response.write(JSON.stringify(successInfo));
    }
    response.end();
}
path.set('/concernUser', {
    type: 'post',
    fn: concernUser
})

// 取关
 async function cancelConcern (request, response) {
    const { userPhone, concernUserPhone } = request.body;
    // 取消关注
    const concernResult = await userDao.delConcern(userPhone, concernUserPhone)
    // 统计关注数
    const concernNumSet = await userDao.countConcernNum(userPhone);
    // 更新关注数
    userDao.updateUserConcernNum(concernNumSet[0].concernNum, userPhone); 

    // 被关注者失去粉丝
    const fansResult = await userDao.delFans(concernUserPhone, userPhone);
    // 统计粉丝数
    const fansNumSet = await userDao.countFansNum(concernUserPhone);
    // 更新粉丝数
    userDao.updateUserFansNum(fansNumSet[0].fansNum, concernUserPhone); 

    if (concernResult.affectedRows !== 1 || fansResult.affectedRows !== 1) {
        response.status(500);
        response.write(JSON.stringify(failInfo));
    } else {
        response.status(200);
        response.write(JSON.stringify(successInfo));
    }
    response.end();
}
path.set('/cancelConcern', {
    type: 'post',
    fn: cancelConcern
})

// 获取用户关注列表
function getUserConcernList (request, response) {
    const { phone } = url.parse(request.url, true).query;
    userDao.selectConcernList(phone).then(result => {
        const promiseTaskArr = result.map(async item => {
            const { concernUserPhone } = item;
            const userInfo = await userDao.selectUserBaseInfo(concernUserPhone);
            return {...item, ...userInfo[0]}
        })
        Promise.all(promiseTaskArr).then(result => {
            response.status(200);
            response.write(JSON.stringify({
                concernList: result
            }));
            response.end();
        })
        
    })
}
path.set('/getUserConcernList', {
    type: 'get',
    fn: getUserConcernList
})

// 获取用户粉丝列表
function getUserFansList (request, response) {
    const { phone } = url.parse(request.url, true).query;
    userDao.selectFansList(phone).then(result => {

        const promiseTaskArr = result.map(async item => {
            const { fansPhone  } = item;
            const userInfo = await userDao.selectUserBaseInfo(fansPhone );
            return {...item, ...userInfo[0]}
        })
        Promise.all(promiseTaskArr).then(result => {
            response.status(200);
            response.write(JSON.stringify({
                fansList: result
            }));
            response.end();
        })
    })
}
path.set('/getUserFansList', {
    type: 'get',
    fn: getUserFansList
})

// 管理员登录
function adminLogin (request, response) {
    const { username, password } = request.body;
    userDao.adminLogin(username).then(result => {
        if (!result.length) {
            response.write(JSON.stringify(failInfo))
        } else if (result[0].password !== password) {
            response.write(JSON.stringify(failInfo))
        } else if (result[0].password === password) {
            response.write(JSON.stringify(successInfo))
        }
        response.status(200)
        response.end();
    })
}
path.set('/adminLogin', {
    type: 'post',
    fn: adminLogin
})

// 用户登录记录
function saveLoginDate (request, response) {
    const { id, loginDate } = request.body;
    userDao.loginCount(id, loginDate).then(result => {
        if (result.affectedRows === 1) {
            response.write(JSON.stringify(successInfo))
            response.status(200)
            response.end();
            return;
        }
        response.write(JSON.stringify(failInfo))
        response.status(500)
        response.end();
    })
}
path.set('/saveLoginDate', {
    type: 'post',
    fn: saveLoginDate
})

module.exports = {
    path
}