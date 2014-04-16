'use strict';
/*!
* mediaelement-overlay.js
* https://github.com/wildavies/
* https://github.com/wildavies/mediaelement-overlay
*
* Extends MediaElement.js (http://mediaelementjs.com/) to allow videos to be opened in an overlay.
*
* Copyright 2010-2013, Wil Davies (http://www.wildavies.com/)
* License: MIT
*
*/
(function ($) {
    /*
        mejs.MepDefaults
        -----------------------------------------------------------
        - Defaults for the overlay
            - overlayTriggerClass = class of the link used to trigger video overlay 
            - videoWidth = width of video
            - videoHeight = height of video
            - skinClass = class of any skin to be used (default is none)
            - autoplay = boolean for whether to autoplay the video in the overlay (default is true)
        - Overwrite these using the following in your html page before this script see example below:
            <script>
                var mejs = mejs || {};

                mejs.OverlayOpts = {
                    overlayTriggerClass: 'my-classname'
                };
            </script>
    */    
    $.extend(mejs.MepDefaults, {
        overlayTriggerClass: 'video-link',
        videoWidth: 962,
        videoHeight: 541,
        skinClass: '',
        autoplay: true
    }, mejs.OverlayOpts);

    $.extend(MediaElementPlayer.prototype, {
        Overlay: {
            /*
                init
                -----------------------------------------------------------
                - Calls function to build the video overlay
                - Adds click event to open video in overlay
            */
            init: function () {
                var self = this;

                $.extend(self, {
                    videoLink: mejs.MepDefaults.overlayTriggerClass,
                    videoWidth: mejs.MepDefaults.videoWidth,
                    videoHeight: mejs.MepDefaults.videoHeight,
                    skinClass: mejs.MepDefaults.skinClass,
                    autoPlay: mejs.MepDefaults.autoplay
                });

                self.buildOverlay();

                // Click event to open video overlay
                var elements = document.getElementsByTagName('a');
                for(var i = 0; i < elements.length; i++) {
                    var element = elements[i];

                    // Regex for checking for videoclass name
                    var regex = new RegExp(self.videoLink, 'g');

                    // if the class name of the link contains the video link class (self.videoLink) add click event
                    if(element.className.match(regex)) {
                        element.onclick = function() {      
                            self.videoURL = this.href;               
                            self.buildVideo();
                            return false;
                        }
                    }
                }
            },
            /*
                buildOverlay
                -----------------------------------------------------------
                - Creates transparent overlay and adds to the page
            */
            buildOverlay: function () {
                var self = this;

                // Create overlay div
                var overlay = document.createElement('div');
                overlay.id = 'video-overlay';

                // Set and apply CSS for overlay div
                var i,
                    css = {
                        background: '#000',
                        left: '0',
                        top: '0',
                        position: 'fixed',
                        zIndex: '999999',
                        filter: 'alpha(opacity=70)',
                        opacity: '0.7',
                        width: '100%',
                        height:'100%',
                        cursor:'pointer',
                        display:'none'
                    };

                for (i in css) {
                    overlay.style[i] = css[i];
                }

                // Add overlay div to page
                document.body.appendChild(overlay);

                document.getElementById('video-overlay').onclick = function() {
                    self.closeVideo();
                    return false;
                }
            },
            /*
                toggleOverlay
                -----------------------------------------------------------
                - Shows / hides overlay depending on current state
            */
            toggleOverlay: function () {
                document.getElementById('video-overlay').style.display = ((document.getElementById('video-overlay').style.display != 'none') ? 'none' : 'block');
            },
            /*
                buildVideo
                -----------------------------------------------------------
                - Checks if we have an instance of MediaElementPlayer and destroys it
                - Creates a video element and adds to the page
                - Initialises MediaElementPlayer on the new video element
            */
            buildVideo: function () {
                var self = this;

                if (typeof self.videoPlayer !== 'undefined') {
                    self.destroyVideo();
                }

                // Create video element which MediaElementPlayer will be intialised on 
                var videoComponent = document.createElement('video');
                videoComponent.id = 'video-overlay-player';

                // Add skin class if being used
                if (typeof self.skinClass !== 'undefined'){
                    videoComponent.className = self.skinClass;
                }
                videoComponent.src = self.videoURL;

                // Set and apply html attributes for video element (width and height used by MediaElementPlayer)
                var i,
                    attributes = {
                        'width': self.videoWidth + 'px',
                        'height': self.videoHeight + 'px'
                    };

                for (i in attributes) {
                    videoComponent.setAttribute(i, attributes[i]);
                }

                // Add video element to page
                document.body.appendChild(videoComponent);

                if (typeof MediaElementPlayer === 'function') {
                    // Initalise MediaElementPlayer - success callback then positions player 
                    self.videoPlayer = new MediaElementPlayer('#video-overlay-player', {
                        startVolume: 0.8,
                        // enables Flash and Silverlight to resize to content size
                        enableAutosize: true,
                        // the order of controls you want on the control bar (and other plugins below)
                        features: ['playpause', 'progress', 'current', 'duration', 'tracks', 'volume', 'fullscreen', 'overlay'],
                        // Hide controls when playing and mouse is not over the video
                        alwaysShowControls: false,
                        // force iPad's native controls
                        iPadUseNativeControls: false,
                        // force iPhone's native controls
                        iPhoneUseNativeControls: false,
                        // force Android's native controls
                        AndroidUseNativeControls: false,
                        // forces the hour marker (##:00:00)
                        alwaysShowHours: false,
                        // show framecount in timecode (##:00:00:00)
                        showTimecodeFrameCount: false,
                        // used when showTimecodeFrameCount is set to true
                        framesPerSecond: 25,
                        // turns keyboard support on and off for this instance
                        enableKeyboard: true,
                        // when this player starts, it will pause other players
                        pauseOtherPlayers: true,
                        // array of keyboard commands
                        keyActions: [],
                        success: function (media, domNode, player) {
                            // Check flash video is ready before opening in overlay
                            if (media.pluginType === 'flash') {
                                // Listen for when the video can play
                                media.addEventListener('canplay', function() {
                                    // Open video in overlay
                                    self.openVideo(player);
                                }, false);
                            }
                            else{
                                // Open video in overlay
                                self.openVideo(player);
                            }
                        }
                    });
                }
            },
            /*
                buildCloseButton
                -----------------------------------------------------------
                - Creates video close button and adds to the page
                - Binds click event to close overlay and destroy video
            */
            buildCloseButton: function () {
                var self = this;

                // Set and apply CSS for video close button
                var closeButton = document.createElement('a');
                closeButton.href = '#';
                closeButton.id = 'close-video';
                closeButton.title = 'Close video';
                closeButton.innerHTML = 'Close video';

                // Append close button to the video    
                document.getElementById(self.videoID).appendChild(closeButton);

                // Add click event to close video
                document.getElementById('close-video').onclick = function() {
                    self.closeVideo();
                    return false;
                }
            },
            /*
                openVideo
                -----------------------------------------------------------
                - Applies CSS to MediaElementPlayer instance based on video width and height to maintain central positioning
                - Animates to the top of the page where the video is positioned
            */
            openVideo: function (player) {
                var self = this;

                // Store id of MediaElementPlayer if it has been passed from MediaElementPlayer success callback
                if (typeof player !== 'undefined') {
                    self.videoPlayer = player;
                    self.videoID = player.id;
                }

                // Show overlay
                self.toggleOverlay();

                // Set and apply CSS for positioning video player
                var i,
                    css = {
                        left: '50%',
                        top: '50%',
                        position: 'fixed',
                        zIndex: '9999999',
                        margin: (self.videoHeight / -2) + 'px 0 0 ' + (self.videoWidth / -2) + 'px'
                    };

                for (i in css) {
                    document.getElementById(self.videoID).style[i] = css[i];
                }

                // Setup close video button
                self.buildCloseButton();

                // Play video
                if(self.autoPlay){
                    self.videoPlayer.play();
                }
            },
            /*
                closeVideo
                -----------------------------------------------------------
                - Called when close button or overlay is clicked
                - Pauses video, closes overlay and destroys the video
            */
            closeVideo: function(){
                var self = this;

                self.videoPlayer.pause();
                // Hide overlay
                self.toggleOverlay();
                self.destroyVideo();
            },
            /*
                destroyVideo
                -----------------------------------------------------------
                - MediaElementPlayer doesn't allow a video instance to have its src updated
                - everytime we load a video we must destroy the instance of MediaElementPlayer
            */
            destroyVideo: function () {
                var self = this;

                // Remove instances of MediaElementPlayer using build in function remove() 
                self.videoPlayer.remove();

                // Remove video element from page
                var node = document.getElementById('video-overlay-player');
                if (node && node.parentNode) {
                    node.parentNode.removeChild(node);
                }
            }
        }
    });
    
    // Initialises the overlay functionality
    MediaElementPlayer.prototype.Overlay.init();
})(mejs.$);