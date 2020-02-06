const userDao = require('../dao/userDao');
const cipher = require('../tools/cipher');
const url = require('url');

const path = new Map();

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

module.exports = {
    path
}