
/**
 * 函数getName在prototype指定.
 * @param {} name
 */
var user = function(name){
	return user.fn.init(name);
};

user.fn=user.prototype={
	constructor : user,
	init: function(name){
		this.name = name;
		return this;
	},
	getName: function(){
		return this.name;
	}
};

user.fn.init.prototype = user.fn;

