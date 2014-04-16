mediaelement-overlay
====================

Extends MediaElement.js (http://mediaelementjs.com/) to allow videos to be opened in an overlay by clicking on a link with a href that contains the path to a video.

## Overlay options
- overlayTriggerClass = class of the url to trigger video overlay 
- videoWidth = width of video (default is 962)
- videoHeight = height of video (default is 541)
- skinClass = class of any skin to be used (default is none)
- autoplay = boolean for whether to autoplay the video in the overlay (default is true)

## Usage

The code below will open a video in an overlay when the link with className "my-classname" is clicked.
    
        <a href="/pathtovideo" class="my-classname">Open video in an overlay</a>
    
        <script>
            var mejs = mejs || {};
        
            mejs.OverlayOpts = {
                overlayTriggerClass: 'my-classname',
                videoWidth: 962,
                videoHeight: 541,
                skinClass: 'my-player-skin',
                autoplay: true
            };
        </script>
        
        <script src="mediaelement-overlay.js"></script>
