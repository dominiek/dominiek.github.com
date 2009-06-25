/*
 * Flip! jQuery Plugin (http://lab.smashup.it/flip/)
 * @author Luca Manno (luca@smashup.it) [http://i.smashup.it]
 * 		[Original idea by Nicola Rizzo (thanks!)]
 * 
 * @version 0.5
 * 
 * @changelog
 * v 0.5	->  Added patch to make it work with Opera (thanks to Peter Siewert), Added callbacks [Feb. 1, 2008]
 * v 0.4.1 	->	Fixed a regression in Chrome and Safari caused by getTransparent [Oct. 1, 2008]
 * v 0.4 	->	Fixed some bugs with transparent color. Now Flip! works on non-white backgrounds | Update: jquery.color.js plugin or jqueryUI still needed :( [Sept. 29, 2008]
 * v 0.3 	->	Now is possibile to define the content after the animation.
 * 				(jQuery object or text/html is allowed) [Sept. 25, 2008]
 * v 0.2 	->	Fixed chainability and buggy innertext rendering (xNephilimx thanks!)
 * v 0.1 	->	Starting release [Sept. 11, 2008]
 * 
 */
(function($) {
var getTransparent, parent, pBg;
getTransparent = function(el){
		for(var n=0;n<el.parents().length;n++){
		parent = el.parents().get(n);
		pBg = $.browser.safari ? $(parent).css("background") : $(parent).css("background-color");
		if(pBg!='' && pBg!='transparent'){
			return pBg;
		}
	}
}

function int_prop(fx){ 
	fx.elem.style[ fx.prop ] = parseInt(fx.now) + fx.unit; 
} 
jQuery.extend( jQuery.fx.step, {
  borderTopWidth : int_prop,
  borderBottomWidth : int_prop,
  borderLeftWidth: int_prop,
  borderRightWidth: int_prop
});
	
jQuery.fn.flip = function(settings){
	return this.each( function() {
		
		var $this, flipObj, cloneId, _self, newContent;
		
		$this = $(this);
		if($this.data('flipLock')){
			return false;
		} else {
			$this.data('flipLock',1);	
		};
		
		flipObj = {
			width: $this.width(),
			height: $this.height(),
			speed: settings.speed || 500,
			top: $this.offset().top,
			left: $this.offset().left,
			target: settings.content || null,
			onBefore: settings.onBefore || function(){},
			onEnd: settings.onEnd || function(){},
			onAnimation: settings.onAnimation || function(){}			
		};
	
		cloneId = "flipClone_"+(new Date()).getTime();
		
		$this
			.css("visibility","hidden")
			.clone(true)
				.appendTo("body")
				.html($('<img src="vendor/smartfm/smartness/images/ui_card_flip.png"/>'))
				.css({visibility:"visible",position:"absolute",left:flipObj.left,top:flipObj.top,margin:0,zIndex:9999}).attr("id",cloneId);
		_self = $this;
		
		newContent = function(){
			var target = flipObj.target;
			return target && target.jquery ? target.html() : target;
		}
		
		function queue(_this,_self){			
			setTimeout(_this.hide, this.speed);
			_this.queue(function(){
				var nC = newContent();
				if(nC){_self.html(nC);}
				_this.remove();
				flipObj.onEnd();
				_self.removeData('flipLock');
				_this.dequeue();
			});
		}
		queue($("#"+cloneId),_self);
		
	});
  };
})(jQuery);