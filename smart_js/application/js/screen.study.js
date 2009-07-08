var study = {
  
  templates: {
    
    flipsideText: function(side) {
      return preview.templates.cardText(side);
    },
    
    flipside: function(side) {

      var part = iknow.session.item[side];
      var html = '<div style="'+(side=="response" ? "display:none;":"")+'" class="item-card-inner-'+side+'   cue-'+part.type+'-quiz"><div class="item-'+side+'">';
        
        if(part.content.sound)
          html += '<span class="'+side+'-audio"><a href="'+part.content.sound+'" class="fg-button ui-state-default ui-corner-all">►</a></span>';
        
        if(part.type == '' || part.content.text)
          html += study.templates.flipsideText(part);
        
        if(part.content.image) {
          
          var data = smart.session.preloaded[part.content.image], style = '';
          data = { height: data.height, width: data.width };

          iknow.constrainImage(data, iknow.alignments.study);
          style += 'width: '+data.width+'px;';
          style += 'height: '+data.height+'px;';  
            
          // center image
          style += 'top: ' + (iknow.alignments.study.height - data.height)/2 + 'px;';
          style += 'left: ' + (iknow.alignments.study.width - data.width)/2 + 'px;';        

          html += '<span class="'+side+'-image"><img style="'+style+'" src="'+part.content.image+'"></span>';
          
        }
      html += '</div></div>';
      
      return html;
      
    },
    
    sentenceText: function(sentence) {

      var html = '';

      switch(sentence.language) {
    
        case 'ja':
      
          switch(iknow.mode) {
        
            case 'full':
              html += '<span class="sentence-text">'+sentence.text+'</span>';
              if(sentence.transliterations['Hira']) html += '<span class="transliteration">'+sentence.transliterations['Hira']+'</span>';
              break;
          
            case 'simple':
              html += '<span class="sentence-text">'+(!sentence.text.hasKanji() ? sentence.text : sentence.transliterations['Hira'])+'</span>';
              break;
          
            case 'latin':
              html += '<span class="sentence-text">'+sentence.transliterations['Latn']+'</span>';
              html += '<span class="transliteration">'+(!sentence.text.hasKanji() ? sentence.text : sentence.transliterations['Hira'])+'</span>';
              html += '</span>';
              break;
        
          }
      
          break;
      
        case 'zh-CN':

          switch(iknow.mode) {

            case 'full':

              html += '<span class="sentence-text">'+sentence.text+'</span>';
              html += '<span class="transliteration">'+sentence.transliterations['Latn']+'</span>';
              break;

            case 'simple':
            case 'latin':

              html += '<span class="sentence-text">'+sentence.transliterations['Latn']+'</span>';
              break;

          }

          break;
      
        default:
          html += '<span class="sentence-text">'+sentence.text+'</span>';
          break;
    
      }
  
      return html;

    },
    
    sentence: function(sentence) {
      
      var html = '<div lang="'+sentence.language+'" xml:lang="'+sentence.language+'" id="sentence_'+sentence.id+'" class="session-sentence clr">';
      
      if(sentence.image)
        html += '<img src="'+sentence.image+'" />';
            
      if(sentence.sound)
        html += '<a href="'+sentence.sound+'" class="fg-button ui-state-default ui-corner-all">►</a>';
               
      html += '<p class="session-sentence-text">';
      html += study.templates.sentenceText(sentence);
      html += '</p>';
                
      html += '<div class="attribution License">';
      html += '<span class="created_by vcard">'+smart.t('created-by')+': <a href="http://smart.fm/user/'+sentence.author.id+'">'+sentence.author.name+'</a></span>';
      html += ' <span class="vcard from">'+smart.t('sentence-source')+': '+sentence.author.name+'</span>';     
      html += '</div>';
      
      html += '</div>';
      
      return html;      
      
    }
    
  },
  
  populateStudyTab: function() {

    // fill the study tab
    $("#item-card")
      .css('display','none')
      .html(study.templates.flipside('response') + study.templates.flipside('cue'));
    
    //Fly over animation for studying
    var item = iknow.session.item;
    
		$('div.flyover').remove();
		$('<div class="flyover">'+(item.cue.type == 'image' ? '<img src="'+item.cue.content.image+'">' : study.templates.flipsideText(item.cue))+'</div>')
		.css({ opacity: 0 })
      .appendTo($("#item-card").parent())
      .animate({ opacity: 1 }, { duration: 1000, easing: 'easeOutExpo' })
      .animate({ opacity: 0 }, { duration: 1000, easing: 'easeInExpo', complete: function() {
				$(this).css({ display: "none" });
        $(this)
          .clone().appendTo(this.parentNode)
          .html((item.response.type == 'image' ? '<img src="'+item.response.content.image+'">' : study.templates.flipsideText(item.response)))
					.css({ display: "block" })
          .animate({ opacity: 1 }, { duration: 1000, easing: 'easeOutExpo' })
          .animate({ opacity: 0 }, { duration: 1000, easing: 'easeInExpo', complete: function() {
          
            $('div.flyover:eq(1)')
              .addClass(item.cue.type+"-side-1")
              .animate({ opacity: 1 }, { duration: 1000, easing: 'easeOutExpo' })
              
            $('div.flyover:eq(0)')
	            .addClass(item.cue.type+"-side-0")
							.css({ display: "block" })
              .animate({ opacity: 1 }, { duration: 1000, easing: 'easeOutExpo', complete: function() {
                setTimeout( function(){
										$('div.flyover').animate({ opacity: 0 }, {duration:100, easing: 'easeOutQuad', complete:function() { 
		                  $(this).remove();                 
		                  $('#item-card')
		                    .css({ opacity: 0, display: "block", visibility: 'visible' })
		                    .animate({ opacity: 1 }, 100);
		                   }
		                  });
								}, 1000);
              } });
          }
          });
      }
      });
  },
  
  populateSentencesTab: function() {
    
    var sentences = iknow.session.item.cue.related.sentences;
    
    //If there aren't any sentences, hide the sentence tab
    if(!sentences)
      return $('#tabs').tabs('disable', 1);
      
    $('div.session-sentences-inner').empty();
    for (var i=0; i < sentences.length; i++) {
      $(study.templates.sentence(sentences[i]))
        .appendTo('div.session-sentences-inner');
    };
    
    $('#tabs').tabs('enable', 1);
    
  },
  
  populateExtraInfoTab: function() {
    
    // Always disable the extra tab
    if(!iknow.session.item.cue.related.annotation)
      return $('#tabs').tabs('disable', 2);
    
    $('div.extra-info-inner').html(iknow.session.item.cue.related.annotation);
    $('#tabs').tabs('enable', 2);
    
  },
  
  populateQuizPracticeTab: function() {
    //TODO
  },
  
  populate: function() {
    
    // We strangely need to relcalculate the width/height of the alignment container upon first show
    if($('#calculate-study').length) {
      var s = $('#calculate-study');
      study.container.css('visibility', 'hidden').show();
      iknow.alignments.study = { width: s[0].offsetWidth, height: s[0].offsetHeight };
      study.container.hide().css('visibility', 'visible');
    }
    
    study.populateStudyTab();
    study.populateSentencesTab();
    study.populateExtraInfoTab();
    study.populateQuizPracticeTab();
    
    iknow.currentPane = study.container.show();
    $('#tabs').tabs('select', 0);
    
    $('div.session-footer-panel div.right-button').find("a").text(smart.t('next')).end().show().find('a').delayedFocus();
    
  }
  
};

$(document).ready(function() {
  
  // initialize tabs for study screen
  $("#tabs").tabs({
    select: function(e, ui) {
      if(ui.index == 2) {
        $('div.extra-info').delayedFocus();
      }
    }
  });
  
  // find and cache container
  study.container = $("div.study-panel");
    
});