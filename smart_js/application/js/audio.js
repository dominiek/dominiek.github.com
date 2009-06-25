if(!window.Audio || $.browser.mozilla) { //Stupid Firefox doesn't support mp3 playback
	$('head').prepend('<script src="../vendor/soundmanager2/script/soundmanager2-nodebug-jsmin.js"></script>'); //this is synchroneous
	//$.getScript("../vendor/soundmanager2/script/soundmanager2-nodebug-jsmin.js");
}

$(document).ready(function() {
	$('a[href$=.mp3]').live('click', function() {
		iknow.audio.play($(this).attr('href'));
		return false;
	});
});

iknow.audio = {
	
	load: function(uri) {
		
		if(typeof uri == 'array') {
			for (var i=0; i < uri.length; i++) {
				iknow.audio.load(uri[i]);
			};
		} else {
			if(window.Audio && !$.browser.mozilla) { // use HTML5 audio if possible

				iknow.audio.cache[uri] = new Audio(uri);
					
			} else { // defer to SoundManager 2 (Flash)
				iknow.audio.cache[uri] = soundManager.createSound({
					id: uri,
					url: uri
				});
			}
		}
		
	},
	
	play: function(uri) {
		
		if(!iknow.audio.cache[uri])
			iknow.audio.load(uri);
		
		iknow.audio.cache[uri].play();
		
	},
	
	cache: {}
	
};