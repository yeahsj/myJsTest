
/**
 * 函数getName在prototype指定.
 * @param {} name
 */
function user(name){
	this.name = name ;
}

user.prototype.getName=function(){
	return this.name;
}

