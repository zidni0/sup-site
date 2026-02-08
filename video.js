const vid = document.getElementById("vid");
const overlay = document.getElementById("overlay");
const dumpEl = document.getElementById("dump");
const revealEl = document.getElementById("reveal");

function asciiToText(asciiArr) {
  return asciiArr.map(n => String.fromCharCode(n)).join("");
}

function startDecrypt() {
  const saved = localStorage.getItem("val_collected");
  if (!saved) return;

  let collected;
  try { collected = JSON.parse(saved); } catch { return; }
  if (!Array.isArray(collected)) return;

  // Sort by position and extract ascii
  const ascii = collected
    .filter(Boolean)
    .sort((a, b) => a.pos - b.pos)
    .map(x => x.ascii);

  // Show overlay
  overlay.classList.remove("hidden");

  // Show number dump
  dumpEl.textContent = ascii.join(" ");

  // Decrypt animation
  const text = asciiToText(ascii);
  revealEl.textContent = "";

  let i = 0;
  const timer = setInterval(() => {
    revealEl.textContent += text[i] ?? "";
    i++;
    if (i >= text.length) clearInterval(timer);
  }, 90);
}

// Trigger near end (last ~6 seconds), only once
let started = false;
vid.addEventListener("timeupdate", () => {
  if (started) return;
  if (!vid.duration || isNaN(vid.duration)) return;
  if (vid.currentTime >= Math.max(0, vid.duration - 6)) {
    started = true;
    startDecrypt();
  }
});

vid.addEventListener("ended", () => {
  if (!started) startDecrypt();
});
