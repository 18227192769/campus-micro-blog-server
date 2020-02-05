const crypto = require('crypto');
const password = 'campusDynamic';
// 加密数据
function getEnCodeData (data) {
    const cipher = crypto.createCipher('aes192', password);
    let cipherData = cipher.update(data, 'utf-8', 'hex');
    cipherData += cipher.final('hex');
    return cipherData;
}
// 解密数据
function getDeCodeData (data) {
    const decipher = crypto.createDecipher('aes192', password);
    let decipherData = decipher.update(data, 'hex', 'utf-8');
    decipherData += decipher.final('utf-8');
    return decipherData;
}

module.exports = {
    password,
    getEnCodeData,
    getDeCodeData
}