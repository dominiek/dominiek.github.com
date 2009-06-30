if(!window.Audio || $.browser.mozilla) { //Stupid Firefox doesn't support mp3 playback
	$('head').prepend('<script src="'+iknow.base+'../vendor/soundmanager2/script/soundmanager2-nodebug-jsmin.js"></script>'); //this is synchroneous
	//$.getScript("../vendor/soundmanager2/script/soundmanager2-nodebug-jsmin.js");
}

$(document).ready(function() {
	$('a[href$=.mp3]').live('click', function() {
		iknow.audio.play($(this).attr('href'));
		return false;
	});
});

iknow.audio = {
	
	asyncer: 0,
	
	load: function(uri, async) {
	  return;
		
		if(typeof uri == 'array') {
			for (var i=0; i < uri.length; i++) {
				iknow.audio.load(uri[i]);
			};
		} else {
			if(window.Audio && !$.browser.mozilla) { // use HTML5 audio if possible

				iknow.audio.cache[uri+(async ? iknow.audio.asyncer : '')] = new Audio(uri);
					
			} else { // defer to SoundManager 2 (Flash)
				iknow.audio.cache[uri+(async ? iknow.audio.asyncer : '')] = soundManager.createSound({
					id: uri,
					url: uri
				});
			}
		}
		
	},
	
	play: function(uri, async) {
		
  	return;
  	  
		if(async) iknow.audio.asyncer++;
		
		if(!iknow.audio.cache[uri+(async ? iknow.audio.asyncer : '')])
			iknow.audio.load(uri, async);
		
		iknow.audio.cache[uri+(async ? iknow.audio.asyncer : '')].play();
		
	},
	
	cache: {}
	
};