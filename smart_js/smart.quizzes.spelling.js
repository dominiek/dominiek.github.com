smart.quizzes.spelling = function(item, difficulty) {

	this.item = item;
	this.config = { timeout: 6000 };
	this.difficulty = difficulty;

	// Assign content
	if(difficulty == 2 && this.item.cue.related.character) {
		
		// show hiragana
		var text = this.item.cue.content.text;
		
	} else {
		
		//show kanji or response
		var text = [(this.item.response.related.character || this.item.response.content.text)]
		if(this.item.cue.related.character) text.push(this.item.cue.related.character);
		
		var text = text[Math.floor(Math.random()*text.length)];
		
	}
	
	this.content = $.extend({ type: this.item.cue.type }, this.item['cue'].content, { text: text });
	this.content.question = "Do you know how to spell this?";

	this.correctChoice = this.item.cue.content.text; //TODO: Use transliterations here if available

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