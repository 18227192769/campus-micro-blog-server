const { baseDB } = require("./dbutil");

const newsPointMaxNum = 7 // 新闻列表最大节点数

function inserNewsHead (id, newsDate, newsTitle, newsFrom) {
    const sqlString = 'insert into newslist value(?,?,?,?)'
    return baseDB(sqlString, [id, newsDate, newsTitle, newsFrom])
}

function inserNewsContent (data) {
    const sqlString = 'insert into newslist_content value(?,?,?,?,?,?,?)';
    let params = Object.values(data);
    params.length = newsPointMaxNum;
    params = params.map(item => (item || null))
    return baseDB(sqlString, params)
}

function insertNewsImg (data) {
    const sqlString = 'insert into newlist_img value(?,?,?,?,?,?,?)';
    data.length = newsPointMaxNum;
    data = data.map(item => (item || null));
    return baseDB(sqlString, data);
}

function selectNewsBaseInfo (data) {
    const sqlString = 'select * from newslist';
    return baseDB(sqlString, []);
}

function selectNews_imgById (id) {
    const sqlString = 'select * from newlist_img where id=?'
    return baseDB(sqlString, [id]);
}

function selectNews_contentById (id) {
    const sqlString = 'select * from newslist_content where id=?'
    return baseDB(sqlString, [id]);
}

function searchNewsByTitle (title) {
    const sqlString = "select * from newslist where newsTitle like ?";
    title = `%${title}%`;
    return baseDB(sqlString, [title])
}

function searchNewsByTime (time) {
    const startTime = `${time[0]} 00:00:00`;
    const endTime = `${time[1]} 23:59:59`;
    const sqlString = 'select * from newslist where newsDate BETWEEN ? and ?';
    return baseDB(sqlString, [startTime, endTime]);
}

function searchNews (title, time) {
    const startTime = `${time[0]} 00:00:00`;
    const endTime = `${time[1]} 23:59:59`;
    title = `%${title}%`;
    const sqlString = 'select * from newslist where newsTitle like ? and newsDate BETWEEN ? and ?';
    return baseDB(sqlString, [title, startTime, endTime]);
}

function deleteNews_head (id) {
    const sqlString = 'delete from newslist where id=?';
    return baseDB(sqlString, [id]);
}

function deleteNews_content (id) {
    const sqlString = 'delete from newslist_content where id=?';
    return baseDB(sqlString, [id]);
}

function deleteNews_img (id) {
    const sqlString = 'delete from newlist_img where id=?';
    return baseDB(sqlString, [id]);
}

module.exports = {
    inserNewsHead,
    inserNewsContent,
    insertNewsImg,
    selectNewsBaseInfo,
    selectNews_imgById,
    selectNews_contentById,
    searchNewsByTitle,
    searchNewsByTime,
    searchNews,
    deleteNews_head,
    deleteNews_content,
    deleteNews_img
}