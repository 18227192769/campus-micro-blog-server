const { baseDB } = require("./dbutil");

// 查询话题列表
function selectTopicList_topic () {
    const sqlString = 'select topic from topic_list';
    return baseDB(sqlString, []);
}
// 插入动态信息
function insertDynamic (dynamicInfo) {
    const sqlString = 'insert into dynamic(topic, id, type, phone, push_date, content) values(?,?,?,?,?,?)';
    const { topic, id, type, phone, push_date, content } = dynamicInfo;
    const params = [topic, id, type, phone, push_date, content];
    return baseDB(sqlString, params);
}
// 插入大图信息
function insertBigImg (id, src) {
    const sqlString = 'insert into bigimage values(?,?)';
    const params = [ id, src ];
    return baseDB(sqlString, params)
}
// 插入九宫格图片信息
function insertNineImg (id, srcArr) {
    const sqlString = 'insert into nineimage values(?,?,?,?,?,?,?,?,?,?)';
    const params = [id, ...srcArr];
    return baseDB(sqlString, params);
}
// 查询热门动态信息 
function selectDynamicInfoByReadNum () {
    const sqlString = 'select * from dynamic order by read_num desc limit 5'
    return baseDB(sqlString, []);
}
// 查询用户信息
function selectUserInfo (phone) {
    const sqlString = 'select userNick, userImage from userInfo where phone=?';
    return baseDB(sqlString, [phone]);
}
// 查询大图路径
function selectBigImgPath (id) {
    const sqlString = 'select filepath from bigimage where id=?'
    return baseDB(sqlString, [id]);
}
// 查询九宫格路径
function selectNineImgPath (id) {
    const sqlString = 'select filepath_1,filepath_2,filepath_3,filepath_4,filepath_5,filepath_6,filepath_7,filepath_8,filepath_9 from nineimage where id=?'
    return baseDB(sqlString, [id]);
}

module.exports = {
    selectTopicList_topic,
    selectDynamicInfoByReadNum,
    selectUserInfo,
    selectBigImgPath,
    selectNineImgPath,
    insertDynamic,
    insertBigImg,
    insertNineImg
}