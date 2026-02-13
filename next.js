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
  const count = 40;
  const width = confettiLayer.clientWidth || 900;

  for (let k = 0; k < count; k++) {
    const p = document.createElement("div");
    p.className = "confetti";
    p.style.left = Math.floor(Math.random() * width) + "px";
    p.style.transform = `translateY(0) rotate(${Math.random() * 180}deg)`;
    // Use your theme: pink/purple/white-ish
    const choices = ["rgba(255,119,183,.95)","rgba(201,147,255,.95)","rgba(246,242,255,.9)"];
    p.style.background = choices[Math.floor(Math.random() * choices.length)];
    p.style.animationDelay = (Math.random() * 0.2) + "s";
    confettiLayer.appendChild(p);

    // Clean up
    setTimeout(() => p.remove(), 1800);
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
