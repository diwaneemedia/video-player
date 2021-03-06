// Supported video player platforms ::
// https://developers.google.com/interactive-media-ads/docs/sdks/html5/compatibility#iphone-footnote

// Sample Tags
// https://developers.google.com/interactive-media-ads/docs/sdks/html5/tags

export default function(playerWrap) {

  let adTagUrl;
  var currentTime = 0;

  let videoContent;
  let playButton;
  let adContainer;

  let linearWidth;
  let linearHeight;
  let nonlinearWidth;
  let nonlinearHeight = 150;

  var adsManager;
  var adsLoader;
  var adDisplayContainer;
  var intervalTimer;


  function init() {
    videoContent = playerWrap.getElementsByClassName('video-in-template')[0];
    adTagUrl = videoContent.dataset.adtagurl;
    //if (!adTagUrl) return;
    adContainer = playerWrap.getElementsByClassName('ad-container')[0];
    //playButton = playerWrap.getElementsByClassName('play')[0];
    videoContent.addEventListener('playButtonClick', (e)=>{
      playAds();
      e.preventDefault()
      playAds = function(){};
    });
    linearWidth = nonlinearWidth = videoContent.offsetWidth;
    linearHeight = videoContent.offsetHeight;
    //console.log(linearWidth, linearHeight)
    videoContent.addEventListener('progress', () => {
      if (!!videoContent.currentTime) { //not null :)
        currentTime = videoContent.currentTime;
      }
    });

    setUpIMA();
  }

  function setUpIMA() {
    // Create the ad display container.
    createAdDisplayContainer();
    // Create ads loader.
    adsLoader = new google.ima.AdsLoader(adDisplayContainer);
    // Listen and respond to ads loaded and error events.
    adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      onAdsManagerLoaded,
      false
    );
    adsLoader.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError,
      false
    );

    // An event listener to tell the SDK that our content video
    // is completed so the SDK can play any post-roll ads.
    var contentEndedListener = function() {
      adsLoader.contentComplete();
      currentTime = 9999999999999999999;
    };
    videoContent.onended = contentEndedListener;

    // Request video ads.
    var adsRequest = new google.ima.AdsRequest();
    adsRequest.adTagUrl = adTagUrl;

    // Specify the linear and nonlinear slot sizes. This helps the SDK to
    // select the correct creative if multiple are returned.
    adsRequest.linearAdSlotWidth = linearWidth;
    adsRequest.linearAdSlotHeight = linearHeight;

    adsRequest.nonLinearAdSlotWidth = nonlinearWidth;
    adsRequest.nonLinearAdSlotHeight = nonlinearHeight;

    adsLoader.requestAds(adsRequest);
  }


  function createAdDisplayContainer() {
    // We assume the adContainer is the DOM id of the element that will house
    // the ads.
    adDisplayContainer = new google.ima.AdDisplayContainer(
      adContainer, videoContent
    );
  }

  function playAds() {
    // Initialize the container. Must be done via a user action on mobile devices.
    videoContent.load();
    adDisplayContainer.initialize();

    try {
      // Initialize the ads manager. Ad rules playlist will start at this time.
      adsManager.init(640, 360, google.ima.ViewMode.NORMAL);
      // Call play to start showing the ad. Single video and overlay ads will
      // start at this time; the call will be ignored for ad rules.
      adsManager.start();
    } catch (adError) {
      // An error may be thrown if there was a problem with the VAST response.
      videoContent.play();
    }
  }

  function onAdsManagerLoaded(adsManagerLoadedEvent) {
    // Get the ads manager.
    var adsRenderingSettings = new google.ima.AdsRenderingSettings();
    adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
    // videoContent should be set to the content video element.
    adsManager = adsManagerLoadedEvent.getAdsManager(
      videoContent, adsRenderingSettings
    );

    // Add listeners to the required events.
    adsManager.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError
    );
    adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
      onContentPauseRequested
    );
    adsManager.addEventListener(
      google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      onContentResumeRequested
    );
    adsManager.addEventListener(
      google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
      onAdEvent
    );

    // Listen to any additional events, if necessary.
    adsManager.addEventListener(
      google.ima.AdEvent.Type.LOADED,
      onAdEvent
    );
    adsManager.addEventListener(
      google.ima.AdEvent.Type.STARTED,
      onAdEvent
    );
    adsManager.addEventListener(
      google.ima.AdEvent.Type.COMPLETE,
      onAdEvent
    );
    adsManager.addEventListener(
      google.ima.AdEvent.Type.SKIPPED,
      onAdEvent
    );
  }

  // A D   E V E N T   H A N D L E R S

  function onAdEvent(adEvent) {
    // Retrieve the ad from the event. Some events (e.g. ALL_ADS_COMPLETED)
    // don't have ad object associated.
    var ad = adEvent.getAd();
    switch (adEvent.type) {
      case google.ima.AdEvent.Type.LOADED:
      {
        // This is the first event sent for an ad - it is possible to
        // determine whether the ad is a video ad or an overlay.
        if (!ad.isLinear()) {
          // Position AdDisplayContainer correctly for overlay.
          // Use ad.width and ad.height.
          videoContent.play();
          playerWrap.classList.add('ad-nonlinear');
        }
        else {
          playerWrap.classList.add('ad-linear');
        }
      }
      break;
      case google.ima.AdEvent.Type.STARTED:
      {
        playerWrap.classList.add('ad-playing');
        // This event indicates the ad has started - the video player
        // can adjust the UI, for example display a pause button and
        // remaining time.
        if (ad.isLinear()) {
          // For a linear ad, a timer can be started to poll for
          // the remaining time.
          intervalTimer = setInterval(function() {
            //currentTime = videoContent.currentTime;
            var remainingTime = adsManager.getRemainingTime();
          }, 300); // every 300ms
          // made in S...
        }
        if (!ad.isLinear()) {
          if (videoContent.shaka) {
            videoContent.shaka.load(videoContent.getAttribute('data-vid'), currentTime).then(()=>{
              videoContent.play();
            });
          }
          if (videoContent.hlsjs) {
            videoContent.hlsjs.attachMedia(videoContent);
            videoContent.play();
          }
        }
      }
      break;
      case google.ima.AdEvent.Type.COMPLETE:
      case google.ima.AdEvent.Type.SKIPPED:
      {
        playerWrap.classList.remove('ad-playing');
        // This event indicates the ad has finished - the video player
        // can perform appropriate UI actions, such as removing the timer for
        // remaining time detection.
        if (ad.isLinear()) {
          if (videoContent.shaka) {
            clearInterval(intervalTimer);
            videoContent.shaka.load(videoContent.getAttribute('data-vid'), currentTime);
          }
          if (videoContent.hlsjs) {
            clearInterval(intervalTimer);
            videoContent.hlsjs.attachMedia(videoContent);
            videoContent.currentTime = currentTime;
            videoContent.play();
          }
        }
      }
      break;
    }
  }

  function onAdError(adErrorEvent) {
    // Handle the error logging.
    console.log(adErrorEvent.getError());
    if (adsManager) {
      adsManager.destroy();
    }
  }

  function onContentPauseRequested() {
    videoContent.pause();
    // This function is where you should setup UI for showing ads (e.g.
    // display ad timer countdown, disable seeking etc.)
    // setupUIForAds();
  }

  function onContentResumeRequested() {
    videoContent.play();
    // This function is where you should ensure that your UI is ready
    // to play content. It is the responsibility of the Publisher to
    // implement this function when necessary.
    // setupUIForContent();

  }

  // Wire UI element references and UI event listeners.
  init();

}
