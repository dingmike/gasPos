function plusReady() {
	$$.CheckloginState();
	var clickNum = 0;
	var webview = plus.webview.currentWebview();
	plus.key.addEventListener('backbutton', function() {
		webview.canBack(function(e) {
			clickNum++;
			if(clickNum > 1) {
				plus.runtime.quit();
			} else {
				plus.nativeUI.toast("再按一次退出应用");
			}
		})
	});
	
	elemClick();
}

if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}


/**
 * 元素点击事件
 */
function elemClick() {

	// 设置
	$(".open-setting").click(function() {
        var getTimestamp = new Date().getTime();
		plus.webview.create('src/choicesetting.html?timestamp=' + getTimestamp).show();
	});

	// 对账
	$(".open-dz").click(function() {
        var getTimestamp = new Date().getTime();
		plus.webview.create('src/dz.html?version=0.1&timestamp=' + getTimestamp).show();
	});

	// 客服
	$(".open-help").click(function() {
        var getTimestamp = new Date().getTime();
		plus.webview.create('src/kefu.html?timestamp=' + getTimestamp).show();
	});

	// 交班
	$(".jb").click(function() {
        var getTimestamp = new Date().getTime();
		plus.webview.create('src/jb.html?timestamp=' + getTimestamp).show();
	});

	function hasGasstationInfo() {
        var uuid = $$.TerminalNum();
        var data = {
            "pos机串码": uuid
        };

        var tmpl = "'{{pos机串码}}'";
        var params = tmpl.t(data);
        var sql = "POS机注册信息查询 " + params;
        var queryRegInfoData = $$.sqlQuery(sql);
        if(queryRegInfoData.length == 0) {
            layer.open({
                content: '请先完善油站信息设置',
                skin: 'msg',
                time: 5
            });
            return 0;
        }
        return 1;
	}

	// 点击油信宝
	$("#yxb").click(function() {
		if (!hasGasstationInfo()) {
			return;
		}
		var getTimestamp = new Date().getTime();
		plus.webview.create('src/payment.html?paymenttype=yxb&timestamp=' + getTimestamp).show();
	});

	// 点击车友网
	$("#cyw").click(function() {
	var uuid = $$.TerminalNum();
	if(uuid == '10829796'){
		var getTimestamp = new Date().getTime();
		var pageId = "cheyouwang";
		var webview = plus.webview.getWebviewById(pageId);
		if (webview) {
			webview.show();
		} else {
			// var url ="src/test.html";
			// var url ="https://test.m.cheyuu.com/html/pos_sheep/index.html";
			var url ="https://m.cheyuu.com/html/pos_sheep/index.html";
			plus.webview.create(url, pageId).show();
		}
	} else {
		layer.open({
			content: '该油站暂未授权',
			skin: 'msg',
			time: 1
		});
	}

	});

	// 点击微信
	$("#wx").click(function() {
        if (!hasGasstationInfo()) {
            return;
        }
		var getTimestamp = new Date().getTime();
		plus.webview.create('src/payment.html?paymenttype=wx&timestamp=' + getTimestamp).show();
	});

	// 点击支付宝
	$("#zfb").click(function() {
        if (!hasGasstationInfo()) {
            return;
        }
		var getTimestamp = new Date().getTime();
		plus.webview.create('src/payment.html?paymenttype=zfb&timestamp=' + getTimestamp).show();
	});

    // 点击沃支付
    $("#wzf").click(function() {
        if (!hasGasstationInfo()) {
            return;
        }
        var getTimestamp = new Date().getTime();
        plus.webview.create('src/payment.html?paymenttype=wzf&timestamp=' + getTimestamp).show();
    });

    // 点击翼支付
    $("#yzf").click(function() {
        if (!hasGasstationInfo()) {
            return;
        }
        var getTimestamp = new Date().getTime();
        plus.webview.create('src/payment.html?paymenttype=yzf&timestamp=' + getTimestamp).show();
    });


    $("#ccb").click(function() {
        if (!hasGasstationInfo()) {
            return;
        }
        var getTimestamp = new Date().getTime();
        plus.webview.create('src/payment.html?paymenttype=ccb&timestamp=' + getTimestamp).show();
    });


    $("#webSocket").click(function() {
        if (!hasGasstationInfo()) {
            return;
        }
        var getTimestamp = new Date().getTime();
        plus.webview.create('src/websocket.html?timestamp=' + getTimestamp).show();
    });

	$(".col-33 img").not(".show").click(function() {
		layer.open({
			content: '该油站暂未授权',
			skin: 'msg',
			time: 1
		});
	});
}

function print(data) {
	var info = data;
    var dataArray = ["1", "24", "0", "1", "0"];
    var printText;
    printText = "                       加油明细                 \n"
	printText += "\n";
    printText += "油站名称 :" + info.station + "\n";
	printText += "\n";
    printText += "商品名称 :" + info.name + "\n";
	printText += "\n";
    printText += "订单金额 :" + info.order_price + " 元\n";
	printText += "\n";
	printText += "实付金额 :" + info.pay_price + " 元\n";
	printText += "\n";
    printText += "渠道信息：" + info.mchid + "\n";
	printText += "\n";
    printText += "车牌号码：" + info.lincese + "\n";
	printText += "\n";
    printText += "创建时间：" + info.pay_time + "\n";
	printText += "\n";
    printText += "订单号：" + info.out_trade_no + "\n";
	printText += "\n";
	printText += "\n";

    dataArray.push(printText);
    plus.plugintest.printTicket(
        dataArray,
        function(result) {
            console.log(result);
		},
        function(error) {
            console.log(error)
        }
    );

}

function Verification(data) {
	try {
		if(data && typeof data === 'string') {
			data = JSON.parse(data);
		}
	} catch(e) {}


	var result = $$.Verification(data);

	if (result.success == "true") {
		$$.printThirdTicket(result.流水号);
	}

	if(data.pageId && data.callbackFunc) {
		var webview = plus.webview.getWebviewById(data.pageId);
		$$.fire(webview, data.callbackFunc, result);
	}
}