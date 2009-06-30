var smart = {
	
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
		server: 'smart.fm'
	},	
	load: function(options, callback, scope) {
		
		var o = $.extend({}, smart.loadDefaults, options),
			self = this;

		$.getJSON('http://api.' + o.server + '/study/index.json?'
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
			callback && callback.call(scope, data);
			smart.trigger('load', scope, [data]);
		});

	},
	
	/* quizzes scope */
	
	quizzes: {},
	
	getRandomQuiz: function(item, difficulty) {

		var quizzes = [],
			difficulty = difficulty || (item._clearanceMode ? 3 : Math.round(1 + (((!this.progress || !this.progress.percentage) ? 0 : this.progress.percentage/100) + ((item.state || 0) * 2)))); //TODO: Generate difficulty from item state and total progress

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
			var quiz = new random[1](item, difficulty, null); //TODO: Pass direction as third argument
			quiz.difficulty = difficulty;
			quiz.type = random[0];
			return quiz;
		} else {
			console.log(difficulty, item, item.cue.type);
			console.log('if the difficulty is not bidirectional, cue type must match supported types: ', $.inArray(difficulty, smart.quizzes['multipleChoice'].bidirectional) == -1, $.inArray(item.cue.type, smart.quizzes['multipleChoice'].supports) != -1);
			console.log('if the difficulty is bidirectional, response type must match supported types: ', smart.quizzes['multipleChoice'].bidirectional, $.inArray(difficulty, smart.quizzes['multipleChoice'].bidirectional) != -1, $.inArray(item.response.type, smart.quizzes['multipleChoice'].supports) != -1);
			throw 'smart.getRandomByQuiz wasn\'t able to find any quizzes for this item - try loading more quiz types';
		}
		
	}
	
}