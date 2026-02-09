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
// We'll define a mask where "1" means "place a target here".
// Need exactly 24 target cells (because TARGETS.length = 24).
// This 10x12 mask draws a stylized "19" using 24 spots.
// If you want the "19" thicker/thinner later, change the 1s,
// but keep the total count = 24.

const MASK = [
  "000100000000",
  "001100000000",
  "000100000110",
  "000100001010",
  "000100001010",
  "000100001110",
  "000100000010",
  "000100000010",
  "001110001100",
  "000000000000",
];

// Convert mask -> list of target indices
const targetIndices = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    if (MASK[r][c] === "1") targetIndices.push(r * COLS + c);
  }
}

if (targetIndices.length !== TARGETS.length) {
  // Safety: if mask count doesn't match targets, fallback to random.
  // (You can delete this once you're happy.)
  console.warn("MASK count =", targetIndices.length, "but TARGETS length =", TARGETS.length);
}

// Build cells
const cells = [];
let t = 0;

const useMask = (targetIndices.length === TARGETS.length);
const targetSet = new Set(useMask ? targetIndices : []);

if (!useMask) {
  // fallback random if mask wrong
  while (targetSet.size < TARGETS.length) {
    targetSet.add(Math.floor(Math.random() * CELL_COUNT));
  }
}

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

function asciiToText(arr) {
  return arr.map(n => String.fromCharCode(n)).join("");
}

function updateTracker() {
  // show collected ascii in correct order (with blanks)
  const asciiOrdered = collected.map(x => (x ? x.ascii : "__"));
  asciiTrackEl.textContent = asciiOrdered.join(" ");

  // decode only what is collected (contiguous fill isn't required)
  // We'll decode with blanks as spaces, so she sees progress.
  const decoded = collected.map(x => (x ? String.fromCharCode(x.ascii) : "•")).join("");
  textTrackEl.textContent = decoded;

  // counts + button
  const got = collected.filter(Boolean).length;
  countEl.textContent = String(got);
  finishBtn.disabled = got !== TARGETS.length;
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
      btn.addEventListener("click", () => pick(cell));
    }

    gridEl.appendChild(btn);
  }

  updateTracker();
}

function pick(cell) {
  cell.picked = true;

  if (cell.pos !== null && collected[cell.pos] === null) {
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
  // reset collected
  for (let i = 0; i < collected.length; i++) collected[i] = null;
  // reset picked states
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
