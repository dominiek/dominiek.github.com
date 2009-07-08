smart.quizzes.multipleChoice = function(item, difficulty, direction, transliterationMode) {

	// cue(simple) -> response (5)		| japanese only
	// cue(full) -> response (5)		| non-japanese only
	
	// cue(simple)	-> response (10)	| japanese only
	// cue (full) -> response (10)
	// cue (full) -> cue(simple)		| japanese only
	// response -> cue(simple) (10)		| japanese only
	
	// response -> cue (full) (10)
	// cue(simple) -> cue(full)			| japanese only

	this.item = item;
	this.difficulty = difficulty;
	this.options = $.extend({}, smart.quizzes.multipleChoice.defaults, {});
	this.transliterationMode = transliterationMode;
	
	switch(difficulty) {

		case 1:
		
			// cue(simple) -> response (5)		| character lang only
			if(/^(ja|zh)/.test(this.item.cue.related.language)) { 
				if(this.transliterationMode != 'kanji') {
					this.direction = this.distractorDirection = 'forward';
					this.recallMode = 'simple';
					this.distractorMode = 'full';
					break;
				}
			} else {
				// cue(full) -> response (5)		| non-character only
				this.direction = this.distractorDirection = 'forward';
				this.recallMode = 'full';
				this.distractorMode = 'full';
				break;
			}
		
		case 2:

			// cue (full) -> response (10)
			this.direction = this.distractorDirection = 'forward';
			this.distractorMode = 'full';
			this.recallMode = this.transliterationMode;
			break;
			
		case 3:

			if(/^(ja|zh)/.test(this.item.cue.related.language) && this.transliterationMode != 'kanji') {
				// cue(simple)	-> response (10)	| character languages only
				this.direction = this.distractorDirection = 'forward';
				this.distractorMode = 'full';
				this.recallMode = 'simple';
				break;
			}
		
		case 4:
			
			if(/^(ja|zh)/.test(this.item.cue.related.language) && this.transliterationMode != 'kanji') {

				// response -> cue(simple) (10)		| character languages only
				this.direction = this.distractorDirection = 'reverse';
				this.distractorMode = 'simple';
				this.recallMode = 'full';
				
				// cue (full) -> cue(simple)		| japanese only
				if(Math.random() > 0.3 && this.transliterationMode == 'full' && this.item.cue.related.language == 'ja' && !this.item.cue.content.text.isKana())
					this.direction = 'forward';
					this.distractorDirection = 'reverse';
					this.distractorMode = 'full';
					this.recallMode = 'simple';	
					
				break;			
				
			}
			
		case 5:
		
			// response -> cue (full) (10)
			this.direction = this.distractorDirection = 'reverse';
			this.distractorMode = this.transliterationMode != 'full' ? 'simple' : 'full'; //TODO: Should also change the difficuly if global mode isn't full
			this.recallMode = 'full';
	
			if(this.transliterationMode == 'full' && this.item.cue.related.language == 'ja') {
				 // cue(simple) -> cue(full)			| character languages only
				if(Math.random() > 0.5 && !this.item.cue.content.text.isKana()) {
					this.direction = 'forward';
					this.recallMode = 'simple';
				}
			}		
		
			break;

	}
	
	this.timeout = 4000;
	this.side = this.direction == 'forward' ? this.item.cue : this.item.response;
	this.distractorType = this.item[this.distractorDirection == 'forward' ? 'response' : 'cue'].type;
	this.noneOfTheAbove = Math.random() < 0.3;

	//We can't have d-10 quizzes on images
	var numberOfDistractors = ({ 1: 4, 2: 4, 3: 9, 4: 9, 5: 9 })[difficulty];
	if(numberOfDistractors == 9 && this.distractorType == "image") numberOfDistractors = 4;
	
		this.timeout = numberOfDistractors * 1000;
	
	// distractors are always just distractors, not including the item
	this.distractors = this._getRandomizedDistractors(numberOfDistractors); //TODO: Mixin 'none of the above' randomly
	
	// if the noneOfTheAbove option is used, we randomly mix-in the item - otherwise, we'll always mixin the item
	this.items = !this.noneOfTheAbove || !this.options.noneOfTheAbove ? this._randomizedMixin(this.distractors, this.item[this.distractorDirection == 'forward' ? 'response' : 'cue']) : this.distractors;
	
	// map the correct choice to be able to check easily
	this.correctChoice = this.item[this.distractorDirection == 'forward' ? 'response' : 'cue'];

};

// configuration
$.extend(smart.quizzes.multipleChoice, {
	difficulty: [1,2,3,4,5],
	supports: ['text','image','sound'],
	bidirectional: [3,4,5], //If the quiz can be bidirectional, we have to tell the quizzing engine which difficulties trigger the other direction
	defaults: {
		noneOfTheAbove: true
	}
});

// internal properties and methods
$.extend(smart.quizzes.multipleChoice.prototype, {
	
	getDistractorText: function(side) {
	
		var mode = this.distractorMode;
		if(this.transliterationMode == 'latin' && mode == 'simple' && this.distractorDirection == 'reverse') mode = 'latin';
		
		switch(side.related.language) {
			case 'ja':
				switch(mode) {
					case 'full':
					case 'kanji':
						return side.content.text;
					case 'simple':
						return side.content.text.isKana() ? side.content.text : side.related.transliterations['Hira'];
					case 'latin':
						return side.related.transliterations['Latn'];
				}
				break;
			case 'zh-CN':
				switch(mode) {
					case 'full':
						return side.content.text;
						break;
					case 'simple':
					case 'latin':
						return side.related.transliterations['Latn'];
						break;
				}
				break;
			default:
				return side.content.text;
		};	

	},
	
	getRecallMarkup: function() {

		var mode = this.recallMode;
		if(this.transliterationMode == 'latin' && mode == 'simple' && this.direction == 'forward') mode = 'latin';

		if('ja' == this.side.related.language) {
			switch(mode) {
				case 'full':
				case 'kanji':
					return '<span class="cue-text">'+this.side.content.text+'</span>';		
				case 'simple':
					return '<span class="cue-text">'+(this.side.content.text.isKana() ? this.side.content.text : this.side.related.transliterations['Hira'])+'</span>';
				case 'latin':
					return '<span class="cue-text">'+this.side.related.transliterations['Latn']+'</span>';
			}
		} else if(/^zh/.test(this.side.related.language)) {
			switch(mode) {
				case 'full':
					return '<span class="cue-text">'+this.side.content.text+'</span>';
				case 'simple':
				case 'latin':
					return '<span class="cue-text">'+this.side.related.transliterations['Latn']+'</span>';
			}
		} else {
			return '<span class="cue-text">'+this.side.content.text+'</span>';
		}

	},
	
	getRecallQuestion: function() {
		
		switch(this.item[this.direction == 'forward' ? 'cue' : 'response'].type) {
			case 'text':
				switch(this.item[this.direction == 'forward' ? 'response' : 'cue'].type) {
					case 'text':
						return smart.t('do-you-know-the-answer');
					case 'image':
						return smart.t('do-you-know-the-image-this-belongs-to');
				}
				break;
			case 'image':
				return smart.t("can-you-recall-whats-on-the-picture");
			case 'sound':
				return smart.t("can-you-recall-what-you-are-hearing");
			case 'video':
				return smart.t("can-you-recall-what-you-are-watching");
		};

	},
	
	_getRandomizedDistractors: function(i) {
		
		var a = this.item[this.distractorDirection == 'forward' ? 'response' : 'cue'].related.distractors.slice();
		var list = a.shuffle().slice(0,i);
		var self = this;
		
		// if it is a complex item, we flatten it by type
		if(list[0].cue) {
			list = $.map(list, function(a, b) {
				return a[self.distractorDirection == 'forward' ? 'response' : 'cue'];
			});
		}
		
		return list;
	},
	
	_randomizedMixin: function(a, b) {
		var c = a.slice(1);
		c.push(b);
		return c.shuffle();
	}
	
});