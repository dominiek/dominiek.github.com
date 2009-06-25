module('session spacing');

function average(a) {
	var n = 0;
	for (var i=0; i < a.length; i++) {
		n = n + a[i];
	};
	
	return n/a.length;
	
}

var collector = function(condition, event) {

	var self = this;
	this.total = [];
	this.now = 0;

	session.bind('end', function() {
		self.total.push(self.now);
	});

	session.bind(event || 'next', function() {
		var add = condition.call(this);
		if(add) self.now = self.now + add;
	});

};

collector.prototype.collect = function(min, max, word) {
	ok(average(this.total) > min && average(this.total) < max, 'average '+(word || '')+' should be around '+min+'-'+max+': '+average(this.total));
};

var runAverageTesting = function(o, times) {
	
	stop();
	(function(times) {
		
		var callee = arguments.callee;
		window.session = new smart.session(o);
		session.load(window._items || { user: 'pbakaus' });
		
		session.bind('ready', function(data) {

			window._items = this.items;

			for (var i=0; i < 500; i++) {
				this.next(Math.floor(this.state == 'recall' ? 1 : Math.random()*3) -1); //always yes on recall
			};
			
			if(times > 0) {
				callee(times-1);
			} else {

				//TODO: Make numbers variable
				iterations.collect(140,190, 'iterations');
				poolchange.collect(9,15, 'poolchange');
				quizzes.collect(60,85, 'quizzes');
				studies.collect(13,30, 'studies');
				recall.collect(60,85, 'recall');
				
				start();
				
			}

		});		
		
	})(times);
	
	var iterations = new collector(function() { return 1; });
	var poolchange = new collector(function() { return 1; }, 'poolchange');
	var quizzes = new collector(function() { return this.state == 'quiz' ? 1 : 0; });
	var studies = new collector(function() { return this.state == 'study' ? 1 : 0; });
	var recall = new collector(function() { return this.state == 'recall' ? 1 : 0; });

};

test('default spacing', function() {
	runAverageTesting(null, 100);
});

test('quizzesPerItem', function() {
	runAverageTesting({ quizzesPerItem: 5 }, 100);
});

test('maxQuizzesPerItem', function() {
	ok(false, 'untested code is broken code');
});

test('incrementalPool', function() {
	ok(false, 'untested code is broken code');
});

test('initialPoolSize', function() {
	ok(false, 'untested code is broken code');
});

test('progressOnFailing', function() {
	ok(false, 'untested code is broken code');
});

test('adaptiveClearance', function() {
	ok(false, 'untested code is broken code');
});

test('preventAnnoyingLastItem', function() {
	ok(false, 'untested code is broken code');
});