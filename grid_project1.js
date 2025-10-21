function toggleMenu() {
  const menu = document.getElementById("menuItems");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

// 📁 Dynamic fallback loader
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

// 📦 Load and render a project grid
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
      style: "grid-column: 1 / 2;",
      html: `<h2>${project.title.toUpperCase()}</h2><p>${project.location}</p>`
    },
    {
      class: "tile blank",
      style: "grid-column: 2 / 3; grid-row: 1;",
      html: ""
    },
    {
      class: "tile full-bleed",
      style: "grid-column: 3 / 4; grid-row: 1 / 2;",
      image: "image",
      alt: "Photo 1"
    },
    {
      class: "tile full-bleed double",
      style: "grid-column: 4 / 6; grid-row: 1 / span 2;",
      image: "big1",
      alt: "Photo "
    },
    {
      class: "tile full-bleed",
      style: "grid-column: 1 / 2; grid-row: 2 / 3;",
      image: "1",
      alt: "Photo 2"
    },
    {
      class: "tile text-left",
      style: "grid-column: 2 / 3;",
      html: `
        <p><strong>Year completed: </strong>${project.year_completed}</p>
        <p><strong>Owner: </strong>${project.owner}</p>
        <p><strong>Architect: </strong>${project.architect}</p>
        <p><strong>Lot size: </strong>${project.lot_size_sqft}</p>`
    },
    {
      class: "tile text-left",
      style: "grid-column: 3 / 4;",
      html: `
        <p><strong>Total floor space: </strong>${project.floor_space_sqft}</p>
        <p><strong># of units: </strong>${project.units}</p>
        <p><strong>Unit distribution: </strong>${project.unit_distribution}</p>
        <p><strong># of inhabitants: </strong>${project.number_of_inhabitants}</p>`
    },
    {
      class: "tile hatch",
      style: "grid-column: 1 / 2; grid-row: 3;",
      html: ""
    },
    {
      class: "tile full-bleed double",
      style: "grid-column: 2 / 4; grid-row: 3 / span 2;",
      image: "big2",
      alt: "Photo 5"
    },
    {
      class: "description",
      style: "grid-column: 4 / 6; grid-row: 3 / span 2;",
      html: project.description
        .split(/\n\s*\n/)
        .map(p => `<p>${p.trim()}</p>`)
        .join("") 
    },
    {
      class: "tile blank",
      style: "grid-column: 1 / 2; grid-row: 4;",
      html: ""
    },
    {
      class: "tile full-bleed",
      style: "grid-column: 1 / 2; grid-row: 5;",
      image: "2",
      alt: "Photo 3"
    },
    {
      class: "tile text-left",
      style: "grid-column: 2 / 3; grid-row: 5;",
      html: `
        <p><strong>Development cost/unit: </strong>${project.development_cost_per_unit || 'N/A'}</p>
        <p><strong>Average rent/unit: </strong>${project.average_rent_per_unit || 'N/A'}</p>
        <p><strong>Median tenant income: </strong>${project.median_tenant_income || 'N/A'}</p>
        <p><strong>Housing cost ratio: </strong>${project.housing_cost_ratio || 'N/A'}</p>`
    },
    {
      class: "tile full-bleed double",
      style: "grid-column: 3 / 5; grid-row: 5 / span 2;",
      image: "big3",
      alt: "Photo 8"
    },
    {
      class: "tile hatch",
      style: "grid-column: 5 / 6; grid-row: 5;",
      html: ""
    },
    {
      class: "tile text-left",
      style: "grid-column: 5 / 6; grid-row: 6;",
      html: `
        <p><strong>Materials Used:</strong></p>
        <p>${project.material_1 || ''}</p>
        <p>${project.material_2 || ''}</p>
        <p>${project.material_3 || ''}</p>
        <p>${project.material_4 || ''}</p>`
    },
    {
      class: "tile hatch",
      style: "grid-column: 2 / 3; grid-row: 6;",
      html: ""
    }
    
  ];

  for (const tile of tiles) {
    const div = document.createElement("div");
    div.className = tile.class;
    if (tile.style) div.style = tile.style;

    // Load image fallback if needed
    if (tile.image) {
      const src = await getImagePath(slug, tile.image);
      div.innerHTML = `<img src="${src}" alt="${tile.alt}" />`;
    } else {
      div.innerHTML = tile.html;
    }

    grid.appendChild(div);

    const img = div.querySelector("img");
    if (img) {
      img.style.cursor = "pointer";
      img.addEventListener("click", () => showPopup(img.src));
    }
    
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
  
  const titleTile = document.querySelector(".tile.title");
  const doubleTiles = document.querySelectorAll(".tile.full-bleed.double");
  const projectGrid = document.getElementById("projectGrid");

  if (titleTile && projectGrid) {
    const rowHeight = titleTile.offsetHeight;
    const gap = 15;
    const doubleHeight = 2 * rowHeight + gap;

    projectGrid.style.gridAutoRows = `${rowHeight}px`;

    doubleTiles.forEach(tile => {
      tile.style.height = `${doubleHeight}px`;
    });
  }

  setTimeout(() => {
    drawDashedLinesBetweenTileRows();
    drawVerticalDashedLines();
  }, 100);

}



window.addEventListener("resize", () => {
  loadProject(); // reloads and recalculates layout
});

// 🔍 Image popup
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

window.onload = loadProject;


function drawDashedLinesBetweenTileRows() {
  const grid = document.querySelector('.project-page .grid');
  if (!grid) return;

  // collect tiles that define rows
  const tiles = Array.from(grid.querySelectorAll('.tile, .project-page .description'));
  if (!tiles.length) return;

  // create/clear the line layer (sits behind tiles)
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

  // helper: rect in document coords
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

  // --- group tiles into visual rows ---
  const rowThreshold = 10; // px tolerance
  const rows = [];
  tiles.forEach(el => {
    const top = el.getBoundingClientRect().top;
    let row = rows.find(r => Math.abs(r.top - top) < rowThreshold);
    if (row) row.tiles.push(el);
    else rows.push({ top, tiles: [el] });
  });
  rows.sort((a, b) => a.top - b.top);
  if (rows.length < 2) return;

  // sort tiles in each row left→right so "first left-most" is index 0
  rows.forEach(r =>
    r.tiles.sort((a, b) => a.getBoundingClientRect().left - b.getBoundingClientRect().left)
  );

  // --- compute spacing per your spec ---
  const r1 = docRect(rows[0].tiles[0]);      // first tile, row 1
  const r2 = docRect(rows[1].tiles[0]);      // first tile, row 2
  const gap = r2.top - r1.bottom;            // distance between rows’ first tiles
  const x = r1.height + gap;                 // step size you defined

  // first dashed line at midpoint of the first gap
  let y = r1.bottom + gap / 2;               // document-space Y

  // number of lines = (number of rows - 1)
  const nLines = rows.length - 1;

  // compute horizontal span: across all tiles in grid
  let minLeft = Infinity, maxRight = -Infinity;
  rows.forEach(row => row.tiles.forEach(el => {
    const r = docRect(el);
    minLeft = Math.min(minLeft, r.left);
    maxRight = Math.max(maxRight, r.right);
  }));

  // draw lines
  for (let i = 0; i < nLines; i++) {
    const line = document.createElement('div');
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
    y += x; // subsequent lines spaced by x
  }
}


function drawVerticalDashedLines({
  selector = ".tile",
  lines = 4,
  rowThreshold = 10
} = {}) {
  const container = document.getElementById("projectGrid");
  if (!container) return;

  // remove old
  document.querySelectorAll(".vertical-grid-line").forEach(el => el.remove());

  // ----- first row -----
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

  // measure spacing
  const firstTileWidth = first.width;
  const measuredGap = (second.left - first.right);
  const cs = getComputedStyle(container);
  const cssGap = parseFloat(cs.columnGap || cs.gap || 0);
  const gap = measuredGap > 0 && measuredGap < firstTileWidth * 2 ? measuredGap : cssGap;

  // first gutter midpoint
  const xStart = (first.right + second.left) / 2 + window.scrollX;

  // ----- vertical span from tiles (top of first row to bottom of last) -----
  const tilesAll = Array.from(container.querySelectorAll(".tile, .description"));
  if (!tilesAll.length) return;

  const rectsAll = tilesAll.map(t => t.getBoundingClientRect());
  let topEdge    = Math.min(...rectsAll.map(r => r.top))    + window.scrollY;
  let bottomEdge = Math.max(...rectsAll.map(r => r.bottom)) + window.scrollY;
  let lineHeight = bottomEdge - topEdge;

  // offsets you wanted
  const offsetTop = -12;     // start a bit higher
  const offsetBottom = 12;  // end a bit lower
  topEdge   += offsetTop;
  lineHeight += offsetBottom - offsetTop;

  // ----- draw lines -----
  for (let i = 0; i < lines; i++) {
    const x = xStart + i * (firstTileWidth + gap);

    const line = document.createElement("div");
    line.className = "vertical-grid-line";
    line.style.position = "absolute";
    line.style.left = `${x}px`;
    line.style.top = `${topEdge}px`;
    line.style.height = `${lineHeight}px`;   // ← use lineHeight, not height
    line.style.width = "1px";
    line.style.backgroundImage =
      "repeating-linear-gradient(to bottom, #ccc 0, #ccc 4px, transparent 5px, transparent 9px)";
    line.style.pointerEvents = "none";
    line.style.zIndex = "-1";
    document.body.appendChild(line);
  }
}



window.addEventListener("resize", () => {
  // 🧹 Remove existing dashed lines
  document.querySelectorAll(".vertical-grid-line, .horizontal-grid-line").forEach(line => line.remove());

  // 🔁 Redraw
  drawDashedLinesBetweenTileRows();
  drawVerticalDashedLines();
});

let allProjects = []; // will be fetched from your JSON

// Fetch projects once
fetch("json_projects.json")
  .then(res => res.json())
  .then(data => {
    allProjects = data;
    setRandomPreview();
  });

// Pick a random project and attach its slug to the arrow container
function setRandomPreview() {
  const previews = document.querySelectorAll(".preview-card");

  previews.forEach(card => {
    const project = allProjects[Math.floor(Math.random() * allProjects.length)];

    // render the preview
    card.innerHTML = `
      <a href="page_project.html?slug=${project.slug}" class="preview-link">
        <img src="${project.image}" style="width:100%; height:150px; object-fit:cover;" />
        <h4>${project.title}</h4>
        <p>${project.location}</p>
      </a>
    `;

    // save the slug on the arrow wrapper so the arrow can use it
    const wrapper = card.closest(".nav-arrow");
    if (wrapper) wrapper.dataset.slug = project.slug;
  });
}

// make the arrow itself navigate to the previewed project
document.addEventListener("click", (e) => {
  const arrow = e.target.closest(".nav-arrow .arrow");
  if (!arrow) return;

  const wrapper = arrow.closest(".nav-arrow");
  const slug = wrapper && wrapper.dataset.slug;
  if (slug) {
    window.location.href = `page_project.html?slug=${slug}`;
  }
});
