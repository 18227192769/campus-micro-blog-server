const newsDao = require('../dao/newsDao');
const multer = require('multer');
const upload = multer({ dest: './resource/newsImg/' });
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

// 上传新闻表头
function uploadNewsList_head (request, response) {
    console.log(request.body);
    const { id, nowTime: newsDate, title: newsTitle, from: newsFrom } = request.body;
    newsDao.inserNewsHead(id, newsDate, newsTitle, newsFrom).then(result => {
        if (result.affectedRows !== 1) {
            response.status(500);
            response.write(JSON.stringify(failInfo));
            response.end();
            return;
        }
        response.status(200);
        response.write(JSON.stringify(successInfo));
        response.end();
    })
}
path.set('/uploadNewsListHead', {
    type: 'post',
    fn: uploadNewsList_head
})

// 上传新闻内容
function uploadNewsList_content (request, response) {
    console.log(request.body);
    newsDao.inserNewsContent(request.body).then(result => {
        if (result.affectedRows !== 1) {
            response.status(500);
            response.write(JSON.stringify(failInfo));
            response.end();
            return;
        }
        response.status(200);
        response.write(JSON.stringify(successInfo));
        response.end();
    })

}
path.set('/uploadNewsListContent', {
    type: 'post',
    fn: uploadNewsList_content
})

// 上传新闻图片
function uploadNewsList_img (request, response) {
    const { id } = request.body;
    const pathArr = request.files.map(item => item.path);
    console.log(pathArr);
    newsDao.insertNewsImg([id, ...pathArr]).then(result => {
        if (result.affectedRows !== 1) {
            response.status(500);
            response.write(JSON.stringify(failInfo));
            response.end();
            return;
        }
        response.status(200);
        response.write(JSON.stringify(successInfo));
        response.end();
    })
}
path.set('/uploadNewsListImg', {
    type: 'post-m',
    middleware: upload.array("newsImage"),
    fn: uploadNewsList_img
})

// 获取新闻基础信息
function getNewsBaseInfo (request, response) {
    newsDao.selectNewsBaseInfo().then(result => {
        const resultData = {
            ...successInfo,
            data: result
        }
        response.status(200);
        response.write(JSON.stringify(resultData));
        response.end();
    })
}
path.set('/getNewsBaseInfo', {
    type: 'get',
    fn: getNewsBaseInfo
})


// 获取新闻详情
function getNewsItem (request, response) {
    const { id } = url.parse(request.url, true).query;
    const promiseArr = [
        newsDao.selectNews_imgById(id),
        newsDao.selectNews_contentById(id)
    ]

    Promise.all(promiseArr).then(result => {
        const newsImageArr = result[0];
        const newsContentArr = result[1];
        let newsData = [];
        if (newsImageArr !== null && newsContentArr !== null) {
            let newsImage = Object.values(newsImageArr[0]);
            let newsContent = Object.values(newsContentArr[0]);
            newsImage.shift();
            newsContent.shift();
            newsImage.forEach((item, index) => {
                if (!item) return;
                newsData.push({
                    content: newsContent[index],
                    image: item
                })
            })
        }
        const resultData = {
            ...successInfo,
            data: newsData
        }
        response.status(200);
        response.write(JSON.stringify(resultData));
        response.end();
    })
}
path.set('/getNewsItem', {
    type: 'get',
    fn: getNewsItem
})

// 搜索新闻
function searchNews (request, response) {
    const { searchTitle, searchTime } = request.body;
    let status = '';
    if (searchTitle) status += 'Title';
    if (searchTime) status += 'Time';
    console.log(searchTime, searchTitle);
    let promiseTask = null;
    switch (status) {
        case 'Title':
            promiseTask = newsDao.searchNewsByTitle(searchTitle);
            break;
        case 'Time':
            promiseTask = newsDao.searchNewsByTime(searchTime);
            break;
        case 'TitleTime':
            promiseTask = newsDao.searchNews(searchTitle, searchTime);
            break;
    }
    promiseTask.then(result => {
        const resultData = {
            ...successInfo,
            data: result
        }
        response.status(200);
        response.write(JSON.stringify(resultData));
        response.end();
    })
}
path.set('/searchNews', {
    type: 'post',
    fn: searchNews
})

// 删除新闻信息
async function deleteNewsInfoById (id) {
    const result = await newsDao.selectNews_imgById(id)
    imgPathArr = Object.values(result[0]);
    imgPathArr.shift();
    imgPathArr.forEach(imgPath => {
        if (!imgPath) {
            return;
        }
        fs.unlink(`./${imgPath}`, (err, data) => {
            if (err) {
                console.log(err);
            }
            console.log(data);
        })
    })
    
    return Promise.all([
        newsDao.deleteNews_head(id),
        newsDao.deleteNews_content(id),
        newsDao.deleteNews_img(id)
    ])
}

// 删除新闻接口
function deleteNews (request, response) {
    const { targetNewsIdArr } = request.body;
    const promiseTaskArr = [];
    targetNewsIdArr.forEach(id => {
        promiseTaskArr.push( deleteNewsInfoById(id) );
    })
    Promise.all(promiseTaskArr).then(result => {
        response.status(200);
        response.write(JSON.stringify({
            ...successInfo,
            data: result
        }))
        response.end();
    })
}
path.set('/deleteNews', {
    type: 'post',
    fn: deleteNews
})

module.exports.path = path
