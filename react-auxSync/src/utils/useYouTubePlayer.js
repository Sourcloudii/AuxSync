import { useState, useEffect, useRef, useCallback } from "react";

let apiLoaded = false;
let apiReadyPromise = null;

function loadYouTubeAPI() {
  if (apiLoaded) return Promise.resolve();
  if (apiReadyPromise) return apiReadyPromise;

  apiReadyPromise = new Promise((resolve, reject) => {
    const markReady = () => {
      apiLoaded = true;
      resolve();
    };

    if (window.YT && window.YT.Player) {
      markReady();
      return;
    }

    const existingCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (existingCallback) existingCallback();
      markReady();
    };

    const scriptSelector = 'script[src="https://www.youtube.com/iframe_api"]';

    if (!document.querySelector(scriptSelector)) {
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.onerror = () =>
        reject(new Error("Failed to load YouTube IFrame API"));
      document.head.appendChild(script);
    } else {
      const poll = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(poll);
          markReady();
        }
      }, 100);
    }
  });

  return apiReadyPromise;
}

export function useYouTubePlayer(containerElId = "yt-player-container") {
  const [isReady, setIsReady] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef(null);
  const pendingVideoRef = useRef(null);

  useEffect(() => {
    console.log(
      "[YT] Initializing YouTube player hook with container ID:",
      containerElId,
    );
    let cancelled = false;
    let observer = null;
    let initTimeout = null;

    const initPlayer = el => {
      if (cancelled || playerRef.current) return;

      console.log("[YT] Creating player on element:", el);
      playerRef.current = new window.YT.Player(el, {
        height: "100%",
        width: "100%",
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            console.log("[YT] Player instance ready");
            if (pendingVideoRef.current) {
              playerRef.current.loadVideoById(pendingVideoRef.current);
              pendingVideoRef.current = null;
            }
          },
          onStateChange: event => {
            const playing = event.data === window.YT.PlayerState.PLAYING;
            setIsPaused(!playing);

            if (playing) {
              const videoData = event.target.getVideoData();
              setCurrentVideo({
                title: videoData.title,
                videoId: videoData.video_id,
              });
              setDuration(event.target.getDuration());
            }
          },
          onError: event => {
            const errorCodes = {
              2: "Invalid video ID",
              5: "HTML5 player error — video cannot be played",
              100: "Video not found or removed",
              101: "Video owner does not allow embedded playback",
              150: "Video owner does not allow embedded playback",
            };
            console.error(
              `[YT Player Error] Code ${event.data}: ${errorCodes[event.data] || "Unknown error"}`,
            );
          },
        },
      });
    };

    const destroyPlayer = () => {
      if (playerRef.current?.destroy) {
        console.log("[YT] Destroying player");
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };

    const scheduleCheck = () => {
      if (initTimeout) clearTimeout(initTimeout);
      initTimeout = setTimeout(() => {
        if (cancelled) return;
        const el = document.getElementById(containerElId);

        if (el && !playerRef.current && !el.tagName.match(/iframe/i)) {
          initPlayer(el);
        }

        if (!document.getElementById(containerElId) && playerRef.current) {
          destroyPlayer();
        }
      }, 100);
    };

    console.log("[YT] Loading YouTube API...");
    loadYouTubeAPI()
      .then(() => {
        if (cancelled) return;
        console.log("[YT] API loaded");
        setIsReady(true);

        scheduleCheck();

        observer = new MutationObserver(scheduleCheck);
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
      })
      .catch(err => {
        console.error("[YT] Failed to load API:", err);
      });

    return () => {
      cancelled = true;
      if (initTimeout) clearTimeout(initTimeout);
      if (observer) observer.disconnect();

      if (playerRef.current?.destroy) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [containerElId]);

  const playVideo = useCallback(videoId => {
    if (playerRef.current?.loadVideoById) {
      playerRef.current.loadVideoById(videoId);
    } else {
      pendingVideoRef.current = videoId;
    }
  }, []);

  const pauseVideo = useCallback(() => {
    if (playerRef.current?.pauseVideo) {
      playerRef.current.pauseVideo();
    }
  }, []);

  const resumeVideo = useCallback(() => {
    if (playerRef.current?.playVideo) {
      playerRef.current.playVideo();
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    const state = playerRef.current.getPlayerState();
    if (state === window.YT.PlayerState.PLAYING) {
      playerRef.current.pauseVideo();
    } else {
      playerRef.current.playVideo();
    }
  }, []);

  const setVolume = useCallback(vol => {
    if (playerRef.current?.setVolume) {
      playerRef.current.setVolume(vol);
    }
  }, []);

  const seekTo = useCallback(seconds => {
    if (playerRef.current?.seekTo) {
      playerRef.current.seekTo(seconds, true);
    }
  }, []);

  const stopVideo = useCallback(() => {
    if (playerRef.current?.stopVideo) {
      playerRef.current.stopVideo();
    }
  }, []);

  const getCurrentTime = useCallback(() => {
    if (playerRef.current?.getCurrentTime) {
      return playerRef.current.getCurrentTime();
    }
    return 0;
  }, []);

  const getDuration = useCallback(() => {
    if (playerRef.current?.getDuration) {
      return playerRef.current.getDuration();
    }
    return 0;
  }, []);

  return {
    isReady,
    isPaused,
    currentVideo,
    duration,
    playVideo,
    pauseVideo,
    resumeVideo,
    togglePlay,
    setVolume,
    seekTo,
    stopVideo,
    getCurrentTime,
    getDuration,
  };
}
