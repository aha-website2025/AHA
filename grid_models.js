// grid_models.js — Models page (3 cols) with pattern, search, and dashed guides

/* ---------- Menu ---------- */
function toggleMenu() {
  const menu = document.getElementById("menuItems");
  if (menu) menu.style.display = menu.style.display === "block" ? "none" : "block";
}

/* ---------- Globals ---------- */
let allModels = [];

/* ---------- Config: 3×3 repeating layout ---------- */
const LAYOUT_PATTERN = [
  "model", "model", "hatch",
  "hatch", "model", "model",
  "model", "hatch", "model"
];

/* ---------- Utilities ---------- */
const rafp = (cb) => new Promise(res => requestAnimationFrame(() => { if (cb) cb(); res(); }));

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function waitForImages(container) {
  const imgs = Array.from(container.querySelectorAll("img"));
  if (!imgs.length) return Promise.resolve();
  return Promise.all(imgs.map(img =>
    img.complete ? Promise.resolve() :
    new Promise(res => {
      img.addEventListener("load", res, { once: true });
      img.addEventListener("error", res, { once: true });
    })
  ));
}

/* ---------- Dashed guides (relative to #grid) ---------- */
function drawDashedLinesBetweenTileRows() {
  const container = document.getElementById("grid");
  if (!container) return;

  container.querySelectorAll(".horizontal-grid-line").forEach(el => el.remove());

  const tiles = Array.from(container.querySelectorAll(".tile"));
  if (!tiles.length) return;

  const cRect = container.getBoundingClientRect();
  const rows = new Map();

  tiles.forEach(tile => {
    const r = tile.getBoundingClientRect();
    const key = Math.round(r.top);
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push(r);
  });

  const tops = [...rows.keys()].sort((a, b) => a - b);
  for (let i = 0; i < tops.length - 1; i++) {
    const current = rows.get(tops[i]);
    const nextTop = tops[i + 1];
    const curBottomMax = Math.max(...current.map(rr => rr.bottom));

    const y = ((curBottomMax + nextTop) / 2) - cRect.top;
    const leftEdge  = Math.min(...current.map(rr => rr.left))  - cRect.left;
    const rightEdge = Math.max(...current.map(rr => rr.right)) - cRect.left;

    const line = document.createElement("div");
    line.className = "horizontal-grid-line";
    Object.assign(line.style, {
      position: "absolute",
      top: `${y}px`,
      left: `${leftEdge - 15}px`,
      width: `${(rightEdge - leftEdge) + 30}px`,
      height: "1px",
      backgroundImage:
        "repeating-linear-gradient(to right,#ccc 0,#ccc 4px,transparent 5px,transparent 9px)",
      pointerEvents: "none",
      zIndex: "2"
    });
    container.appendChild(line);
  }
}

function drawVerticalDashedLines() {
  const container = document.getElementById("grid");
  if (!container) return;

  container.querySelectorAll(".vertical-grid-line").forEach(el => el.remove());

  const tiles = Array.from(container.querySelectorAll(".tile"));
  if (!tiles.length) return;

  const cRect = container.getBoundingClientRect();
  const columns = new Map();

  tiles.forEach(tile => {
    const r = tile.getBoundingClientRect();
    const key = Math.round(r.left);
    if (!columns.has(key)) columns.set(key, { rects: [], width: r.width });
    columns.get(key).rects.push(r);
  });

  const cols = [...columns.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([left, info]) => {
      const tops = info.rects.map(rr => rr.top);
      const bots = info.rects.map(rr => rr.bottom);
      return { left, width: info.width, topMin: Math.min(...tops), bottomMax: Math.max(...bots) };
    });

  if (cols.length < 2) return;

  const topEdge    = Math.min(...cols.map(c => c.topMin))    - cRect.top;
  const bottomEdge = Math.max(...cols.map(c => c.bottomMax)) - cRect.top;

  for (let i = 0; i < cols.length - 1; i++) {
    const c1 = cols[i], c2 = cols[i + 1];
    const midX = ((c1.left + c1.width) + c2.left) / 2 - cRect.left;

    const line = document.createElement("div");
    line.className = "vertical-grid-line";
    Object.assign(line.style, {
      position: "absolute",
      top: `${topEdge - 15}px`,
      left: `${midX}px`,
      height: `${(bottomEdge - topEdge) + 30}px`,
      width: "1px",
      backgroundImage:
        "repeating-linear-gradient(to bottom,#ccc 0,#ccc 4px,transparent 5px,transparent 9px)",
      pointerEvents: "none",
      zIndex: "2"
    });
    container.appendChild(line);
  }
}

async function redrawGuides() {
  await rafp();
  drawDashedLinesBetweenTileRows();
  drawVerticalDashedLines();
}

/* ---------- Tiles ---------- */
function createModelTile(model) {
  const div = document.createElement("div");
  div.classList.add("tile", "model-tile");
  div.innerHTML = `
    <a href="page_model.html?slug=${model.slug}">
      <div class="model-content">
        <img src="${model.logo_image}" alt="${model.title}" class="model-image" />
        <div class="model-label">${model.title}</div>
      </div>
    </a>
  `;
  return div;
}

function createHatchTile() {
  const div = document.createElement("div");
  div.classList.add("tile", "hatch");
  return div;
}

/* ---------- Render with pattern ---------- */
async function renderModelsGrid(models) {
  const container = document.getElementById("grid");
  if (!container) return;

  container.innerHTML = "";

  const order = shuffle(models); // remove shuffle() if you want fixed order
  let modelIndex = 0;

  // Repeat pattern until all models placed; skip excess hatches at the end
  for (let i = 0; modelIndex < order.length; i++) {
    const type = LAYOUT_PATTERN[i % LAYOUT_PATTERN.length];

    if (type === "hatch") {
      container.appendChild(createHatchTile());
    } else {
      const m = order[modelIndex];
      if (!m) break;
      container.appendChild(createModelTile(m));
      modelIndex++;
    }
  }

  await waitForImages(container);
  await redrawGuides();
}

/* ---------- Search (title + info.txt near logo path) ---------- */
async function preloadSearchText(models) {
  const jobs = models.map(async m => {
    let infoText = "";
    try {
      const logo = m.logo_image || "";
      const dir  = logo.slice(0, logo.lastIndexOf("/"));
      if (dir) {
        const res = await fetch(`${dir}/info.txt?v=${Date.now()}`);
        if (res.ok) infoText = await res.text();
      }
    } catch (_) {}
    m._searchText = `${m.title || ""} ${infoText}`.toLowerCase();
  });
  await Promise.all(jobs);
}

function handleModelSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;
  const q = input.value.trim().toLowerCase();
  if (!q) { renderModelsGrid(allModels); return; }
  const filtered = allModels.filter(m => (m._searchText || "").includes(q));
  renderModelsGrid(filtered);
}

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch(`json_models.json?v=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    allModels = await res.json();

    await preloadSearchText(allModels);
    await renderModelsGrid(allModels);

    const search = document.getElementById("searchInput");
    if (search) search.addEventListener("input", handleModelSearch);

    window.addEventListener("resize", () => redrawGuides());
  } catch (e) {
    console.error("Failed to init models page:", e);
  }
});
