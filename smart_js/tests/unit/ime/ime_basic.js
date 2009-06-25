module('ime core');

test('module existance', function() {
	expect(1);
	ok(smart.ime, 'smart IME is initialized');
});

module('ime roman');

test('spacing', function() {
	expect(1);
	equals(smart.ime.roman.spacing, 0.6, 'roman spacing');
});

test('typing', function() {

	$('#ime').type('Hello my friend!');
	equals($('#ime')[0].value, 'Hello my friend!', 'check if keyboard simulation works');	
	
	$('#ime').backspace();
	equals($('#ime')[0].value, 'Hello my friend', 'check if keyboard backspace simulation works');
	
});

module('ime hiragana');

test('spacing', function() {
	expect(1);
	equals(smart.ime.hiragana.spacing, 1, 'hiragana spacing');
});

test('typing', function() {

	$('#ime').smartHiragana();
	$('#ime').type('watashi');
	
	equals($('#ime')[0].value, 'わたし', 'typed out "watashi" should match わたし');
	
	//MISSING:
	// backspace, space testing
	

});