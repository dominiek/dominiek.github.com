$(document).ready(function() {
	
	$('input.dictation-input').smartHiragana();
	$('input.dictation-input').attr('disabled', false).val('');
	
	var length = 3;
	var spacing = smart.ime.hiragana.spacing; //Hiragana
	var fontSize = 29.87;
	var input = $('input.dictation-input').width((fontSize * spacing) * length);
	
	for (var i=0; i < length; i++) {
		$('<div class="dictation-bar"><div></div></div>').css('width', (fontSize * spacing)).appendTo('div.dictation-bars');
	};
	
	$('input.dictation-input').bind('keydown', function(event) {
		
		if(event.keyCode == 13) {
			var offset = $('input.dictation-input').offset();
			
			if(this.value == 'わたし') {
				
				$('<div></div>')
					.appendTo('body')
					.css({
						position: 'absolute', top: offset.top, left: offset.left, zIndex: 2,
						width: $('input.dictation-input').width(), height: $('input.dictation-input').height(),
						background: 'url(img/correct.png)'
					})
					.fadeOut(1000);
				
				$('input.dictation-input')
					.css('background', 'transparent')
					.attr('disabled', true)[0].blur();
				
				$('div.dictation-bars').animate({ opacity: 0 }, 1000);	
					
			} else {
				$('input.dictation-input').removeClass('correct').addClass('wrong');
			}
			
			
			
		};
		
	});
	
});