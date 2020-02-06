const mysql = require('mysql');

function createConnection () {
    return mysql.createConnection({
        host: '127.0.0.1',
        port: '3306',
        user: 'root',
        password: '123456',
        database: 'campusdynamic'
    })
}

function baseDB (sqlString, params) {
    return new Promise((resolve, reject) => {
        const db = createConnection();
        db.connect();
        db.query(sqlString, params, (err, data) => {
            if (err) {
                console.log(err);
                reject(err);
                return;
            }
            resolve(data)
        });
        db.end();
    })
}

module.exports = {
    createConnection,
    baseDB
}