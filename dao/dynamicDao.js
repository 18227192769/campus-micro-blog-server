const { baseDB } = require("./dbutil");

// 查询话题列表
function selectTopicList_topic () {
    const sqlString = 'select topic from topic_list';
    return baseDB(sqlString, []);
}
// 统计用户动态条数
function countDynamicNum (phone) {
    const sqlString = 'select count(*) as dynamicNum from dynamic where phone=?'
    return baseDB(sqlString, [phone]);
}
// 插入评论信息
function insertComment (commentInfo) {
    const sqlString = 'insert into commentlist values(?,?,?,?,?)';
    const params = Object.values(commentInfo);
    return baseDB(sqlString, params)
}
// 插入动态信息 -- 发布动态
function insertDynamic (dynamicInfo) {
    const sqlString = 'insert into dynamic(topic, id, type, phone, push_date, content) values(?,?,?,?,?,?)';
    const { topic, id, type, phone, push_date, content } = dynamicInfo;
    const params = [topic, id, type, phone, push_date, content];
    return baseDB(sqlString, params);
}
// 插入动态信息 -- 转发动态
function insertDynamic_ref (dynamicInfo) {
    const sqlString = 'insert into dynamic values(?,?,?,?,?,?,?,?,?,?,?)';
    const params = Object.values(dynamicInfo);
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

// 查询评论信息
function selectComment (id) {
    const sqlString = 'select * from commentList where dynamicId = ?'
    return baseDB(sqlString, [id]);
}
// 查询用户的动态信息
function selectDynamicInfoByUserPhone (phone) {
    const sqlString = 'select * from dynamic where phone = ?';
    return baseDB(sqlString, [phone]);
}
// 查询热门动态信息 
function selectDynamicInfoByReadNum () {
    const sqlString = 'select * from dynamic order by read_num desc limit 15'
    return baseDB(sqlString, []);
}
// 获取所有动态新
function selectAllDynamic () {
    const sqlString = 'select * from dynamic';
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
// 更新动态点赞数
function updateDynamicLikeNum (id, value) {
    const sqlString = 'update dynamic set like_num =? where id=?'
    return baseDB(sqlString, [value, id]);
}

// 更新动态阅读数
function updateDynamicReadNum (id, value) {
    const sqlString = 'update dynamic set read_num =? where id=?'
    return baseDB(sqlString, [value, id]);
}

// 删除评论
function deleteComment (id) {
    const sqlString = "delete from commentlist where id = ?";
    return baseDB(sqlString, [id]);
}

// 获取评论数
function getCommentNumById (id) {
    const sqlString = 'select count(*) as commentNum from commentlist where dynamicId=?';
    return baseDB(sqlString, [id])
}

// 获取大图路径
function getBigImgById (id) {
    const sqlString = 'select filepath from bigimage where id=?';
    return baseDB(sqlString, [id])
}

function updateRefNum (id, forward_num) {
    const sqlString = 'update dynamic set forward_num =? where id=?';
    return baseDB(sqlString, [forward_num, id]);
}

module.exports = {
    selectTopicList_topic,
    selectDynamicInfoByReadNum,
    selectDynamicInfoByUserPhone,
    selectAllDynamic,
    selectUserInfo,
    selectBigImgPath,
    selectNineImgPath,
    selectComment,
    insertComment,
    insertDynamic,
    insertDynamic_ref,
    insertBigImg,
    insertNineImg,
    countDynamicNum,
    updateDynamicLikeNum,
    updateDynamicReadNum,
    updateRefNum,
    deleteComment,
    getCommentNumById,
    getBigImgById
}