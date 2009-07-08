$(document).ready(function(){
	iknow.init();
});

var iknow = {
	
	base: '',
	mode: (['full','simple', 'latin', 'kanji'])[0],
	
	cacheAlignments: function() {
	  
	  console.log('hello 1');
		
		//Calculate the parent offsets of alignment containers
		var p = $('#calculate-preview'),
			r = $('#calculate-recall'),
			s = $('#calculate-study'),
			q = $('#calculate-quiz');
			
	  console.log('hello 2');

		iknow.alignments = {};
		iknow.alignments.preview = { width: p[0].offsetWidth, height: p[0].offsetHeight };
		iknow.alignments.recall = { width: r[0].offsetWidth, height: r[0].offsetHeight };
		iknow.alignments.study = { width: s[0].offsetWidth, height: s[0].offsetHeight };
		iknow.alignments.quiz = { width: q[0].offsetWidth, height: q.innerHeight() };

	  console.log('hello 3');
		
	},
	
	constrainImage: function(to, from) {

		if(to.height > from.height) {
			var height = to.height;
			to.height = from.height;
			to.width = to.width * (to.height / height);
		}
		
		if(to.width > from.width) {
			var width = to.width;
			to.width = from.width;
			to.height = to.height * (to.width / width);
		}
		
		return to;
		
	},
	
	
	init: function() {

		// resolve the url query into a hash
		var query = window.location.href.split('?');
		iknow.params = { list: 705 };
		if(query[1]) $($.map(query[1].split('&'), function(a) { return [a.split('=')]; })).each(function() {
			iknow.params[this[0]] = this[1];
		});

		// default to en for loading (if not passed from params)
		iknow.changeLanguageTo(iknow.params.lang || 'en');

		// create the smartjs session
		iknow.session = new smart.session({
			study: 'recall',
			transliterationMode: iknow.mode,
			quizzesPerItem: 5,
			//maxQuizzesPerItem: 5,
			//adaptiveClearance:true
			//recall: false
		});
		
		iknow.session.bind('ready', iknow.ready);
		iknow.session.bind('error', iknow.error);
		iknow.session.bind('next', iknow.next);
		iknow.session.bind('end', iknow.end);


		iknow.cacheAlignments();
		iknow._hideCurrent();

		// initialize top session progress
		$("#progressbar").progressbar({ value: 0 });

		//let the session window smoothly fall down
		$("div.session-window").animate({
			top: 0,
			opacity: 1
		}, 1000);
		
	},
	
	changeLanguageTo: function(lang) {
	
		smart.setLanguage(lang, function() {

			$('span.text-loading').html(smart.t('loading'));
			$('a.text-study-item').html(smart.t('study-item'));
			$('a.text-sentences').html(smart.t('sentences'));
			$('a.text-extra-info').html(smart.t('extra-info'));
			$('a.text-quiz-practice').html(smart.t('quiz-practice'));

			$('button.text-no').html(smart.t('no'));
			$('button.text-maybe').html(smart.t('maybe'));
			$('button.text-yes').html(smart.t('yes'));
			
			if(!iknow.session || !iknow.session.state) { // we're on preview
				$('span.new-item').html(smart.t('new'));
				$('div.session-footer-panel div.right-button a').html(smart.t('start'));
			}
			
		});
		
	},
	
	waitForReaction: function(init) {
		
		if(!iknow.session.running) {
			$('div.session-paused').hide();
			$('div.overlay').hide();
			iknow.session.start();
		}
		
		if(init) $(window).bind('mousemove', iknow.waitForReaction);
		if(init) $(document).bind('keydown', iknow.waitForReaction);
		
		if(init || iknow.reactionTimeout) {
			window.clearTimeout(iknow.reactionTimeout);
			iknow.reactionTimeout = window.setTimeout(function() {
				$('div.session-paused').show();
				$('div.overlay').show();
				iknow.session.pause();
			}, 60000);
		}
		
	},
	
	updateProgress: function() {
		
		var accumulatedState = 0;
		for (var i=0; i < iknow.session.items.length; i++) {
			accumulatedState += iknow.session.items[i].state || 0;
		};
		
		$("#progressbar").progressbar('value', (accumulatedState / iknow.session.items.length) * 100);
		
	},
	
	runSimulation: function() {
		
		window.setInterval(function() {

			if(iknow.currentFocus.parent().is('.multiple-choice')) {

				var buttons = iknow.currentFocus.parent().find('button');
				(Math.random() < 0.5 ? buttons.eq(Math.round(buttons.length * Math.random())) : buttons.filter('.correct')).delayedFocus();
				window.setTimeout(function() { iknow.currentFocus.trigger('click');  }, 100);

			} else {
				iknow.currentFocus.trigger('click');
			}

			if(iknow.currentFocus.is('input')) {
				if(Math.random() < 0.5) iknow.currentFocus[0].value = iknow.session.quiz.correctChoice;
				quiz.checkSpelling();
			}
		}, parseInt(iknow.params.simulation) || 1000);
			
	},
	
	ready: function() {

		// change to the response language
		if(!iknow.params.lang)
			iknow.changeLanguageTo(iknow.session.responseLanguage);

		// run the timer in the top bar
		iknow.runTimer();
		
		$("div.loading-spinner").hide();
  	
		//populate the preview
		if(iknow.params.preview != 'false') {
			preview.populate();
		} else {
			iknow.waitForReaction(1);
			iknow.session.next(1);
		};

		if(iknow.params.simulation)
			iknow.runSimulation();

	},
	
	end: function() {
		iknow._hideCurrent();
		window.preview.populate('end');
		iknow.updateProgress();
	},
	
	error: function() {
		
		$('div.loading-error').html(smart.t('an-error-occured-while-trying-to-prepare-your-study-data-please-try-reloading'));
		
		$("div.loading-spinner").hide();
		$("div.loading-error").show();
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
		iknow.currentPane ? iknow.currentPane.hide() : $("div.session-main-panel > div").hide();
		$('div.session-footer-panel > *').hide();
		$('div:animated').stop();
	},
	
	// this runs the timer in the top bar
	sessionTime: 0,
	sessionTimer: null,
	runTimer: function() {
		iknow.sessionTimer = window.setInterval(function() {
			
			iknow.sessionTime++;
			var minutes = Math.floor(iknow.sessionTime / 60);
			var seconds = parseInt(((iknow.sessionTime / 60) - minutes) * 60);
			minutes = (minutes+'').length == 1 ? '0'+minutes : minutes;
			seconds = (seconds+'').length == 1 ? '0'+seconds : seconds;
			
			document.getElementById('timer').innerHTML = minutes + ':' + seconds;
			
		}, 1000);
	},
	stopTimer: function() {
		window.clearInterval(iknow.sessionTimer);
	}

};