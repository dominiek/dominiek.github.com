$(document).ready(function() {
	
	$('input.dictation-input').smartPinyin();
	
	
	var length = 20;
	var spacing = 0.61 || smart.ime.pinyin.spacing; //Hiragana
	var fontSize = 29.87;
	var input = $('input.dictation-input').width((fontSize * spacing) * length);
	
	for (var i=0; i < length; i++) {
		$('<div class="dictation-bar"><div></div></div>').css('width', (fontSize * spacing)).appendTo('div.dictation-bars');
	};
	
	$('input.dictation-input').val('')[0].focus();
	
});