/**
 * Created by admin on 2018/3/18.
 */
var mysql = require('mysql');   // 引用mysql模块。注意要先安装mysql： npm install mysql
var config = require('./db');

var onelib_pool = mysql.createPool(config.onelib, function (err, pool) {
    console.log(34343)
    pool.getConnection(function (err, connection) {
        if (err) {
            console.error(err.message);
            return;
        }
    console.log(connection);
    });
});
exports.onelib_pool = onelib_pool;