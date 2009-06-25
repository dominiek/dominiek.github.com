smart.ime = {
	
	roman: {
		spacing: 0.6
	}
	
};

smart.ime.hiragana = function(element) {
	smart.ime.kana(element, 'hiragana');
};

smart.ime.katakana = function(element) {
	smart.ime.kana(element, 'katakana');
};

smart.ime.hiragana.spacing = 1;
smart.ime.katakana.spacing = 1;

jQuery.fn.smartHiragana = function() {
	smart.ime.hiragana(this);
}

jQuery.fn.smartKatakana = function() {
	smart.ime.katakana(this);
}

smart.ime.kana = function(element, kana) {

	var savedChar = false;
	var consonants = {
		87: 'w', 82: 'r', 76: 'l', 90: 'z', 80: 'p', 83: 's', 68: 'd', 70: 'f', 71: 'g', 72: 'h', 74: 'j',
		75: 'k', 89: 'y', 66: 'b', 78: 'n', 77: 'm', 70: 'f', 81: 'q', 88: 'x', 67: 'c', 86: 'v', 84: 't'
	};
	
	var vocals = { 65: 'a', 69: 'e', 73: 'i', 79: 'o', 85: 'u', 109: '-', 190: '.' };
	var map = {
		hiragana: {
			a: 'あ', e: 'え', i: 'い', o: 'お', u: 'う', n: 'ん', '-': 'ー', '.': '。',

			sha: 'しゃ', she: 'しぇ', shi: 'し', sho: 'しょ', shu: 'しゅ',
			cha: 'ちゃ', che: 'ちぇ', chi: 'ち', cho: 'ちょ', chu: 'ちゅ',
			tsa: 'つぁ', tse: 'つぇ', tsi: 'つぃ', tso: 'つぉ', tsu: 'つ',

			ha: 'は', he: 'へ', hi: 'ひ', ho: 'ほ', hu: 'ふ',
			ba: 'ば', be: 'べ', bi: 'び', bo: 'ぼ', bu: 'ぶ',
			pa: 'ぱ', pe: 'ぺ', pi: 'ぴ', po: 'ぽ', pu: 'ぷ',

			hya: 'ひゃ', hye: 'ひぇ', hyi: 'ひぃ', hyo: 'ひょ', hyu: 'ひゅ',
			bya: 'びゃ', bye: 'びぇ', byi: 'びぃ', byo: 'びお', byu: 'びゅ',
			pya: 'ぴゃ', pye: 'ぴぇ', pyi: 'ぴぃ', pyo: 'ぴょ', pyu: 'ぴゅ',

			wa: 'わ', we: 'うぇ', wi: 'うぃ', wo: 'を', wu: 'う',
			ra: 'ら', re: 'れ', ri: 'り', ro: 'ろ', ru: 'る',
			la: 'ら', le: 'れ', li: 'り', lo: 'ろ', lu: 'る',
			rya: 'りゃ', rye: 'りぇ', ryi: 'りぃ', ryo: 'りょ', ryu: 'りゅ',
			lya: 'りゃ', lye: 'りぇ', lyi: 'りぃ', lyo: 'りょ', lyu: 'りゅ',
			ta: 'た', te: 'て', ti: 'ち', to: 'と', tu: 'つ',
			da: 'だ', de: 'で', di: 'ぢ', 'do': 'ど', du: 'づ',
			tya: 'ちゃ', tye: 'ちぇ', tyi: 'ちぃ', tyo: 'ちょ', tyu: 'ちゅ',

			sa: 'さ', se: 'せ', si: 'し', so: 'そ', su: 'す',
			za: 'ざ', ze: 'ぜ', zi: 'じ', zo: 'ぞ', zu: 'ず',
			sya: 'しゃ', sye: 'しぇ', syi: 'しぃ', syo: 'しょ', syu: 'しゅ',
			zya: 'じゃ', zye: 'じぇ', zyi: 'じぃ', zyo: 'じょ', zyu: 'じゅ',
			fa: 'ふぁ', fe: 'ふぇ', fi: 'ふぃ', fo: 'ふぉ', fu: 'ふ',
			fya: 'ふゃ', fye: 'ふぇ', fyi: 'ふぃ', fyo: 'ふょ', fyu: 'ふゅ',

			ka: 'か', ke: 'け', ki: 'き', ko: 'こ', ku: 'く',
			ga: 'が', ge: 'げ', gi: 'ぎ', go: 'ご', gu: 'ぐ',
			kya: 'きゃ', kye: 'きぇ', kyi: 'きぃ', kyo: 'きょ', kyu: 'きゅ',
			gya: 'ぎゃ', gye: 'ぎぇ', gyi: 'ぎぃ', gyo: 'ぎょ', gyu: 'ぎゅ',

			ja: 'じゃ', je: 'じぇ', ji: 'じ', jo: 'じょ', ju: 'じゅ',
			jya: 'じゃ', jye: 'じぇ', jyi: 'じぃ', jyo: 'じょ', jyu: 'じゅ',
			ya: 'や', ye: 'いぇ', yi: 'い', yo: 'よ', yu: 'ゆ',

			na: 'な', ne: 'ね', ni: 'に', no: 'の', nu: 'ぬ',
			ma: 'ま', me: 'め', mi: 'み', mo: 'も', mu: 'む',
			nya: 'にゃ', nye: 'にぇ', nyi: 'にぃ', nyo: 'にょ', nyu: 'にゅ',
			mya: 'みゃ', mye: 'みぇ', myi: 'みぃ', myo: 'みょ', myu: 'みゅ',

			qa: 'くぁ', qe: 'くぇ', qi: 'くぃ', qo: 'くぉ', qu: 'くぅ',
			xa: 'ぁ', xe: 'ぇ', xi: 'ぃ', xo: 'ぉ', xu: 'ぅ',　//Todo: Implement variations
			ca: 'か', ce: 'せ', ci: 'し', co: 'こ', cu: 'く',
			cya: 'ちゃ', cye: 'ちぇ', cyi: 'ちぃ', cyo: 'ちょ', cyu: 'ちゅ',
			va: 'ゔぁ', ve: 'ゔぇ', vi: 'ゔぃ', vo: 'ゔぉ', vu: 'ゔ',
			vya: 'ゔゃ', vye: 'ゔぇ', vyi: 'ゔぃ', vyo: 'ゔょ', vyu: 'ゔゅ'

		},
		katakana: {
			a: 'ア', e: 'エ', i: 'イ', o: 'オ', u: 'ウ', n: 'ン', '-': 'ー', '.':'。',

			sha: 'シャ', she: 'シェ', shi: 'シ', sho: 'ショ', shu: 'シュ',
			cha: 'チャ', che: 'チェ', chi: 'チ', cho: 'チョ', chu: 'チュ',
			tsa: 'ツァ', tse: 'ツェ', tsi: 'ツィ', tso: 'ツォ', tsu: 'ツ',

			ha: 'ハ', he: 'ヘ', hi: 'ヒ', ho: 'ホ', hu: 'フ',
			ba: 'バ', be: 'ベ', bi: 'ビ', bo: 'ボ', bu: 'ブ',
			pa: 'パ', pe: 'ペ', pi: 'ピ', po: 'ポ', pu: 'プ',

			hya: 'ヒャ', hye: 'ヒェ', hyi: 'ヒィ', hyo: 'ヒョ', hyu: 'ヒュ',
			bya: 'ビャ', bye: 'ビェ', byi: 'ビィ', byo: 'ビオ', byu: 'ビュ',
			pya: 'ピャ', pye: 'ピェ', pyi: 'ピィ', pyo: 'ピョ', pyu: 'ピュ',

			wa: 'ワ', we: 'ウェ', wi: 'ウィ', wo: 'ヲ', wu: 'ウ',
			ra: 'ラ', re: 'レ', ri: 'リ', ro: 'ロ', ru: 'ル',
			la: 'ラ', le: 'レ', li: 'リ', lo: 'ロ', lu: 'ル',
			rya: 'リャ', rye: 'リェ', ryi: 'リィ', ryo: 'リョ', ryu: 'リュ',
			lya: 'リャ', lye: 'リェ', lyi: 'リィ', lyo: 'リョ', lyu: 'リュ',
			ta: 'タ', te: 'テ', ti: 'チ', to: 'ト', tu: 'ツ',
			da: 'ダ', de: 'デ', di: 'ヂ', 'do': 'ド', du: 'ヅ',
			tya: 'チャ', tye: 'チェ', tyi: 'チィ', tyo: 'チョ', tyu: 'チュ',

			sa: 'サ', se: 'セ', si: 'シ', so: 'ソ', su: 'ス',
			za: 'ザ', ze: 'ゼ', zi: 'ジ', zo: 'ゾ', zu: 'ズ',
			sya: 'シャ', sye: 'シェ', syi: 'シィ', syo: 'ショ', syu: 'シュ',
			zya: 'ジャ', zye: 'ジェ', zyi: 'ジィ', zyo: 'ジョ', zyu: 'ジュ',
			fa: 'ファ', fe: 'フェ', fi: 'フィ', fo: 'フォ', fu: 'フ',
			fya: 'フャ', fye: 'フェ', fyi: 'フィ', fyo: 'フョ', fyu: 'フュ',

			ka: 'カ', ke: 'ケ', ki: 'キ', ko: 'コ', ku: 'ク',
			ga: 'ガ', ge: 'ゲ', gi: 'ギ', go: 'ゴ', gu: 'グ',
			kya: 'キャ', kye: 'キェ', kyi: 'キィ', kyo: 'キョ', kyu: 'キュ',
			gya: 'ギャ', gye: 'ギェ', gyi: 'ギィ', gyo: 'ギョ', gyu: 'ギュ',

			ja: 'ジャ', je: 'ジェ', ji: 'ジ', jo: 'ジョ', ju: 'ジュ',
			jya: 'ジャ', jye: 'ジェ', jyi: 'ジィ', jyo: 'ジョ', jyu: 'ジュ',
			ya: 'ヤ', ye: 'イェ', yi: 'イ', yo: 'ヨ', yu: 'ユ',

			na: 'ナ', ne: 'ネ', ni: 'ニ', no: 'ノ', nu: 'ヌ',
			ma: 'マ', me: 'メ', mi: 'ミ', mo: 'モ', mu: 'ム',
			nya: 'ニャ', nye: 'ニェ', nyi: 'ニィ', nyo: 'ニョ', nyu: 'ニュ',
			mya: 'ミャ', mye: 'ミェ', myi: 'ミィ', myo: 'ミョ', myu: 'ミュ',

			qa: 'クァ', qe: 'クェ', qi: 'クィ', qo: 'クォ', qu: 'クゥ',
			xa: 'ァ', xe: 'ェ', xi: 'ィ', xo: 'ォ', xu: 'ゥ',　//Todo: Implement variations
			ca: 'カ', ce: 'セ', ci: 'シ', co: 'コ', cu: 'ク',
			cya: 'チャ', cye: 'チェ', cyi: 'チィ', cyo: 'チョ', cyu: 'チュ',
			va: 'ヴァ', ve: 'ヴェ', vi: 'ヴィ', vo: 'ヴォ', vu: 'ヴ',
			vya: 'ヴャ', vye: 'ヴェ', vyi: 'ヴィ', vyo: 'ヴョ', vyu: 'ヴュ'
		}
	};

	
	jQuery(element).bind('keydown.smart', function(event) {

		if(consonants[event.keyCode]) {

			if(savedChar) {
				
				//Check if the double consonant is legitimate
				if(map[kana][savedChar+consonants[event.keyCode]+'a']) {
					savedChar += consonants[event.keyCode];
				} else if(savedChar == consonants[event.keyCode] && consonants[event.keyCode] != 'n') { // double consonants
					this.value = this.value.substr(0, this.value.length-1) + (kana == 'hiragana' ? 'っ' : 'ッ');
					savedChar = consonants[event.keyCode];
				} else {
					
					if(savedChar == 'n') {
						this.value = this.value.substr(0, this.value.length-1) + map[kana][savedChar];
						savedChar = consonants[event.keyCode];
					} else {
						//If you don't return false it behaves like a normal IME
						return false;
					}
					
				}
				
			} else {
				//Save consonant
				savedChar = consonants[event.keyCode];
			}

		} else if(vocals[event.keyCode]) {
		
			if(savedChar) {
				
				if(map[kana][savedChar+vocals[event.keyCode]]) {
					this.value = this.value.substr(0, this.value.length-savedChar.length) + map[kana][savedChar+vocals[event.keyCode]];
					savedChar = false;
				} else {
					if(savedChar == 'n')
						this.value = this.value.substr(0, this.value.length-1) + map[kana][savedChar] + map[kana][vocals[event.keyCode]];
					else
						return false;
					
				}

				
			} else {
				this.value += map[kana][vocals[event.keyCode]];
			}
			
			return false;
			
		} else { //Any other sign

			if(savedChar == 'n')
				this.value = this.value.substr(0, this.value.length-1) + map[kana][savedChar];
			
			savedChar = false;
			
		};
		
	});	

};




smart.ime.pinyin = function(element) {

	function getSelectionStart(o) {
		if (o.createTextRange) {
			var r = document.selection.createRange().duplicate();
			r.moveEnd('character', o.value.length);
			if (r.text == '') return o.value.length;
			return o.value.lastIndexOf(r.text);
		} else return o.selectionStart;
	};

	function getSelectionEnd(o) {
		if (o.createTextRange) {
			var r = document.selection.createRange().duplicate();
			r.moveStart('character', -o.value.length);
			return r.text.length;
		} else return o.selectionEnd;
	};

	var keyCodes = { 49: 0, 50: 1, 51: 2, 52: 3, 53: 4 },
		vowels = /[āáǎàaīíǐìiūúǔùuēéěèeōóǒòoǖǘǚǜüĀÁǍÀAĪÍǏÌIŪÚǓÙUĒÉĚÈEŌÓǑÒOǕǗǙǛÜvV]+/g,
		rules = [/ao|ou|io/i, /ui|ua|ue|uo|ia|iu|io|ie/i],
		caretPosition = 0,
		//alternativeInput = { 'u:': 'ü', 'U:': 'Ü' }, //TODO: That one is seriously difficult and rarely used
		vowelToPinyin = {
			'a': 'āáǎàa',
			'i': 'īíǐìi',
			'u': 'ūúǔùu',
			'e': 'ēéěèe',
			'o': 'ōóǒòo',
			'ü': 'ǖǘǚǜü',
			'v': 'ǖǘǚǜü',
			'A': 'ĀÁǍÀA',
			'I': 'ĪÍǏÌI',
			'U': 'ŪÚǓÙU',
			'E': 'ĒÉĚÈE',
			'O': 'ŌÓǑÒO',
			'Ü': 'ǕǗǙǛÜ',
			'V': 'ǕǗǙǛÜ'
		};


	jQuery(element)
		.bind('click', function() { caretPosition = getSelectionStart(this); })
		.bind('keyup', function() { caretPosition = getSelectionStart(this); })
		.bind('keydown', function() { caretPosition = getSelectionStart(this); })
		.bind('keypress', function() { caretPosition = getSelectionStart(this); })
		.bind('mouseup', function() { caretPosition = getSelectionStart(this); })
		.bind('mousedown', function() { caretPosition = getSelectionStart(this); });
	
	
	jQuery(element).bind('keydown.smart', function(event) {
		
		var i = keyCodes[event.keyCode],
			a = function(vowel) {
				return vowelToPinyin[vowel][i];
			};

		if(i !== undefined) {
			
			var beforeCaretReversed = this.value.substr(0, caretPosition).split('').reverse().join(''); //Reverse characters of the string before the caret
			var chunkMatch = beforeCaretReversed.match(vowels);
			
			if(!chunkMatch) return false;
			
			var chunk = chunkMatch[0].split('').reverse().join(''); //Match the first (last) vowel chunk, then flip vowel chunk back
			var index = Math.abs(beforeCaretReversed.search(vowels) - beforeCaretReversed.length) - chunk.length;
			var normalizedChunk = chunk
				.replace(/[āáǎàa]/g, 'a')
				.replace(/[īíǐìi]/g, 'i')
				.replace(/[ūúǔùu]/g, 'u')
				.replace(/[ēéěèe]/g, 'e')
				.replace(/[ōóǒòo]/g, 'o')
				.replace(/[ǖǘǚǜü]/g, 'ü')
				.replace(/[ĀÁǍÀA]/g, 'A')
				.replace(/[ĪÍǏÌI]/g, 'I')
				.replace(/[ŪÚǓÙU]/g, 'U')
				.replace(/[ĒÉĚÈE]/g, 'E')
				.replace(/[ŌÓǑÒO]/g, 'O')
				.replace(/[ǕǗǙǛÜ]/g, 'Ü');
			
			// Find out the right replacement for the found chunk
			switch(normalizedChunk.length) {
				case 1:
					var replacement = a(normalizedChunk);
					break;
				case 2:
					var replacement = (rules[0].test(normalizedChunk) ? a(normalizedChunk.substr(0,1)) + normalizedChunk.substr(1) : normalizedChunk.substr(0,1)+a(normalizedChunk.substr(1)));
					break;
				case 3:
					var replacement = normalizedChunk.substr(0,1) + a(normalizedChunk.substr(1,1)) + normalizedChunk.substr(2);
					break;
			}
			
			//Replace the vowel chunk in the value
			this.value = (this.value.substr(0, index) + this.value.substr(index, caretPosition-index+1).replace(chunk, replacement) + this.value.substr(caretPosition+1));
			
			//Set the caret to where it was before
			if(this.setSelectionRange) {
				this.setSelectionRange(caretPosition,caretPosition);
			} else if(this.createTextRange) {
				var range = this.createTextRange();
				range.collapse(true);
				range.moveEnd('character', caretPosition);
				range.moveStart('character', caretPosition);
				range.select();
			}
			
			
			return false;
			
		}
		
	});	

};

smart.ime.pinyin.spacing = 0.6;

//This would be a very jQuery style usage
jQuery.fn.smartPinyin = function() {
	smart.ime.pinyin(this);
}
