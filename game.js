// Target phrase: "will you be my valentine"
const TARGETS = [
  119,105,108,108,32,121,111,117,32,98,101,32,109,121,32,118,97,108,101,110,116,105,110,101
];

// We store position+ascii so duplicates don't break anything.
const collected = new Array(TARGETS.length).fill(null);

const gridEl = document.getElementById("grid");
const countEl = document.getElementById("count");
const finishBtn = document.getElementById("finish");
const asciiTrackEl = document.getElementById("asciiTrack");
const textTrackEl = document.getElementById("textTrack");
const resetBtn = document.getElementById("reset");

// Grid size
const ROWS = 10;
const COLS = 12;
const CELL_COUNT = ROWS * COLS;

// ---- "19" SHAPE PLACEMENT ----
// IMPORTANT: MUST have exactly 24 "1"s (because TARGETS.length = 24).
// This mask draws a clear "19" using 24 target spots.
const MASK = [
  "001000011110",
  "001000010010",
  "001000010010",
  "001000011110",
  "001000000010",
  "001000000010",
  "001000000110",
  "001000000000",
  "000000000000",
  "000000000000",
];

const targetIndices = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    if (MASK[r][c] === "1") targetIndices.push(r * COLS + c);
  }
}

// Keep this. It prevents silent bugs.
if (targetIndices.length !== TARGETS.length) {
  throw new Error(`MASK has ${targetIndices.length} targets, but needs ${TARGETS.length}. Fix the MASK.`);
}

const targetSet = new Set(targetIndices);

// Build cells
const cells = [];
let t = 0;

for (let i = 0; i < CELL_COUNT; i++) {
  let value, pos;

  if (targetSet.has(i)) {
    value = TARGETS[t];
    pos = t; // position in message
    t++;
  } else {
    value = Math.floor(Math.random() * 91) + 32; // 32..122
    pos = null;
  }

  cells.push({ value, pos, picked: false });
}

function updateTracker() {
  // show collected ascii in correct order (with blanks)
  const asciiOrdered = collected.map(x => (x ? x.ascii : "__"));
  asciiTrackEl.textContent = asciiOrdered.join(" ");

  // DO NOT reveal decoded message on this page
  if (textTrackEl) textTrackEl.textContent = "";

  const got = collected.filter(Boolean).length;
  countEl.textContent = String(got);
  finishBtn.disabled = got !== TARGETS.length;
}

function wrongFeedback(btn, originalText) {
  btn.disabled = true;
  btn.textContent = "💔";
  btn.style.borderColor = "rgba(255,119,183,.55)";
  btn.style.background = "rgba(255,119,183,.10)";

  setTimeout(() => {
    btn.disabled = false;
    btn.textContent = originalText;
    btn.style.borderColor = "";
    btn.style.background = "";
  }, 550);
}

function render() {
  gridEl.innerHTML = "";
  for (const cell of cells) {
    const btn = document.createElement("button");
    btn.className = "cell";
    btn.type = "button";
    btn.textContent = cell.value;

    if (cell.picked) {
      btn.classList.add("picked");
      btn.disabled = true;
      btn.textContent = "❤";
    } else {
      btn.classList.add("slide-in");

      // Correct = ❤, Wrong = 💔
      btn.addEventListener("click", () => {
        if (cell.pos !== null) {
          btn.classList.add("pop"); // harmless if you don't have .pop in CSS
          setTimeout(() => pick(cell), 110);
        } else {
          wrongFeedback(btn, String(cell.value));
        }
      });
    }

    gridEl.appendChild(btn);
  }

  updateTracker();
}

function pick(cell) {
  if (cell.pos === null) return; // only targets

  cell.picked = true;

  if (collected[cell.pos] === null) {
    collected[cell.pos] = { pos: cell.pos, ascii: cell.value };
    localStorage.setItem("val_collected", JSON.stringify(collected));
  }

  render();
}

finishBtn.addEventListener("click", () => {
  localStorage.setItem("val_collected", JSON.stringify(collected));
  window.location.href = "video.html";
});

resetBtn.addEventListener("click", () => {
  localStorage.removeItem("val_collected");

  for (let i = 0; i < collected.length; i++) collected[i] = null;
  for (const cell of cells) cell.picked = false;

  render();
});

// Load saved progress
const saved = localStorage.getItem("val_collected");
if (saved) {
  try {
    const arr = JSON.parse(saved);
    if (Array.isArray(arr) && arr.length === TARGETS.length) {
      for (let i = 0; i < TARGETS.length; i++) collected[i] = arr[i];
      for (const cell of cells) {
        if (cell.pos !== null && collected[cell.pos]) cell.picked = true;
      }
    }
  } catch {}
}

render();
