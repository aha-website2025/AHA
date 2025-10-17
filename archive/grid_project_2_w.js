/* =========================
   Menu toggle
   ========================= */
function toggleMenu() {
  const menu = document.getElementById("menuItems");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

/* =========================
   Image fallback loader
   ========================= */
function getImagePath(slug, filenameBase) {
  return new Promise(resolve => {
    const tryJpg = `projects/${slug}/${filenameBase}.jpg`;
    const tryPng = `projects/${slug}/${filenameBase}.png`;

    const img = new Image();
    img.onload = () => resolve(tryJpg);
    img.onerror = () => resolve(tryPng);
    img.src = tryJpg;
  });
}

/* =========================
   Grid sizing (deterministic)
   ========================= */
function setGridHeights() {
  const grid = document.getElementById('projectGrid');
  const firstTile = grid?.querySelector('.tile');
  if (!grid || !firstTile) return;

  // read the same ratio used in CSS (fallback to 0.85)
  const root = getComputedStyle(document.documentElement);
  const cssRatio = parseFloat(root.getPropertyValue('--tile-ratio')) || 0.85;

  // read the actual CSS grid gap so JS matches your stylesheet (13px in your CSS)
  const cs = getComputedStyle(grid);
  const gap = parseFloat(cs.rowGap || cs.gap || 13);

  // base row height = column width * ratio
  const colW = firstTile.getBoundingClientRect().width;
  const rowH = Math.round(colW * cssRatio);

  // set track height for all implicit rows
  grid.style.gridAutoRows = `${rowH}px`;

  // explicit heights for spanning tiles
  const doubleH = rowH * 2 + gap;
  const tripleH = rowH * 3 + gap * 2;

  grid.querySelectorAll('.tile.full-bleed.double, .description')
      .forEach(el => { el.style.height = `${doubleH}px`; });

  grid.querySelectorAll('.tile.full-bleed.triple')
      .forEach(el => { el.style.height = `${tripleH}px`; });
}

/* =========================
   Load & render project (grid layout #2)
   ========================= */
async function loadProject() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug");

  const res = await fetch("json_projects.json");
  const projects = await res.json();
  const project = projects.find(p => p.slug === slug);

  if (!project) {
    document.body.innerHTML = "<h1>Project not found</h1>";
    return;
  }

  const grid = document.getElementById("projectGrid");

  const tiles = [
    {
      class: "tile title",
      style: "grid-column: 1 / 2; grid-row: 1 / 2;",
      html: `<h2>${project.title.toUpperCase()}</h2><p>${project.location}</p>`
    },
    {
      class: "tile full-bleed",
      style: "grid-column: 2 / 3; grid-row: 1 / 2;",
      image: "image",
      alt: "Photo 1"
    },
    {
      class: "description",
      style: "grid-column: 4 / 6; grid-row: 1 / 3;", // spans 2 rows via JS height
      html: project.description
        .split(/\n\s*\n/)
        .map(p => `<p>${p.trim()}</p>`)
        .join("")
    },
    {
      class: "tile full-bleed double",
      style: "grid-column: 2 / 4; grid-row: 2 / 4;", // 2 rows tall via JS
      image: "big1",
      alt: "Photo"
    },
    {
      class: "tile text-left",
      style: "grid-column: 1 / 2; grid-row: 2 / 3;",
      html: `
        <p><strong>Year completed: </strong>${project.year_completed}</p>
        <p><strong>Owner: </strong>${project.owner}</p>
        <p><strong>Architect: </strong>${project.architect}</p>
        <p><strong>Lot size: </strong>${project.lot_size_sqft}</p>`
    },
    {
      class: "tile text-left",
      style: "grid-column: 4 / 5; grid-row: 3 / 4;",
      html: `
        <p><strong>Total floor space: </strong>${project.floor_space_sqft}</p>
        <p><strong># of units: </strong>${project.units}</p>
        <p><strong>Unit distribution: </strong>${project.unit_distribution}</p>
        <p><strong># of inhabitants: </strong>${project.inhabitants_per_unit}</p>`
    },
    {
      class: "tile hatch",
      style: "grid-column: 5 / 6; grid-row: 3 / 4;",
      html: ""
    },
    {
      class: "tile full-bleed double",
      style: "grid-column: 1 / 3; grid-row: 4 / 6;", // 2 rows tall via JS
      image: "big2",
      alt: "Photo 5"
    },
    {
      class: "tile full-bleed",
      style: "grid-column: 3 / 4; grid-row: 4 / 5;",
      image: "1",
      alt: "Photo 3"
    },
    {
      class: "tile text-left",
      style: "grid-column: 4 / 5; grid-row: 4 / 5;",
      html: `<p><strong>Finance</strong></p>`
    },
    {
      class: "tile full-bleed double",
      style: "grid-column: 3 / 5; grid-row: 5 / 6;", // will be double tall by JS
      image: "big3",
      alt: "Photo 8"
    },
    {
      class: "tile full-bleed",
      style: "grid-column: 5 / 6; grid-row: 5 / 6;",
      image: "2",
      alt: "Photo 9"
    },
    {
      class: "tile hatch",
      style: "grid-column: 1 / 2; grid-row: 6 / 7;",
      html: ""
    },
    {
      class: "tile text-left",
      style: "grid-column: 2 / 3; grid-row: 6 / 7;",
      html: `<p><strong>Tags</strong></p>`
    },
    {
      class: "tile hatch",
      style: "grid-column: 5 / 6; grid-row: 6 / 7;",
      html: ""
    }
  ];

  // append tiles
  for (const tile of tiles) {
    const div = document.createElement("div");
    div.className = tile.class;
    if (tile.style) div.style.cssText = tile.style;

    if (tile.image) {
      const src = await getImagePath(slug, tile.image);
      div.innerHTML = `<img src="${src}" alt="${tile.alt}" />`;
    } else {
      div.innerHTML = tile.html;
    }
    grid.appendChild(div);

    // image popup
    const img = div.querySelector("img");
    if (img) {
      img.style.cursor = "pointer";
      img.addEventListener("click", () => showPopup(img.src));
    }

    // description popup
    if (tile.class.includes("description")) {
      div.addEventListener("click", () => {
        const overlay = document.createElement("div");
        overlay.className = "description-popup-overlay";

        const popup = document.createElement("div");
        popup.className = "description-popup";
        popup.innerHTML = `
          <div class="description-popup-close">×</div>
          ${tile.html}
        `;

        overlay.appendChild(popup);
        document.body.appendChild(overlay);
        document.body.style.overflow = "hidden";

        overlay.addEventListener("click", () => {
          document.body.removeChild(overlay);
          document.body.style.overflow = "";
        });
      });
    }
  }

  // after fonts (to avoid small metric shifts)
  const whenFontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
  whenFontsReady.then(() => {
    setGridHeights();
    // draw lines after sizing is stable
    drawDashedLinesBetweenTileRows();
    drawVerticalDashedLines();
  });
}

/* =========================
   Image popup
   ========================= */
function showPopup(src) {
  const overlay = document.createElement("div");
  overlay.className = "image-popup-overlay";

  const popupImage = document.createElement("img");
  popupImage.className = "image-popup";
  popupImage.src = src;

  overlay.appendChild(popupImage);
  document.body.appendChild(overlay);

  document.body.style.overflow = "hidden";
  overlay.addEventListener("click", () => {
    document.body.removeChild(overlay);
    document.body.style.overflow = "";
  });
}

/* =========================
   Horizontal dashed lines
   ========================= */
function drawDashedLinesBetweenTileRows() {
  const grid = document.querySelector('.project-page .grid');
  if (!grid) return;

  const tiles = Array.from(grid.querySelectorAll('.tile, .project-page .description'));
  if (!tiles.length) return;

  // create/clear the line layer (behind tiles)
  let layer = grid.querySelector('.row-lines');
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'row-lines';
    Object.assign(layer.style, {
      position: 'absolute', inset: '0', pointerEvents: 'none', zIndex: '0'
    });
    grid.prepend(layer);
  }
  layer.innerHTML = '';

  const docRect = el => {
    const r = el.getBoundingClientRect();
    return {
      top: r.top + window.scrollY,
      left: r.left + window.scrollX,
      right: r.right + window.scrollX,
      bottom: r.bottom + window.scrollY,
      width: r.width,
      height: r.height
    };
  };

  const gridTopDoc = grid.getBoundingClientRect().top + window.scrollY;

  // group into rows
  const rowThreshold = 10;
  const rows = [];
  tiles.forEach(el => {
    const top = el.getBoundingClientRect().top;
    let row = rows.find(r => Math.abs(r.top - top) < rowThreshold);
    if (row) row.tiles.push(el);
    else rows.push({ top, tiles: [el] });
  });
  rows.sort((a, b) => a.top - b.top);
  if (rows.length < 2) return;

  rows.forEach(r =>
    r.tiles.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left)
  );

  // spacing per spec
  const r1 = docRect(rows[0].tiles[0]);
  const r2 = docRect(rows[1].tiles[0]);
  const gap = r2.top - r1.bottom;
  const x = r1.height + gap;

  let y = r1.bottom + gap / 2;
  const nLines = rows.length - 1;

  // horizontal span across all tiles
  let minLeft = Infinity, maxRight = -Infinity;
  rows.forEach(row => row.tiles.forEach(el => {
    const r = docRect(el);
    minLeft = Math.min(minLeft, r.left);
    maxRight = Math.max(maxRight, r.right);
  }));

  for (let i = 0; i < nLines; i++) {
    const line = document.createElement('div');
    line.className = 'horizontal-grid-line';
    Object.assign(line.style, {
      position: 'absolute',
      left: `${minLeft - (grid.getBoundingClientRect().left + window.scrollX) - 15}px`,
      width: `${(maxRight - minLeft) + 30}px`,
      height: '1px',
      top: `${y - gridTopDoc}px`,
      backgroundImage:
        'repeating-linear-gradient(to right, #ccc 0, #ccc 4px, transparent 5px, transparent 9px)'
    });
    layer.appendChild(line);
    y += x;
  }
}

/* =========================
   Vertical dashed lines
   ========================= */
function drawVerticalDashedLines({
  selector = ".tile",
  lines = 4,
  rowThreshold = 10
} = {}) {
  const container = document.getElementById("projectGrid");
  if (!container) return;

  // remove old
  document.querySelectorAll(".vertical-grid-line").forEach(el => el.remove());

  const tiles = Array.from(container.querySelectorAll(selector));
  if (tiles.length < 2) return;

  const rectsFirst = tiles.map(el => ({ el, r: el.getBoundingClientRect() }));
  const minTop = Math.min(...rectsFirst.map(o => o.r.top));
  const firstRow = rectsFirst
    .filter(o => Math.abs(o.r.top - minTop) < rowThreshold)
    .sort((a, b) => a.r.left - b.r.left);

  if (firstRow.length < 2) return;

  const first  = firstRow[0].r;
  const second = firstRow[1].r;

  const firstTileWidth = first.width;
  const measuredGap = (second.left - first.right);
  const cs = getComputedStyle(container);
  const cssGap = parseFloat(cs.columnGap || cs.gap || 0);
  const gap = measuredGap > 0 && measuredGap < firstTileWidth * 2 ? measuredGap : cssGap;

  const xStart = (first.right + second.left) / 2 + window.scrollX;

  const tilesAll = Array.from(container.querySelectorAll(".tile, .description"));
  if (!tilesAll.length) return;

  const rectsAll = tilesAll.map(t => t.getBoundingClientRect());
  let topEdge    = Math.min(...rectsAll.map(r => r.top))    + window.scrollY;
  let bottomEdge = Math.max(...rectsAll.map(r => r.bottom)) + window.scrollY;
  let lineHeight = bottomEdge - topEdge;

  const offsetTop = -12;
  const offsetBottom = 12;
  topEdge   += offsetTop;
  lineHeight += offsetBottom - offsetTop;

  for (let i = 0; i < lines; i++) {
    const x = xStart + i * (firstTileWidth + gap);

    const line = document.createElement("div");
    line.className = "vertical-grid-line";
    line.style.position = "absolute";
    line.style.left = `${x}px`;
    line.style.top = `${topEdge}px`;
    line.style.height = `${lineHeight}px`;
    line.style.width = "1px";
    line.style.backgroundImage =
      "repeating-linear-gradient(to bottom, #ccc 0, #ccc 4px, transparent 5px, transparent 9px)";
    line.style.pointerEvents = "none";
    line.style.zIndex = "-1";
    document.body.appendChild(line);
  }
}

/* =========================
   Resize: recompute + redraw
   ========================= */
window.addEventListener("resize", () => {
  document.querySelectorAll(".vertical-grid-line, .horizontal-grid-line").forEach(n => n.remove());
  setGridHeights();
  drawDashedLinesBetweenTileRows();
  drawVerticalDashedLines();
});

/* =========================
   Previews (unchanged)
   ========================= */
let allProjects = [];
fetch("projects.json")
  .then(res => res.json())
  .then(data => {
    allProjects = data;
    setRandomPreview();
  });

function setRandomPreview() {
  const previews = document.querySelectorAll(".preview-card");
  previews.forEach(card => {
    const project = allProjects[Math.floor(Math.random() * allProjects.length)];
    card.innerHTML = `
      <a href="page_project.html?slug=${project.slug}" class="preview-link">
        <img src="${project.image}" style="width:100%; height:150px; object-fit:cover;" />
        <h4>${project.title}</h4>
        <p>${project.location}</p>
      </a>
    `;
  });
}

/* =========================
   Boot
   ========================= */
window.onload = loadProject;
