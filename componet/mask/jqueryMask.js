(function(){
	var MaskDIV_ = window.MaskDIV,
	MaskDIV = window.MaskDIV = function( divId , curObj ){ 
		return new MaskDIV.fn.init( divId, curObj );
	}; 
 	   
 	MaskDIV.fn = MaskDIV.prototype = { 
 		windowMaskDIVId: null,
 		messageDIVId:null,
 		toMaskObj:null,
 		isCreate:false,
 		init : function(  divId , curObj ){
 			if( null == divId ){
				divId = "$$$$MASK_DIV_ID$$$$";
			}
			this.isCreate = false;
			this.windowMaskDIVId = divId;
 			this.messageDIVId =  divId + "SHOW";
 			
 			if( curObj ){
 				this.toMaskObj = curObj;
 			}
 			
			if( document.getElementById( this.windowMaskDIVId ) ){
			}else{
				this.createWindowMask();
			}
			if( document.getElementById( this.messageDIVId ) ){
 			}else{
 				this.createMessageDiv();
 			}
			this.isCreate = false;
			return this;  
 		},
 		createWindowMask: function(){
			this.isCreate = true;
			var maskDIV = document.createElement( "DIV" ); 
			$(maskDIV).attr("id", this.windowMaskDIVId );
			//alert( $(this.toMaskObj).height() );
			$(maskDIV).height( $(this.toMaskObj).height() );
			$(maskDIV).width( $(this.toMaskObj).width() );
			$(maskDIV).offset( $(this.toMaskObj).offset() );
			$(maskDIV).addClass("windowMask");
			$(maskDIV).addClass("hidden");
			$(maskDIV ).appendTo( $(this.toMaskObj) );
 		},
 		createMessageDiv: function(){
			this.isCreate = true;
 			var messageDIV = document.createElement( "DIV" ); 
 			var p_height = 50;
			var p_width = 200;
			//alert( $(this.toMaskObj).offset().top );
			var t_top = $(this.toMaskObj).offset().top + ( $(this.toMaskObj).height() - p_height )/2;
			var t_left =  $(this.toMaskObj).offset().left  +  ( $(this.toMaskObj).width()  - p_width )/2;
			
			$(messageDIV).attr("id", this.messageDIVId );
			$(messageDIV).attr("mask_id", this.windowMaskDIVId );
			$(messageDIV).offset( { top: t_top ,left: t_left } );
			$(messageDIV).height( p_height );
			$(messageDIV).width( p_width );
			$(messageDIV).addClass("windowMaskMessage");
			$(messageDIV).addClass("hidden");
			$(messageDIV).appendTo( $(this.toMaskObj));
 		},
 		show: function(){
 			$("#" + this.windowMaskDIVId ).removeClass("hidden");
 			$("#" + this.messageDIVId ).removeClass("hidden");
		},
		hidden : function(){
			$("#" + this.windowMaskDIVId ).addClass("hidden");
 			$("#" + this.messageDIVId ).addClass("hidden");
		},
		setHtml : function( htmlContent ){
			$("#" + this.messageDIVId ).html( htmlContent );
		},
		alertSuccMsg: function( msg ){
			var msgHtml = "<a href=\"javascript:void(0)\" onclick=\"closeMask('" + this.windowMaskDIVId + "');\" >" + msg + "</a>";
			$("#" + this.messageDIVId ).html( msgHtml );
			this.show();
		} 
	}; 
	MaskDIV.fn.init.prototype = MaskDIV.fn;
})( window );
 	
function closeMask( id ){
	MaskDIV( id ).hidden();
}

function openMask( id , msg ){
	MaskDIV( id , document.body ).setHtml( msg );
   	MaskDIV( id ).show();
}