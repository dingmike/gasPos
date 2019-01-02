document.addEventListener( "plusready",  function()
{
    var _BARCODE = 'plugintest',
		B = window.plus.bridge;
    var plugintest = 
    {
    	printTicket : function (Argus, successCallback, errorCallback ) 
		{
			var success = typeof successCallback !== 'function' ? null : function(args) 
			{
				successCallback(args);
			},
			fail = typeof errorCallback !== 'function' ? null : function(code) 
			{
				errorCallback(code);
			};
			callbackID = B.callbackId(success, fail);

			return B.exec(_BARCODE, "printTicket", [callbackID, Argus]);
		},
		getDeviceInfo : function (successCallback, errorCallback ) 
		{
			var success = typeof successCallback !== 'function' ? null : function(args) 
			{
				successCallback(args);
			},
			fail = typeof errorCallback !== 'function' ? null : function(code) 
			{
				errorCallback(code);
			};
			callbackID = B.callbackId(success, fail);
			return B.execSync(_BARCODE, "getDeviceInfo", [callbackID]);
		}	
    };
    window.plus.plugintest = plugintest;
}, true );