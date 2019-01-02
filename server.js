/**
 * Created by admin on 2018/2/9.
 */

var http = require('http');
const fs = require('fs');
const path = require('path');
var express = require('express');
var tasks = require('./routes/tasks');

var app = express();


app.use("/", express.static(__dirname + '/'));


// requset
app.get("/zhuanhuan",function (req, res) {

    var dirName = path.join(__dirname,'/lib/area/AreaData.json');
    console.log(dirName)

    /*fs.readFile(path.join(__dirname,'/lib/area/AreaData.json'),'utf8',function (err, data) {
        if(err) console.log(err);
        var test1=JSON.parse(data);
        var t = JSON.stringify(test1);
        fs.writeFileSync(path.join(__dirname,'/lib/area/AreaData.json'),t)
    });*/

})

app.get("/goget",tasks.getTask)


// 创建服务端
http.createServer(app).listen('8087', function() {
    console.log('start over 8087-----');
});