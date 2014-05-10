(function(window) {
	var $ = window.$, location = window.location;

	var _oauclient = window.oauclient, oauclient = function(option) {
		return new oauclient.fn.init(option);
	};

	oauclient.fn = oauclient.prototype = {
		constructor : oauclient,
		access_token_key : '_app_access_token',
		refresh_token_key : '_app_refresh_token',
		st_user_info : '_st_user_info',
		_third_app_auth_url: '',
		_third_verify_token_url: '',
		_third_get_user_info: '',
		__thirdVerifyToken : null,
		__thirdQueryUserInfo: null,
		__afterVerifyToken: null,
		init: function( option){
			if( option ){
				if( option._third_app_auth_url ){
					this._third_app_auth_url = option._third_app_auth_url;
				}
				if( option._third_verify_token_url ){
					this._third_verify_token_url = option._third_verify_token_url;
				}
				if( option._third_get_user_info ){
					this._third_get_user_info = option._third_get_user_info;
				}
				if( option.__verifyToken ){
					this.__verifyToken = option.__verifyToken;
				}
				if( option.__queryUserInfo ){
					this.__queryUserInfo = option.__queryUserInfo;
				}
			}
		},
		login : function(_third_app_url, __thirdVerifyToken , _verifyTokenUrl , __afterVerifyToken ) {
			_third_app_url = ( _third_app_url )? _third_app_url : this._third_app_auth_url;
			if ( checkToken( __thirdVerifyToken , _verifyTokenUrl , __afterVerifyToken )) {
				return true;
			} else {
				location.href = _third_app_url;
			}
		},
		checkToken : function( __thirdVerifyToken , _verifyTokenUrl , __afterVerifyToken ) {
			var oauth_token = getLocalData(this.access_token_key);
			var oauth_token_secret = getLocalData(this.refresh_token_key);
			if (null == oauth_token || null == oauth_token_secret) {
				return false;
			} else {
				return verifyToken(__thirdVerifyToken , _verifyTokenUrl , __afterVerifyToken);
			}
		},
		saveToken : function() {
			var url_search = window.location.search;
			var accessToken = "";
			var refreshToken = "";

			if (url_search.length > 0) {
				var parameters = url_search.substring(1).split("&");

				var pos, paraName, paraValue;
				for (var i = 0; i < parameters.length; i++) {
					// 获取等号位置
					pos = parameters[i].indexOf('=');
					if (pos == -1) {
						continue;
					}
					// 获取name 和 value
					paraName = parameters[i].substring(0, pos);
					paraValue = parameters[i].substring(pos + 1);
					if (paraName == "accessToken") {
						accessToken = paraValue;
					} else if (paraName == "refreshToken") {
						refreshToken = paraValue;
					}
				}
			}

			if (accessToken == "" || refreshToken == "") {
				return false;
			} else {
				saveLocalData(this.access_token_key, accessToken);
				saveLocalData(this.refresh_token_key, refreshToken);
				return true;
			}
		},
		verifyToken : function( __thirdVerifyToken , _verifyTokenUrl , __afterVerifyToken  ) {
			__thirdVerifyToken = (  __thirdVerifyToken )? __thirdVerifyToken: this.__thirdVerifyToken ;
			__afterVerifyToken = (  __afterVerifyToken )? __afterVerifyToken: this.__afterVerifyToken ;
			_third_verify_token_url = (  _third_verify_token_url )? _third_verify_token_url: this._third_verify_token_url ;
			
			var accessToken = getLocalData(this.access_token_key);
			var result = __thirdVerifyToken( accessToken, _third_verify_token_url );
			if (result) {
				if( __afterVerifyToken ){
					__afterVerifyToken(result);
				}
				return true;
			} else {
				return false;
			}
		},
		saveCurUserInfo : function(userInfo) {
			if (null != userInfo) {
				saveSessionData(this.st_user_info, userInfo);
			}
		},
		getCurUserInfo : function() {
			return getSessionData(this.st_user_info);
		}
	};

	var getLocalData = function(key) {
		try {
			var value = localStorage[key];
			if (value && "null" != value) {
				return JSON.parse(value);
			}
		} catch (ex) {
			return null;
		}
	};
	var saveLocalData = function(key, value) {
		localStorage[key] = JSON.stringify(value);
	};
	var getSessionData = function(key) {
		try {
			var value = sessionStorage[key];
			if (value && "null" != value) {
				return JSON.parse(value);
			}
		} catch (ex) {
			return null;
		}
	};
	var saveSessionData = function(key, value) {
		sessionStorage[key] = JSON.stringify(value);
	};

	oauclient.fn.init.prototype = oauclient.fn;
	window.oauclient = oauclient;

})(window);