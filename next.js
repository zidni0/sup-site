// Pull the collected ASCII from localStorage (saved on page 1).
// Fallback to hardcoded TARGETS if storage is missing.
const FALLBACK = [
  119,105,108,108,32,121,111,117,32,98,101,32,109,121,32,118,97,108,101,110,116,105,110,101
];

function getAsciiInOrder() {
  const saved = localStorage.getItem("val_collected");
  if (!saved) return FALLBACK;

  try {
    const arr = JSON.parse(saved);
    if (!Array.isArray(arr)) return FALLBACK;

    const ascii = arr
      .filter(Boolean)
      .sort((a,b) => a.pos - b.pos)
      .map(x => x.ascii);

    // If incomplete somehow, fallback
    if (ascii.length !== FALLBACK.length) return FALLBACK;
    return ascii;
  } catch {
    return FALLBACK;
  }
}

function charFromAscii(n) {
  return String.fromCharCode(n);
}

const asciiLine = document.getElementById("asciiLine");
const messageLine = document.getElementById("messageLine");
const progressPill = document.getElementById("progressPill");
const cta = document.getElementById("cta");

const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const result = document.getElementById("result");
const confettiLayer = document.getElementById("confetti");

const ascii = getAsciiInOrder();
progressPill.textContent = `0/${ascii.length}`;

let i = 0;
let message = "";

// Animate: show ASCII numbers one-by-one, and decrypt above them (message line)
function step() {
  const n = ascii[i];
  const ch = charFromAscii(n);

  // ASCII token
  const tok = document.createElement("span");
  tok.className = "token";
  tok.textContent = String(n);
  asciiLine.appendChild(tok);

  // Decrypt into message
  message += ch;
  messageLine.textContent = message;

  i++;
  progressPill.textContent = `${i}/${ascii.length}`;

  if (i < ascii.length) {
    setTimeout(step, 240);
  } else {
    // Add the question mark at the end (required)
    if (!messageLine.textContent.trim().endsWith("?")) {
      messageLine.textContent = messageLine.textContent + "?";
    }

    // Reveal buttons after a tiny pause
    setTimeout(() => {
      cta.classList.remove("hidden");
    }, 450);
  }
}

setTimeout(step, 400);

// Confetti generator (simple + reliable)
function popConfetti() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // More confetti and spread across full screen
  const count = Math.min(160, Math.floor(width / 4)); // scales with screen size

  for (let k = 0; k < count; k++) {
    const p = document.createElement("div");
    p.className = "confetti";

    // random position across the top
    p.style.left = Math.floor(Math.random() * width) + "px";

    // random size variety
    const size = 10 + Math.random() * 12; // 10..22
    p.style.width = size + "px";
    p.style.height = (size * 1.2) + "px";

    // colors (theme-matching)
    const choices = [
      "rgba(255,119,183,.98)",
      "rgba(201,147,255,.98)",
      "rgba(246,242,255,.95)",
      "rgba(255,190,220,.95)"
    ];
    p.style.background = choices[Math.floor(Math.random() * choices.length)];

    // random fall duration + delay
    const dur = 2.2 + Math.random() * 1.4; // 2.2..3.6s
    const delay = Math.random() * 0.2;     // 0..0.2s
    p.style.animationDuration = dur + "s";
    p.style.animationDelay = delay + "s";

    // random drift + spin
    const drift = (Math.random() * 2 - 1) * (width * 0.25); // left/right drift
    const rot = 360 + Math.random() * 720;

    // start transform
    p.style.transform = `translateY(0) translateX(0) rotate(${Math.random() * 180}deg)`;

    // hack: bake drift into animation using CSS variable-ish approach
    // We'll just set a random translateX using a CSS trick: put it in translate at end via inline keyframes? too heavy.
    // Instead: use a simple interval-less trick by setting a random margin-left at creation.
    p.style.marginLeft = (drift / 30) + "px";

    confettiLayer.appendChild(p);

    setTimeout(() => p.remove(), (dur + delay + 0.2) * 1000);
  }
}


function celebrate() {
  result.textContent = "Hooray 🎉 You picked YES 💗 refrsh if u think u made a mistake";
  popConfetti();
  yesBtn.disabled = true;
  noBtn.disabled = true;
}

// The “joke”: both buttons lead to YES.
yesBtn.addEventListener("click", celebrate);
noBtn.addEventListener("click", celebrate);
