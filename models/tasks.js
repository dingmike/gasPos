/**
 * Created by admin on 2018/3/18.
 */
var mysql = require('../config/mysql');// 获取数据库连接配置

exports.findAll = function(callback) {   // 增加一个方法，名为find，传入参数为id和回调函数callback

    // sql查询语句，注意这里的“?”号，它会在query的时候被处理
    // var sql = "SELECT * FROM yj_addres";
    var sql = "SELECT * FROM region";
    // 获取mysql的onelib_pool连接池，以回调的方式处理（即获取成功后，执行下一步）
    mysql.onelib_pool.getConnection(function(err, connection) {
        console.log('connnnnnnnn')
        if (err) {
            console.log('err33333:' + err);
            callback(true);
            return;
        }
        // 获取成功后，执行query
        // 注意到这里有三个参数，第一个是sql语句，第二个是一个数组，第三个是回调函数
        // 需要着重说明的是第二个参数，它将依次替换sql里的“?”号
        // sql语句被替换后，会是这样的："SELECT * FROM tasks WHERE id = " + id
        connection.query(sql, ['*'], function(err, results) {

            if (err) {
                console.log('err:' + err)
                callback(true);
                return;
            }
            callback(true, results);
        });
    });
};