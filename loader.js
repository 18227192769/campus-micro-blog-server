const fs = require('fs');

const webDirPath = './web';
// 读取目录数组
const webDirArr = fs.readdirSync(webDirPath);
const pathMap = new Map();

// 初始化controller配置
function init (app) {
    webDirArr && webDirArr.forEach(file => {
        const obj = require(`./${webDirPath}/${file}`);  
        // 如果未抛出path则认为该文件不是controller    
        if (!obj.path) return;
        // 根据path中value记录的type值分别配置get/post路由
        for (let [key, value] of obj.path) {
            if (pathMap.get(key)) throw new Error('路由名称重复，不符合设计规范');
            pathMap.set(key, value)
            // 配置路由
            initApi(app, key, value);
        }
    })
}

function initApi (app, controllerKey, controllerValue) {
    const { type, fn } = controllerValue;
    switch (type) {
        case 'get': 
            app.get(controllerKey, fn);
            break;
        case 'post':
            app.post(controllerKey, fn)
    }
}

module.exports = {
    init,
    pathMap
}