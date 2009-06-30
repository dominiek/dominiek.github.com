var preview = {
	
	templates: {
		
		card: function(item) {
			
			var html = '<div class="item-card small-card">';

				if(item.progress.percentage == 0) html += '<span class="new-item leaf-border-small">New</span>';
				
				html += '<div class="small-card-inner">';
				
				// Front side (cue)
				html += '<div class="leaf-border border-front"><span></span></div>';
				html += '<div class="item-card-inner-cue '+item.cue.type+'-item">';
					html += '<div class="item-cue">';

						if(item.cue.content.sound) {
							html += '<span class="cue-audio">';
								html += '<a href="' + item.cue.content.sound+'" class="fg-button ui-state-default ui-corner-all">►</a>';
							html += '</span>';
						}

						if(item.cue.type == 'text' || item.cue.content.text) {
							html += iknow.getTextMarkup(item.cue);
						}

						if(item.cue.content.image) {
							var data = smart.session.preloaded[item.cue.content.image];
							if(data) html += '<span class="cue-image leaf-corners-front"><img class="" '+(data.width < iknow.alignments.preview.width ? 'style="width: '+iknow.alignments.preview.width+'px; height: '+(data.width * (iknow.alignments.preview.width/data.width))+'px;" ' : '')+'src="' + item.cue.content.image + '"></span>';
						}

					html += '</div>';
				html += '</div>';
				
				
				// Back side (response)
				html += '<div class="leaf-border border-back" style="display:none;"><span></span></div>';
				html += '<div class="item-card-inner-response '+item.response.type+'-item" style="display: none;">';
					html += '<div class="item-cue">';

						if(item.response.content.sound) {
							html += '<span class="cue-audio">';
								html += '<a href="' + item.response.content.sound+'" class="fg-button ui-state-default ui-corner-all">►</a>';
							html += '</span>';
						}
						
						if(item.response.type == 'text' || item.response.content.text) {
							html += iknow.getTextMarkup(item.response);
						}

						if(item.response.content.image) {
							var data = smart.session.preloaded[item.response.content.image];
							html += '<span class="cue-image leaf-corners-back"><img '+(data.width < iknow.alignments.preview.width ? 'style="width: '+iknow.alignments.preview.width+'px; height: '+(data.width * (iknow.alignments.preview.width/data.width))+'px;" ' : '')+'src="' + item.response.content.image + '"></span>';
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

		
		// show the right button and name it 'start', then focus it
		if(end) {
			$('div.session-footer-panel div.right-button').hide();
		} else {
			$('div.session-footer-panel div.right-button').find("a").text('Start').end().show().find('a').delayedFocus();
		}

	}
	
};