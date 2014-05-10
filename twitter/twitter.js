/**
 * @fileOverview This is a simple api access twitter rest api. include Oauth
 *               1.0a flow, access twitter api with access_token and
 *               access_token_secret created by
 * @author <a href="sangjun@pset.suntec.net">sangjun</a>
 * @version 0.1
 */
(function(window) {
	var $ = window.$, location = window.location;

	/**
	 * @example
	 * var tw = twitter();
	 * @constructor twitter
	 * @since version 0.1
	 * @param {json}
	 *            option json对象,用于修改参数
	 * @description 封装了对Twitter Rest API 的访问
	 */
	var twitter = function(option) {
		return new twitter.fn.init(option);
	};

	/**
	 * @description
	 */
	twitter.fn = twitter.prototype = {
		constructor : twitter,
		IS_DEV : true,
		METHOD_GET : 'GET',
		METHOD_POST : 'POST',
		api_twitter_host : "https://api.twitter.com",
		statuses_home_timeline_url : "/1.1/statuses/home_timeline.json",
		statuses_user_timeline_url : "/1.1/statuses/user_timeline.json",
		friends_ids_url : "/1.1/friends/ids.json",
		friends_list_url : "/1.1/friends/list.json",
		favorites_list_url : "/1.1/favorites/list.json",

		suggestions_category_list_url : "/1.1/users/suggestions.json",
		suggestions_list_url : "/1.1/users/suggestions",
		app_rate_limit_url : "/1.1/application/rate_limit_status.json",
		app_verify_token_url : "/1.1/account/verify_credentials.json",
		// POST
		statuses_retweet_create_url : "/1.1/statuses/retweet",
		friendships_create_url : "/1.1/friendships/create.json",
		favorites_create_url : "/1.1/favorites/create.json",
		device_type : "app3",
		app_type : "twitter",
		site_host : "http://localhost:8080",
		twitter_server : "http://appoauth.herokuapp.com",
		// ?oauth_token=" + oauth_token + "&oauth_token_secret=" +
		// oauth_token_secret + "&request_url=" + encodeURIComponent(tw_url),
		access_token_key : 'tw_access_token',
		refresh_token_key : 'tw_refresh_token',
		st_suggest_categorys_key : 'tw_st_suggest_category_list', // 保存推荐分类
		st_dcv_sug_users_key : 'tw_st_dcv_sug_users', // 保存已抓取过推荐用户的分类
		st_dcv_sug_users_members_key : 'tw_st_dcv_sug_users_members', // 保存已经抓取过推荐用户状态的分类
		st_user_info : 'tw_st_user_info',
		st_frd_key : 'tw_st_frd',
		st_frd_frd_key : 'tw_st_frd_frd',
		st_has_fetch_frdfrd : 'tw_st_has_fetch_frdfrd',
		st_act_frd_fav_key : 'tw_st_act_frd_fav',

		login_url : "index.html",
		login_back_url : "index.html",
		login_twitter_index_url : "/tw_index.html",
		twitter_oauth_url : "/auth/twitter",
		// ?deviceType=app3&appType=twitter&backurl=",
		twitter_token_header_url : "/twitter/header",
		login_success_action : this.saveToken,

		/**
		 * @function
		 * @param {json}
		 *            option
		 * @description Twitter入口方法
		 */
		init : function(option) {
			if (option) {
				if (option.site_host) {
					this.site_host = option.site_host;
				}

				if (option.login_url) {
					this.login_url = option.login_url;
				}

				if (option.login_back_url) {
					this.login_back_url = option.login_back_url;
				}

				if (option.twitter_oauth_url) {
					this.twitter_oauth_url = option.twitter_oauth_url;
				}

				if (option.login_twitter_index_url) {
					this.login_twitter_index_url = option.login_twitter_index_url;
				}
			}
			// return this;
		},
		/**
		 * @function
		 * @description 登录系统
		 *              <li> 如果checkToken成功，则返回true(需要自行添加跳转到main页面的事件).
		 *              <li> 失败的话，则跳转到第三方应用，请求Token.
		 * 
		 */
		login : function() {
			var full_login_back_url = "";
			if (this.IS_DEV) {
				full_login_back_url = this.site_host + "/main.html";
			} else {
				full_login_back_url = "http://localhost/oauth2callback/iauto-app://net.suntec.web.twitter/chrome/content/"
						+ this.login_back_url;
			}
			if (this.checkToken()) {
				return true;
				// location.href = this.login_back_url;
				// full_login_back_url;
				// this.site_host + this.login_back_url;
			} else {
				location.href = this.twitter_server + this.twitter_oauth_url
						+ "?deviceType=" + this.device_type + "&appType="
						// + "http://localhost/oauth2callback/"
						+ this.app_type + "&backurl=" + full_login_back_url;
				// "iauto-app://net.suntec.web.twitter/chrome/content/" +
				// this.login_back_url;
				// + encodeURIComponent(this.site_host + this.login_back_url);
			}
		},
		/**
		 * @function
		 * @description 检查Token是否有效,返回true/false
		 *              <li>检查 LocalStorage 中是否存在Token (以前是否登录过)
		 *              <li>有Token的话，则检查SessionStorage中是否存在用户信息(稍前是否登录过/会话还有效).没有Token的话，则返回false.
		 *              <li>没有用户信息的话，则到服务器端验证Token是否有效(以前登录过，但是会话已经超时).有用户信息，则返回true.
		 *              <li>返回服务器端验证结果true/false.
		 * @return {boolean} true/false
		 */
		checkToken : function() {
			var oauth_token = getLocalData(this.access_token_key);
			var oauth_token_secret = getLocalData(this.refresh_token_key);
			if (null == oauth_token || null == oauth_token_secret) {
				return false;
			} else {
				if (null != this.getCurUserInfo()) {
					return true;
				} else {
					return this.verifyToken();
				}
			}
		},
		/**
		 * @function
		 * @description 将Access Token 以及 Refresh Token
		 *              从返回路径中解析出来并保存到LocalStorage中
		 * @return {boolean} true/false
		 */
		saveToken : function() {
			if (this.checkToken()) {
				return true;
			}
			var url_search = window.location.search;
			var accessToken = "";
			var refreshToken = "";

			if (url_search.length > 0) {
				var parameters = url_search.substring(1).split("&");

				var pos, paraName, paraValue;
				var len = parameters.length;
				for (var i = 0; i < len; i++) {
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
				// location.href = this.site_host + this.login_url;
				return false;
			} else {
				// alert( "accessToken:" + accessToken );
				// alert( "refreshToken:" + refreshToken );
				saveLocalData(this.access_token_key, accessToken);
				saveLocalData(this.refresh_token_key, refreshToken);
				return true;
				// window.location.href = this.site_host
				// + this.login_twitter_index_url;
			}
		},
		/**
		 * @function
		 * @description 到第三方服务器中验证Token是否有效,
		 * @return {boolean} true/false
		 */
		verifyToken : function() {
			var result = this.getTwitterApi(this.api_twitter_host
					+ this.app_verify_token_url);
			if (result) {
				this.saveCurUserInfo(result);
				return true;
			} else {
				return false;
			}
		},
		/**
		 * @function
		 * @param userInfo
		 *            用户信息
		 * @description 将用户信息保存到sessionStorage中
		 * 
		 */
		saveCurUserInfo : function(userInfo) {
			if (null != userInfo) {
				saveSessionData(this.st_user_info, userInfo);
			}
		},
		/**
		 * @param request_url
		 *            请求路径
		 * @param method
		 *            请求方法
		 * @param data
		 *            请求数据
		 * @description 从服务器中获取 Auth Header,用于认证
		 * @return {string}
		 */
		getTokenHeader : function(request_url, method, data) {
			var oauth_token = getLocalData(this.access_token_key);
			var oauth_token_secret = getLocalData(this.refresh_token_key);

			console.log("oauth_token: " + oauth_token);
			console.log("oauth_token_secret: " + oauth_token_secret);
			if (null == oauth_token || null == oauth_token_secret) {
				// window.location.href = this.site_host + this.login_url;
				return null;
			}

			var tokenUrl = this.twitter_server + this.twitter_token_header_url
					+ "?oauth_token=" + oauth_token + "&oauth_token_secret="
					+ oauth_token_secret + "&request_url="
					+ window.encodeURIComponent(request_url);
			var returnVal = "";

			$.ajax({
						type : method,
						async : false,
						url : tokenUrl,
						data : data,
						success : function(msg) {
							returnVal = msg;
						},
						error : function(xhr, textStatus, errorThrown) {
							returnVal = null;
						}
					});
			console.log("returnVal: " + returnVal);
			return returnVal;
		},
		/**
		 * @function
		 * @description 构建Auth Header,并放入request header中. 用于Twitter oauth认证
		 */
		createTokenHeader : function(xhr, request_url, method, data) {
			console.log("createTokenHeader.....");
			var tokenHeader = this.getTokenHeader(request_url, method, data);
			console.log("tokenHeader: " + tokenHeader);
			xhr.setRequestHeader('Authorization', tokenHeader);
		},
		accessTwitterApi : function(request_url, method, data,
				responseAccessSuccessAction, responseAccessErrorAction) {
			var result = null;
			console.log("request_url: " + request_url);
			console.log("method: " + method);
			var twitter_fnc = this;
			$.ajax({
						type : method,
						url : request_url,
						async : false,
						data : data,
						dataType : 'json',
						// jsonp:'callback',
						crossDomain : true,
						beforeSend : function(xhr) {
							console.log("beforeSend.....");
							console.log("request_url: " + request_url);
							twitter_fnc.createTokenHeader(xhr, request_url,
									method, data);
						},
						success : function(res, textStatus) {
							console.log("success ........ " + textStatus);
							if (responseAccessSuccessAction) {
								result = responseAccessSuccessAction(res);
								// eval(responseAccessSuccessAction)(res);
							} else {
								result = twitter_fnc
										.defaultTwAccSuccAction(res);
							}
						},
						error : function(xhr, textStatus, errorThrown) {
							result = null;
						}
					});
			return result;
		},
		defaultTwAccSuccAction : function(res) {
			return res;
			// window.$("#restext").val(res);
		},
		defaultTwAccErrAction : function(xhr, textStatus, errorThrown) {
			return xhr;
		},
		defaultTwPostSuccAction : function(res) {
			return res;
		},
		defaultTwPostErrAction : function(xhr, textStatus, errorThrown) {
			return xhr;
		},
		getTwitterApi : function(get_url, paramOption, option) {
			var succHandle = null;
			// this.defaultTwAccSuccAction;
			var errHandle = null;
			// this.defaultTwAccErrAction;
			var data = null;
			var params = "";

			if (paramOption) {
				var isFirst = true;
				for (var p in paramOption) {
					if (typeof(paramOption[p]) == "function") {
						continue;
					}
					if (isFirst) {
						params = "?" + p + "=" + paramOption[p];
						isFirst = false;
					} else {
						params += "&" + p + "=" + paramOption[p];
					}
				}
			}

			if (option) {
				if (option.data) {
					data = option.data;
				}
				if (option.succHandle) {
					succHandle = option.succHandle;
				}
				if (option.errHandle) {
					errHandle = option.errHandle;
				}
			}

			return this.accessTwitterApi(get_url + params, 'GET', null,
					succHandle, errHandle);
		},
		accessHomeAPI : function(paramOption, option) {
			var records = this.getHomeTimeline(paramOption, option);
			return records;
		},
		/**
		 * 
		 * 
		 * @description 获取系统推荐用户的发布状态
		 *              <li>用户请求数据，此时先清除缓存中的过时数据(该缓存保存获取过数据的分类)。
		 *              <li>对分类进行随机排序，然后轮询分类。
		 *              <li>如果被轮询到的分类，在缓存中存在，则继续轮询下一个分类，一直到所轮询的分类在缓存中不存在.
		 *              <li>向Twitter API获取数据
		 *              <li>将数据对应的分类放入缓存中，并返回数据给用户
		 *              <li>如果所有分类都已经轮询过，且不满足'在缓存中不存在'这个条件，则返回null给用户.
		 * 
		 * @return {array} [{"statuses_count":15286,"nam"}]
		 */
		accessDcvSugTimeLine : function() {
			this.cacheClearInSession(this.st_dcv_sug_users_members_key);
			var result = null;
			var categorys = this.sugGetCategorys();
			var _self = this;
			categorys = this.randomSortArray(categorys);
			$.each(categorys, function(index, category) {
						var slug = category['slug'];
						if (!_self.checkInCache(
								_self.st_dcv_sug_users_members_key, slug)) {
							result = _self.sugGetMembers(slug);
							_self.sugCacheCategory(
									_self.st_dcv_sug_users_members_key, slug);
							return false;
						}
					});
			return result;
		},
		/**
		 * 
		 * @description 获取系统推荐用户
		 *              <li>用户请求数据，此时先清除缓存中的过时数据(该缓存保存获取过数据的分类)。
		 *              <li>对分类进行随机排序，然后轮询分类。
		 *              <li>如果被轮询到的分类，在缓存中存在，则继续轮询下一个分类，一直到所轮询的分类在缓存中不存在.
		 *              <li>向Twitter API获取数据
		 *              <li>将数据对应的分类放入缓存中，并返回数据给用户
		 *              <li>如果所有分类都已经轮询过，且不满足'在缓存中不存在'这个条件，则返回null给用户.
		 * @return {json} {"slug":"nhl","size":62,"users":[{"name":"Alex"}]}
		 */
		accessDcvSuggetions : function() {
			this.cacheClearInSession(this.st_dcv_sug_users_key);
			var result = null;
			var categorys = this.sugGetCategorys();
			var _self = this;
			categorys = this.randomSortArray(categorys);
			$.each(categorys, function(index, category) {
						var slug = category['slug'];
						if (!_self.checkInCache(_self.st_dcv_sug_users_key,
								slug)) {
							result = _self.sugGetUserLists(slug);
							_self.sugCacheCategory(_self.st_dcv_sug_users_key,
									slug);
							return false;
						}
					});
			return result;
		},
		/**
		 * @description 获取 discovery 中的 当前用户的 friends 的 friends的状态
		 */
		accessDcvFrdFrdUserTimeLine : function() {
			return this.fetchFrdFrdStates(false);
		},
		/**
		 * @description activity 中的 friends 的 friends
		 */
		accessActvFrdFrd : function() {
			return this.fetchFrdFrdStates(true);
		},
		/**
		 * @description activity 中的 friends 的favority
		 */
		accessAvtvFrdFav : function() {
			this.cacheClearInSession(this.st_act_frd_fav_key);
			var result = null;
			var myFriends = this.stLoadMyFriends().users;
			myFriends = this.randomSortArray(myFriends);

			var friend = null;
			var friend_id = null;
			var fetch_result = null;
			var last_fetch_count = 0;
			var last_since_id = 0;
			var len = myFriends.length;
			for (var index = 0; index < len; index++) {
				friend = myFriends[index];
				friend_id = friend.id;
				if (this.checkInCache(this.st_act_frd_fav_key, friend_id)) {
					var cacheObj = this.cacheGetRecord(this.st_act_frd_fav_key,
							friend_id);
					if (cacheObj.hasOwnProperty('is_fetch_all')
							&& cacheObj['is_fetch_all']) {
						continue;
					} else {
						last_fetch_count = cacheObj.fetch_count || 0;
						last_since_id = cacheObj.last_since_id || 0;
						if (cacheObj.hasOwnProperty('max_id')) {
							fetch_result = this.getFavoriteList({
										'user_id' : friend_id,
										'max_id' : cacheObj['max_id'] - 1,
										'include_entities' : false
									});
						} else {
							fetch_result = this.getFavoriteList({
										'user_id' : friend_id,
										'include_entities' : false
									});
						}
						break;
					}
				} else {
					fetch_result = this.getFavoriteList({
								'user_id' : friend_id,
								'include_entities' : false
							});
					break;
				}
			}

			if (fetch_result) {
				var cur_fetch_count = fetch_result.length;
				var max_id = -1;
				var since_id = fetch_result[0].id;
				since_id = (since_id > last_since_id)
						? since_id
						: last_since_id;
				result = {};

				if (cur_fetch_count > 0) {
					max_id = fetch_result[cur_fetch_count - 1].id;
					result['max_id'] = max_id;
				}

				result['user_id'] = friend_id;
				result['screen_name'] = friend.screen_name;
				result['name'] = friend.name;
				result['size'] = cur_fetch_count;
				result['since_id'] = since_id;
				result['favs'] = fetch_result;
				this.cacheFrdFav(this.st_act_frd_fav_key, friend, result,
						last_fetch_count)
			}
			return result;
		},
		/**
		 * 
		 * @param skip_status
		 *            是否忽略好友的好友的发布状态
		 * @description 获取好友的好友
		 * @return {json}
		 */
		fetchFrdFrdStates : function(skip_status) {
			this.cacheClearInSession(this.st_frd_frd_key);
			var myFriends = this.stLoadMyFriends().users;
			myFriends = this.randomSortArray(myFriends);

			var friend = null;
			var friend_id = null;
			var fetch_result = null;
			var last_fetch_count = 0;
			var len = myFriends.length;
			for (var index = 0; index < len; index++) {
				friend = myFriends[index];
				friend_id = friend.id;
				if (this.checkInCache(this.st_frd_frd_key, friend_id)) {
					var cacheObj = this.cacheGetRecord(this.st_frd_frd_key,
							friend_id);
					if (cacheObj['is_fetch_all']) {
						continue;
					} else {
						last_fetch_count = cacheObj.fetch_count || 0;
						fetch_result = this.getFriendsList({
									'user_id' : friend_id,
									'cursor' : cacheObj['next_cursor'],
									'skip_status' : skip_status
								});
						break;
					}
				} else {
					fetch_result = this.getFriendsList({
								'user_id' : friend_id,
								'cursor' : -1,
								'skip_status' : false
							});
					break;
				}
			}
			if (fetch_result) {
				fetch_result['user_id'] = friend_id;
				fetch_result['screen_name'] = friend.screen_name;
				fetch_result['name'] = friend.name;
				this.cacheFrdFrd(this.st_frd_frd_key, friend, fetch_result,
						last_fetch_count)
			}
			return fetch_result;
		},
		getHomeTimeline : function(paramOption, option) {
			return this.getTwitterApi(this.api_twitter_host
							+ this.statuses_home_timeline_url, paramOption,
					option);
		},
		getUserTimeline : function(paramOption, option) {
			if (!paramOption
					|| (!paramOption['user_id'] && !paramOption['screen_name'])) {
				handleTwitterApiGetErr('user_id or screen_name must exist one');
				return null;
			}
			return this.getTwitterApi(this.api_twitter_host
							+ this.statuses_user_timeline_url, paramOption,
					option);
		},
		getFriendsIds : function(paramOption, option) {
			return this.getTwitterApi(this.api_twitter_host
							+ this.friends_ids_url, paramOption, option);
		},
		getFriendsList : function(paramOption, option) {
			return this.getTwitterApi(this.api_twitter_host
							+ this.friends_list_url, paramOption, option);
		},
		sugGetCategorys : function(paramOption, option) {
			return this.stLoadMyCategorys();
		},
		sugGetMembers : function(category, paramOption, option) {
			if (!category) {
				handleTwitterApiGetErr('category should not empty');
				return null;
			}
			return this.getTwitterApi(this.api_twitter_host
							+ this.suggestions_list_url + "/"
							+ encodeURIComponent(category) + "/members.json",
					paramOption, option);
		},
		sugGetUserLists : function(category, paramOption, option) {
			if (!category) {
				handleTwitterApiGetErr('category should not empty');
				return null;
			}
			return this.getTwitterApi(this.api_twitter_host
							+ this.suggestions_list_url + "/"
							+ encodeURIComponent(category) + ".json",
					paramOption, option);
		},
		getCurUserInfo : function() {
			return getSessionData(this.st_user_info);
		},
		getAppRateLimit : function(paramOption, option) {
			return this.getTwitterApi(this.api_twitter_host
							+ this.app_rate_limit_url, paramOption, option);
		},
		getFavoriteList : function(paramOption, option) {
			return this.getTwitterApi(this.api_twitter_host
							+ this.favorites_list_url, paramOption, option);
		},
		postRetwitterAPI : function(param_twitter_id, option) {
			if (!param_twitter_id) {
				handleTwitterApiPostErr('twitter_id should not empty');
				return null;
			}
			var twitter_id = param_twitter_id;
			var succHandle = null;
			var errHandle = null;
			var data = null;
			if (option) {
				if (option.data) {
					data = option.data;
				}
				if (option.succHandle) {
					succHandle = option.succHandle;
				}
				if (option.errHandle) {
					errHandle = option.errHandle;
				}
			}
			return this.accessTwitterApi(this.api_twitter_host
							+ this.statuses_retweet_create_url + "/"
							+ twitter_id + ".json", this.METHOD_POST, data,
					succHandle, errHandle);
		},
		postFollowAPI : function(param_user_id, option) {
			if (!param_user_id) {
				handleTwitterApiPostErr('user_id should not empty');
				return null;
			}
			var user_id = param_user_id;
			var succHandle = this.defaultTwPostSuccAction;
			var errHandle = this.defaultTwPostErrAction;
			var is_follow = true;
			var data = {};
			if (option) {
				if (option.user_id) {
					user_id = option.user_id;
				}

				if (option.data) {
					data = option.data;
				}

				if (option.follow) {
					is_follow = option.follow;
				}

				if (option.succHandle) {
					succHandle = option.succHandle;
				}

				if (option.errHandle) {
					errHandle = option.errHandle;
				}
			}
			return this.accessTwitterApi(this.api_twitter_host
							+ this.friendships_create_url + "?user_id="
							+ user_id + "&follow=" + isFollow,
					this.METHOD_POST, data, succHandle, errHandle);
		},
		postFavoritesAPI : function(param_twitter_id, option) {
			if (!param_twitter_id) {
				handleTwitterApiPostErr('twitter_id should not empty');
				return null;
			}

			var twitter_id = param_twitter_id;
			var succHandle = this.defaultTwPostSuccAction;
			var errHandle = this.defaultTwPostErrAction;
			var data = {};
			if (option) {
				// if( option.twitter_id ){
				// twitter_id = option.twitter_id ;
				// }
				if (option.data) {
					data = option.data;
				}
				if (option.succHandle) {
					succHandle = option.succHandle;
				}
				if (option.errHandle) {
					errHandle = option.errHandle;
				}
			}
			return this.accessTwitterApi(this.api_twitter_host
							+ this.favorites_create_url + "?id=" + twitter_id,
					this.METHOD_POST, data, succHandle, errHandle);
		},
		handleTwitterApiPostErr : function(msg) {
			alert(msg);
		},
		handleTwitterApiGetErr : function(msg) {
			alert(msg);
		},
		stLoadMyFriends : function() {
			var myFriends = getSessionData(this.st_frd_key);
			if (null == myFriends) {
				myFriends = this.getFriendsList({
							'user_id' : this.getCurUserInfo().id,
							'skip_status' : true,
							'include_user_entities' : false,
							'count' : 100
						});
				saveSessionData(this.st_frd_key, myFriends);
			}
			return myFriends;
		},
		stLoadMyCategorys : function() {
			var categorys = getSessionData(this.st_suggest_categorys_key);
			if (null == categorys) {
				// ,{'lang': this.getCurUserInfo().lang}
				categorys = this.getTwitterApi(this.api_twitter_host
						+ this.suggestions_category_list_url);
				saveSessionData(this.st_suggest_categorys_key, categorys);
			}
			return categorys;
		},
		/**
		 * @description 保存用户收藏信息
		 */
		cacheFrdFav : function(stKey, friend, fetch_result, last_fetch_count) {
			var screen_name = friend.screen_name;
			var name = friend.name;
			var favourites_count = friend.favourites_count;
			var user_id = friend.id;
			var cur_fetch_count = fetch_result['size'];
			var since_id = fetch_result['since_id'];
			var is_fetch_all = false; // 是否已经获取了所有好友
			var fetch_count = cur_fetch_count + last_fetch_count;
			if (fetch_count >= favourites_count) {
				is_fetch_all = true;
			}
			var datas = getSessionData(stKey);
			if (null == datas) {
				datas = {};
			}

			var sugComplexData = {};
			if (fetch_result.hasOwnProperty('max_id')) {
				var cur_max_id = fetch_result['max_id'];
				sugComplexData = {
					'screen_name' : screen_name,
					'name' : name,
					'favourites_count' : favourites_count,
					'fetch_count' : fetch_count,
					'max_id' : cur_max_id,
					'since_id' : since_id,
					'is_fetch_all' : is_fetch_all,
					'last_fetch_time' : this.cacheGetCurTime()
				};
			} else {
				sugComplexData = {
					'screen_name' : screen_name,
					'name' : name,
					'favourites_count' : favourites_count,
					'fetch_count' : fetch_count,
					'since_id' : since_id,
					'is_fetch_all' : is_fetch_all,
					'last_fetch_time' : this.cacheGetCurTime()
				};
			}

			datas[user_id] = sugComplexData;
			saveSessionData(stKey, datas);
		},
		/**
		 * @param stKey
		 * @param friend
		 *            我的好友
		 * @param fetch_result
		 *            我的好友的好友
		 * @param last_fetch_count
		 *            我的好友上次获取到的好友总数
		 * @description 缓存登录用户的好友的好友，利用缓存中的数据获取新的数据，保证后面获取到的数据不是重复数据
		 */
		cacheFrdFrd : function(stKey, friend, fetch_result, last_fetch_count) {
			var screen_name = friend.screen_name;
			var name = friend.name;
			var friends_count = friend.friends_count;
			var user_id = friend.id;
			var cur_fetch_count = fetch_result['users'].length;
			var cur_next_cursor = fetch_result['next_cursor'];
			var is_fetch_all = false; // 是否已经获取了所有好友

			var fetch_count = cur_fetch_count + last_fetch_count;
			if (fetch_count >= friends_count) {
				is_fetch_all = true;
			}

			var datas = getSessionData(stKey);
			if (null == datas) {
				datas = {};
			}

			var sugComplexData = {
				'screen_name' : screen_name,
				'name' : name,
				'friends_count' : friends_count,
				'fetch_count' : fetch_count,
				'next_cursor' : cur_next_cursor,
				'is_fetch_all' : is_fetch_all,
				'last_fetch_time' : this.cacheGetCurTime()
			};
			datas[user_id] = sugComplexData;
			saveSessionData(stKey, datas);
		},
		/**
		 * @description 从缓存中获取数据
		 */
		cacheGetRecord : function(stKey, firstKey) {
			var datas = getSessionData(stKey);
			if (null == datas) {
				datas = {};
			}
			return datas[firstKey];
		},
		/**
		 * 用户推荐功能
		 * 
		 * @param stKey
		 * @param category
		 * @description: 缓存已经获取过的分类
		 */
		sugCacheCategory : function(stKey, category) {

			var datas = getSessionData(stKey);
			if (null == datas) {
				datas = {};
			}
			var sugComplexData = {
				'last_fetch_time' : this.cacheGetCurTime()
			};
			datas[category] = sugComplexData;
			saveSessionData(stKey, datas);
		},
		checkInCache : function(stKey, firstKey) {
			/**
			 * 用户推荐功能
			 * 
			 * @param stKey
			 *            sessionstorage中的key
			 * @param firstKey
			 *            (如sug的category , frd 的user_id )
			 * @description: 判断缓存中是否存在该分类数据
			 */
			var datas = getSessionData(stKey);
			if (null == datas) {
				return false;
			} else {
				return datas.hasOwnProperty(firstKey);
			}
		},
		cacheClearInSession : function(stKey) {
			/**
			 * 目前用于推荐用户,清理缓存中数据，数据格式如下:
			 * <p>{ dataKey_1:{ 'data': data , 'last_fetch_time':
			 * last_fetch_time }, dataKey_2:{ 'data': data , 'last_fetch_time':
			 * last_fetch_time } }
			 */
			var stData = getSessionData(stKey);
			if (null != stData) {
				for (key in stData) {
					var curValue = stData[key];
					if (null == curValue
							|| this
									.cacheIsOverTime(curValue['last_fetch_time'])) {
						delete stData[key];
					}
				}
			}
		},
		cacheIsOverTime : function(lastFetchTime) {
			/**
			 * 用于缓存 判断超时(1小时)
			 */
			var curTime = this.cacheGetCurTime();
			return (curTime - lastFetchTime) > 3600000;
		},
		cacheGetCurTime : function() {
			/**
			 * 用于缓存 获取当前时间， long类型
			 */
			var d = new Date();
			return d.getTime();
		},
		getLocalData : getLocalData,
		saveLocalData : saveLocalData,
		getSessionData : getSessionData,
		saveSessionData : saveSessionData,
		randomSortArray : function(orgArray) {
			return orgArray.sort(function() {
						return Math.random() > 0.5 ? -1 : 1;
					});
		}
	};

	twitter.fn.init.prototype = twitter.fn;

	var getLocalData = function(key) {
		try {
			var value = localStorage.getItem(key);
			if (value && "null" != value) {
				return JSON.parse(value);
			}
		} catch (ex) {
			return null;
		}
	};
	var saveLocalData = function(key, value) {
		localStorage.setItem(key, JSON.stringify(value));
		// localStorage[key] = JSON.stringify(value);
	};
	var getSessionData = function(key) {
		try {
			var value = sessionStorage.getItem(key);
			if (value && "null" != value) {
				return JSON.parse(value);
			}
		} catch (ex) {
			return null;
		}
	};
	var saveSessionData = function(key, value) {
		// sessionStorage[key] = JSON.stringify(value);
		sessionStorage.setItem(key, JSON.stringify(value));
	};

	window.twitter = twitter;
})(window)
