module('session events');

test('ready', function() {
	
	stop(2000);
	
	window.session = new smart.session();
	session.load({ user: 'pbakaus' });
	
	session.bind('ready', function(data) {
		
		equals(session, this, 'event is fired and scope matches session instance');
		start();
		
	});

});

test('next', function() {
	
	expect(1);
	
	session.bind('next', function() {
		equals(session, this, 'event is fired and scope matches session instance');
	});
	
	session.next(1);
	
});

test('stop', function() {
	
	expect(1);
	
	session.bind('stop', function() {
		equals(session, this, 'event is fired and scope matches session instance');
	});
	
	session.stop();
	
});

test('cancel', function() {
	
	expect(1);
	stop(2000);
	
	window.session = new smart.session();
	session.load({ user: 'pbakaus' });

	session.bind('cancel', function() {
		equals(session, this, 'event is fired and scope matches session instance');
		start();
	});
	
	session.bind('ready', function(data) {
		this.cancel();
	});	

});

test('end', function() {

	expect(1);
	stop(2000);
	
	window.session = new smart.session();
	session.load({ user: 'pbakaus' });

	session.bind('end', function() {
		equals(session, this, 'event is fired and scope matches session instance');
	});
	
	session.bind('ready', function(data) {
		
		for (var i=0; i < 250; i++) {
			this.next(Math.floor(this.state == 'recall' ? 1 : Math.random()*3) -1); //always yes on recall
		};
		
		start();
		
	});

});

test('poolchange', function() {

	stop(2000);
	
	window.session = new smart.session();
	session.load({ user: 'pbakaus' });

	session.bind('poolchange', function() {
		equals(session, this, 'event is fired and scope matches session instance');
	});
	
	session.bind('ready', function(data) {
		
		for (var i=0; i < 250; i++) {
			this.next(Math.floor(this.state == 'recall' ? 1 : Math.random()*3) -1); //always yes on recall
		};
		
		start();
		
	});

});