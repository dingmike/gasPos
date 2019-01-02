var closeme;

function plusReady() {
	// 返回键的处理
	var webview = plus.webview.currentWebview();
	plus.key.addEventListener('backbutton', function() {
		webview.canBack(function(e) {
			if(e.canBack) {
				webview.back();
			} else {
				webview.close()
			}
		})
	});

	closeme = function() {
		var ws = plus.webview.currentWebview();
		plus.webview.close(ws);
	}
}

if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}