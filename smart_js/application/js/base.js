$(document).ready(function(){
	iknow.init();
});

var iknow = {
	
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
		var query = window.location.href.split('?'), params = { list: 705 };
		if(query[1]) $($.map(query[1].split('&'), function(a) { return [a.split('=')]; })).each(function() {
			params[this[0]] = this[1];
		});

		// create the smartjs session
		iknow.session = new smart.session({adaptiveClearance:true, study:'recall'});
		
		iknow.session.bind('ready', iknow.ready);
		iknow.session.bind('error', iknow.error);
		iknow.session.bind('next', iknow.next);
		iknow.session.bind('end', iknow.end);

		// load data into the session (which then fires the 'ready' event)
		iknow.session.load(json_images || {
			list: parseInt(params.list),
			user: params.user
		});

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
		preview.populate();
		
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