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
    const { phone, password } = url.parse(request.url, true).query;
    userDao.login(phone, (data) => {
        let responseObj = null;
        if (!data.length) {
            responseObj = {
                status: 'fail',
                msg: 'the user is not exit'
            }
        } else {
            const deCodePassword = cipher.getDeCodeData(data[0].password);
            const msg = (password === deCodePassword) ? 'login success' : 'password error';
            // response.cookie("userPhone", data[0].phone);
            responseObj = {
                status: 'success',
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

module.exports = {
    path
}