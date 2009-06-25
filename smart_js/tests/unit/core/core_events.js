module('core events');

test('global event, no scope specified', function() {

	var scope = null;
	smart.bind('global', function() {
		scope = this;
	});

	smart.trigger('global');

	ok(scope, 'event is successfully triggered');
	equals(scope, smart, 'default scope of the callback function is smart');

});

test('global event, bind scope specified', function() {

	var scope = null, bindScope = {};
	smart.bind('global', function() {
		scope = this;
	}, bindScope);

	smart.trigger('global');

	ok(scope, 'event is successfully triggered');
	equals(scope, bindScope, 'bind scope is passed to the callback function');

});

test('global event, trigger scope specified', function() {

	var scope = null, triggerScope = {};
	smart.bind('global', function() {
		scope = this;
	});

	smart.trigger('global', triggerScope);

	ok(scope, 'event is successfully triggered');
	equals(scope, triggerScope, 'trigger scope is passed to the callback function');

});

test('global event, trigger scope and data specified', function() {

	var scope = null, data = null, triggerScope = {}, triggerData = [{ foo: 1 }];
	smart.bind('global', function(d) {
		scope = this;
		data = d;
	});

	smart.trigger('global', triggerScope, triggerData);

	ok(scope, 'event is successfully triggered');
	equals(scope, triggerScope, 'trigger scope is passed to the callback function');
	equals(data, triggerData[0], 'data is passed to the callback function');

});

test('global event, bind scope and trigger scope specified', function() {

	var scope = null, bindScope = {}, triggerScope = {};
	smart.bind('global', function() {
		scope = this;
	}, bindScope);

	smart.trigger('global', triggerScope);

	ok(scope, 'event is successfully triggered');
	equals(scope, bindScope, 'bind scope has higher priority than trigger scope');

});

test('local event', function() {

	expect(2);

	var session = new smart.session(),
		session2  = new smart.session();
		
	smart.bind('fire', function() {
		ok(false, 'smart event should not be fired');
	});
	session.bind('fire', function() {
		ok(true, 'event should be triggered only once for session 1');
	});
	session2.bind('fire', function() {
		ok(true, 'event should be triggered only once for session 2');
	});
	
	session.trigger('fire');
	session2.trigger('fire');

});