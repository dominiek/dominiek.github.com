var preview = {
	
	templates: {
		
		card: function(item) {
			
			var html = '<div class="item-card small-card"><div class="small-card-inner ui-corner-all">';

				if(item.progress.percentage == 0) html += '<span class="new-item">New</span>';
				
				// Front side (cue)
				html += '<div class="item-card-inner-cue '+item.cue.type+'-item">';
					html += '<div class="item-cue">';

						if(item.cue.content.sound) {
							html += '<span class="cue-audio">';
								html += '<a href="'+item.cue.content.sound+'" class="fg-button ui-state-default ui-corner-all">play</a>';
							html += '</span>';
						}

						if(item.cue.content.text) {
							html += '<span class="cue-text">'+item.cue.content.text;
							if(item.cue.related.character) { //if it's a non roman language, show the kanji/character
								html += '<em>【'+item.cue.related.character+' 】</em>';
							}
							html += '</span>';
						}

						if(item.cue.content.image) {
							var data = smart.session.preloaded[item.cue.content.image];
							html += '<span class="cue-image"><img '+(data.width < iknow.alignments.preview.width ? 'style="width: '+iknow.alignments.preview.width+'px; height: '+(data.width * (iknow.alignments.preview.width/data.width))+'px;" ' : '')+'src="' + item.cue.content.image + '"></span>';
						}

					html += '</div>';
				html += '</div>';
				
				
				// Back side (response)
				html += '<div class="item-card-inner-response '+item.response.type+'-item" style="display: none;">';
					html += '<div class="item-cue">';

						if(item.response.content.sound) {
							html += '<span class="cue-audio">';
								html += '<a href="'+item.response.content.sound+'" class="fg-button ui-state-default ui-corner-all">play</a>';
							html += '</span>';
						}

						if(item.response.content.text) {
							html += '<span class="cue-text">'+item.response.content.text+' </span>';
							if(item.response.related.character) { //if it's a non roman language, show the kanji/character
								html += '<em>【'+item.response.related.character+' 】</em>';
							}
							html += '</span>';
						}

						if(item.response.content.image) {
							var data = smart.session.preloaded[item.response.content.image];
							html += '<span class="cue-image"><img '+(data.width < iknow.alignments.preview.width ? 'style="width: '+iknow.alignments.preview.width+'px; height: '+(data.width * (iknow.alignments.preview.width/data.width))+'px;" ' : '')+'src="' + item.response.content.image + '"></span>';
						}

					html += '</div>';
				html += '</div>';				
				
				// Item progress
				html += '<div class="item-progress">';
					html += '<span>'+item.progress.percentage+'%</span>';
					html += '<div class="progress-bar"></div>';
				html += '</div>';
			html += '</div></div>';

			return html;
			
		}
		
	},
	
	populate: function(end) {

		$("div.session-preview").show();

		if(end) {
			//Do some funky stuff if preview is used for the end screen
		}

		// append preview cards to preview
		var container = $("div.session-preview-inner").empty();
		for (var i=0; i < iknow.session.items.length; i++) {
			var item = $(preview.templates.card(iknow.session.items[i])).appendTo(container);
			$(".progress-bar", item).progressbar({ value: iknow.session.items[i].progress.percentage });
		};

	    function mySideChange(front) {
	        if (front) {
	            $(this).parent().find('div.item-card-inner-cue').show();
	            $(this).parent().find('div.item-card-inner-response').hide();

	        } else {
	            $(this).parent().find('div.item-card-inner-response').show();
	            $(this).parent().find('div.item-card-inner-cue').hide();
	        }
	    }

	    $('div.small-card').hover(
	        function () {
				
				//if($('span.cue-audio a', this).length)
					//iknow.audio.play($('span.cue-audio a', this).attr('href'));
				
				$(this).find('> div').stop().rotate3Di('flip', 250, {direction: 'clockwise', sideChange: mySideChange});
	        },
	        function () {
	            $(this).find('> div').stop().rotate3Di('unflip', 500, {sideChange: mySideChange});
	        }
	    );

		
		// show the right button and name it 'start', then focus it
		if(end) {
			$('div.session-footer-panel div.right-button').hide();
		} else {
			$('div.session-footer-panel div.right-button').find("a").text('Start').end().show().find('a').delayedFocus();
		}

	}
	
};