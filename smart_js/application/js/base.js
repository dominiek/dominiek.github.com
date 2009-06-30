$(document).ready(function(){
	iknow.init();
});

var iknow = {
	
	base: '',
	mode: (['full','kana', 'romaji'])[2],
	
	cacheAlignments: function() {
		
		//Calculate the parent offsets of alignment containers
		var p = $('#calculate-preview'),
			r = $('div.session-recall-inner'),
			s = $('#calculate-study'),
			q = $('#calculate-quiz');

		iknow.alignments = {};
		iknow.alignments.preview = { width: p[0].offsetWidth, height: p[0].offsetHeight };
		iknow.alignments.recall = { width: r[0].offsetWidth, height: r[0].offsetHeight };
		iknow.alignments.study = { width: s[0].offsetWidth, height: s[0].offsetHeight };
		iknow.alignments.quiz = { width: q[0].offsetWidth, height: q[0].offsetHeight };
		
	},
	
	init: function() {

		// resolve the url query into a hash
		var query = window.location.href.split('?');
		iknow.params = { list: 705 };
		if(query[1]) $($.map(query[1].split('&'), function(a) { return [a.split('=')]; })).each(function() {
			iknow.params[this[0]] = this[1];
		});

		// create the smartjs session
		iknow.session = new smart.session({
			adaptiveClearance: true,
			study: 'recall'
			//recall: false
		});
		
		iknow.session.bind('ready', iknow.ready);
		iknow.session.bind('error', iknow.error);
		iknow.session.bind('next', iknow.next);
		iknow.session.bind('end', iknow.end);

		// load data into the session (which then fires the 'ready' event)
		//iknow.session.load(json_images);
		iknow.session.load({ list: parseInt(iknow.params.list), token: iknow.params.token, server: 'testing.smart.fm' });

		// initialize top session progress
		$("#progressbar").progressbar({ value: 0 });
		
		this.cacheAlignments();
		
		//Hide all main containers
		$("div.session-main-panel > div, div.session-footer-panel > *").hide();
		
	},
	
	updateProgress: function() {
		
		var accumulatedState = 0;
		for (var i=0; i < iknow.session.items.length; i++) {
			accumulatedState += iknow.session.items[i].state || 0;
		};
		
		$("#progressbar").progressbar('value', (accumulatedState / iknow.session.items.length) * 100);
		
	},
	
	ready: function() {

		// run the timer in the top bar
		iknow.runTimer();

		// populate the preview
		if(iknow.params.preview != 'false') {
			preview.populate();
		} else {
			iknow.session.next(1);
		}
		
		
	},
	
	end: function() {
		iknow._hideCurrent();
		window.preview.populate('end');
		iknow.updateProgress();
	},
	
	error: function() {
		console.log('error!');
	},
	
	next: function() {
		
		// hide current views
		iknow._hideCurrent();
		
		// populate the view of the current state
		window[this.state].populate();
		
		// update the learning progress in the top bar
		iknow.updateProgress();
		
	},
	
	_hideCurrent: function() {
		$("div.session-main-panel > div, div.session-footer-panel > *").hide();
		$('div:animated').stop();
	},
	
	// this runs the timer in the top bar
	sessionTime: 0,
	sessionTimer: null,
	runTimer: function() {
		var element = $('#timer');
		iknow.sessionTimer = window.setInterval(function() {
			
			iknow.sessionTime++;
			var minutes = Math.floor(iknow.sessionTime / 60);
			var seconds = parseInt(((iknow.sessionTime / 60) - minutes) * 60);
			minutes = (minutes+'').length == 1 ? '0'+minutes : minutes;
			seconds = (seconds+'').length == 1 ? '0'+seconds : seconds;
			
			element.html(minutes + ':' + seconds);
			
		}, 1000);
	},
	stopTimer: function() {
		window.clearInterval(iknow.sessionTimer);
	}
	
};


iknow.getTextMarkup = function(side, quiz) {
	
	var html = '',
		mode = iknow.mode;
	
	// kana mode: hrkt
	// full mode: hrkt, text ?
	// romaji mode: latn
	
	switch(side.related.language) {
		
		case 'ja':
			
			switch(mode) {
				
				case 'full':
				
					var first = (side.related.transliterations['Hrkt'] || side.content.text || side.related.transliterations['Hira']);
					html += '<span class="cue-text">'+first;
					if(first != side.content.text && side.content.text != '') html += '<em>【'+side.content.text+' 】</em>';
					html += '</span>';
					break;
					
				case 'kana':

					html += '<span class="cue-text">'+(side.related.transliterations['Hrkt'] || side.related.transliterations['Hira'] || side.content.text)+'</span>';
					break;
					
				case 'romaji':

					html += '<span class="cue-text">'+side.related.transliterations['Latn'];
					html += '<em>【'+(side.related.transliterations['Hrkt'] || side.related.transliterations['Hira'] || side.content.text)+' 】</em>';
					html += '</span>';
					break;
				
			}
			
			break;
			
		default:
			html += '<span class="cue-text">'+side.content.text+'</span>';
			break;
		
	}
	
	return html;
	
};

iknow.getText = function(side) {
	
	var mode = iknow.mode;
	
	// kana mode: hrkt
	// full mode: hrkt, text ?
	// romaji mode: latn
	
	switch(side.related.language) {
		
		case 'ja':
			
			switch(mode) {
				
				case 'full':
					return side.related.transliterations['Hrkt'] || side.content.text || side.related.transliterations['Hira'];
					
				case 'kana':
					return (side.related.transliterations['Hrkt'] || side.related.transliterations['Hira'] || side.content.text);
					
				case 'romaji':
					return side.related.transliterations['Latn'];
				
			}
			
			break;
			
		default:
			return side.content.text;
		
	}
	
};