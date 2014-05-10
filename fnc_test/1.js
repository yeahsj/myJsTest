/**
 * 在内部指定函数　getName
 * @param {} name
 */
function user(name){
	this.name = name ;
	this.getName = function(){
		return this.name;
	}
}

