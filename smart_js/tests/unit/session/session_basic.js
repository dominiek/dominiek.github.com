module('session basic');

test('module existance', function() {
	ok(smart.session, 'smart session is initialized');
});

test('creating a basic session without options', function() {
	var session = new smart.session();
	ok(session, 'the session was successfully initialized');
});

test('unique id assigning', function() {
	var session = new smart.session(), session2 = new smart.session();
	ok(session.id != session2.id, 'each session id should be unique');
});

test('session defaults', function() {
	equals(smart.session.defaults.autostart, true, 'session should be automatically started upon initialization');
	equals(smart.session.defaults.recall, true, 'recall screen should be enabled by default');
	equals(smart.session.defaults.study, true, 'study screen should be enabled by default');
	equals(smart.session.defaults.quizzes, 'all', 'all quizzes should be rotated by default');
	equals(smart.session.defaults.quizzesPerItem, 3, 'default quizzes per item');
	equals(smart.session.defaults.maxQuizzesPerItem, false, 'there shouldnt be a maximum quizzes per item by default');
	equals(smart.session.defaults.incrementalPool, true, 'incremental pool produces more random results, so it defaults to true');
	equals(smart.session.defaults.initialPoolSize, 3, 'initial size of the pool');
	equals(smart.session.defaults.progressOnFailing, false, 'you should not be rewarded intra session for failing in a quiz');
	equals(smart.session.defaults.adaptiveClearance, false, 'adaptiveClearance is too experimental to be enabled by default');
	equals(smart.session.defaults.preventAnnoyingLastItem, true, 'the last item should not occur twice, even if the item state is low');
});