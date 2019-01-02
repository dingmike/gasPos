/**
 * Created by admin on 2018/3/18.
 */
// 引用tasks模型
var Task = require('../models/tasks');

// 根据taskid获取任务数据
exports.getTask = function(req, res) {
     var taskid = req.params.taskid;
    Task.findAll(function(success, result){
       /* if(success){
            console.log(success);

            var newData = [];
            var provinces = [];
            //操作数据
            for(var i=0;i<result.length;i++){
                if(result[i].pid===0){
                    provinces.push(result[i]);
                }
            }
            console.log(provinces);
            var cities = [];
            for(var j=0;j<provinces.length;j++){
                var childArr = [];
                for(var k=0;k<result.length; k++){
                    if(provinces[j].id===result[k].pid){
                        childArr.push(result[k]);
                        console.log('childArr:' + childArr.length);
                        cities.push(result[k]);
                    }
                }
                provinces[j]['child'] = childArr;

            }
            console.log('provinces:' + provinces);

            for(var m=0;m<cities.length;m++){
                var childArr = []; //quxian
                for(var n=0;n<result.length; n++){
                    if(cities[m].id===result[n].pid){
                        childArr.push(result[n]);
                    }
                }
                cities[m]['child'] = childArr;
            }
            res.send({
                data: provinces
            });
        }*/

        if(success){
            console.log(success);
            console.log(result);

            var newData = [];
            var provinces = [];
            //操作数据
            for(var i=0;i<result.length;i++){
                if(result[i].Pid===1){
                    provinces.push(result[i]);
                }
            }
            console.log(provinces);
            var cities = [];
            for(var j=0;j<provinces.length;j++){
                var childArr = [];
                for(var k=0;k<result.length; k++){
                    if(provinces[j].Id===result[k].Pid){
                        childArr.push(result[k]);
                        console.log('childArr:' + childArr.length);
                        cities.push(result[k]);
                    }
                }
                provinces[j]['child'] = childArr;

            }
            console.log('provinces:' + provinces);

            for(var m=0;m<cities.length;m++){
                var childArr = []; //quxian
                for(var n=0;n<result.length; n++){
                    if(cities[m].Id===result[n].Pid){
                        childArr.push(result[n]);
                    }
                }
                cities[m]['child'] = childArr;
            }
            res.send({
                data: provinces
            });
        }

    });
}