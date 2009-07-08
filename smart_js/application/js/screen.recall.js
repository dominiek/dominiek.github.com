var recall = {
  
  templates: {},

  populate: function() {

    var q = iknow.session.quiz,
		html = '';

	// get the question onto the recall screen
    $('p.session-recall-question:eq(0)').html(q.getRecallQuestion());

    if(q.side.content.image) {
	
		var data = smart.session.preloaded[q.side.content.image], style = '';
		data = { height: data.height, width: data.width }; // copies the object

		iknow.constrainImage(data, iknow.alignments.recall);
		style += 'width: '+data.width+'px;';
		style += 'height: '+data.height+'px;';
			
		// center image
		style += 'top: ' + (iknow.alignments.recall.height - data.height)/2 + 'px;';
		style += 'left: ' + (iknow.alignments.recall.width - data.width)/2 + 'px;';	
	
		html += '<img style="'+style+'" src="'+q.side.content.image+'">';
		
	}
	
	if(q.side.type == 'text' || q.side.content.text)
		html += q.getRecallMarkup();
		
	if(q.direction == 'forward' && q.side.content.sound && q.type != "spelling")
		iknow.audio.play(q.side.content.sound);

    $('div.session-recall-inner div.item-cue')
		.removeClass('item-cue-text item-cue-image item-cue-sound item-cue-video')
		.addClass('item-cue-'+q.side.type)
		.html(html);
    
    $('div.session-window').addClass('recall-screen');
    
    iknow.currentPane = $("div.session-recall").show();
    $('div.session-footer-panel div.fg-buttonset').show().find('button:eq(2)').delayedFocus();

  }

};