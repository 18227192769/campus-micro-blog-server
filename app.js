const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const loader = require('./loader');

const app = express();
// 配置静态资源目录
app.use(express.static('./page'));
// 配置解析cookie中间件
app.use(cookieParser());
// 配置解析body中间件
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// cors
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Authorization, Accept, X-Requested-With");
    res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
    next();
})

// 初始化controller配置
loader.init(app);

app.listen(3001, () => {
    console.log("app is run");
})

// 异常事件监听
process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});