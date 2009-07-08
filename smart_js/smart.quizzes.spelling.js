smart.quizzes.spelling = function(item, difficulty, direction, transliterationMode) {

	this.item = item;
	this.timeout = 6000;
	this.direction = "forward";
	this.side = this.item.cue;
	this.difficulty = difficulty;
	this.transliterationMode = transliterationMode;
	
	var question = smart.t("do-you-know-how-to-spell-the-answer");

	// we only have have 'easy' spell quizzing where we can show Kana, so only japanese
	if(difficulty == 4 && this.transliterationMode != 'latin' && this.item.cue.related.language == 'ja' && this.item.cue.related.transliterations) {
		this.mode = 'simple';
	} else {
		
		//show either characters (if available) or response
		var testOn = ['response'];
		if(this.item.cue.related.transliterations && !this.item.cue.content.text.isKana() && this.transliterationMode != 'latin') testOn.push('cue');
		
		var rand = testOn[Math.floor(Math.random()*testOn.length)];
		this.direction = rand == 'cue' ? 'forward' : 'reverse';
		this.side = this.item[rand];
		this.mode = 'full';
		if(rand == 'cue') question = smart.t("do-you-know-how-to-spell-this");
		
	}

	this.recallQuestion = question;
	this.correctChoice = this.getCorrectSpelling();
	this.timeout = this.correctChoice.length * 3000;

};

// configuration
$.extend(smart.quizzes.spelling, {
	difficulty: [4,5],
	supports: ['text'],
	bidirectional: false
});

// internal properties and methods
$.extend(smart.quizzes.spelling.prototype, {
	
	getCorrectSpelling: function() {

		switch(this.item.cue.related.language) {
			case 'ja':
				if(this.transliterationMode == 'latin') {
					return this.item.cue.related.transliterations['Latn'];
				} else {
					if(this.item.cue.content.text.isKana()) {
						return this.item.cue.content.text;
					} else {
						return this.item.cue.related.transliterations['Hira'];
					}
				}
			case 'zh-CN':
				return this.item.cue.related.transliterations['Latn'];
			default:
				return this.item.cue.content.text;
		};

	},
	
	getQuizText: function() {
		return this.getRecallMarkup();
	},
	
	getRecallMarkup: function() {
		
		var mode = this.mode || this.transliterationMode;
		
		if(this.direction == 'reverse') {
			return '<span class="cue-text">'+this.side.content.text+'</span>';
		}
		
		if('ja' == this.side.related.language) {
			switch(this.transliterationMode) {

				case 'full':
				case 'kanji':
					return '<span class="cue-text">'+this.side.content.text+'</span>';
							
				case 'simple':
					return '<span class="cue-text">'+(this.side.content.text.isKana() ? this.side.content.text : this.side.related.transliterations['Hira'])+'</span>';
				
				case 'latin':
					return '<span class="cue-text">'+this.side.related.transliterations['Latn']+'</span>';

			}
		} else if(/^zn/.test(this.side.related.language)) {
			switch(this.transliterationMode) {

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
		return this.recallQuestion;
	}
	
});