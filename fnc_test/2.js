function getName(){
	return this.name;
}

/**
 * 函数getName在外部构建，再在内部指定
 * @param {} name
 */
function user(name){
	this.name = name ;
	this.getName = getName;
}



