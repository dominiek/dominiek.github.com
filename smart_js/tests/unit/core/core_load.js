module('load');

test('call load with only user id: defaults', function() {

	stop();

	smart.bind('load', function(data) {

		ok(data, 'API call worked');
		equals(data.length, 10, 'default limit is 10');
		
		smart.unbind('load');
		start();
		
	});
	
	smart.load({ user: 'pbakaus' });

});

test('call load anonymously with a list id', function() {

	stop();

	smart.bind('load', function(data) {

		ok(data, 'API call worked');
		equals(data.length, 10, 'default limit is 10');
		
		smart.unbind('load');
		start();
		
	});
	
	smart.load({ list: 705 });

});