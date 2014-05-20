var express = require('express') 
     , http = require('http')
    , path = require('path')
    , utils = require('./public/utils')
    , app = express();



app.configure(function(){
	app.set('port', 3000);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.cookieParser());
	app.use(express.session({ secret: "mytest", cookie: { maxAge: 60000 } }));
//	app.use(express.session({ secret:'keyboard cat'}, cookie: { maxAge: 60000 }));
	app.use(app.router);
	app.use(express.static(path.join(__dirname, 'public')));
});

//app.use(express.favicon());
//app.use(express.logger('dev'));
//app.use(express.bodyParser());
//app.use(express.methodOverride());
//app.use(express.cookieParser())
//app.use(express.session({ secret: "appstore_oauth", cookie: { maxAge: 60000 } }));
//app.use(passport.initialize());
//app.use(passport.session());
//app.use(app.router);
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.errorHandler());
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}
//config route
app.get('/', utils.index);
app.get('/', utils.main);

http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
