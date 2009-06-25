$.simulation = function(options) {
	
	this.options = $.extend({}, options);
	
};

$.extend($.simulation.prototype, {
	
	load: function(data) {
		this.options.data = data;
	},
	
	record: function() {
		
	},
	
	simulate: function(target, part) {
		
		var eventType = part.type;
		
		switch(eventType) {
			
			case 'type':
				target.type(part.text, 0, part.speed);
				break;
			case 'focus':
			case 'blur':
				target[0][eventType]();
				break;
			case 'click':
				if(/(input|button|a|select)/.test(target[0].nodeName.toLowerCase()))
					target[0].focus();
			default:
				var offset = this.cursor.offset();
				target.simulate(eventType, {
					clientX: offset.left, clientY: offset.top,
					pageX: offset.left, pageY: offset.top
				});
				
		};
		
	},
	
	intersects: function(target) {
		
		var a = this.cursor.offset();
		var b = target.offset();
		
		return (
			(a.top > b.top && a.top < b.top + target[0].offsetHeight)
			&& (a.left > b.left && a.left < b.left + target[0].offsetWidth)
		)

	},
	
	play: function(event) {
	
		var data = this.options.data,
			self = this;
			
		this.cursor = $('<img src="images/cursor.png" class="cursor">').css({ position: 'absolute', top: event.pageY, left: event.pageY }).appendTo('body');
		$('body').css('cursor', 'url(images/transparent.gif), text');
	
		var chain = function(part, duration) {
			
			var eventType = part.type,
				target = $(part.target);
			
			self.cursor.queue('sim', function() {

				if(!part.y || !part.x) {
					var center = self._findCenter(target);
					part.y = part.y || center.y;
					part.x = part.x || center.x;
				}

				if(parseInt(duration) == 0) {
					self.simulate(target, part);
					window.setTimeout(function() {
						self.cursor.dequeue('sim');
					}, part.type == "click" ? 500 : 0);
				} else {
					self.cursor.animate({
						top: part.y,
						left: part.x
					}, {
						duration: parseInt(duration),
						step: function(a, b) {
							if(b.prop == 'top') {
								if(part.type == "mousemove") self.simulate(target, part);
							}
						},
						complete: function() {

							self.simulate(target, part);
							window.setTimeout(function() {
								self.cursor.dequeue('sim');
							}, part.type == "click" ? 100 : 0);

						}
					});
				}
				
			});
			
		};
	
		var j = 0;
		for (var i in data) {

			if(data[i].type == "drag") {
				chain({ type: 'mousedown', target: data[i].target }, parseInt(i));
				chain({ type: 'mousemove', target: data[i].target, x: data[i].x, y: data[i].y }, i - j);
				chain({ type: 'mouseup', target: data[i].target, x: data[i].x, y: data[i].y }, 0);
			} else {
				chain(data[i], i - j);
			}
			
			j = i;
			
		}
		
		self.cursor.dequeue('sim');

	},
	
	_findCenter: function(el) {
		var o = el.offset();
		return {
			x: o.left + el.outerWidth() / 2,
			y: o.top + el.outerHeight() / 2
		};
	}
	
});