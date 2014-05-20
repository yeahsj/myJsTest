
module.exports = {
	/**
	 * 响应事件
	 * 
	 * @param {}
	 *            req
	 * @param {}
	 *            res
	 */
	responseAction : function responseAction(req, res) {
		var accessToken = "";
		var refreshToken = "";
		if (req.params.accessToken) {
			accessToken = req.params.accessToken;
		} else if (req.params.oauth_token) {
			accessToken = req.params.oauth_token;
		} else if (req.query.accessToken) {
			accessToken = req.query.accessToken;
		} else if (req.query.oauth_token) {
			accessToken = req.query.oauth_token;
		}

		if (req.params.refreshToken) {
			refreshToken = req.params.refreshToken;
		} else if (req.query.refreshToken) {
			refreshToken = req.query.refreshToken;
		}

		console.log("responseAction: accessToken is " + accessToken);

		if (req.session.backurl) {
			var backurl = req.session.backurl;
			delete req.session.backurl;
			console.log("responseAction: req.session.backurl: "
					+ backurl);
			if (accessToken) {
				res.redirect(backurl + "?accessToken="
						+ accessToken + "&refreshToken=" + refreshToken);
			} else {
				res.redirect(backurl);
			}
		} else {
			console.log("responseAction: no req.session.backurl: ");
			if (accessToken) {
				var html = "<script type=\"text/javascript\">";
				html += " if( opener && opener.handleToken ){";
				html += "opener.handleToken(\"" + accessToken + "\");";
				html += "window.close();";
				html += " } ";
				html += "</script>";
				res.send(html);
			} else {
				res.redirect("/");
			}
		}
	},
	index : function(req, res, next){
		req.query.id=1;
		req.headers["user"] = {'id': 1,
								'name': 'zhangsan',
								'age': 21};
		console.log(  req.headers  );
		return next();
	},
	main : function(req, res, next) {
//		res.header( "flag" ,  "oauth" );
//		req.header( "flag" ,  "oauth" );
//		
//		req.params.flag = "oauth";
		console.log(  req.headers  );
		console.log( req.query.id );
		console.log( req.header("user") );
		
		res.header("user" , req.header("user") );
		res.render('index', {
					title : 'Express Oauth',
					version: "1.0"
				});
	}

}