const vid = document.getElementById("vid");
const tapHint = document.getElementById("tapHint");

// Try to request fullscreen (best-effort)
async function tryFullscreen(videoEl) {
  try {
    // Standard fullscreen API
    if (videoEl.requestFullscreen) {
      await videoEl.requestFullscreen();
      return true;
    }
    // Safari (older) fullscreen
    if (videoEl.webkitRequestFullscreen) {
      videoEl.webkitRequestFullscreen();
      return true;
    }
    // iOS Safari sometimes supports this on the video element
    if (videoEl.webkitEnterFullscreen) {
      videoEl.webkitEnterFullscreen();
      return true;
    }
  } catch (e) {
    // Fullscreen blocked. Fine.
  }
  return false;
}

async function startPlayback() {
  try {
    vid.muted = false; // explicitly unmute
    await vid.play();
  } catch (err) {
    // If autoplay with sound fails, fallback:
    vid.muted = true;
    await vid.play();
  }
}


// Kick off immediately
startPlayback();

// If the user taps play manually, hide the hint and try fullscreen again
vid.addEventListener("play", () => {
  if (tapHint) tapHint.classList.add("hidden");
  tryFullscreen(vid);
});

// When video ends, go to the next page
vid.addEventListener("ended", () => {
  window.location.href = "next.html";
});

