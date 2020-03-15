const { createConnection, baseDB } = require('./dbutil');
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

// 更新用户头像
function updateUserAvatarImage (phone, imgFile) {
    const sqlString = 'update userInfo set userImage=? where phone=?'
    return baseDB(sqlString, [imgFile, phone]);
}
// 更新用户背景图片
function updateUserbackImage (phone, imgFile) {
    const sqlString = 'update userInfo set backImage=? where phone=?'
    return baseDB(sqlString, [imgFile, phone]);
}
// 查询用户头像
function selectUserAvatarImage (phone) {
    const sqlString = 'select userImage from userInfo where phone=?'
    return baseDB(sqlString, [phone]);
}
// 查询用户背景图片
function selectUserbackImage (phone) {
    const sqlString = 'select backImage from userInfo where phone=?'
    return baseDB(sqlString, [phone]);
}

// 更新用户动态数
function updateUserDynamicNum (phone, dynamicNum) {
    const sqlString = 'update userinfo set dynamicNum=? where phone=?';
    return baseDB(sqlString, [ dynamicNum, phone ])
}

// 添加关注
function inserConcern (id, userPhone, concernUserPhone) {
    const sqlString = 'insert into concernlist values (?,?,?)'
    return baseDB(sqlString, [id, userPhone, concernUserPhone]);
}
// 添加粉丝
function inserFans (id, concernUserPhone, userPhone) {
    const sqlString = 'insert into fanslist values (?,?,?)'
    return baseDB(sqlString, [id, concernUserPhone, userPhone]);
}
// 取消关注
function delConcern (userPhone, concernUserPhone) {
    const sqlString = 'delete from concernlist where userPhone = ? and concernUserPhone = ?'
    return baseDB(sqlString, [userPhone, concernUserPhone]);
}
// 删除粉丝
function delFans (concernUserPhone, userPhone) {
    const sqlString = 'delete from fanslist where userPhone = ? and fansPhone = ?'
    return baseDB(sqlString, [concernUserPhone, userPhone]);
}
// 查询关注列表
function selectConcernList (phone) {
    const sqlString = 'select * from concernlist where userPhone = ?';
    return baseDB(sqlString, [phone]);
}
// 查询粉丝列表
function selectFansList (phone) {
    const sqlString = 'select * from fanslist where userPhone = ?';
    return baseDB(sqlString, [phone]);
}
// 查询用户基础信息
function selectUserBaseInfo (phone) {
    const sqlString = 'select userNick, userSign, userImage from userinfo where phone = ?';
    return baseDB(sqlString, [phone]);
}
// 统计用户关注数
function countConcernNum (phone) {
    const sqlString = 'select count(*) as concernNum from concernlist where userPhone = ?'
    return baseDB(sqlString, [phone]);
}
// 更新用户关注数
function updateUserConcernNum (concernNum, phone) {
    const sqlString = 'update userinfo set concernNum = ? where phone = ?';
    return baseDB(sqlString, [concernNum, phone]);
}
// 统计用户粉丝数
function countFansNum (phone) {
    const sqlString = 'select count(*) as fansNum from fanslist where userPhone = ?'
    return baseDB(sqlString, [phone]);
}
// 更新用户粉丝数
function updateUserFansNum (fansNum, phone) {
    const sqlString = 'update userinfo set fansNum = ? where phone = ?';
    return baseDB(sqlString, [fansNum, phone]);
}

module.exports = {
    insertUserInfo,
    isAlready_userNick,
    isAlready_phone,
    login,
    saveUserInfo,
    selectUserInfo,
    updateUserAvatarImage,
    updateUserbackImage,
    updateUserDynamicNum,
    selectUserAvatarImage,
    selectUserbackImage,
    inserConcern,
    inserFans,
    delConcern,
    delFans,
    selectConcernList,
    selectFansList,
    selectUserBaseInfo,
    countConcernNum,
    countFansNum,
    updateUserConcernNum,
    updateUserFansNum
}