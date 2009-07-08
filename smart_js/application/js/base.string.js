// matches a single kanji character
String.prototype.isaKanji = function(){
	return !!this.match(/^[\u4E00-\u9FAF]$/);
}

// matches one or more kanji characters
String.prototype.isKanji = function(){
	return !!this.match(/^[\u4E00-\u9FAF]+$/);
}

//check if there's kanji in the string
String.prototype.hasKanji = function(){
	return !!this.match(/[\u4E00-\u9FAF]/);
}

// matches one or more hiragana characters
String.prototype.isHiragana = function(){
	return !!this.match(/^[\u3040-\u3096]+$/);
}

// matches one or more full-width katakana characters
String.prototype.isKatakana = function(){
	return !!this.match(/^[\u30A1-\u30FA|\u30FC|\u3001-\u302F|\uFF5B|\uFF5D|\uFF08|\uFF09|\uFF3B|\uFF3D|\u2026|\u2025]+$/);
}

String.prototype.isPureKatakana = function(){
	return !!this.match(/^[\u30A1-\u30FA]+$/);
}

// kana is hiragana, full-width katakana,
// half-width katakana, or a katakana
// phonetic extension

//matches punctuation characters as well
String.prototype.isKana = function(){
	return !!this.match(/^[\u3040-\u3096|\u30A1-\u30FA|\uFF66-\uFF9D|\u31F0-\u31FF|\u30FC|\u3001-\u302F|\uFF5B|\uFF5D|\uFF08|\uFF09|\uFF3B|\uFF3D|\u2026|\u2025]+$/);
}

String.prototype.isPureKana = function(){
	return !!this.match(/^[\u3040-\u3096|\u30A1-\u30FA|\uFF66-\uFF9D|\u31F0-\u31FF]+$/);
}

// matches a String that contains kanji and/or kana character(s)
String.prototype.isKanjiKana = function(){
	return !!this.match(/^[\u4E00-\u9FAF|\u3040-\u3096|\u30A1-\u30FA|\uFF66-\uFF9D|\u31F0-\u31FF|\u30FC|\u3001-\u302F|\uFF5B|\uFF5D|\uFF08|\uFF09|\uFF3B|\uFF3D|\u2026|\u2025]+$/);
}

String.prototype.isPureKanjiKana = function(){
	return !!this.match(/^[\u4E00-\u9FAF|\u3040-\u3096|\u30A1-\u30FA|\uFF66-\uFF9D|\u31F0-\u31FF]+$/);
}