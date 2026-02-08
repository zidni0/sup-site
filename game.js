// Target phrase: "will you be my valentine"
const TARGETS = [
  119,105,108,108,32,121,111,117,32,98,101,32,109,121,32,118,97,108,101,110,116,105,110,101
];

// We store position+ascii so duplicates don't break anything.
const collected = new Array(TARGETS.length).fill(null);

const gridEl = document.getElementById("grid");
const countEl = document.getElementById("count");
const finishBtn = document.getElementById("finish");

// Build a grid of numbers (noise + targets)
const ROWS = 10;
const COLS = 12;
const CELL_COUNT = ROWS * COLS;

// Pick random cells to hide targets in
const targetCells = new Set();
while (targetCells.size < TARGETS.length) {
  targetCells.add(Math.floor(Math.random() * CELL_COUNT));
}

const cells = [];
let t = 0;

for (let i = 0; i < CELL_COUNT; i++) {
  let value, pos;

  if (targetCells.has(i)) {
    value = TARGETS[t];
    pos = t;        // position in message
    t++;
  } else {
    // random printable-ish ASCII codes, exclude target codes sometimes so it's harder to guess
    value = Math.floor(Math.random() * 91) + 32; // 32..122
    pos = null;
  }

  cells.push({ value, pos, picked: false });
}

// Render
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

  const got = collected.filter(Boolean).length;
  countEl.textContent = String(got);
  finishBtn.disabled = got !== TARGETS.length;
}

function pick(cell) {
  cell.picked = true;

  if (cell.pos !== null && collected[cell.pos] === null) {
    collected[cell.pos] = { pos: cell.pos, ascii: cell.value };
    // Save progress
    localStorage.setItem("val_collected", JSON.stringify(collected));
  }

  render();
}

finishBtn.addEventListener("click", () => {
  // Ensure saved, then go to video
  localStorage.setItem("val_collected", JSON.stringify(collected));
  window.location.href = "video.html";
});

// Load saved progress (optional)
const saved = localStorage.getItem("val_collected");
if (saved) {
  try {
    const arr = JSON.parse(saved);
    if (Array.isArray(arr) && arr.length === TARGETS.length) {
      for (let i = 0; i < TARGETS.length; i++) collected[i] = arr[i];
      // Mark any already-collected targets as picked in the grid
      for (const cell of cells) {
        if (cell.pos !== null && collected[cell.pos]) cell.picked = true;
      }
    }
  } catch {}
}

render();
