var zhcNetworkInvoke = {
    websocket: null,
    iReconnect:0,
    data: {
        ws_address: "",
    },
    datas: function() {
        return zhcNetworkInvoke.data;
    },
    addEventListen: function(event, cb) {
        switch(event) {
            case "onOpen":
                zhcNetworkInvoke.onOpen = cb;
                break;
            case "onMessage":
                zhcNetworkInvoke.onMessage = cb;
                break;
            case "onClose":
                zhcNetworkInvoke.onClose = cb;
                break;
            case "onError":
                zhcNetworkInvoke.onError = cb;
                break;
        }
    },
    init: function() {
        try{
            zhcNetworkInvoke.websocket = new WebSocket(zhcNetworkInvoke.data.ws_address);
            zhcNetworkInvoke.websocket.onopen = zhcNetworkInvoke.onOpen;
            zhcNetworkInvoke.websocket.onmessage = zhcNetworkInvoke.onMessage;
            zhcNetworkInvoke.websocket.onclose = zhcNetworkInvoke.onClose;
            zhcNetworkInvoke.websocket.onError = zhcNetworkInvoke.onError;
        }
        catch(e){
            console.log(e);
        }

    },
    onOpen: function() {
        console.log("onopen is called");
    },
    onMessage: function() {
        console.log("onmessage is called");
    },
    onClose: function() {
        console.log("onclose is called");
    },
    onError: function() {
        console.log("onerror is called");
    },
    send: function(msg) {
        zhcNetworkInvoke.waitForConnection(function() {
            zhcNetworkInvoke.websocket.send(msg);
            if(typeof callback !== 'undefined') {
                callback();
            }
        }, 1000);
    },
    waitForConnection: function(callback, interval) {
        if(zhcNetworkInvoke.websocket.readyState === 1) {
            callback();
        } else {
            setTimeout(function() {
                zhcNetworkInvoke.waitForConnection(callback, interval)
            }, interval);
        }
    },
    close: function() {
        zhcNetworkInvoke.websocket.close();
    },
    setWsAddress: function(ws) {
        zhcNetworkInvoke.data.ws_address = ws;
    },
    packet: function(_controller, _method, _data) {
        var msg = {
            controller: _controller,
            method: _method,
            data: _data
        }
        return JSON.stringify(msg);
    }
};

var zhcServerConnector = {
    token: "",
    mchid: "",
    callback: null,
    url: "ws://112.74.160.253:9503",
    status: {
        connection: false, // 连接状态
        session: "", // session
        heartbeat_id: 0, // 心跳id
        heartbeat_intval: 10000 // 心跳时间
    },
    listenMap: new Array(),

    /*
     *
     * @param {string} token    TOKEN
     * @param {string} mchid    终端ID
     * @param {closed} callback 闭包
     */
    create: function(token, mchid, callback) {
        zhcServerConnector.token = token;
        zhcServerConnector.mchid = mchid;
        zhcServerConnector.callback = callback;
        zhcServerConnector.init();
    },

    init: function() {
        zhcNetworkInvoke.setWsAddress(zhcServerConnector.url);
        zhcNetworkInvoke.addEventListen("onOpen", zhcServerConnector.onOpen);
        zhcNetworkInvoke.addEventListen("onClose", zhcServerConnector.onClose);
        zhcNetworkInvoke.addEventListen("onError", zhcServerConnector.onError);
        zhcNetworkInvoke.addEventListen("onMessage", zhcServerConnector.onMessage);
        zhcServerConnector.addEventListen("Sign", zhcServerConnector.events_func.onSign);
        zhcNetworkInvoke.init();
    },
    onReconnection:function(){
        zhcNetworkInvoke.init();
        zhcNetworkInvoke.iReconnect++;
    },
    onOpen: function() {
        zhcServerConnector.status.connection = true;
        console.log("succuess connect server");
        // zhcServerConnector.events_func.begin_heartbeat();
        if(zhcNetworkInvoke.websocket.readyState === 1){
            zhcServerConnector.event.sign();
        }
    },
    onClose: function(event) {
        zhcNetworkInvoke.iReconnect = 0;
        zhcServerConnector.status.connection = false;
        console.log("succuess disconnect server");
        console.log(event);
        if(event.code == 1006)
        {
            console.log("服务器断开连接");
            zhcServerConnector.onReconnection();
        }
        else if(event.code == 1002)
        {
            console.log("协议错误");
            zhcServerConnector.onReconnection();
        }
        else if(event.code == 1012)
        {
            console.log("服务器重连请求");
            zhcServerConnector.onReconnection();
        }
    },
    onError:function(error){
        console.log(error);
    },
    onMessage: function(event) {
        var msg = null;
        try {
            msg = JSON.parse(event.data);
            if(typeof(msg) === "object") {
                // code 为0 代表无错误，否则，控制台输出错误信息
                if(msg.message !== undefined && typeof(msg.message) === "string" &&
                    zhcServerConnector.listenMap[msg.message] !== undefined) {
                    zhcServerConnector.listenMap[msg.message](msg);
                } else {
                    console.log("数据包被丢弃");
                }
            } else {
                var errDesc = "服务器处理异常";
                console.log(errDesc);
            }
        } catch(e) {
            console.log("帧错误，被丢弃 " + e);
        }
    },
    sessionHandler: {
        data: {
            uid: "", // uid
            times: "", // 登陆时间
            status: "", // 状态
            session_id: "", // session
            mchid: "", // mchid 号
            name: "", // 加油站名字
        },
        setData: {
            setTimes: function(_times) {
                zhcServerConnector.sessionHandler.data.times = _times;
            },
            setStatus: function(_status) {
                zhcServerConnector.sessionHandler.data.status = _status;
            },
            setSessionId: function(_session_id) {
                zhcServerConnector.sessionHandler.data.session_id = _session_id;
            },
            setMchid: function(_mchid) {
                zhcServerConnector.sessionHandler.data.mchid = _mchid;
            },
            setName: function(_name) {
                zhcServerConnector.sessionHandler.data.name = _name;
            },
        },
        initData: function() {
            zhcServerConnector.sessionHandler.setData.setUid("");
            zhcServerConnector.sessionHandler.setData.setTimes("");
            zhcServerConnector.sessionHandler.setData.setStatus("");
            zhcServerConnector.sessionHandler.setData.setSessionId("");
            zhcServerConnector.sessionHandler.setData.setMchid("");
            zhcServerConnector.sessionHandler.setData.setName("");
        }
    },
    event: {
        sign:function() {
            zhcServerConnector.addEventListen("onSign",  zhcServerConnector.events_func.onSign);
            var frame = {
                "mchid":zhcServerConnector.mchid
            };
            var frameJson = zhcNetworkInvoke.packet("Account","Sign",frame);
            zhcNetworkInvoke.send(frameJson);
        },
        begin_heartbeat: function() {
            if(zhcServerConnector.status.heartbeat_id == 0) {
                console.log("心跳事件触发");
                zhcServerConnector.addEventListen("pong", zhcServerConnector.events_func.pong);
                zhcServerConnector.status.heartbeat_id = setInterval(function() {
                    // 蹇冭烦鍖呭彂閫�
                    zhcNetworkInvoke.send(zhcNetworkInvoke.packet("Account", "Ping", {}));
                }, zhcServerConnector.status.heartbeat_intval);
            }
        },
        end_heartbeat: function() {
            if(zhcServerConnector.status.heartbeat_id > 0) {
                window.clearInterval(zhcServerConnector.status.heartbeat_id);
                zhcServerConnector.status.heartbeat_id = 0;
            }
        },

    },
    addEventListen: function(eventName, eventCallback) {
        zhcServerConnector.listenMap[eventName] = eventCallback;
    },
    send: function(msg) {
        zhcNetworkInvoke.waitForConnection(function() {
            websocket.send(msg);
            if(typeof callback !== 'undefined') {
                callback();
            }
        }, 1000);
    },
    waitForConnection: function(callback, interval) {
        if(zhcNetworkInvoke.websocket.readyState === 1) {
            callback();
        } else {
            setTimeout(function() {
                zhcNetworkInvoke.waitForConnection(callback, interval)
            }, interval);
        }
    },
    close: function() {
        zhcNetworkInvoke.websocket.close();
    },
    setWsAddress: function(ws) {
        zhcNetworkInvoke.data.ws_address = ws;
    },
    packet: function(_controller, _method, _data) {
        var msg = {
            controller: _controller,
            method: _method,
            data: _data
        };

        return JSON.stringify(msg);
    },
    events_func: {
        pong: function(msg) {
            console.log("收到心跳返回帧" + msg.data.timestamp);
        },
        onSign:function(msg) {
            // 保存值
            zhcServerConnector.sessionHandler.setData.setSessionId(msg.data.session_id);
            zhcServerConnector.sessionHandler.setData.setMchid(msg.data.mchid);
            console.log("登陆成功");
            // 启动心跳
            zhcServerConnector.event.begin_heartbeat();
            zhcServerConnector.addEventListen("onSignFailed",zhcServerConnector.events_func.onReplaceSign);
            zhcServerConnector.addEventListen("onReplaceSign",zhcServerConnector.events_func.onReplaceSign);
            zhcServerConnector.addEventListen("onPushOrder",zhcServerConnector.events_func.onPushOrder);
        },
        onSignFailed:function(msg){
            console.log("登陆失败，失败原因："+ msg.status);
        },
        onReplaceSign:function(msg){
            console.log("客户端在异地登陆");
            zhcNetworkInvoke.close();
        },
        onPushOrder:function(msg){
            if(zhcServerConnector.callback)
            {
                // 回调参数：
                console.log(msg);
                var results = zhcServerConnector.callback(msg);
                zhcNetworkInvoke.send(zhcNetworkInvoke.packet("Order","RecordsOrder",results));
            }
        },
    },

}

// zhcServerConnector.create("", "00000012", function(msg){
    // console.log(msg);
// });
