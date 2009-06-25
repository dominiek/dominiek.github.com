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
		user: null,
		list: null,
		limit: 10,
		sort: 'urgent',
		order: 'asc',
		min_progress: 0,
		max_progress: 100,
		server: 'http://api.smart.fm'
	},	
	load: function(options, callback, scope) {
		
		var o = $.extend({}, smart.loadDefaults, options),
			self = this;
		
		if(o.user) {
		
			if(typeof o.list == 'number') { // load items from a certain list
				
			} else { // load all learned items

				$.getJSON(o.server + '/users/' + o.user + '/items.json?'
					+'sort=' + o.sort
					+'&ascending=' + (o.order == 'asc')
					+'&min_progress=' + o.min_progress
					+'&max_progress=' + o.max_progress
					+'&include_sentences=false'
					+'&per_page=' + o.limit
					+'&callback=?'
				, function(data) {
					callback && callback.call(scope, data);
					smart.trigger('load', scope, [data]);
				});
				
			}

		} else { // anonymous session

			if(typeof o.list == 'number') {

				$.getJSON(o.server + '/lists/' + o.list + '/items.json?'
					+'include_sentences=false'
					+'&per_page=' + o.limit
					+'&callback=?'
				, function(data) {
					callback && callback.call(scope, data);
					smart.trigger('load', scope, [data]);
				});
			
			} else { //bail
				throw "smart.session can't load data without any user/list information";
			}
			
		}

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
			throw 'smart.getRandomByQuiz wasn\'t able to find any quizzes for this item - try loading more quiz types';
		}
		
	}
	
}