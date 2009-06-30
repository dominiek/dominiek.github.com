smart.quizzes.spelling = function(item, difficulty) {

	this.item = item;
	this.config = { timeout: 6000, direction: 'cue' };
	this.difficulty = difficulty;
	
	var question = "Do you know how to spell this?";

	// Assign content
	if(difficulty == 2 && this.item.cue.related.transliterations) {
		
		// show hiragana
		var text = this.item.cue.related.transliterations['Hrkt'] || this.item.cue.related.transliterations['Hira'] || this.item.cue.related.transliterations['Latn'];
		this.config.direction = 'cue';
		
	} else {
		
		//show kanji or response
		var text = [this.item.response.content.text];
		if(this.item.cue.related.transliterations && this.item.cue.content.text) text.push(this.item.cue.content.text); //TODO: Check if this is really a kanji
		
		var rand = Math.floor(Math.random()*text.length);
		this.config.direction = rand ? 'cue' : 'response';
		if(rand) question = "Do you know how to spell the answer?";
		
		text = text[rand];
		
	}
	
	this.content = $.extend({ type: this.item.cue.type }, this.item['cue'].content, { text: text });
	this.content.question = question;
	this.correctChoice = this.item.cue.related.transliterations ? this.item.cue.related.transliterations['Hira'] || this.item.cue.related.transliterations['Latn'] : this.item.cue.content.text;

};

// configuration
$.extend(smart.quizzes.spelling, {
	difficulty: [2,3],
	supports: ['text'],
	bidirectional: false
});

// internal properties and methods
$.extend(smart.quizzes.spelling.prototype, {
	difficulty: 0
});