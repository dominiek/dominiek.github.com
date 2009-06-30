var quiz = {
	
	templates: {
		
		spellItem: function() {
			
			var html = '<div class="item-cue">';
			
			if(iknow.session.quiz.content.sound) {
				html += '<span class="cue-audio"><a href="'+iknow.session.quiz.content.sound+'" class="fg-button ui-state-default ui-corner-all">play</a></span>';
			}

			html += '<span class="cue-text">'+iknow.session.quiz.content.text+'</span>';
			html += '</div>';
			
			return html;
			
		},
		
		distractorImage: function(d) {
			
			var data = smart.session.preloaded[d];
			data = { height: data.height, width: data.width };
			var style = '';

			// resize image
			var prop = data.width >= data.height ? 'width' : 'height';
			if(data[prop] > iknow.alignments.quiz[prop]) { //TODO: get dynamic parent height
				data[prop] = iknow.alignments.quiz[prop];
				data[prop == 'height' ? 'width' : 'height'] = data[prop == 'height' ? 'width' : 'height'] * (data[prop] / smart.session.preloaded[d][prop]);
				style += prop + ':' + data[prop] + 'px;';
			}	

			// center image
			style += 'top: ' + (iknow.alignments.quiz.height - data.height)/2 + 'px;';
			style += 'left: ' + (iknow.alignments.quiz.width - data.width)/2 + 'px;';
			
			return '<img style="'+ style +'" src="'+d+'">';
			
		},
		
		distractor: function(d) {
			switch(iknow.session.quiz.distractorType) {
				case 'text':
					var inner = iknow.getText(d);
					break;
				case 'image':
					var inner = quiz.templates.distractorImage(d.content.image);
					break;
				case 'sound':
					// TODO
					break;
			};
			return '<button type="button" class="fg-button ui-state-default ui-corner-all '+(d.content[iknow.session.quiz.distractorType] == iknow.session.quiz.correctChoice.content[iknow.session.quiz.distractorType] ? 'correct' : '')+'">'+inner+'</button>'
		}
	},
	
	timeout: function(duration) {
		$('#quiz-timer').progressbar('value', 100).show();
		$('#quiz-timer .ui-progressbar-value').animate({ width: '0' }, duration, function() {
			$('#quiz-timer').hide();
			quiz.wrong();
		});
	},
	
	populateMultipleChoice: function() {
		
		var container = $('div.multiple-choice-quiz').show();
		
		// Update the question on top
		$('.multiple-choice-question', container).html(iknow.session.quiz.content.question);
		
		// remove old distractors
		$('> div', container).removeClass('d-5 d-10').removeClass('multiple-choice-image multiple-choice-text multiple-choice-sound multiple-choice-video');
		$('button', container).remove();
		
		//Append new distractors
		var innerContainer = $('> div', container)
			.addClass('d-'+(iknow.session.quiz.items.length <= 4 ? 5 : 10))
			.addClass('multiple-choice-' + iknow.session.quiz.distractorType);
			
		for (var i=0; i < iknow.session.quiz.items.length; i++) {
			var button = $(quiz.templates.distractor(iknow.session.quiz.items[i])).appendTo(innerContainer);
		};
		
		// Add 'none of the above' answer
		$('<button type="button" class="fg-button ui-state-default ui-corner-all last-button '+(iknow.session.quiz.noneOfTheAbove ? 'correct' : '')+'">None of the above</button>').appendTo(innerContainer);
		
		innerContainer.find('button:eq(0)').delayedFocus();
		quiz.timeout(iknow.session.quiz.config.timeout);
		
	},
	
	populateSpelling: function() {

		// Populate the item
		$('div.enter-missing-quiz div.item-cue').html(quiz.templates.spellItem());
		$('div.enter-missing-input').removeClass('correct-answer wrong-answer');
		
		//Show the quizzing screen
		$('div.enter-missing-quiz').show();
		
		//Unbind previous events bound to the input (from hiragana / katakana / pinyin)
		$('div.enter-missing-quiz input').unbind(); //Unbind all old events from the input
		
		var spacing = 0.6;
		if(iknow.session.item.cue.related.language == 'ja') {
			$('div.enter-missing-quiz input').smartHiragana(); //TODO: Find out if katakana is needed
			spacing = 1;
		}
		if(iknow.session.item.cue.related.language == 'cn') {
			$('div.enter-missing-quiz input').smartPinyin();
			spacing = 1;
		}

		$('div.enter-missing-quiz input')
			.css({
				letterSpacing: 'normal',
				fontSize: '2em',
				position: 'relative',
				zIndex: 2,
				fontFamily: 'Monaco'
			})
			.css('width', (iknow.session.quiz.correctChoice.length * spacing)+'em');
			
		$('div.enter-missing-quiz div.dictation-bars')
			.empty()
			.css({
				border: '0',
				position: 'relative',
				top: -70,
				left: 0,
				fontFamily: $('div.enter-missing-quiz input').css('fontFamily'),
				color: 'transparent'
			});
			
		for (var i=0; i < iknow.session.quiz.correctChoice.length; i++) {
			$('<span>'+iknow.session.quiz.correctChoice[i]+'<span></span></span>')
				.css({
					fontSize: '2em',
					position: 'relative'
				})
				.find('span')
					.css({
						display: 'block',
						position: 'absolute',
						bottom: 0,
						left: '5%',
						width: '90%',
						height: '2px',
						background: '#fff'
					})
				.end()
				.appendTo('div.enter-missing-quiz div.dictation-bars');
		};
		
		$('div.enter-missing-quiz input')
			.attr('disabled', false)
			.val('')
			.delayedFocus();
		
		quiz.timeout(iknow.session.quiz.config.timeout);
		
	},
	
	populate: function() {

		switch(iknow.session.quiz.type) {
			case 'multipleChoice':
				quiz.populateMultipleChoice();
				break;
			case 'spelling':
				quiz.populateSpelling();
				break;
		}

	},
	
	checkSpelling: function() {

		// if the timer isn't running, do nothing
		if(!$('#quiz-timer .ui-progressbar-value').is(':animated'))
			return;

		// stop and hide the timer
		$('#quiz-timer .ui-progressbar-value').stop().parent().hide();
		
		var value = $('div.enter-missing-quiz input').val();
		if(value == iknow.session.quiz.correctChoice) {
			quiz.correct();
		} else {
			quiz.wrong();
		}
		
	},
	
	wrong: function(picked) {

		switch(iknow.session.quiz.type) {
			case 'multipleChoice':
			
				if(picked)
					$(picked).addClass('wrong-answer');

				$('div.multiple-choice-quiz button:not(.correct)')
					.removeClass('ui-state-hover')
					.animate({ opacity: 0.5 }, 600)
					.addClass('ui-state-disabled');

				$('div.multiple-choice-quiz button.correct')
					.addClass('correct-answer')
					.addClass('ui-hover-disabled');
					
				break;
			case 'spelling':
			
			$('div.enter-missing-quiz input')
				.attr('disabled', true);
				
			$('div.enter-missing-input')
					.addClass('wrong-answer');
				
				break;
		}

		//TODO: Highlight wrong response
		iknow.result = -1;
		$('div.session-footer-panel div.right-button').find("a").text('Review again').end().show().find('a').delayedFocus();
		
		iknow.audio.play(iknow.base + 'media/sounds/spell_wrong.mp3');	
			
	},
	
	correct: function(picked) {

		switch(iknow.session.quiz.type) {
			
			case 'multipleChoice':

				var toOffset = $('div.multiple-choice-quiz button:eq(0)').position(),
					picked = $(picked);

				// If the picked was none of the above, we need to transform it into the actual item
				if(picked.is('.last-button')) {

					switch(iknow.session.quiz.distractorType) {
						case 'image':
							picked.html(quiz.templates.distractorImage(iknow.session.quiz.correctChoice.content[iknow.session.quiz.distractorType]));				
							break;
						case 'text':
							picked.html(iknow.session.quiz.distractorType == 'text' ? iknow.getText(iknow.session.quiz.correctChoice) : iknow.session.quiz.correctChoice.content[iknow.session.quiz.distractorType]);
							break;
					}

				}

				if(iknow.session.quiz.distractorType != 'text') picked.parent().find('.last-button')
					.animate({
						width: $('div.multiple-choice-quiz button:eq(0)')[0].offsetWidth,
						height: $('div.multiple-choice-quiz button:eq(0)')[0].offsetHeight
					}, 	{
						duration: 600,
						easing: 'easeOutQuint'
					});

				picked
					.css('zIndex', '100')
					.removeClass('ui-state-hover')
					.addClass('correct-answer')
					.addClass('ui-hover-disabled')
					.siblings().andSelf()
						.absolutize()
						.animate(toOffset, {
							duration: 600,
							easing: 'easeOutQuint',
							queue: false
						});
			
				break;
			
			case 'spelling':
			
				$('div.enter-missing-quiz input')
					.attr('disabled', true);
					
				$('div.enter-missing-input')
  					.addClass('correct-answer');
				break;
				
		}

		
		//TODO: Highlight correct response
		iknow.result = 1;
		$('div.session-footer-panel div.right-button').find("a").text('Next').end().show().find('a').delayedFocus();
		
		iknow.audio.play(iknow.base + 'media/sounds/spell_end.mp3');

	}
	
};


$.fn.absolutize = function() {
	
	var offsets = [];
	this.each(function() {
		offsets.push($(this).position());
	});

	return this.each(function(i) {
		$(this).css({
			left: offsets[i].left,
			top: offsets[i].top,
			width: this.offsetWidth,
			position: 'absolute'
		});
	});	
	
};


$(document).ready(function() {
	
	//initialize quiz timers
	$("#quiz-timer").progressbar({ value: 100 });	
	
	$('div.multiple-choice-quiz button').live('click', function() {
		
		// if the timer isn't running, do nothing
		if(!$('#quiz-timer .ui-progressbar-value').is(':animated'))
			return;
			
		// stop and hide the timer
		$('#quiz-timer .ui-progressbar-value').stop().parent().hide();
		
		// Check if correct or not and show accordingly
		quiz[$(this).is('.correct') ? 'correct' : 'wrong'](this);
		
	});
	
});