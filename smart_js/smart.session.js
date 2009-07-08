smart.session = function(options) {
	
	this.options = $.extend({}, smart.session.defaults, options);
	this.id = ++smart.session._counter;
	
	this.results = [];
	this._pool = [];
	
	if(this.options.progressOnFailing === true)
		this.options.progressOnFailing = 0.5/this.options.quizzesPerItem;
		
	if(this.options.autostart)
		this.start();
	
};

$.extend(smart.session, {
	_counter: 0,
	preloaded: {},
	defaults: {
		autostart: true,
		recall: true,
		study: true,
		quizzes: 'all',
		quizzesPerItem: 3,
		maxQuizzesPerItem: false,
		incrementalPool: true,
		initialPoolSize: 3,
		progressOnFailing: false,
		adaptiveClearance: false,
		preventAnnoyingLastItem: true,
		transliterationMode: 'full'
	},
	loadDefaults: $.extend(smart.loadDefaults, {
		preload: {
			images: true,
			timeout: false
		}
	})
});

$.extend(smart.session.prototype, {

	// event triggering
	bind: function(type, func) {
		return smart.bind(type, func, this);
	},
	unbind: function(type, func) {
		return smart.unbind(type, func, this);
	},
	trigger: function(type, data) {
		return smart.trigger(type, this, data);
	},
	
	// session timing
	start: function() {
		this.running = true;
		return true;
	},
	pause: function() {
		this.running = false;
		return true;
	},
	stop: function() { //TODO: Save study data
		this.trigger('stop') && (this.running = false);
		return true;
	},
	cancel: function() {
		this.trigger('cancel') && (this.running = false);
		return true;
	},
	
	// session progressing
	wrong: function(pickedChoice) { return this.next(-1, pickedChoice); },
	right: function(pickedChoice) { return this.next(1, pickedChoice); },
	maybe: function() { return this.next(0); },
	yes: function() { return this.next(1); },
	no: function() { return this.next(-1); },

	// pooling

	_addToPool: function(item) {
		this._pool.push(item);
	},
	_addLowestToPool: function(count) {
		
		// allocate a list of items that are not in the pool
		var notInPool = [];
		for (var i=0; i < this.items.length; i++) {
			if($.inArray(this.items[i], this._pool) == -1 && this.items[i].state != 1)
				notInPool.push(this.items[i]);
		};
		
		// if there aren't any, return false because adding wasn't possible
		if(!notInPool.length)
			return false;
		
		// sort the notInPool collection by item state
		notInPool.sort(function(a, b) { return a.state - b.state; });
		
		// finally, add them to the pool
		for (var i=0; i < Math.min(notInPool.length, count); i++) {
			this._pool.push(notInPool[i]);
		};
		
		return true;
		
	},
	_removeHighestFromPool: function(count) {
		return this._pool = this._pool
			.sort(function(a, b) { return a.state - b.state; })
			.slice(0, -count);
	},
	_removeCompletedFromPool: function() {
		var pool = [];
		for (var i=0; i < this._pool.length; i++) {
			if(this._pool[i].state != 1) pool.push(this._pool[i]);
		};
		return this._pool = pool;
	},
	_getLowestFromPool: function(touch) {
		this._pool.sort(function(a, b) { return a.state == b.state ? a._touched - b._touched : a.state - b.state; });
		var untouched = $(this._pool).filter(function() { return !this._touched; });
				
		//Make sure no item shows twice directly after each
		if(untouched[0] == this.item && untouched[1]) {
			if(touch) untouched[1]._touched = 1;
			return untouched[1];
		} else if(untouched[0] == this.item && !untouched[1] && this.options.preventAnnoyingLastItem && $(this.items).not("[state=1]").length == 1) {
			this.item.state = 1;
			return false;
		} else {
			if(touch) untouched[0]._touched = 1;
			return untouched[0];
		}

	},
	_currentPoolCompleted: function() {

		for (var i=0; i < this._pool.length; i++) {
			if(this._pool[i]._touched != 1) return false;
		};
		
		for (var i=0; i < this._pool.length; i++) {
			this._pool[i]._touched = 0; // reset touch
		};
		return true;
		
	},

	next: function(result, pickedChoice) { // move to the next item

		if(!this.running)
			return false;

		// if all items are completed, quit the session
		if(!$(this.items).not("[state=1]").length) {
			this.trigger('end', [this._results]) && this.stop();
			return;
		}
		
		if(this.item) {
			switch(this.state) {
				case 'study':
					// if we show the user a new item, reward him a bit
					// otherwise coming from the study screen without the item being new, no reward
					var reward = this.item.state == 0 ? 0.5/this.options.quizzesPerItem : 0;
					break;
				case 'recall':
					this.item._recallAnswer = result;
					var reward = 0;
					break;
				case 'quiz':
					
					this.item._presentations++;
					var reward = result != -1 ? (this.item._recallAnswer == 1 || !this.options.recall ? 1 : 0.5)/this.options.quizzesPerItem : (this.options.progressOnFailing || 0);
					
					// If we use adapative clearance, we test the user first with a hard quiz, and
					// if that was right, we reward them very highly and get the item out of this current session
					if(this.item._clearanceMode) {
						this.item._clearanceMode = false;
						if(result == 1) {
							result = 4; //TODO: Find right value here to bump up enough
							this.item.state = 1;
						}
					}
					
					//If the maximum number of presentations has passed, just throw it out entirely
					if(this.options.maxQuizzesPerItem && this.item._presentations >= this.options.maxQuizzesPerItem) {
						this.item.state = 1;
					}
					
					this.results.push([this.item.id, result, this.quiz.difficulty, pickedChoice]);
					break;
			}
			 
			this.item.state = Math.min(1, this.item.state + reward).toFixed(3) * 1;
		}
		
		

		
		// if the user pressed 'no' on recall/quiz, go to study again
		if(this.item && this.options.study && (this.state == 'recall' || this.state == 'quiz') && result == -1) {
			return (this.state = 'study') && this.trigger('next');
		}
				
		
		// after running through the current pool,
		if(this._currentPoolCompleted()) {

			if(this._addLowestToPool(this.options.incrementalPool ? 2 : 1)) // 1. add a new item from the rest that has the lowest state
				this._removeHighestFromPool(1); // 2. if that worked, remove the item with the highest state
			
			this._removeCompletedFromPool();
			
			if(!this._pool.length)
				return this.trigger('end', [this.results]) && this.stop();
				
	
			this.trigger('poolchange');
			
		}
		
		// normal recall / quiz procedure
		if(this.state == 'recall') {
			this.state = 'quiz';
			this.item._touched = 1;
		} else {
			
			this.item = this._getLowestFromPool(false); //never touch on getting it from pool (was enabled for recall but made problems)

			if(!this.item)
				return this.trigger('end', [this.results]) && this.stop();
			
			if(this.item.state == 0 && this.options.study === true) {
				this.state = 'study';
			} else {
				this.state = this.options.recall ? 'recall' : 'quiz';
				this.quiz = smart.getRandomQuiz(this.item, null, this.options.transliterationMode);
				if(this.state == 'quiz') this.item._touched = 1;
			}
		
		}

		
		this.trigger('next');
		
	},
	
	//List loading
	
	_resolveRelativeUrls: function(item) {
		
		if(item.cue.content.image && item.cue.content.image.indexOf('http://') == -1) item.cue.content.image = 'http://' + this.loadOptions.server + item.cue.content.image;
		if(item.response.content.image && item.response.content.image.indexOf('http://') == -1) item.response.content.image = 'http://' + this.loadOptions.server + item.response.content.image;
		if(item.cue.content.sound && item.cue.content.sound.indexOf('http://') == -1) item.cue.content.sound = 'http://' + this.loadOptions.server + item.cue.content.sound;
		if(item.response.content.sound && item.response.content.sound.indexOf('http://') == -1) item.response.content.sound = 'http://' + this.loadOptions.server + item.response.content.sound;

		if(item.cue.related.sentences) {
			for (var i=0; i < item.cue.related.sentences.length; i++) {
				if(item.cue.related.sentences[i].image && item.cue.related.sentences[i].image.indexOf('http://') == -1) item.cue.related.sentences[i].image = 'http://' + this.loadOptions.server + item.cue.related.sentences[i].image;
				if(item.cue.related.sentences[i].sound && item.cue.related.sentences[i].sound.indexOf('http://') == -1) item.cue.related.sentences[i].sound = 'http://' + this.loadOptions.server + item.cue.related.sentences[i].sound;
			};
		}
		
		if(item.response.related.sentences) {
			for (var i=0; i < item.cue.related.sentences.length; i++) {
				if(item.cue.related.sentences[i].image && item.cue.related.sentences[i].image.indexOf('http://') == -1) item.cue.related.sentences[i].image = 'http://' + this.loadOptions.server + item.cue.related.sentences[i].image;
				if(item.cue.related.sentences[i].sound && item.cue.related.sentences[i].sound.indexOf('http://') == -1) item.cue.related.sentences[i].sound = 'http://' + this.loadOptions.server + item.cue.related.sentences[i].sound;
			};
		}
		
	},
	
	_resolveDistractors: function(item) {
		
		var self = this;
		
		if(!isNaN(item.cue.related.distractors[0])) { // if the distractors are id's, we need to resolve them
			item.cue.related.distractors = $.map(item.cue.related.distractors, function(a) {
				return self.distractors[a];
			});
		}
		
		if(!isNaN(item.response.related.distractors[0])) { // if the distractors are id's, we need to resolve them
			item.response.related.distractors = $.map(item.response.related.distractors, function(a) {
				return self.distractors[a];
			});
		}
		
	},
	
	_transformTransliterations: function(item) {

		if(item.cue.related.transliterations) {
			var t = item.cue.related.transliterations;
			item.cue.related.transliterations = {};
			for (var i=0; i < t.length; i++) {
				item.cue.related.transliterations[t[i].type] = t[i].text; 
			};
		}
		
		if(item.response.related.transliterations) {
			var t = item.response.related.transliterations;
			item.response.related.transliterations = {};
			for (var i=0; i < t.length; i++) {
				item.response.related.transliterations[t[i].type] = t[i].text; 
			};
		}
		
		if(item.cue.related.sentences) {
			for (var i=0; i < item.cue.related.sentences.length; i++) {
				if(item.cue.related.sentences[i].transliterations) {
					var t = item.cue.related.sentences[i].transliterations;
					item.cue.related.sentences[i].transliterations = {};
					for (var j=0; j < t.length; j++) {
						item.cue.related.sentences[i].transliterations[t[j].type] = t[j].text; 
					};
				}
			};
		}
		
		if(item.response.related.sentences) {
			for (var i=0; i < item.response.related.sentences.length; i++) {
				if(item.response.related.sentences[i].transliterations) {
					var t = item.response.related.sentences[i].transliterations;
					item.response.related.sentences[i].transliterations = {};
					for (var j=0; j < t.length; j++) {
						item.response.related.sentences[i].transliterations[t[j].type] = t[j].text; 
					};
				}
			};
		}
		
	},
	
	_prepareData: function(data) {

		if(!data || data['error'])
			return this.trigger('error');
	
		var isInit = !this.items,
			self = this;
		this.items = data.items.shuffle();
		this.distractors = data.distractors;
		this.responseLanguage = data.list.response_language;
		
		// if we have distractors outside the actual items, resolve them into a hash
		if(this.distractors) {
			var d = this.distractors;
			this.distractors = {};
			for (var i=0; i < d.length; i++) {
				this._resolveRelativeUrls(d[i]);
				this._transformTransliterations(d[i]);
				this.distractors[d[i].id] = d[i];
			};
		}
		
		// If the item doesn't come with a progress (i.e. anonymous login), we
		// assign a progress of 0 to each
		$(this.items).each(function() {
			
			// resolve distractors
			self._resolveDistractors(this);
			
			// we don't want type == 'meaning' in response
			if(this.response.type == "meaning")
				this.response.type = "text";
				
			//we need to resolve all relative urls
			self._resolveRelativeUrls(this);
			
			//transform transliterations to a hash
			self._transformTransliterations(this);
			
			$.extend(this, {
				_touched: 0,
				_presentations: 0,
				_clearanceMode: self.options.adaptiveClearance
			});

			this.state = ((!this.progress || !this.progress.percentage) && self.options.study === true ? 0 : 0.5/self.options.quizzesPerItem).toFixed(3) * 1;

		});
		
		this._currentThreshold = 0.3;

		//add some initial items to the pool
		this._addLowestToPool(this.options.initialPoolSize);

		// 'ready' is only called once after the first items have been loaded
		if(isInit) {
			if(this.loadOptions.preload) {
				this.preload();
			} else {
				self.trigger('ready');
			}
		}
		
	},
	
	load: function(options) {
		this.loadOptions = $.extend({}, smart.loadDefaults, smart.session.loadDefaults, options);
		if(options.items) {
			var self = this;
			window.setTimeout(function() { self._prepareData(options); },0);
		} else {
			smart.load(this.loadOptions, this._prepareData, this);
		}
			
	},
	
	preload: function() {

		var preloaded = 0,
			total = 0,
			currentTime = (new Date()).getTime(),
			preloadImage = function(url) {
				total++;
				var img = new Image();
				img.src = url;
				$('<img src="'+url+'">')
					.css({ visibility: 'hidden', position: 'absolute', top: -1000, left: -1000 })
					.appendTo('body')
					.bind('load', function() {
						preloaded++;
						smart.session.preloaded[url] = { width: this.offsetWidth, height: this.offsetHeight };
					})
					.bind('error', function() {
						preloaded++;
					});

			};
		
		for (var i=0; i < this.items.length; i++) {
			
			if(this.loadOptions.preload.images) {
				if(this.items[i].cue.content.image) preloadImage(this.items[i].cue.content.image);
				if(this.items[i].response.content.image) preloadImage(this.items[i].response.content.image);
			}
			
		};
		
		if(this.distractors) {
			for (var i in this.distractors) {
				if(this.loadOptions.preload.images) {
					if(this.distractors[i].cue.content.image) preloadImage(this.distractors[i].cue.content.image);
					if(this.distractors[i].response.content.image) preloadImage(this.distractors[i].response.content.image);
				}
			};
		}

		
		var self = this;
		this._preloaderInterval = window.setInterval(function() {

			if(preloaded == total || (self.loadOptions.preload.timeout && (new Date).getTime() - currentTime > self.loadOptions.preload.timeout)) {
				self.trigger('ready');
				window.clearInterval(self._preloaderInterval);
			}
			
		}, 100);
		
	}
	
});