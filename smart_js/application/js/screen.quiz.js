var quiz = {
	
	templates: {
		
		spellItem: function() {
			
			var html = '<div class="item-cue">';
			
			if(iknow.session.quiz.side.content.sound) {
				html += '<span class="cue-audio"><a href="'+iknow.session.quiz.side.content.sound+'" class="fg-button ui-state-default ui-corner-all">►</a></span>';
			}

			html += iknow.session.quiz.getQuizText();
			html += '</div>';
			
			return html;
			
		},
		
		distractorImage: function(d,nc) {
			
			if (nc) {
			  var style = "height:4.5em; top:-.5em;"
			} else {
			var data = smart.session.preloaded[d], style = '';
			data = { height: data.height, width: data.width };

			iknow.constrainImage(data, iknow.alignments.quiz);
			style += 'width: '+data.width+'px;';
			style += 'height: '+data.height+'px;';

			// center image
			style += 'top: ' + (iknow.alignments.quiz.height - data.height)/2 + 'px;';
			style += 'left: ' + (iknow.alignments.quiz.width - data.width)/2 + 'px;';
			}
			return '<img style="'+ style +'" src="'+d+'">';
			
		},
		
		distractor: function(d) {
			
			switch(iknow.session.quiz.distractorType) {
				case 'text':
					var inner = iknow.session.quiz.getDistractorText(d);
					break;
				case 'image':
					var inner = quiz.templates.distractorImage(d.content.image);
					break;
				case 'sound':
					// TODO
					break;
			};
			
			return '<button type="button" class="fg-button ui-state-default ui-corner-all '
					+(d.content[iknow.session.quiz.distractorType] == iknow.session.quiz.correctChoice.content[iknow.session.quiz.distractorType] ? 'correct' : '')
					+'">'+inner+'</button>';
			
		}
	},
	
	timeout: function(duration) {
		$('#quiz-timer').progressbar('value', 100).show();
		$('#quiz-timer .ui-progressbar-value').animate({ width: '0' }, {
			duration: duration,
			complete: function() {
				$('#quiz-timer').hide();
				quiz.wrong();
			},
			easing: 'linear'
		});
	},
	
	populateMultipleChoice: function() {
		
		iknow.currentPane = $('div.multiple-choice-quiz').show();
		
		// Update the question on top
		$('.multiple-choice-question', iknow.currentPane).html(iknow.session.quiz.getRecallQuestion());
		
		// remove old distractors and classes
		$('> div', iknow.currentPane).removeClass('d-5 d-10').removeClass('multiple-choice-image multiple-choice-text multiple-choice-sound multiple-choice-video');
		$('button', iknow.currentPane).remove();
		
		//Append new distractors
		var innerContainer = $('> div', iknow.currentPane)
			.addClass('d-'+(iknow.session.quiz.items.length <= 4 ? 5 : 10))
			.addClass('multiple-choice-' + iknow.session.quiz.distractorType);
			
		for (var i=0; i < iknow.session.quiz.items.length; i++) {
			var button = $(quiz.templates.distractor(iknow.session.quiz.items[i])).appendTo(innerContainer);
		};
		
		// Add 'none of the above' answer
		$('<button type="button" class="fg-button ui-state-default ui-corner-all last-button '
			+(iknow.session.quiz.noneOfTheAbove ? 'correct' : '')
			+'">'+smart.t('none-of-the-above')+'</button>'
		).appendTo(innerContainer);
		
		innerContainer.find('button:eq(0)').delayedFocus();
		quiz.timeout(iknow.session.quiz.timeout);
		
	},
	
	populateSpelling: function() {

		// Populate the item
		$('div.enter-missing-quiz div.item-cue').html(quiz.templates.spellItem());
		$('div.enter-missing-input').removeClass('correct-answer wrong-answer');
		
		//Show the quizzing screen
		iknow.currentPane = $('div.enter-missing-quiz').show();
		
		//Unbind previous events bound to the input (from hiragana / katakana / pinyin)
		$('div.enter-missing-quiz input').unbind('.smart');
		
		
		// add IME magic to the input if needed
		var spacing = 0.6;
		if(iknow.session.item.cue.related.language == 'ja' && iknow.mode != 'latin') {
			$('div.enter-missing-quiz input')[iknow.session.item.cue.content.text.isKatakana() ? 'smartKatakana' : 'smartHiragana']();
			spacing = 1;
		}else if(iknow.session.item.cue.related.language.indexOf('zh') != -1) {
			$('div.enter-missing-quiz input').smartPinyin();
		}

		// adjust the width of the input
		$('div.enter-missing-quiz input')
			.css({ letterSpacing: 'normal', fontSize: '2em', fontFamily: 'Monaco', position: 'relative', zIndex: 2 })
			.css('width', (iknow.session.quiz.correctChoice.length * spacing)+'em');
			
		// empty the current dictation bars	
		$('div.enter-missing-quiz div.dictation-bars')
			.empty()
			.css({
				border: '0', color: 'transparent', fontFamily: $('div.enter-missing-quiz input').css('fontFamily'),
				position: 'relative', top: -70, left: 0
			});
		
		// fill up with new dictation bars	
		for (var i=0; i < iknow.session.quiz.correctChoice.length; i++) {
			$('<span>'+iknow.session.quiz.correctChoice[i]+'<span></span></span>')
				.css({ fontSize: '2em', position: 'relative' })
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
		
		// clear the input
		$('div.enter-missing-quiz input')
			.attr('disabled', false)
			.val('')
			.delayedFocus();
		
		// run the timeout
		quiz.timeout(iknow.session.quiz.timeout);
		
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
		if(!$('#quiz-timer .ui-progressbar-value').is(':animated')) return;

		// stop and hide the timer
		$('#quiz-timer .ui-progressbar-value').stop().parent().hide();
		
		var value = $('div.enter-missing-quiz input').val();
		quiz[value == iknow.session.quiz.correctChoice ? 'correct' : 'wrong']();
		
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

					// If the right one was none of the above, we need to transform it into the actual item
					if($('div.multiple-choice-quiz button.correct').is('.last-button')) {

						switch(iknow.session.quiz.distractorType) {
							case 'image':
								$('div.multiple-choice-quiz button.correct').html(quiz.templates.distractorImage(iknow.session.quiz.correctChoice.content[iknow.session.quiz.distractorType], true));				
								break;
							case 'text':
								$('div.multiple-choice-quiz button.correct').html(iknow.session.quiz.getDistractorText(iknow.session.quiz.correctChoice));
								break;
						}

					}

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
		$('div.session-footer-panel div.right-button').find("a").text(smart.t('review-again')).end().show().find('a').delayedFocus();
		
		// play 'fail' sound
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
							picked.html(iknow.session.quiz.getDistractorText(iknow.session.quiz.correctChoice));
							break;
					}

				}

				if(iknow.session.quiz.distractorType != 'text') {
					picked.parent().find('.last-button')
						.animate({
							width: $('div.multiple-choice-quiz button:eq(0)')[0].offsetWidth,
							height: $('div.multiple-choice-quiz button:eq(0)')[0].offsetHeight
						}, 	{
							duration: 600,
							easing: 'easeOutQuint'
						});
				}

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
						
				if(iknow.session.quiz.direction != 'forward' && iknow.session.item.cue.content.sound) {
					iknow.audio.play(iknow.session.item.cue.content.sound);
				};
			
				break;
			
			case 'spelling':
			
				$('div.enter-missing-quiz input')
					.attr('disabled', true);
					
				$('div.enter-missing-input')
  					.addClass('correct-answer');

				break;
				
		}

		iknow.result = 1;
		$('div.session-footer-panel div.right-button').find("a").text(smart.t('next')).end().show().find('a').delayedFocus();
		
		// play 'correct' sound
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