var smart = {
	
	/* language function */
	language: 'en',
	setLanguage: function(lang, callback) {
		
		if(smart.lang[lang]) {
			smart.language = lang;
			callback && callback();
			smart.trigger('languageChanged');
		} else {
			$.getScript('../smart.lang.'+lang+'.js', function() {
				smart.language = lang;
				callback && callback();
				smart.trigger('languageChanged');
			});
		}

	},
	lang: {},
	t: function(key, lang) {

		lang = lang || smart.language;
		if(smart.lang[lang] && smart.lang[lang][key]) {
			return smart.lang[lang][key];
		} else {
			if(smart.lang[lang]) {
				return key; //key simply doesn't exist
			} else {
				//might do ajax stuff here
			}
		}

	},
	
	/* smartjs event system */
	
	bind: function(type, func, scope) {
		return $(document).bind('smart'+type+(scope && scope.id ? ''+scope.id : ''), function(event, scope2, data) {
			func.apply(scope || scope2, data || []);
		});
	},
	
	unbind: function(type, func, scope) {
		return $(document).unbind('smart'+type+(scope && scope.id ? ''+scope.id : ''));
	},
	
	trigger: function(type, scope, data) {
		return $(document).trigger('smart'+type+(scope && scope.id ? ''+scope.id : ''), [scope || smart, data]);
	},

	/* list loading */

	loadDefaults: {
		list: null,
		token: null,
		limit: 10,
		sort: 'urgent',
		order: 'asc',
		min_progress: 0,
		max_progress: 100,
		server: 'smart.fm',
		timeout: 20000
	},
	load: function(options, callback, scope) {
		
		var o = $.extend({}, smart.loadDefaults, options),
			self = this,
			timeoutTriggered = false;
		
		var timeout = false;
		
		if(o.timeout)
			timeout = window.setTimeout(function() {
				timeoutTriggered = true;
				smart.trigger('error', scope, []);
			}, o.timeout);

		$.getJSON('http://api.' + o.server + '/study.json?'
			+'sort=' + o.sort
			+'&ascending=' + (o.order == 'asc')
			+'&min_progress=' + o.min_progress
			+'&max_progress=' + o.max_progress
			+'&include_sentences=false'
			+'&per_page=' + o.limit
			+(typeof o.list == 'number' ? '&list_id=' + o.list : '')
			+(o.token ? '&token=' + o.token : '')
			+'&callback=?'
		, function(data) {
			if(timeoutTriggered) return;
			 if (timeout) clearTimeout(timeout);
			callback && callback.call(scope, data);
			smart.trigger('load', scope, [data]);
		});

	},
	
	/* quizzes scope */
	
	quizzes: {},
	
	getDifficulty: function(item) {  //TODO: Generate difficulty from item state and total progress
		
		if(item._clearanceMode)
			return 5;

		return 1 + Math.round((item.progress.percentage/100) + ((item.state || 0) * 4));
		
	},
	
	getRandomQuiz: function(item, difficulty, transliterationMode) {

		var quizzes = [],
			difficulty = difficulty || smart.getDifficulty(item);

		for(var i in smart.quizzes) {

			if(
				$.inArray(difficulty, smart.quizzes[i].difficulty) != -1
				&&
				(
					(	$.inArray(difficulty, smart.quizzes[i].bidirectional) == -1 // that difficulty is not bidirectional
						&& $.inArray(item.cue.type, smart.quizzes[i].supports) != -1
					)
					||
					(
						(
							smart.quizzes[i].bidirectional
							|| $.inArray(difficulty, smart.quizzes[i].bidirectional) != -1 // that difficulty is bidirectional
						) && $.inArray(item.response.type, smart.quizzes[i].supports) != -1
					)
				)
			) quizzes.push([i, smart.quizzes[i]]);
				
		}
		
		if(quizzes.length) {
			var random = quizzes[Math.floor(Math.random()*quizzes.length)];
			var quiz = new random[1](item, difficulty, null, transliterationMode); //TODO: Pass direction as third argument
			quiz.difficulty = difficulty;
			quiz.type = random[0];
			return quiz;
		} else {
			throw 'smart.getRandomByQuiz wasn\'t able to find any quizzes for this item - try loading more quiz types';
		}
		
	}
	
};

(function () {
	var swapper = function (a,L,e) {
		var r = Math.floor(Math.random()*L);
		var x = a[e];
		a[e] = a[r];
		a[r] = x;
	};
	Array.prototype.shuffle = function () {
		var i,L;
		i = L = this.length;
		while (i--) swapper(this,L,i);
		return this;
	};
})();