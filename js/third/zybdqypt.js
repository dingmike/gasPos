var zybdqypt = {};

function plusReady() {
	zybdqypt.Verification = function (data) {
		var fire = function(webview, func, data) {
			if(plus) {
				if(typeof data === 'undefined') {
					data = '';
				} else if(typeof data === 'boolean' || typeof data === 'number') {
					webview.evalJS(func + "(" + data + ")");
					return;
				} else if(data instanceof Object || data instanceof Array) {
					data = JSON.stringify(data || {}).replace(/\'/g, "\\u0027").replace(/\\/g, "\\u005c");
				}
				webview.evalJS(func + "('" + data + "')");
			}

		};

		if(plus) {
			var currentPage = plus.webview.currentWebview();
			data.pageId = currentPage.id;

			var targetPage = plus.webview.getWebviewById("index");
			fire(targetPage, "Verification", data);
		}
	};

	zybdqypt.close = function () {
		var ws = plus.webview.currentWebview();
		ws.close();
	};

	zybdqypt.hide = function () {
		var ws = plus.webview.currentWebview();
		ws.hide();
	};

	var webview = plus.webview.currentWebview();
	plus.key.addEventListener('backbutton', function() {
		webview.canBack(function(e) {
			if(e.canBack) {
				webview.back();
			} else {
				webview.hide();
			}
		})
	});
}

if(window.plus) {
	plusReady();
} else {
	document.addEventListener('plusready', plusReady, false);
}