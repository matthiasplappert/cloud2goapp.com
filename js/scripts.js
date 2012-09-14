var video;

function init(v) {
    // Save instance
    video = v;
    
    // Add click function to play
    $('#iphone .play').click(function() {
        video.play();
    });
    
    // Placeholder plugin
    $('#notify_form_email').placeholder({
        'className' : 'placeholder',
        'attr' : 'title'
    });
    
    // Notify in fancybox
    $('#notify_button').fancybox({
    	'titleShow'		: false,
    	'showCloseButton' : false,
    	'scrolling'		: 'no',
    	'showNavArrows' : false,
        'overlayOpacity' : '0.8',
        'overlayColor' : '#000',
        'onClosed' : function() {
            // Resume video
            video.resume();
            $('#notify_error').hide();
        },
        'onStart' : function() {
            // Pause video
            video.pause();
        }
    });
    
    // Form submit callback
    $('#notify_form').bind('submit', function() {
        if ($('#notify_form_email').val().length < 1 || $('#notify_form_email').val() == $('#notify_form_email').attr('title')) {
    	    $('#notify_error').show();
    	    $.fancybox.resize();
    	    return false;
    	}
    	
    	// Disable
    	$('#notify_form_button').attr('disabled', 'disabled').css('opacity', '0.5');
    	
    	// Show activity
    	$.fancybox.showActivity();
    
    	$.ajax({
    		type   : 'POST',
    		cache  : false,
    		url	   : 'notify.php',
    		data   : $(this).serializeArray(),
    		success: function(data) {
    		    // Adjust button
    	  	    $('#notify_button').html('You’ll be<br /><strong>Notified</strong>');
       		    $('#notify_button').attr('href', '#');
       		    
    		    $.fancybox.close();
    		}
    	});
    	
    	return false;
    });
}
