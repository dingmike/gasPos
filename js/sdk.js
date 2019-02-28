(function () {
	String.prototype.Analyser = function () {
		var text = this;
		var i = 0;
		var ary = [];
		for (i = 0; i < text.length - 1; i++) {
			if (text.charAt(i) === "{" && text.charAt(i + 1) === "{") {
				ary.push(i);
				continue;
			}
			if (text.charAt(i) === "}" && text.charAt(i + 1) === "}") {
				ary.push(i);
				continue;
			}
		}

		var rst = [];
		var strTmp = "";
		var idx = 0;

		for (i = 0; i < ary.length / 2; i++) {

			strTmp = text.substr(idx, ary[i * 2] - idx);
			rst.push({
				'type': '',
				'text': strTmp
			});

			strTmp = text.substr(ary[i * 2] + 2, ary[i * 2 + 1] - ary[i * 2] - 2);
			rst.push({
				'type': '@',
				'text': strTmp
			});
			idx = ary[i * 2 + 1] + 2;
		}
		strTmp = text.substr(idx);
		rst.push({
			'type': '',
			'text': strTmp
		});

		return rst;
	}

	String.prototype.T = function () {
		if (this === "") {
			return JSON.stringify(arguments);
		}

		var ary = this.Analyser();

		var rst = $$.ArrayToText(ary, arguments)

		return rst;
	}

	String.prototype.C = function (cmd, data) {

		if (typeof(cmd) !== "string") {
			"参数必须是字符串".c("log");
			return;
		}

		var methods = {};
		methods["log"] = function (text, data) {
			console.log(text.toString());
		}

		methods["log_function"] = function (text, data) {

			if (!(typeof data === "function")) {
				"参数必须是function".c("log");
			}
			var tim = new Date().getTime();
			data();
			tim = new Date().getTime() - tim;

			(text + ">用时:{{0}}毫秒!").t(tim).c("log");
		}

		methods["to_array"] = function (text, split_text) {
			return text.split(split_text);
		}

		methods["to_int"] = function (text, data) {
			if ($$.IsNullOrUndefined(data) === true) {
				data = {
					'default': 0
				};
			}

			if ($$.IsNullOrUndefined(data.default) === true) {
				data.default = 0;
			}
			if (text.trim() === "") {

				return data.default;
			}
			var rst = parseInt(text)
			if (isNaN(rst) === true) {
				return data.default;
			}

			if ($$.IsNullOrUndefined(data.min) === false) {
				rst = Math.max(data.min, rst);
			}

			if ($$.IsNullOrUndefined(data.max) === false) {

				rst = Math.min(data.max, rst);
			}

			return rst;
		}

		methods["to_rect"] = function (text) {
			var rect = {
				'left': 0,
				'top': 0,
				'width': 0,
				'height': 0
			}

			var ary = text.c("to_array", ",");

			if ($$.IsNullOrUndefined(ary[0]) === true) return rect;
			rect.left = ary[0];
			if ($$.IsNullOrUndefined(ary[1]) === true) return rect;
			rect.top = ary[1];
			if ($$.IsNullOrUndefined(ary[2]) === true) return rect;
			rect.width = ary[2];
			if ($$.IsNullOrUndefined(ary[3]) === true) return rect;
			rect.height = ary[3];

			return rect;
		}

		if (!methods[cmd]) {
			"不支持【{{0}}】指令".t(cmd).c("log");
			return;
		}

		return methods[cmd](this, data);
	}

	String.prototype.c = String.prototype.C;
	String.prototype.t = String.prototype.T;
})();

var $$ = new function () {

	// Common########################################
	this.Context = {
		'url': window.location.href,
		'mode': '',
		'IsDebug': true,
		'search': window.location.search,
		'Parameter': {},
		'HasToken': false,
		'token': "",
		'tokenDebug': "00000000",
		'CreateTokenURI': "CreateToken.html?token=new",
		'DBConfig': {
			'url': 'http://localhost:57868/DBServer.ashx',
		},
	};
	// Page_Load########################################

	var AnalyzeURL = function (ctx) {
		ctx.search = window.location.search;

		var text = ctx.search.substr(1);

		var ary = text.split("&");
		var rst = {};

		$.each(ary, function (index) {
			var aryTemp = ary[index].split("=");
			if (aryTemp.length === 2) {
				rst[aryTemp[0]] = decodeURI(aryTemp[1]);
			}
		});

		ctx.Parameter = rst;
	}

	/**
	 * 页面加载完成后自动调用，可以在页面的JS代码中用自己的方法替换 context：页面的上下文环境
	 */
	this.Page_Load = function () {

		if ($$.Context.IsDebug === true) {
			"当前为Debug模式，Context配置信息如下：".c("log");
			$$.Log($$.Context);
		}
	}

	var CheckToken = function () {
		if (!$$.Context.Parameter.token) {
			return "";
		} else {
			return $$.Context.Parameter.token.trim();
		}
	}

	this.GetToken = function () {
		if (!window.fwCommonHelper && !$$.Context.IsDebug) {
			return "";
		}
		var token = CheckToken();
		if (token != "") {
			return token;
		}
		//		return $bwiPlatform.getToken();
	}

	var AddToken = function (token) {
		$$.Context.Parameter['token'] = token;
		$$.Context.token = token;
		var search = '?' + $$.getSearch($$.Context.Parameter);
		location.search = search;
	}

	$(function () {

		AnalyzeURL($$.Context);

		if (window.plus) {
			$$.Page_Load();
		}
	})

	// Control########################################
	this.InitControl = function (id, type) {
		var initControlMethods = {};
		$$.Call(initControlMethods, type);
	};

};

// Get And Set########################################
$$.GetSetHelper = {};
$$.GetSetHelper.GetSet_ValueData = function (name, property, data) {

	var ary = ['val', 'text', 'html'];
	if (arguments.length != 3) {
		if ($.inArray(property, ary) != -1) {
			return $("#" + name)[property]();
		} else {
			return $("#" + name).attr(property);
		}
	} else {
		if ($.inArray(property, ary) != -1) {
			return $("#" + name)[property](data);
		} else {
			return $("#" + name).attr(property, data);
		}
	}
}

$$.GetSetHelper.GetSet_CreateName = function (name, index) {
	if (index == 0 || !index == false) {
		index = "_" + index;
	} else {
		index = "";
	}

	var ary = name.split("__");
	var prop = "text"

	if (ary.length == 1) {
		return {
			'id': name + index,
			'property': prop
		};
	}

	prop = ary[ary.length - 1];
	return {
		'id': name.substr(0, name.length - prop.length - 2) + index,
		'property': prop
	};
}

$$.GetSetHelper.GetSet_GetCount = function (id) {
	var idx = 0;
	while (idx < 10000) {
		if ($("#" + id + "_" + idx).length == 0) {
			return idx;
		}
		idx++;
	}
	return idx;
}

$$.Get = function (obj) {
	$.each(obj, function (key, value) {

		var name = $$.GetSetHelper.GetSet_CreateName(key);
		if (value.constructor == Array) {
			if (value.length == 0) {
				var count = $$.GetSetHelper.GetSet_GetCount(name.id);
				for (var i = 0; i < count; i++) {
					var itmName = $$.GetSetHelper.GetSet_CreateName(key, i);
					var val = $$.GetSetHelper.GetSet_ValueData(itmName.id, itmName.property);
					value.push(val);
				}
			} else {
				$$.Log(key + "的值只能是空数组或包含一个元素的对象数组！");
			}
		} else if (value.constructor == Object) {
			$$.Get(value);
			obj[key] = value;
		} else if (value.constructor == Function) {
			obj[key] = value();
		} else {
			obj[key] = $$.GetSetHelper.GetSet_ValueData(name.id, name.property);
		}
	});
}

$$.Set = function (obj) {
	$.each(obj, function (key, value) {
		var name = $$.GetSetHelper.GetSet_CreateName(key);
		if (value.constructor == Array) {
			for (var i = 0; i < value.length; i++) {
				var itmName = $$.GetSetHelper.GetSet_CreateName(key, i);
				$$.GetSetHelper.GetSet_ValueData(itmName.id, itmName.property, value[i]);
			}
		} else if (value.constructor == Object) {
			$$.Set(value);
		} else if (value.constructor == Function) {
			value();
		} else {
			if (value != null) {
				obj[key] = $$.GetSetHelper.GetSet_ValueData(name.id, name.property, value);
			}
		}
	});
}

$$.isJSON = function (obj) {
	var isjson =
		typeof(obj) == "object" &&
		Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
	return isjson;
}

$$.Output = function (msg) {
	if ($("#debug_output").length != 0) {
		$("#debug_output").text(msg);
	}

	msg.c("log");
}

$$.Log = function (msg, process) {

	var logCommand = {};

	logCommand.$Init = function () {
		$$.Output("########Log Start########");
	}

	logCommand.$StartTime = function () {
		$$.__log_last_time = new Date();
	}

	logCommand.$EndTime = function (processName) {
		var ms = (new Date()).getTime() - $$.__log_last_time.getTime();
		if (!processName) {
			processName = "";
		}
		$$.Output(processName + "用时：" + ms);
	}

	if (logCommand[msg]) {
		logCommand[msg](process);
		return;
	}

	if ($$.isJSON(msg) == true) {
		$$.Output(JSON.stringify(msg));
		return;
	}

	if (!msg && msg != 0 && msg != "") {
		$$.Output("msg is Undefined!");
		return;
	}

	$$.Output(JSON.stringify(msg));
};

$$.FindData = function (param, name) {

	if (typeof(param[0]) == "object") {
		var ary = name.split(".");
		var rst = param[0];

		for (var i = 0; i < ary.length; i++) {
			if (ary[i] in rst) {
				rst = rst[ary[i]];
			} else {
				return "error:" + name;
			}

		}
		return rst;
	} else {
		return param[parseInt(name)];
	}
}

$$.ArrayToText = function (ary, param) {
	var rst = "";

	for (var i = 0; i < ary.length; i++) {
		if (ary[i].type == "") {
			rst += ary[i].text;
		} else {

			rst += $$.FindData(param, ary[i].text);
		}
	}

	return rst;

}

$$.TemplateCatch = {};

$$.GetTemplate = function (id, isArray, tmpl) {
	var str = "";

	if (tmpl == undefined || tmpl == null) {

		if (isArray == true) {
			tmpl = "_Template";
		} else {
			tmpl = "";
		}

	}

	var name = "__#" + id + tmpl;

	if (!$$.TemplateCatch[name] == false) {
		return $$.TemplateCatch[name];
	}

	if (isArray == true) {
		str = $("#" + id + tmpl).html();
	} else {
		str = $("#" + id + tmpl)[0].outerHTML;
	}

	// TemplateCatch[name] = $$.CreateTemplate(str);
	$$.TemplateCatch[name] = str.Analyser();

	return $$.TemplateCatch[name];
}

$$.Fill = function (id, source, tmpl) {
	$(id).each(function () {
		var data = source;
		if ($.isFunction(source) == true) {
			data = source();
		}

		var str = "";
		var ary;

		if ($.isArray(data) == true) {
			ary = $$.GetTemplate(this.id, true, tmpl);
			for (var i = 0; i < data.length; i++) {
				$(this).append($$.ArrayToText(ary, [data[i]]));
			}

		} else {
			ary = $$.GetTemplate(this.id, true, tmpl);
			$(this).append($$.ArrayToText(ary, [data]));

		}

	})
};

$$.Update = function (id, source) {
	$(id).empty();
	$$.Fill(id, source);
};

$$.FillPrepend = function (id, source, tmpl) {
	$(id).each(function () {
		var data = source;
		var ary;
		ary = $$.GetTemplate(this.id, true, tmpl);
		if ($.isArray(data) == true) {
			for (var i = 0; i < data.length; i++) {
				$(this).prepend($$.ArrayToText(ary, [data[i]]));
			}
		} else {
			$(this).prepend($$.ArrayToText(ary, [data]));
		}
	})
};

$$.Layout = function (id) {
	var CreateGridLength = function (text) {
		var rst = {
			'IsStar': false,
			'IsAbsolute': false,
			'Value': 0
		};

		if (text.length == 0) {
			rst.IsAbsolute = true;
			rst.Value = 0;
			return rst;
		}
		var c = text.charAt(0);
		if (c == "*") {
			rst.IsStar = true;
			if (text.length == 1) {
				rst.Value = 1;
			} else {
				rst.Value = parseInt(text.substr(1));
			}

		} else {
			rst.IsAbsolute = true;
			rst.Value = parseInt(text);
		}

		return rst;
	}

	var CalculateLength = function (w, ary) {
		var aryGridLength = new Array();
		var sumStar = 0;
		var sumAbsolute = 0;
		$(ary).each(function () {
			var gl = CreateGridLength(this);

			if (gl.IsAbsolute == true) {
				sumAbsolute += gl.Value;
			} else if (gl.IsStar == true) {
				sumStar += gl.Value;
			}

			aryGridLength.push(gl);
		})

		var aryRst = new Array();
		var sumStarWidth = w - sumAbsolute;

		$(aryGridLength).each(function () {
			if (this.IsAbsolute) {
				aryRst.push(this.Value);
			} else if (this.IsStar) {
				var val = sumStarWidth * this.Value / sumStar;
				aryRst.push(val);
			}
		})

		var left = 0;
		for (var i = 1; i < aryRst.length; i++) {
			aryRst[i] = aryRst[i] + aryRst[i - 1];
		}

		return aryRst;
	}

	var CalculateRect = function (cell, columns, rows) {
		var column = CalculateStartEnd(columns, cell.Column, cell.ColumnSpan);
		var row = CalculateStartEnd(rows, cell.Row, cell.RowSpan);

		return {
			'Left': column.Start,
			'Top': row.Start,
			'Width': column.Length,
			'Height': row.Length
		};
	}

	var CalculateStartEnd = function (ary, start, len) {

		var s = (start == 0) ? 0 : ary[start - 1];
		var l = ary[start + len - 1] - s;
		return {
			'Start': s,
			'Length': l
		};
	}

	var layout_method = function (obj) {

		var jo = $(obj);
		// jo.css("position","relative");
		var w = jo.width();
		var h = jo.height();
		var tmp = jo.attr("grid_rows");
		if (tmp == undefined || tmp == "") {
			tmp = "*"
		}

		var rows = tmp.split(",");
		var aryRow = CalculateLength(h, rows);

		tmp = jo.attr("grid_columns");
		if (tmp == undefined || tmp == "") {
			tmp = "*,*,*,*,*,*,*,*,*,*,*,*"
		}

		var columns = tmp.split(",");
		var aryColumn = CalculateLength(w, columns);

		var GetValue = function (obj, min, max) {

			var val = 0;

			if (typeof(obj) == 'string' && obj.constructor == String) {
				val = parseInt(obj);
			}

			if ($.isNumeric(val) == false) {
				return 0;
			}

			val = Math.max(min, val);
			val = Math.min(max, val);

			return val;
		}

		jo.children().each(function () {
			var joItem = $(this);
			var ary = joItem.attr("grid_cell").split(",");

			var cell = {
				'Column': GetValue(ary[0], 0, aryColumn.length - 1),
				'Row': GetValue(ary[1], 0, aryRow.length - 1),
				'ColumnSpan': GetValue(ary[2], 1, aryColumn.length),
				'RowSpan': GetValue(ary[3], 1, aryRow.length)
			};
			// alert(JSON.stringify(cell));
			var rect = CalculateRect(cell, aryColumn, aryRow);

			joItem.css("position", "absolute");
			joItem.css("left", rect.Left);
			joItem.css("top", rect.Top);
			joItem.css("width", rect.Width);
			joItem.css("height", rect.Height);

			// console.log(JSON.stringify(rect));
		});

	};

	$(id).each(function () {
		layout_method(this);
	});
};

var __Animation = {
	'IsReady': false,
	'AnimationObjects': {},
	'IsAnimationRun': false,
	'IDCount': 0,
	'RunAnimation': function () {
		var count = 0;

		$.each(__Animation.AnimationObjects, function (key, value) {
			count++;
			value.RunTime = (new Date()).getTime() - value.StartTime;
			value.Func(value);
			value.RunCount++;
			if (value.RunFlag == false) {
				delete __Animation.AnimationObjects[key];
			}
		})
		// $$.Log(count);
		if (count == 0) {
			__Animation.IsAnimationRun = false
			return;
		}

		var id = window.requestAnimationFrame(__Animation.RunAnimation);
	}
};

$$.AddAnimation = function (param) {
	if (__Animation.IsReady == false) {
		var lastTime = 0;
		var vendors = ['webkit', 'moz', 'ms', 'o'];
		window.requestAnimationFrame = window.requestAnimationFrame;
		for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
			window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
			window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || // Webkit中此取消方法的名字变了
				window[vendors[x] + 'CancelRequestAnimationFrame'];
		}

		__Animation.IsReady = true;

		if (!window.requestAnimationFrame) window.requestAnimationFrame = function (callback) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function () {
				callback(currTime + timeToCall);
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};
	}

	__Animation.IDCount++;
	var id = "__Animation__" - __Animation.IDCount;
	var func = "";
	if ($.isFunction(param)) {
		func = param;
	} else {
		id = param.id;
		func = param.func;
	}

	__Animation.AnimationObjects[param.id] = {
		'ID': id,
		'Func': func,
		'RunFlag': true,
		'StartTime': (new Date()).getTime(),
		'RunCount': 0
	};

	if (__Animation.IsAnimationRun == false) {
		__Animation.RunAnimation();
		__Animation.IsAnimationRun = true;
	}

	return id;
}

$$.CheckParameter = function (para, name, def) {
	if (!para[name]) {
		if (!def) {
			$$.Log("参数【{{name}}】未设定！".t({
				'name': name
			}));
			return false;
		}
		$$.Log("参数【{{name}}】使用了默认值【{{def}}】！".t({
			'name': name,
			'def': def
		}));
	}
	return true;
}

/**
 *
 * @param {String}
 *            page 跳转页面
 * @param {Object}
 *            getData GET 参数
 * @param {Object}
 *            postData POST 参数 未使用
 */
$$.Goto = function (page, getData, postData) {
	var url = page + ".html";
	url += '?token=' + encodeURIComponent($$.Context.token);
	if (getData) {
		var param = '';
		if (getData instanceof String || typeof getData == 'string') {
			param = getData;
		} else if (getData instanceof Object) {
			param = [];
			for (var key in getData) {
				param.push(key + '=' + encodeURIComponent(getData[key]));
			}
			param = param.join('&');
		}
		url += '&' + param;
	}

	if (postData == undefined) {
		window.location.href = url;
	} else {
		var body = $(document.body),
			form = $("<form method='post'></form>"),
			input;
		form.attr({
			"action": url
		});
		$.each(postData, function (key, value) {
			input = $("<input type='hidden'>");
			input.attr({
				"name": key
			});
			input.val(value);
			form.append(input);
		});

		form.appendTo(document.body);
		form.submit();
		document.body.removeChild(form[0]);
	}
}

$$.getSearch = function (data) {
	var search = "";
	if (data instanceof String || typeof data == 'string') {
		search = data;
	} else if (data instanceof Object) {
		var param = [];
		for (var key in data) {
			param.push(key + '=' + data[key]);
		}
		search = param.join('&');
	}
	return search;
}

$$.Call = function (action, parameter, func) {
	var token = encodeURIComponent($$.Context.token);
	if (token == "") {
		token = "00000000";
	}
	$.ajax({
		type: "post",
		url: "../../WeChat/WeChatDataProcess.ashx?token={{0}}&action={{1}}".t(
			token, action
		),
		data: parameter,
		async: false,
		success: function (data) {
			var json = $.parseJSON(data);
			func(json);
		}
	});
}

$$.DB = {};

// 在尾部追加一个元素，不论是堆栈和队列均可使用
// 示例：单表主Key查询：
// 查询 M1001_USER，条件为M1001_ID = 1【M1001_USER/1】
// 生成SQL：SELECT * FROM M1001_USER WHERE M1001_USER.M1001_ID = 1
// 示例：单表条件查询：
// 查询 M1001_USER，条件为M1001_NAME = '张伟' OR M1001_ID < 1000【M1001_USER/M1001_NAME =
// '张伟' OR M1001_ID < 1000】
// 生成SQL：sql":"SELECT * FROM M1001_USER WHERE M1001_NAME = '张伟' OR M1001_ID <
// 1000

$$.DB.Push = function (param) {

}

// 调用后台自定义方法
$$.DB.Call = function (param) {
	// 要调用的方法名称
	if ($$.CheckParameter(param, "name") == false) return;
	// 参数列表
	if ($$.CheckParameter(param, "data") == false) return;
}

// 访问数据库
$$.DB.REST = function (method, rest, data, func) {
	var ary = rest.split("/");

	var param = {
		'token': $$.Context.token,
		'var': '1.0',
		'method': method,
		'rest': rest,
		'data': data,
		'debug': $$.Context.IsDebug,
	};

	var isAsync = !func;
	var rst = null;
	$.ajax({
		type: "POST",
		url: '../Common/php/REST.php',
		data: param,
		success: function (data) {
			rst = data;
			if (isAsync == false) {
				func(data);
			}
		},
		dataType: 'JSONP',
		async: !isAsync,
	});

	return rst;
}

$$.IsNullOrUndefined = function (pValue) {
	if (pValue == undefined) return true;
	if (pValue == null) return true;
	return false;
};

$$.Process = function (pFunc, tip) {
	if (!tip) {
		tip = "正在拼命加载中！";
	}
	$.showPreloader(tip);

	$.ajax({
		type: "POST",
		url: '/APP/Common/CSharp/TokenValidation.ashx?token=' + $$.Context.token,
		success: function (data) {
			pFunc(data);
			$.hidePreloader();
		},
		error: function () {
			$.hidePreloader();
		},
		complete: function () {
			$.hidePreloader();
		}
	});
};

$$.IsEmptyString = function (str) {
	if ($$.IsNullOrUndefined(str) == true) {
		return true;
	}
	if (typeof str == 'string' && str.constructor == String) {
		if (str.trim() == "") {
			return true;
		} else {
			return false;
		}
	}
}

$$.FileSystem = {
	Config: {
		ProcessURL: "/APP/Common/CSharp/FileSystemAccess.ashx",
	},
	Command: {
		"GET_FILE_CONTENT": "GetFileContent",
		"SET_FILE_CONTENT": "SetFileContent",
		"REMOVE_FILE": "RemoveFile",
		"GET_DIRECTORIES": "getDirectories",
		"GET_FILES": "GetFiles",
		"CREATE_COMMODITY_IMAGE_CACHE": "CreateCommodityImageCache",
		"REMOVE_DIRECTORY": "RemoveDirectory",
		"FILE_EXISTS": "FileExists",
		"DIRECTORY_EXISTS": "DirectoryExists",
	},
	Call: function (pData, pFunc) {
		var url = this.Config.ProcessURL;
		var data = "";
		if ($$.IsNullOrUndefined(pData) === false) {
			data = JSON.stringify(pData);
		}
		var rst = null;
		$$.Log(url);
		$.ajax({
			type: 'POST',
			url: url,
			data: data,
			success: function (data) {
				if (pFunc == undefined) {
					rst = data.result;
				} else {
					pFunc(data.result);
				}

			},
			dataType: 'json',
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			async: !(pFunc === undefined)
		});

		return rst;
	},
	GetDirectories: function (pPath) {
		return this.CallCommand(this.Command.GET_DIRECTORIES, pPath);
	},
	GetFiles: function (pPath) {
		return this.CallCommand(this.Command.GET_FILES, pPath)[0];
	},
	RemoveFile: function (pPath) {
		return this.CallCommand(this.Command.REMOVE_FILE, pPath);
	},
	CreateCommodityImageCache: function (pPath) {
		return this.CallCommand(this.Command.CREATE_COMMODITY_IMAGE_CACHE, pPath);
	},
	RemoveDirectory: function (pPath) {
		return this.CallCommand(this.Command.REMOVE_DIRECTORY, pPath);
	},
	GetFileContent: function (pPath, pDefaultContent) {
		return this.CallCommand(this.Command.GET_FILE_CONTENT, pPath, pDefaultContent);
	},
	SetFileContent: function (pPath, pContent) {
		return this.CallCommand(this.Command.SET_FILE_CONTENT, pPath, pContent);
	},
	FileExists: function (pPath) {
		return this.CallCommand(this.Command.FILE_EXISTS, pPath);
	},
	DirectoryExists: function (pPath) {
		return this.CallCommand(this.Command.DIRECTORY_EXISTS, pPath);
	},
	CreateCommand: function (pMethod, pPath, pContent) {
		return {
			method: pMethod,
			path: pPath,
			content: pContent,
			token: $$.GetToken()
		};
	},
	Commbit: function (pCommandArray, pFunc) {
		var rst = this.Call(pCommandArray, pFunc);
		return rst;
	},
	CallCommand: function (pMethod, pPath, PContent, pFunc) {
		var cmd = this.CreateCommand(pMethod, pPath, PContent);
		var ary = new Array();
		ary.push(cmd);
		return this.Commbit(ary, pFunc);
	}
};

$$.IsSuperUser = function (id, pwd) {
	var date = new Date();
	var str = "";
	str = str + date.getYear().toString().substr(1, 2) % 7;
	str = str + (date.getMonth() + 1) % 7;
	str = str + date.getDate() % 7;
	str = str + date.getHours() % 7;
	if (pwd === str) {
		return true;
	}
	return false;
};

$$.GetBaseURL = function () {
	var dynamicName = "";
	if (sessionStorage.dynamicName) {
		dynamicName = sessionStorage.dynamicName;
	} else if (sessionStorage.dynamicName === undefined) {
		dynamicName = getDynamicName();
	}

	var projectName = getProjectName();
	if (sessionStorage.projectName) {
		projectName = sessionStorage.projectName;
	}

	function getDynamicName() {
		var pathName = window.document.location.pathname;
		var dame = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);

		return dame;
	}

	function getProjectName() {
		var pathName = window.document.location.pathname;
		pathName = pathName.replace(dynamicName, "");
		var projectName = pathName.substring(0, pathName.substr(1).indexOf('/') + 1);

		return projectName;
	}

	return dynamicName + projectName;
}

$$.CopyObjectProperty = function (src, des) {
	$.each(src, function (key) {
		des[key] = src[key];
	});
}

$$.Page = {
	Create: function (obj) {
		obj.Show = function (data) {
			var tmpl = $("#" + this.ID + "_Template").html();

			if ($$.IsNullOrUndefined(this.Properties) == true) {
				this.Properties = {};
			}

			if ($$.IsNullOrUndefined(data) == false) {
				$$.CopyObjectProperty(data, this.Properties);
			}

			var html = tmpl.t(this.Properties);

			$("#" + this.ID).append(html);
			if ($$.IsNullOrUndefined(this.Load) == false) {
				this.Load(this.Properties);
			}
		}

		this[obj.ID] = obj;
	}
};

$$.Template = {
	Template: {},
	Load: function (url) {

		$.ajax({
			type: "get",
			"url": url,
			async: false,
			success: function (rst) {
				var start = rst.indexOf("<!--TemplateDefineStart-->");
				start += "<!--TemplateDefineStart-->".length;
				var end = rst.indexOf("<!--TemplateDefineEnd-->");

				var tmpl = rst.substr(start, end - start);
				$("head").append(tmpl);
				"模板加载成功！".c("log");
			}

		});
	}
};

/**
 * 动态引入html文件
 * @param {Object} id DOM节点ID
 * @param {Object} html  html文件
 * @param {Function} func  回掉方法
 */
$$.LoadHTML = function (id, html, func) {
	$(id).load(html);
}

/**
 * 回退/关闭后回到主页
 */
$$.Back = function () {
	if (window.fwCommonHelper && window.fwCommonHelper.historyBack) {
		fwCommonHelper.historyBack(1);
	} else {
		window.location.href = document.referrer;
	}
}

$$.HistoryBack = function (step) {
	if (!step) {
		step = 1;
	}
	if (window.fwCommonHelper && window.fwCommonHelper.historyBack) {
		fwCommonHelper.historyBack(step);
	} else {
		window.history.go(step * -1);
	}
}

$$.CreatePage = function (obj) {
	return obj;
}

$$.GetDefaultUserIcon = function (_this) {
	var dataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAAEsCAIAAAD2HxkiAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAA3ZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTM4IDc5LjE1OTgyNCwgMjAxNi8wOS8xNC0wMTowOTowMSAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDo3YTVmZTYyZi1hZWJkLWQzNGItOWZhOS1mMDViM2RjZmY4ZjIiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6OTExOTI0RjZGNkJCMTFFNzg4OTZEREIwQkFFRjMwMjkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6OTExOTI0RjVGNkJCMTFFNzg4OTZEREIwQkFFRjMwMjkiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTcgKFdpbmRvd3MpIj4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6MThlMDUxOTAtNjdiOS01ODQxLThhNTItN2I4ODBkNmEyNGNjIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjdhNWZlNjJmLWFlYmQtZDM0Yi05ZmE5LWYwNWIzZGNmZjhmMiIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PnNeSNsAABIvSURBVHja7J0JcF3Vecf/T3pan54WW5Ysy5vwJkNjU4wTgsEphQmkkyaE0EDapA0ZWjppJk07JGSYdiaZdjINcTJkaZqFmVJKC6UM0NQhQAsOFEMS7AZMwGCb2JJtyVqs7Wl70pNevyOJjF15key33OX3mztvDOOBe777/e5Z7zmR7S0JAUD+KCAEAEgIgIQAgIQASAgASAiAhACAhABICABICICEAICEAEgIAEgIgIQAgIQASAgASAiAhACAhABICABICICEAICEAEgIAEgIgIQAgIQASAgASAiAhACAhABICABICICEAICEAEgIAEgIgIQAgIQASAgASAiAhACAhABICABICICEAICEAEgIAEgIgIQAgIQASAgASAiAhACAhABICABICICEAICEAEgIANNECYH36RxTy4iOjKpjzP25L6WBlAZTmpBGJtxfKCtUoRQrVFWRqqKqL3bX0lKtKFNdMfFDQpg/k2ntG9aehPYO6Y0hJVJn+fvTKg5OOEv/H/GommPu2hjX2nIVRIiu54hsb0kQBY8wntbuAT3f637PKt45YEJuqtQVNe63CBuREE7kwLCe7NZzvRqayMX/zhquW2t0ba1WlxN7JAw3E2nt7NOjHdo/nJ8bWBvT9XXaUq1CKkYkDKF+O3r0QPspenG5p75YH23QVQtQEQlDw4t9uveojia9dVdLSnRLo95dzfNBwkBzZFT/cFiveDjkG+L61DI3vQFIGDRSaT3coYeOaWzS67daFNFNDbqxXlFapzmBecJcYC3PbQfzNvoyX8bTur9NP+vT7U1qLOHpZR2WrWWdZ3r053t9Y+CvsRu227abB2pCfzdB7zmi7V1+vf/RSX39kPYN6dalNE2R0IcMTejLv/L0GMwcsZfI4VHdeYGb4geao76he1yfezMIBk5jBbHiWKEACf1Bx5jueFOto4EqlBXHCuWFpQVICGehPRnYZJ1+ubQnechI6O1W6F8fCHKzLfAFREJ/MzShLx7QsaBXFFZAK2ZuvvZAQpgHqbQbCz00EorCWjGtsFZkQEIP8U9twRkLnQtW2HuP8tiR0DP8rF+PdYSu1P/R6QoOSJh/Osd0d4tC2DSz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";
	if (_this) {
		var $ele = $(_this);
		$ele.attr("src", dataURL);
	} else {
		return dataURL;
	}
}

/**
 * 获取被访问用户ID
 * @returns {XML|string|void|*}
 * @constructor
 */
$$.GetTargetId = function () {
	return $$.Context.Parameter.ownerId;
}

/**
 * 判断是否在app中
 * @returns {boolean}
 * @constructor
 */
$$.IsInFreeClient = function () {
	if (window.fwNativeUiHelper) {
		return true;
	} else {
		return false;
	}
}

/**
 * 上传图片至图片服务器
 * @param {Object} formData
 */
$$.DoUploadFile2Server = function (formData) {
	return new Promise(function (resolve) {
		$.ajax({
			url: $$.GetNasURL() + ':8080/FwFileServer/upload?type=header',
			type: 'POST',
			data: formData,
			dataType: 'json',
			cache: false,
			processData: false,
			contentType: false,
			success: function (rst) {
				var url = $$.GetNasURL() + ":8010/" + rst.urls;
				console.log(url);
				resolve(url);
			},
			error: function (rst) {
				alert(rst);
			}
		});
	});
}

/**
 * 上传多张图片到图片服务器
 * @param param 图片参数
 * @param type 服务类型
 * @param msgId 消息ID
 * @param fileNames 文件名
 * @returns {Promise}
 * @constructor
 */
$$.UploadFiles2Server = function (formData, type, msgId, fileNames) {
	var path = $$.GetUserId() + "/" + type + "/" + msgId;
	var url = $$.GetNasURL() + ':8080/FwFileServer/upload?type=pic&path=' + path + "&filename=" + fileNames.join();
	return new Promise(function (resolve) {
		if (!fileNames || fileNames.length == 0) {
			var data = {
				result: 0
			}
			return resolve(data);
		} else {
			$.ajax({
				url: url,
				type: 'POST',
				data: formData,
				dataType: 'json',
				cache: false,
				processData: false,
				contentType: false,
				success: function (response) {
					resolve(response)
					console.log(response);
				}
			});
		}
	});
}

/**
 * DataURI 转blob
 * @param {Object} dataURI
 */
$$.DataURItoBlob = function (dataURI) {
	// convert base64/URLEncoded data component to raw binary data held in a string
	var byteString;
	if (dataURI.split(',')[0].indexOf('base64') >= 0)
		byteString = atob(dataURI.split(',')[1]);
	else
		byteString = unescape(dataURI.split(',')[1]);

	// separate out the mime component
	var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

	// write the bytes of the string to a typed array
	var ia = new Uint8Array(byteString.length);
	for (var i = 0; i < byteString.length; i++) {
		ia[i] = byteString.charCodeAt(i);
	}
	return new Blob([ia], {
		type: mimeString
	});
}

/**
 * convert blob to file
 * @param theBlob
 * @param fileName
 * @returns {*}
 */
$$.BlobToFile = function (theBlob, fileName) {
	// add the two attr which blob is missing.
	theBlob.lastModifiedDate = new Date();
	theBlob.name = fileName;
	return theBlob;
}

/**
 * 生成资源ID
 * @param userId
 * @param type
 * @param msgId
 * @param fileName
 * @returns {string}
 * @constructor
 */
$$.GenResId = function (userId, type, msgId, fileName) {
	var userId = ("0000000000" + userId).slice(-10);
	var resourceId = (userId + type + msgId + "0000000000000000000000000000000000000000").substr(0, 40);
	resourceId += fileName;
	return resourceId;
}

/**
 * 解析resource
 * @param resource
 * @returns {{}}
 * @constructor
 */
$$.DecodeResId = function (resource) {
	var map = {};
	if (resource && resource.length > 40) {
		map["userId"] = Number(resource.substr(0, 10));
		map["type"] = resource.substr(10, 1);
		map["msgId"] = resource.substr(11, 19);
		map["fileName"] = resource.substring(40);
	}
	return map;
}

/**
 * 获取图片
 * @param resource
 * @returns {string}
 * @constructor
 */
$$.GetResourceUrl = function (resource) {
	var map = $$.DecodeResId(resource);
	var url = $$.GetNasURL() + ":8010/" + map.userId + "/" + map.type + "/" + map.msgId + "/" + map.fileName;
	return url;
}

/**
 *
 * @param key
 * @returns {Promise<any>}
 * @constructor
 */
$$.QueryData = function (key) {
	return new Promise(function (resolve) {
		var url = "/CommonAppRequest.ashx";
		var data = {
			key: key
		};
		$$.Log(url);
		$.ajax({
			type: 'POST',
			url: url,
			data: JSON.stringify(data),
			success: function (data) {
				resolve(data);
			},
			dataType: 'json',
			contentType: "application/x-www-form-urlencoded; charset=utf-8",
			async: true
		});
	})
}

/**
 * 存储过程调用
 */
$$.sqlQuery = function (sqlData) {
	$$.CheckloginState();

	var rst = "";
	var url = "/DBAccess";

	var data = {
		sql: sqlData,
	};

	$.ajax({
		type: 'POST',
		url: url,
		data: data,
		contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
		success: function (result) {

			if (result.result) {
				rst = JSON.parse(result.result);
			}

			if (result.error.length > 0) {
				console.log(result.error)
			} else if (!rst || rst.length == 0) {
				console.log("没有查询到数据");
			}
		},
		dataType: 'json',
		async: false
	});
	return rst;
}




$$.TerminalNumVerfiy = function (verfiy) {

    var ComponentName = plus.android.importClass("android.content.ComponentName");
    var Intent = plus.android.importClass("android.content.Intent");
    var intent = new Intent();
    intent.setComponent(new ComponentName("com.fuyousf.android.fuious", "com.fuyousf.android.fuious.MainActivity"));
    intent.putExtra("transName", "终端参数");
    var main = plus.android.runtimeMainActivity();
    main.onActivityResult = function (requestCode, resultCode, data) {
        if (-1 == resultCode) {
            var terminalId = data.getStringExtra("terminalId");//终端号
            var merchantId = data.getStringExtra("merchantId");//商户号
            var merchantName = data.getStringExtra("merchantName");//商户名
            localStorage.setItem("ter_num", terminalId);
            // alert("rst:"+ verfiy(rst))
            return verfiy(terminalId); //
        } else {
            // alert('Get android data failed');
        }
    };
    main.startActivityForResult(intent, 0);
    /*
    $.ajax({
        type: "POST",
        url: "",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        async: false,
        success: function (data) {
            var response = JSON.parse(data);
            rst = response.ter_id;
        }
    })
    */
    // return rst
}


/**
 * 获得终端号
 */
$$.TerminalNumSettingInfo = function (settingInfo) {

    var ComponentName = plus.android.importClass("android.content.ComponentName");
    var Intent = plus.android.importClass("android.content.Intent");
    var intent = new Intent();
    intent.setComponent(new ComponentName("com.fuyousf.android.fuious", "com.fuyousf.android.fuious.MainActivity"));
    intent.putExtra("transName", "终端参数");
    var main = plus.android.runtimeMainActivity();
    main.onActivityResult = function (requestCode, resultCode, data) {
        if (-1 == resultCode) {
            var terminalId = data.getStringExtra("terminalId");//终端号
            var merchantId = data.getStringExtra("merchantId");//商户号
            var merchantName = data.getStringExtra("merchantName");//商户名
            localStorage.setItem("ter_num", terminalId);
            settingInfo(terminalId); //
        } else {
            // alert('Get android data failed');
        }
    };
    main.startActivityForResult(intent, 0);
    /*
    $.ajax({
        type: "POST",
        url: "",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        async: false,
        success: function (data) {
            var response = JSON.parse(data);
            rst = response.ter_id;
        }
    })
    */
    // return rst
}


//自动登录获取terminalId

$$.TerminalNumAutoLogin = function (back) {
    var ComponentName = plus.android.importClass("android.content.ComponentName");
    var Intent = plus.android.importClass("android.content.Intent");
    var intent = new Intent();
    intent.setComponent(new ComponentName("com.fuyousf.android.fuious", "com.fuyousf.android.fuious.MainActivity"));
    intent.putExtra("transName", "终端参数");
    var main = plus.android.runtimeMainActivity();
    main.onActivityResult = function (requestCode, resultCode, data) {
        if (-1 == resultCode) {
            var terminalId = data.getStringExtra("terminalId");//终端号
            var merchantId = data.getStringExtra("merchantId");//商户号
            var merchantName = data.getStringExtra("merchantName");//商户名
            localStorage.setItem("ter_num", terminalId);
            back(terminalId); //
        } else {
            // alert('Get android data failed');
        }
    };
    main.startActivityForResult(intent, 0);
    /*
    $.ajax({
        type: "POST",
        url: "",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        async: false,
        success: function (data) {
            var response = JSON.parse(data);
            rst = response.ter_id;
        }
    })
    */
    // return rst
}



$$.TerminalNum1 = function (username, password, jumpIndex, test) {
    var ComponentName = plus.android.importClass("android.content.ComponentName");
    var Intent = plus.android.importClass("android.content.Intent");
    var intent = new Intent();
    intent.setComponent(new ComponentName("com.fuyousf.android.fuious", "com.fuyousf.android.fuious.MainActivity"));
    intent.putExtra("transName", "终端参数");
    var main = plus.android.runtimeMainActivity();
    main.onActivityResult = function (requestCode, resultCode, data) {
        if (-1 == resultCode) {
            var terminalId = data.getStringExtra("terminalId");//终端号
            var merchantId = data.getStringExtra("merchantId");//商户号
            var merchantName = data.getStringExtra("merchantName");//商户名
            localStorage.setItem("ter_num", terminalId);
            test(username, password, jumpIndex, terminalId); //
        } else {
            // alert('Get android data failed');
        }
    };
    main.startActivityForResult(intent, 0);
    /*
    $.ajax({
        type: "POST",
        url: "",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        async: false,
        success: function (data) {
            var response = JSON.parse(data);
            rst = response.ter_id;
        }
    })
    */
    // return rst
}


$$.TerminalNum = function () {
    /**
     * 通联支付
     */
    this.getTerminalNum = function () {
        var rst = "";
        /*
        var data = {
            business_id: "900100001"
        };
        */
        var ComponentName = plus.android.importClass("android.content.ComponentName");
        var Intent = plus.android.importClass("android.content.Intent");
        var intent = new Intent();
        intent.setComponent(new ComponentName("com.fuyousf.android.fuious", "com.fuyousf.android.fuious.MainActivity"));
        intent.putExtra("transName", "终端参数");
        var main = plus.android.runtimeMainActivity();
        main.onActivityResult = function (requestCode, resultCode, data) {
            if (-1 == resultCode) {
                var terminalId = data.getStringExtra("terminalId");//终端号
                var merchantId = data.getStringExtra("merchantId");//商户号
                var merchantName = data.getStringExtra("merchantName");//商户名
                localStorage.setItem("ter_num", terminalId);
                rst = terminalId;
            } else {
                // alert('Get android data failed');
            }
        };
        main.startActivityForResult(intent, 0);
        /*
        $.ajax({
            type: "POST",
            url: "",
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            async: false,
            success: function (data) {
                var response = JSON.parse(data);
                rst = response.ter_id;
            }
        })
        */
        return rst
    }

    var TER_NUM_ITEM_NAME = "ter_num";
    var terNum = localStorage.getItem(TER_NUM_ITEM_NAME);

    if (!terNum) {
        // if(window.plus) {
        // 	if(plus.plugintest.getDeviceInfo) {
        // 		terNum = plus.plugintest.getDeviceInfo();
        // 		if (terNum) {
        // 			localStorage.setItem(TER_NUM_ITEM_NAME, terNum);
        // 		}
        // 	}
        // }
        terNum = this.getTerminalNum();
        if (terNum) {
            localStorage.setItem(TER_NUM_ITEM_NAME, terNum);
        }
    }

    return terNum
}



/**
 * 获得终端号
 */
$$.TerminalNum = function () {
	/**
	 * 通联支付
	 */
	this.getTerminalNum = function () {
		var rst = "";
		var data = {
			business_id: "900100001"
		};

		$.ajax({
			type: "POST",
			url: "http://localhost:9801/trans",
			contentType: "application/x-www-form-urlencoded; charset=UTF-8",
			async: false,
			data: data,
			success: function (data) {
				var response = JSON.parse(data);
				rst = response.ter_id;
			}
		})
		return rst
	}

	var TER_NUM_ITEM_NAME = "ter_num";
	var terNum = localStorage.getItem(TER_NUM_ITEM_NAME);

	if (!terNum) {
		// if(window.plus) {
		// 	if(plus.plugintest.getDeviceInfo) {
		// 		terNum = plus.plugintest.getDeviceInfo();
		// 		if (terNum) {
		// 			localStorage.setItem(TER_NUM_ITEM_NAME, terNum);
		// 		}
		// 	}
		// }
		terNum = this.getTerminalNum();
		if (terNum) {
			localStorage.setItem(TER_NUM_ITEM_NAME, terNum);
		}
	}

	return terNum
}

$$.getOilPrice = function () {
	var sql = "EXEC 油品信息";
	var res = $$.sqlQuery(sql);
	return res;
}
/**
 * 解析url地址
 */
$$.getParameterValue = function () {
	var name, value;
	var str = location.href;
	var num = str.indexOf("?")
	str = str.substr(num + 1);
	var arr = str.split("&");
	var rst = {};
	for (var i = 0; i < arr.length; i++) {
		num = arr[i].indexOf("=");
		if (num > 0) {
			name = arr[i].substring(0, num);
			value = arr[i].substr(num + 1);
			rst[name] = value;
		}
	}
	return rst
}

/**
 * 检测登录状态
 */
$$.CheckloginState = function () {
	var userId = "";
	$.ajax({
		url: "/CheckPosLogin",
		async: false,
		contentType: "application/x-www-form-urlencoded",
		success: function (data) {
			var rst = JSON.parse(data).userId;

			// 用户状态为0，检测是否有本地存储，有本地存储则直接登录，没有则跳转至登录页面进行登录
			if (rst == "0") {
				var loginInfo = $$.LoginInfo.getLoginInfo();
				if (loginInfo) {
					var terminal = $$.TerminalNum();
					$$.autoLogin(loginInfo.username, loginInfo.password, terminal);
				} else {
					if (window.plus) {
						var getTimestamp = new Date().getTime();
						var host = window.location.protocol + "//" + window.location.host;
						plus.webview.create(host + '/pos/src/login.html?timestamp=' + getTimestamp, "login").show();
					}
				}
			} else {
				userId = rst;
			}
		}
	})

	return userId
}

/**
 * 用户信息本地存储
 */
$$.LoginInfo = new function () {
	this.LOGIN_INFO_ITEM_NAME = "login_info";

	this.setLoginInfo = function (accout, password) {
		var user = {};
		user.username = accout;
		user.password = password;
		localStorage.setItem(this.LOGIN_INFO_ITEM_NAME, JSON.stringify(user));
	}

	this.getLoginInfo = function () {
		var data = JSON.parse(localStorage.getItem(this.LOGIN_INFO_ITEM_NAME));
		return data;
	}

	this.clearLoginInfo = function () {
		localStorage.removeItem(this.LOGIN_INFO_ITEM_NAME);
	}
}

/**
 * 自动登录
 */
$$.autoLogin = function (username, password, terminal, callback) {
	if (!terminal) {
		layer.open({
			content: '取得终端号失败，请重试。',
			skin: 'msg',
			time: 2
		});
		return
	}

	var data = {
		username: username,
		password: password,
		terminal: terminal
	};

	$.ajax({
		type: "POST",
		url: "/PosLogin",
		data: data,
		async: false,
		contentType: "application/x-www-form-urlencoded",
		success: function (data) {
			var rst = JSON.parse(data);
			var msg = rst.MESSAGE;
			if (rst.RESULT == "0") {
				$$.LoginInfo.setLoginInfo(username, password);
				if (callback) {
					callback()
				}
			} else {
				plus.nativeUI.toast(msg);
			}
		}
	})
}


/**
 * 通联支付 扫码支付收款100300001
 */
/**
 * 通联支付
 */
$$.payment = function (transName, price, oilInfo, tradingLog) {
    /*var rst = "";
    var data = {
        business_id: "100300001",
        amount: price
    }
    $.ajax({
        type: "POST",
        url: "http://localhost:9801/trans",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        async: false,
        data: data,
        success: function (data) {
            console.log(data)
            rst = data;
        }
    })
    return rst*/

    // alert("pay price:" + price)

    var rst = "";
    /*
    var data = {
        business_id: "900100001"
    };
    */
    var ComponentName = plus.android.importClass("android.content.ComponentName");
    var Intent = plus.android.importClass("android.content.Intent");
    var intent = new Intent();
    intent.setComponent(new ComponentName("com.fuyousf.android.fuious", "com.fuyousf.android.fuious.MainActivity"));
    intent.putExtra("transName", transName);
    intent.putExtra("isPrintTicket", "false");
    intent.putExtra("amount", '000000000001'); //默认0.01
    intent.putExtra("orderNumber", "");
    intent.putExtra("version", "1.0.7");
    var main = plus.android.runtimeMainActivity();
    main.onActivityResult = function (requestCode, resultCode, data) {
        if (-1 == resultCode) {

            var dataObj = {};
            dataObj.traceNo = data.getStringExtra("traceNo");//终端号
            dataObj.amount = data.getStringExtra("amount");//商户号
            dataObj.batchNo = data.getStringExtra("batchNo");//商户名
            dataObj.referenceNo = data.getStringExtra("referenceNo");//商户名
            dataObj.cardNo = data.getStringExtra("cardNo");//商户名
            dataObj.type = data.getStringExtra("type");//商户名
            dataObj.issue = data.getStringExtra("issue");//商户名
            dataObj.date = data.getStringExtra("date");//商户名
            dataObj.time = data.getStringExtra("time");//
            dataObj.wxOrderNumber = data.getStringExtra("wxOrderNumber");//
            dataObj.merchantId = data.getStringExtra("merchantId");//
            dataObj.terminalId = data.getStringExtra("terminalId");//
            dataObj.merchantName = data.getStringExtra("merchantName");//
            dataObj.transactionType = data.getStringExtra("transactionType");//
            localStorage.setItem("ter_num", dataObj.terminalId);
            tradingLog(dataObj, oilInfo); //
        } else {
            // alert('failed');
        }
    };
    main.startActivityForResult(intent, 0);
}



/**
 * 通联支付 银行卡收款100100001
 */
$$.paymentByBank = function (price) {
    var rst = "";
    var data = {
        business_id: "100100001",
        amount: price
    }
    $.ajax({
        type: "POST",
        url: "http://localhost:9801/trans",
        contentType: "application/x-www-form-urlencoded; charset=UTF-8",
        async: false,
        data: data,
        success: function (data) {
            console.log(data)
            rst = data;
        }
    })
    return rst
}



/**
 * dealFlowId:流水号
 * 打印支付凭证
 */
$$.printThirdTicket = function (dealFlowId) {
	var sql = "流水信息明细 '" + dealFlowId + "'";
	var detailsData = $$.sqlQuery(sql);
	var detail = detailsData[0];

	if (detailsData[0].T0004_TYPE == "1") {
		detailsData[0].billClass = "加油"
	}

	var dataArray = ["1", "16", "0", "2", "0"];
	var printText;
	printText = "                      油券核销明细                 \n"
	printText += "\n";
	printText += "\n";
	printText += "油站名称 :" + detail.M0005_NAME + "\n";
	printText += "\n";
	printText += "商品名称 :" + detail.C0002_CONSUMABLE + "\n";
	printText += "\n";
	printText += "商品单价 :" + detail.T0004_UNIT_PRICE + "\n";
	printText += "\n";
	printText += "消费金额 :" + detail.T0004_EXCHANGE_AMOUNT + "\n";
	printText += "\n";
	printText += "升数 :" + detail.T0004_OIL_L + "\n";
	printText += "\n";
	printText += "渠道信息：" + detail.T0004_EXCHANGE_TYPE + "\n";
	printText += "\n";
	if (detail.车牌号 && detail.车牌号.trim() != "") {
		printText += "车牌信息：" + detail.车牌号 + "\n";
		printText += "\n";
	}
	if (detail.加油枪 && detail.加油枪.trim() != "") {
		printText += "油枪信息：" + detail.加油枪 + "\n";
		printText += "\n";
	}
	printText += "创建时间：" + detail.DATA_CREATE_TIME + "\n";
	printText += "\n";
	printText += "订单号：" + detail.T0004_RECORDS_NUM + "\n";
	printText += "\n";
	if (detail.发票提取码 && detail.发票提取码.trim() != "") {
		printText += "发票提取码：" + detail.发票提取码 + "\n";
	}

	dataArray.push(printText);
	plus.plugintest.printTicket(
		dataArray,
		function (result) {
			console.log(result);
		},
		function (error) {
			console.log(error)
		}
	);

};


/**
 * dealFlowId:流水号
 * 打印支付凭证
 */
$$.printTicket = function (dealFlowId, isReprint) {
	// alert("流水信息明细 '" + dealFlowId + "'")
    /*var sql = "流水信息明细 '" + dealFlowId + "'";
    var detailsData = $$.sqlQuery(sql);
    if (!detailsData || detailsData.length == 0) {
        return;
    }
    var detail = detailsData[0];

    if (detailsData[0].T0004_TYPE == "1") {
        detailsData[0].billClass = "加油"
    }

    var title = "加油信息\n";
    if(isReprint)  {
        title = "加油信息(补)\n";
    }

    var body;
    body = ""
    body += "油站名称 :" + detail.M0005_NAME + "\n";
    body += "商品名称 :" + detail.C0002_CONSUMABLE + "\n";
    body += "商品单价 :" + detail.T0004_UNIT_PRICE + "\n";
    body += "消费金额 :" + detail.T0004_EXCHANGE_AMOUNT + "\n";
    body += "升数 :" + detail.T0004_OIL_L + "\n";
    body += "渠道信息：" + detail.T0004_EXCHANGE_TYPE + "\n";
    if (detail.车牌号 && detail.车牌号.trim() != "") {
        body += "车牌信息：" + detail.车牌号 + "\n";
    }
    if (detail.加油枪 && detail.加油枪.trim() != "") {
        body += "油枪信息：" + detail.加油枪 + "\n";
    }
    body += "创建时间：" + detail.DATA_CREATE_TIME + "\n";
    body += "订单号：" + detail.T0004_RECORDS_NUM + "\n";
    if (detail.发票提取码 && detail.发票提取码.trim() != "") {
        body += "发票提取码：" + detail.发票提取码 + "\n";
        var icon = $$.getInvoiceURL(detail.发票提取码);
    }

    Printer.printTicket(title, body, icon);*/


    var sql = "流水信息明细 '" + dealFlowId + "'";
    var detailsData = $$.sqlQuery(sql);
    if (!detailsData || detailsData.length == 0) {
        return;
    }
    var detail = detailsData[0];

    if (detailsData[0].T0004_TYPE == "1") {
        detailsData[0].billClass = "加油"
    }

    var title = "加油信息\n";
    if (isReprint) {
        title = "加油信息(补)\n";
    }
    /*    var body;
        body = ""
        body += "油站名称 :" + detail.M0005_NAME + "\n";
        body += "商品名称 :" + detail.C0002_CONSUMABLE + "\n";
        body += "商品单价 :" + detail.T0004_UNIT_PRICE + "\n";
        body += "消费金额 :" + detail.T0004_EXCHANGE_AMOUNT + "\n";
        body += "升数 :" + detail.T0004_OIL_L + "\n";
        body += "渠道信息：" + detail.T0004_EXCHANGE_TYPE + "\n";
        if (detail.车牌号 && detail.车牌号.trim() != "") {
            body += "车牌信息：" + detail.车牌号 + "\n";
        }
        if (detail.加油枪 && detail.加油枪.trim() != "") {
            body += "油枪信息：" + detail.加油枪 + "\n";
        }
        body += "创建时间：" + detail.DATA_CREATE_TIME + "\n";
        body += "订单号：" + detail.T0004_RECORDS_NUM + "\n";
        if (detail.发票提取码 && detail.发票提取码.trim() != "") {
            body += "发票提取码：" + detail.发票提取码 + "\n";
            var icon = $$.getInvoiceURL(detail.发票提取码);
        }*/
    // alert(detail.发票提取码);
    if (detail.发票提取码 && detail.发票提取码.trim() != "") {
        var icon = $$.getInvoiceURL(detail.发票提取码);
    }
    var bodyJson = {
        "spos": [
            {

                "content": "http://postest.youxinbao.com.cn:8080/pos/img/qp.bmp",
                "contenttype": "bmp",
                "position": "center"
            },
            {
                "position": "center",
                "content": "POS签购单",
                "contenttype": "txt",
                "bold": "0",
                "height": "-1",
                "italic": "0",
                "offset": "0",
                "size": "3"
            },
            {
                "position": "left",
                "content": "请妥善保管",
                "contenttype": "txt",
                "bold": "0",
                "height": "-1",
                "italic": "0",
                "offset": "0",
                "size": "1"
            },
            {
                "position": "center",
                "content": "_____________________",
                "contenttype": "txt",
                "bold": "0",
                "height": "-1",
                "italic": "0",
                "offset": "0",
                "size": "3"
            },
            {
                "position": "center",
                "content": "         ",
                "contenttype": "txt",
                "bold": "0",
                "height": "-1",
                "italic": "0",
                "offset": "0",
                "size": "3"
            },
            {
                "position": "left",
                "content": "油站名称:"+ detail.M0005_NAME,
                "contenttype": "txt",
                "bold": "0",
                "height": "-1",
                "italic": "0",
                "offset": "0",
                "size": "2"
            },
            {
                "position": "left",
                "content": "订单号: "+detail.T0004_RECORDS_NUM,
                "contenttype": "txt",
                "bold": "0",
                "height": "-1",
                "italic": "0",
                "offset": "0",
                "size": "2"
            },{
                "position": "left",
                "content": "创建时间: "+detail.DATA_CREATE_TIME.split('.')[0],
                "contenttype": "txt",
                "bold": "0",
                "height": "-1",
                "italic": "0",
                "offset": "0",
                "size": "2"
            },
            {
                "position": "left",
                "content": "商品名称:"+ detail.C0002_CONSUMABLE,
                "contenttype": "txt",
                "bold": "0",
                "height": "-1",
                "italic": "0",
                "offset": "0",
                "size": "2"
            },{
                "position": "left",
                "content": "商品单价:"+ detail.T0004_UNIT_PRICE,
                "contenttype": "txt",
                "bold": "0",
                "height": "-1",
                "italic": "0",
                "offset": "0",
                "size": "2"
            },{
                "position": "left",
                "content": "消费金额:"+ detail.T0004_EXCHANGE_AMOUNT,
                "contenttype": "txt",
                "bold": "0",
                "height": "-1",
                "italic": "0",
                "offset": "0",
                "size": "2"
            },{
                "position": "left",
                "content": "升数:"+ detail.T0004_OIL_L,
                "contenttype": "txt",
                "bold": "0",
                "height": "-1",
                "italic": "0",
                "offset": "0",
                "size": "2"
            },{
                "position": "left",
                "content": "渠道信息:"+ detail.T0004_EXCHANGE_TYPE,
                "contenttype": "txt",
                "bold": "0",
                "height": "-1",
                "italic": "0",
                "offset": "0",
                "size": "2"
            },
            {
                "position": "center",
                "content":icon ,
                "contenttype": "two-dimension",
                "bold": "0",
                "height": "-1",
                "italic": "0",
                "offset": "0",
                "size": "3"
            },
        ]
    };



    var ComponentName = plus.android.importClass("android.content.ComponentName");
    var Intent = plus.android.importClass("android.content.Intent");
    var intent = new Intent();
    intent.setComponent(new ComponentName("com.fuyousf.android.fuious", "com.fuyousf.android.fuious.CustomPrinterActivity"));
    intent.putExtra("data", JSON.stringify(bodyJson));
    intent.putExtra("isPrintTicket", "true");
    var main = plus.android.runtimeMainActivity();
    main.onActivityResult = function (requestCode, resultCode, data) {
        // alert(resultCode);
        var reason=data.getStringExtra("reason");//终端号
        // alert(reason);
    };
    main.startActivityForResult(intent, 99);
};
$$.getInvoiceURL = function (code) {
    var invoiceURL = "http://www.uzdust.cn/App/wyjy/tqmapply.html";
    var qrcodeURL = "http://www.uzdust.cn/App/wyjy/tqmapply.html" + "?code=" + code;

    return qrcodeURL;
};

$$.Verification = function (info) {
	var result = {success: "false", result_message: "交易失败"};
	result.out_trade_no = info.out_trade_no;

	var userId = $$.CheckloginState();
	var uuid = $$.TerminalNum();
	var oilNameMap = {
		"92#汽油": "92号 车用汽油(Ⅴ)",
		"95#汽油": "95号 车用汽油(Ⅴ)",
		"97#汽油": "98号 车用汽油(V)"
	};

	var oilName = oilNameMap[info.name];

	info.name= oilName;
	// TODO 根据油品名称获取
	var oilInfo = $$.GetOilInformation(oilName);
	info.oilNameId = oilInfo.油品编号;
	info.oilTaxClassificationCode = oilInfo.税收分类编号;
	info.oilUnitPrice = oilInfo.油品价格;
	info.userId = userId;
	info.terminal = uuid;

	$.ajax({
		type: "POST",
		url: "/AutoVerification",
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		async: false,
		data: info,
		success: function (data) {
			result = JSON.parse(data);
		}
	});

	return result;
};

$$.Verification241 = function (info) {
	// info = {"code":"03662e01fb05465c9272fa090d81dfad","result_message":"成功","success":"true","station":"绵阳白云加油站","out_trade_no":"12312321312313","pay_price":195,"order_price":200,"sale_pr":5,"pay_way":"微信公众号内支付","lincese":"川B921NB","oil":"95#汽油","pay_time":"2018-09-04 07:22:14"};
	var result = {RESULT: -1, MESSAGE: "缺少二维码参数"};
	if (info.code) {
		result = $$.AutoVerification(info.code, info.order_price, info.oil, info.out_trade_no);
		var retCode = result.RESULT;
		if (retCode == 0) {
			$$.print241Ticket(info);
		}
	}

	return result;
};

/**
 * 自动核销接口
 */
$$.AutoVerification = function (QRCode, price, oilConsumable, outTradeNo) {
	var userId = $$.CheckloginState();
	var uuid = $$.TerminalNum();

	var oilNameMap = {
		"92#汽油": "92号 车用汽油(Ⅴ)",
		"95#汽油": "95号 车用汽油(Ⅴ)",
		"97#汽油": "98号 车用汽油(V)"
	};

	var oilName = oilNameMap[oilConsumable];

	// TODO 根据油品名称获取
	var oilInfo = $$.GetOilInformation(oilName);

	var oilId = 0;
	var oilTaxClassificationCode = oilInfo.税收分类编号;
	var oilUnitPrice = oilInfo.油品价格;

	var data = {
		"POS机串码": uuid,
		"二维码编码": QRCode,
		"画面二维码价格": price,
		"操作用户": userId,
		"商品标示": oilId,
		"商品名称": oilConsumable,
		"税收分类编码": oilTaxClassificationCode,
		"商品单价": oilUnitPrice
	};

	var tmpl = "'{{POS机串码}}','{{二维码编码}}',{{画面二维码价格}},'{{操作用户}}',{{商品标示}},'{{商品名称}}','{{税收分类编码}}',{{商品单价}}";
	var params = tmpl.t(data);
	// var sql = "交易登陆 " + params;
	// var tradingLogData = $$.sqlQuery(sql);
	var rst = "";

	var data = {
		params: params,
		outTradeNo: outTradeNo
	};

	$.ajax({
		type: "POST",
		url: "/AutoVerification",
		contentType: "application/x-www-form-urlencoded; charset=UTF-8",
		async: false,
		data: data,
		success: function (data) {
			rst = JSON.parse(data);
		}
	});

	return rst;
};

/**
 * dealFlowId:流水号
 * 打印支付凭证
 */
$$.print241Ticket = function (info) {
	var dataArray = ["1", "24", "0", "1", "0"];
	var printText;
	printText = "                       加油明细                 \n"
	printText += "\n";
	printText += "油站名称 :" + info.station + "\n";
	printText += "\n";
	printText += "商品名称 :" + info.oil + "\n";
	printText += "\n";
	printText += "订单金额 :" + info.order_price + " 元\n";
	printText += "\n";
	printText += "实付金额 :" + info.pay_price + " 元\n";
	printText += "\n";
	printText += "渠道信息：" + "智慧城24.1\n";
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
		function (result) {
			console.log(result);
		},
		function (error) {
			console.log(error)
		}
	);
};

$$.GetOilInformation = function (oilName) {
	var oilInfo = {
		"油品名称": '',
		"税收分类编号": 0,
		"油品价格": 0
	};

	if (oilName != '') {
		var sql = "获取油品详细信息 '" + oilName + "'";
		var oilInformation = $$.sqlQuery(sql);

		var oilPriceJson = localStorage.getItem('油品信息');
		var oilPriceList = [];
		if (oilPriceJson) {
			oilPriceList = JSON.parse(oilPriceJson);
		}
		var oilPrice = '0.00';

		if (oilInformation.length > 0) {
			for (var i = 0; i < oilPriceList.length; i++) {
				if (oilPriceList[i].油品编号 == oilInformation[0].油品编号) {
					oilPrice = oilPriceList[i].油品价格;
					break;
				}
			}
			oilInfo = {
				"油品名称": oilInformation[0].油品名称,
				"税收分类编号": oilInformation[0].税收分类编号,
				"油品价格": oilPrice
			};
		}
	}

	return oilInfo;
};

$$.fire = function (webview, func, data) {
	if (plus) {
		if (typeof data === 'undefined') {
			data = '';
		} else if (typeof data === 'boolean' || typeof data === 'number') {
			webview.evalJS(func + "(" + data + ")");
			return;
		} else if (data instanceof Object || data instanceof Array) {
			data = JSON.stringify(data || {}).replace(/\'/g, "\\u0027").replace(/\\/g, "\\u005c");
		}
		webview.evalJS(func + "('" + data + "')");
	}
};