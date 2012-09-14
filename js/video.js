function Video(elementName, timing, duration, frames) {
    // General vars
    this.numberOfItems  = timing.length;
    this.elementName    = elementName;
    this.viewportWidth  = $(this.elementName).width();
    this.listWidth      = $(this.elementName + ' .navigator li').width() + parseInt($(this.elementName + ' .navigator li').css('margin-left').replace('px', '')) + parseInt($(this.elementName + ' .navigator li').css('margin-right').replace('px', ''));
    this.xPosition      = Math.ceil((this.viewportWidth - this.listWidth * this.numberOfItems) / 2.0);
    this.currentScene   = 0;
    this.sceneTiming    = timing;
    this.supportsNativeVideo  = !!document.createElement('video').canPlayType;
    this.playing        = false;
    this.paused         = false;
    
    // HTML5 vars
    this.h5BlockUpdates = false;
    
    // Quicktime vars
    this.qtFactor     = frames / duration;
    this.qtFrames     = frames;
    this.qtPauseFrame = -1;
    this.qtSyncTimer;
    
    // Create video elements
    if (this.supportsNativeVideo == false) {
        // Add object element
        $('#videocontainer').empty().append('<object width="242" height="362" classid="clsid:02BF25D5-8C17-4B23-BC80-D3488ABDDC6B" codebase="http://www.apple.com/qtactivex/qtplugin.cab"><param name="src" value="img/video.mov" /><param name="autoplay" value="true" /><param name="controller" value="false" /><param name="kioskmode" value="true" /><embed src="img/video.mov" type="video/quicktime" autoplay="true" controller="false" loop="false" kioskmode="true" id="video" width="242" height="362" href="javascript:void(0);"></embed></object>');
    }

    // Quicktime timer observation. Required for window.setInterval.
    var objectRef = this;
    var qtIntervalWrapper = function() {
        // Current frame
        currentFrame = $(objectRef.elementName + ' embed')[0].GetTime();
        if (currentFrame >= objectRef.qtFrames - 100) {
            objectRef.stop();
        } else {
	        objectRef.updateSceneInfo(currentFrame / objectRef.qtFactor);
	    }
    };
    
    var h5UnblockUpdates = function() {
        // Unblock
        objectRef.h5BlockUpdates = false;
    }

    // Modify width of viewport list element
    $(elementName + ' .viewport ul').css('width', this.numberOfItems * this.viewportWidth + 'px');

    // Get title attribute and set it to infobox
    $(this.elementName + ' .infobox .inner').text($(this.elementName + ' .navigator li:nth-child(1) a span').text());
    
    // Event listeners
    if (this.supportsNativeVideo == true) {
	    $(this.elementName + ' video').bind('play', function() {
    	    objectRef.playing = true;
        	objectRef.paused = false;
	    });
    
	    $(this.elementName + ' video').bind('pause', function() {
    	    objectRef.paused = true;
        	objectRef.playing = false;
	    });
    
	    $(this.elementName + ' video').bind('ended', function() {
    	    objectRef.stop();
        
    		objectRef.paused = false;
	    	objectRef.playing = false;
	    });
    
	    $(this.elementName + ' video').bind('timeupdate', function() {
	        if (objectRef.h5BlockUpdates == false) {
		        currentTime = $(objectRef.elementName + ' video')[0].currentTime;
    			objectRef.updateSceneInfo(currentTime);
    		}
	    });
	}
    
    this.updateSceneInfo = function(currentTime) {
        if (this.playing == true) {
            // Get matching scene
            newScene = 0;
            for (i = 0; i < this.sceneTiming.length; i++) {
                if (i == this.sceneTiming.length - 1 && this.sceneTiming[i] <= currentTime) {
                    // Last scene
                    newScene = i;
                    break;
                } else if (this.sceneTiming[i] <= currentTime && this.sceneTiming[i + 1] > currentTime) {
                    // Found scene
                    newScene = i;
                    break;
                }
            }
                
            if (newScene != this.currentScene) {
                // Scene changed
                this.currentScene = newScene;
                
                // Get title attribute and set it to infobox
                title = $(this.elementName + ' .navigator li:nth-child(' + (newScene + 1) + ') a span').text();
                $(this.elementName + ' .infobox .inner').text(title);
            
                // Adjust background-position (animated)
                $(this.elementName + ' .infobox').animate({'background-position':(this.xPosition + newScene * this.listWidth) + 'px 0px'}, 200);
            
                // Change selection state
                $(this.elementName + ' .navigator li.active').removeClass('active');
                $(this.elementName + ' .navigator li:nth-child(' + (newScene + 1) + ')').addClass('active');
            }
        }
    };

    this.play = function() {
        // General operations. Hide play button.
        $(this.elementName + ' .play').css('display', 'none');
        
        // Adjust height to show control panel
        height = $(this.elementName).css('max-height');
        $(this.elementName).animate({'height':height}, 500);
        
        if (this.supportsNativeVideo == true) {
            // Use HTML5 video tag. Show player and play
            $(this.elementName + ' video').css('display', 'block')[0].play();
        } else {
            // Use QuickTime plugin. Show player
	    	$(this.elementName + ' object').css('display', 'block');
        
    	    if (this.playing == false) {
	    	    // Set value and start timer
    	    	this.playing = true;
    	    	this.paused = false;
	        	this.qtSyncTimer = window.setInterval(qtIntervalWrapper, 200);
		        qtIntervalWrapper();
	    	}
	    }
    };
    
    this.playAndJumpToScene = function(scene) {
        // Play
        this.play();
        
        if (this.currentScene != scene) {
            // Jump to scene
            if (this.supportsNativeVideo == true) {
                // Disable lock, if still set
                this.h5BlockUpdates = false;
                
                time = this.sceneTiming[scene];
                $(this.elementName + ' video')[0].currentTime = time;
                this.updateSceneInfo(time);
                
                // Block updates to avoid weird behavior in Safari
                this.h5BlockUpdates = true;
                window.setTimeout(h5UnblockUpdates, 200);
            } else {
                frames = this.sceneTiming[scene] * this.qtFactor;
                $(this.elementName + ' embed')[0].SetTime(frames);
            }
        }
    };

    this.stop = function() {
        // General operations
        if (this.playing == true) {
            // Show play button
            $(this.elementName + ' .play').css('display', 'block');
            
            // Adjust height to hide control panel
            height = $(this.elementName).css('min-height');
            $(this.elementName).animate({'height':height}, 500);
        }
        
        if (this.supportsNativeVideo == true) {
            // HTML5
            if (this.playing == true) {
                // Hide player and stop playback
                $(this.elementName + ' video').css('display', 'none')[0].stop();
            }
        } else {
            // Quicktime
	        if (this.playing == true) {
    	        // Hide player
        	    $(this.elementName + ' object').css('display', 'none');
            
	            // Set value and stop sync timer
            	this.playing = false;
            	this.paused = false;
    	        window.clearInterval(this.qtSyncTimer);
    	    }
        }
    };
    
    this.pause = function() {
        if (this.playing == true) {
	        if (this.supportsNativeVideo == true) {
    	        // HTML5
                $(this.elementName + ' video')[0].pause();
            } else {
	            // Quicktime
        		this.qtPauseFrame = $(this.elementName + ' embed')[0].GetTime();
            	this.stop();
            	
            	// Adjust values
            	this.paused = true;
            	this.playing = false;
            }
        }
    };
    
    this.resume = function() {
        if (this.paused == true) {
            if (this.supportsNativeVideo == true) {
                // HTML5
                $(this.elementName + ' video')[0].play();
            } else {
                // Quicktime
                this.play();
                $(this.elementName + ' embed')[0].SetTime(this.qtPauseFrame);
                this.qtPauseFrame = -1;
            }
        }
    };
}