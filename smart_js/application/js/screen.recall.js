var recall = {
  
  templates: {},

  populate: function() {

    var q = iknow.session.quiz;

	// get the question on the recall screen
    $('p.session-recall-question:eq(0)').html(q.content.question);	


    var html = '';

    if(q.content.image) {
	
		var data = smart.session.preloaded[q.content.image];
		data = { height: data.height, width: data.width };
		var style = '';
		
		// resize image
		var prop = data.width >= data.height ? 'width' : 'height';
		if(data[prop] > (prop == 'width' ? 793 : 429)) { //TODO: get dynamic parent height
			data[prop] = (prop == 'width' ? 793 : 429);
			data[prop == 'height' ? 'width' : 'height'] = data[prop == 'height' ? 'width' : 'height'] * (data[prop] / smart.session.preloaded[q.content.image][prop]);
			style += prop + ':' + data[prop] + 'px;';
		}	
			
		// center image
		style += 'top: ' + (429 - data.height)/2 + 'px;';
		style += 'left: ' + (793 - data.width)/2 + 'px;';	
	
	
		html += '<img style="'+style+'" src="'+q.content.image+'">';
	}
	
	if(q.type == 'text' || q.content.text)
		html += iknow.getTextMarkup(iknow.session.item[q.config.direction], q);
		
	if(q.content.sound)
		iknow.audio.play(q.content.sound);

    $('div.session-recall-inner div.item-cue')
		.removeClass('item-cue-text item-cue-image item-cue-sound item-cue-video')
		.addClass('item-cue-'+q.content.type)
		.html(html);
    
    $('div.session-window').addClass('recall-screen');
    
    $("div.session-recall").show();
    $('div.session-footer-panel div.fg-buttonset').show().find('button:eq(2)').delayedFocus();

  }

};