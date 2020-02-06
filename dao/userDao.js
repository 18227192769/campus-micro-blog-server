const { createConnection } = require('./dbutil');
const cipher = require('../tools/cipher');

// 注册
function insertUserInfo (userInfo, callback) {
    // 获取db实例
    const db = createConnection();

    // 解构用户信息
    let {userId, userNick, password, email, phone, userSex} = userInfo;
    // 加密密码
    password = cipher.getEnCodeData(password);
    // sql
    const insertUserlistSql = 'insert into userlist(userId, phone, password) values (?, ?, ?)';
    const params1 = [userId, phone, password];
    const insertUserInfoSql = 'insert into userInfo(userId, userNick, email, phone, userSex) values (?, ?, ?, ?, ?)'
    const params2 = [userId, userNick, email, phone, userSex];
    // 创建连接
    db.connect();
    // 注册
    db.query(insertUserlistSql, params1, (err, data) => {
        let result = null;
        if (err) {
            result = {
                status: err.code,
                msg: err.sqlMessage
            }
        }
        typeof callback === "function" && callback(result)
    })
    // 同步到用户信息表
    db.query(insertUserInfoSql, params2);
    
    // 关闭连接
    db.end();
}

// 检验用户昵称唯一性
function isAlready_userNick (usernick, callback) {
    const db = createConnection();
    const sqlString = 'select userNick from userInfo where userNick=?'

    db.connect();
    db.query(sqlString, [usernick], (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        const result = !data.length ? true : false;
        typeof callback === 'function' && callback(result);

    })
    db.end();
}
// 检验手机号唯一性
function isAlready_phone (phone, callback) {
    const db = createConnection();
    const sqlString = 'select phone from userlist where phone=?'
    db.connect();
    db.query(sqlString, [phone], (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        const result = !data.length ? true : false;
        typeof callback === 'function' && callback(result);
    })
    db.end();
}

// 登录
function login (phone, callback) {
    const db = createConnection();
    const sqlString = 'select password from userlist where phone=?';

    db.connect();
    db.query(sqlString, [phone], (err, data) => {
        if (err) {
            console.log(err);
            return;
        }
        typeof callback === 'function' && callback(data);
    });
    db.end();
}

// 查询用户信息
function selectUserInfo (phone, callback) {
    const db = createConnection();
    const sqlString = 'select * from userInfo where phone=?'
    db.connect();
    db.query(sqlString, [phone], (err, data) => {
        if (err){
            console.log(err);
            return;
        }
        console.log(data);
        typeof callback === 'function' && callback(data);
    });
    db.end();
}

// 保存用户信息
function saveUserInfo (userInfo, callback) {
    const db = createConnection();
    const { userPhone, userNick, userName, userSex, userAge, userSign, QQ, email } = userInfo
    const sqlString = 'update userInfo set userNick=?,userName=?,userSex=?,userAge=?,userSign=?,QQ=?,email=? where phone=?'
    const params = [userNick, userName, userSex, userAge, userSign, QQ, email, userPhone];
    db.connect();
    db.query(sqlString, params, (err, data) => {
        if (err){
            console.log(err);
            return;
        }
        console.log(data);
        typeof callback === 'function' && callback(data);
    });
    db.end();
}

module.exports = {
    insertUserInfo,
    isAlready_userNick,
    isAlready_phone,
    login,
    saveUserInfo,
    selectUserInfo
}