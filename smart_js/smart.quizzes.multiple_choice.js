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

smart.quizzes.multipleChoice = function(item, difficulty, direction) {

	$.extend(this, {
		item: item,
		options: $.extend({}, smart.quizzes.multipleChoice.defaults, {}),
		config: { difficulty: difficulty }
	});

	this.config.distractors = ({ 1: 4, 2: 9, 3: 9 })[difficulty];
	this.config.timeout = ({ 1: 6000, 2: 6000, 3: 6000 })[difficulty];
	this.config.direction = ({ 1: 'cue', 2: 'cue', 3: 'response' })[difficulty];
	

	
	// Assign distractors and distractors+item
	this.distractorType = this.item[this.config.direction == 'cue' ? 'response' : 'cue'].type;
	
	//We can't have d-10 quizzes on images
	if(this.config.distractors == 9 && this.distractorType == "image")
		this.config.distractors = 4;
	
	this.distractors = this._getRandomizedDistractors(this.config.distractors); //TODO: Mixin 'none of the above' randomly
	
	this.noneOfTheAbove = Math.random() < 0.3;
	this.items = !this.noneOfTheAbove || !this.options.noneOfTheAbove ? this._randomizedMixin(this.distractors, this.item[this.config.direction == 'cue' ? 'response' : 'cue']) : this.distractors;
	this.correctChoice = this.item[this.config.direction == 'cue' ? 'response' : 'cue'];
	
	
	// Assign content
	this.content = $.extend({ type: this.item[this.config.direction].type }, this.item[this.config.direction].content);
	this.content.question = this._getRecallQuestion();
};

// configuration
$.extend(smart.quizzes.multipleChoice, {
	difficulty: [1,2,3],
	supports: ['text','image','sound'],
	bidirectional: [3], //If the quiz can be bidirectional, we have to tell the quizzing engine which difficulties trigger the other direction
	defaults: {
		noneOfTheAbove: true
	}
});

// internal properties and methods
$.extend(smart.quizzes.multipleChoice.prototype, {
	
	_getRecallQuestion: function() {
		
		switch(this.item[this.config.direction].type) {
			case 'text':
				switch(this.item[this.config.direction == 'cue' ? 'response' : 'cue'].type) {
					case 'text':
						return 'Do you know the answer?';
					case 'image':
						return 'Do you know the image this belongs to?';
				}
				break;
			case 'image':
				return "Can you recall what's on the picture?";
			case 'sound':
				return "Can you recall what you are hearing?";
			case 'video':
				return "Can you recall what you are watching?";
		};

	},
	
	_getRandomizedDistractors: function(i) {
		
		var a = this.item[this.config.direction == 'cue' ? 'response' : 'cue'].related.distractors.slice();
		var list = a.shuffle().slice(0,i);
		var self = this;
		
		// if it is a complex item, we flatten it by type
		if(list[0].cue) {
			list = $.map(list, function(a, b) {
				return a[self.config.direction == 'cue' ? 'response' : 'cue'];
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