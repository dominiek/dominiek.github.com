jQuery.fn.delayedFocus = function() {
	var self = this;
	if(this.length) window.setTimeout(function() {
		self[0].focus();
		if(iknow.currentFocus) iknow.currentFocus.removeClass('ui-state-active');
		iknow.currentFocus = self.addClass('ui-state-active');
	}, 0);
}

$(document).ready(function() {

	// button click actions
	$('div.session-footer-panel div.right-button a').bind('click', function() {
		iknow.audio.play(iknow.base + 'media/sounds/spell_press.mp3');
		iknow.session.next(iknow.result != undefined ? iknow.result : 1);
		return false;
	});
	
	$('div.session-footer-panel div.fg-buttonset button').bind('click', function() {
		iknow.audio.play(iknow.base + 'media/sounds/spell_press.mp3');
		iknow.session.next($(this).parent().find('button').index(this)-1);
		return false;
	});
	
	// restore focus on clicking somewhere not focussable
	$(document).bind('click', function(e) {
		if(iknow.currentFocus && !$(e.target).parents().andSelf().is('.fg-button, .extra-info, input')) {
			iknow.currentFocus.delayedFocus();
		}
	});
	
	// keyboard actions
	$(document).bind('keydown', function(event) {
		
		// settings
		if(event.keyCode == 83) {
		
			// show settings
			
		}
		
		// recall buttons at bottom
		if(iknow.session.state == 'recall') {
			switch(event.keyCode) {
				case 37:
					iknow.currentFocus.prev().delayedFocus();
					break;
				case 39:
					iknow.currentFocus.next().delayedFocus();
					break;
			}
		}
		
		// quizzing
		if(iknow.session.state == 'quiz' && iknow.session.quiz.type == 'multipleChoice') {
			
			var list = iknow.currentFocus.parent().find('> *');
			var index = list.index(iknow.currentFocus) + 1;
			var even = index/2 == parseInt(index/2);
			
			if(list.length > 5 || iknow.session.quiz.distractorType == 'image') {

	  			switch(event.keyCode) {
	  				case 37:
						if(even) iknow.currentFocus.prev().delayedFocus();
	  					break;
	  				case 39:
	  					if(!even) iknow.currentFocus.next().delayedFocus();
	  					break;
	  				case 38: //up 
	  					if(index - 2 >= 0) iknow.currentFocus.prev().prev().delayedFocus();
	  					break;
	  				case 40: //down
	  					if(index + 2 <= list.length)
							iknow.currentFocus.next().next().delayedFocus();
						else
							iknow.currentFocus.next().delayedFocus()
	  					break;
	  			}
	
			} else {

				switch(event.keyCode) {
  					case 38: //up 
  						if(index - 1 >= 0) iknow.currentFocus.prev().delayedFocus();
  						break;
  					case 40: //down
  						if(index + 1 <= list.length) iknow.currentFocus.next().delayedFocus();
  						break;
  					}

			}
			
			if(/^(37|39|38|40)$/.test(event.keyCode)) // prevent default scrolling
				event.preventDefault();

		}
		
		// spell quizzing
		if(iknow.session.state == 'quiz' && iknow.session.quiz.type == 'spelling') {
			if(event.keyCode == 13) quiz.checkSpelling();
			if(event.keyCode != 13 && iknow.currentFocus.is('input')) {
				
				iknow.audio.play(iknow.base + 'media/sounds/spell_press.mp3', true);
				
				$('div.dictation-bars > span').eq(iknow.currentFocus.val().length)
					.stop()
					.animate({ top: '+=10' }, { duration: 300, easing: 'swing' })
					.animate({ top: '-=10' }, { duration: 500, easing: 'easeOutBack' });

			}
		}
		
		// study
		if(iknow.session.state == 'study') {

			switch(event.keyCode) {
				case 37:
					var next = $('#tabs ul li.ui-tabs-selected').prevAll(':not(.ui-state-disabled)');
					if(next.length) $('#tabs').tabs('select', $('#tabs ul li').index(next[0]));
					break;
				case 39:
					var next = $('#tabs ul li.ui-tabs-selected').nextAll(':not(.ui-state-disabled)');
					if(next.length) $('#tabs').tabs('select', $('#tabs ul li').index(next[0]));
					break;
				case 13: // since the focus needs to be on the extra info container for native scrolling, detect that
					if(iknow.currentFocus.is('.extra-info'))
						$('div.session-footer-panel div.right-button').find("a").trigger('click');
					break;
			}
			
		}
		
	});
	
	//all hover and click logic for buttons
	$(".fg-button:not(.ui-state-disabled, .ui-hover-disabled),")
	.live('mouseover', function() {
		if($(this).is('button'))
			$(this).delayedFocus();
		else
			$(this).addClass("ui-state-hover"); 
	})
	.live('mouseout', function(){ 
		$(this).removeClass("ui-state-hover"); 
	})
	.live('mousedown', function(){
			$(this).parents('.fg-buttonset-single:first').find(".fg-button.ui-state-active").removeClass("ui-state-active");
			if( $(this).is('.ui-state-active.fg-button-toggleable, .fg-buttonset-multi .ui-state-active') ){ $(this).removeClass("ui-state-active"); }
			else { $(this).addClass("ui-state-active"); }	
	})
	.live('mouseup', function(){
		if(! $(this).is('.fg-button-toggleable, .fg-buttonset-single .fg-button,  .fg-buttonset-multi .fg-button') ){
			$(this).removeClass("ui-state-active");
		}
	});
	

	// card flip (small)
    function mySideChange(front) {
        if (front) {
            
			$('div.item-card-inner-cue, div.border-front, div.item-progress', this.parentNode).show();
			$('div.item-card-inner-response, div.border-back', this.parentNode).hide();

            $('div.small-card-inner', this.parentNode).removeClass('small-card-back').addClass('small-card-front');

        } else {

			$('div.item-card-inner-cue, div.border-front, div.item-progress', this.parentNode).hide();
			$('div.item-card-inner-response, div.border-back', this.parentNode).show();
            $(this).parent().find('div.small-card-inner').removeClass('small-card-front').addClass('small-card-back');
        }
    }

    $('div.small-card').live('click', function () {
		if($('div.item-card-inner-cue', this).is(':visible')) {
			$(this).find('> div').stop().rotate3Di('flip', 250, {direction: 'clockwise', sideChange: mySideChange});
		} else {
			$(this).find('> div').stop().rotate3Di('unflip', 250, {sideChange: mySideChange});
		}
	});	

	
	//card flip
	$("div.large-card").live('click', function(){
    
    
		var self = $(this),
		timeout = 40;
	  
	  if (self.is('.session-recall')) return false;
	  
		// create the flipper image, hide the actual card
		self.css("visibility","hidden");
		var position = self.position();
		var flipper = $('<div class="flipper"></div>')
			.css({
				background: 'url('+iknow.base+'../vendor/smartfm/smartness/images/ui_card_flip.png) no-repeat 0 0',
				width:this.offsetWidth + (this.offsetWidth/8) ,
				height: this.offsetHeight,
				position: 'absolute',
				top: position.top,
				left: position.left - (this.offsetWidth/16)
			})
			.appendTo(this.parentNode);
	  
		// animate flipping through sprites
		setTimeout(function(){
			flipper.css("background-position", "0 -400px"); 
			setTimeout(function(){
				flipper.css("background-position", "0 -800px"); 
				setTimeout(function(){
					flipper.css("background-position", "0 -1200px"); 
					setTimeout(function(){
						flipper.css("background-position", "0 -1600px");
						setTimeout(function(){
							flipper.remove();
							$("div.item-card-inner-response").toggle();
							$("div.item-card-inner-cue").toggle();
							self.css("visibility", "visible");
						}, timeout);
					}, timeout);
				}, timeout);
			}, timeout);
		}, timeout);

	});
	
});