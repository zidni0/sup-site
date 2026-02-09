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
    // Autoplay attempt (muted)
    await vid.play();

    // Try fullscreen after playback starts (some browsers only allow it then)
    tryFullscreen(vid);
  } catch (err) {
    // Autoplay blocked: show hint (user must tap play once)
    if (tapHint) tapHint.classList.remove("hidden");
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
