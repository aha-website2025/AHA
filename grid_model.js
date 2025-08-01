function toggleMenu() {
  const menu = document.getElementById("menuItems");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

// 📁 Dynamic fallback loader
function getImagePath(slug, filenameBase) {
  return new Promise(resolve => {
    const tryJpg = `models/${slug}/${filenameBase}.jpg`;
    const tryPng = `models/${slug}/${filenameBase}.png`;

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

  const res = await fetch("json_models.json");
  const projects = await res.json();
  const project = projects.find(p => p.slug === slug);

  if (!project) {
    document.body.innerHTML = "<h1>Project not found</h1>";
    return;
  }

  const grid = document.getElementById("grid-container");

  const tiles = [

    {
      class: "tile title",
      style: "grid-column: 1 / 2; grid-row: 1;",
      html: `
        <img src="models/${slug}/logo.png" alt="${project.title}" class="model-logo" />
        <p>${project.title}</p>
      </div>
    `,
    },
    {
      class: "tile full-bleed triple",
      style: "grid-column: 3 / 5; grid-row: 1 / span 2;",
      image: "diagram",
      alt: "Diagram"
    },
    {
      class: "tile blank",
      style: "grid-column: 1 / 2; grid-row: 2;",
      html: ""
    },
    {
      class: "tile hatch",
      style: "grid-column: 2 / 3; grid-row: 2;",
      html: ""
    },
    {
      class: "description",
      style: "grid-column: 3 / 5; grid-row: 3;",
      html: project.description
        .split(/\n\s*\n/)
        .map(p => `<p>${p.trim()}</p>`)
        .join("") 
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

    const res2 = await fetch("projects.json");
    const allProjects = await res2.json();
     const relatedPool = allProjects
      .filter(p => p.category.toLowerCase() === project.category.toLowerCase() && p.slug !== project.slug);

    const related = relatedPool
      .sort(() => 0.5 - Math.random()) // shuffle
      .slice(0, 2);      

    related.forEach((p, idx) => {
      const div = document.createElement('div');
      div.className = "tile full-bleed";
      div.style = `grid-column: ${idx + 1} / ${idx + 2}; grid-row: 3;`;

      div.innerHTML = `
        <a href="project.html?slug=${p.slug}">
          <img src="projects/${p.slug}/image.jpg" alt="${p.title}" />
        </a>
      `;
      grid.appendChild(div);
    });


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
  
    // ⬇️ Enforce 1:0.85 aspect ratio for all tiles
  const allTiles = document.querySelectorAll(".project-page .tile, .project-page .tile.hatch");
  allTiles.forEach(tile => {
    const width = tile.offsetWidth;
    tile.style.height = (width * 0.85) + "px";
  });


  const titleTile = document.querySelector(".tile.title");
  const doubleTiles = document.querySelectorAll(".tile.full-bleed.triple");
  const gridContainer = document.getElementById("grid-container");

  if (titleTile && gridContainer) {
    const rowHeight = titleTile.offsetHeight;
    const gap = 15;
    const doubleHeight = 2 * rowHeight + gap;

    gridContainer.style.gridAutoRows = `${rowHeight}px`;

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
  loadProject();
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

window.onload = async () => {
  await loadProject();
   
};



function drawDashedLinesBetweenTileRows() {
  const tiles = Array.from(document.querySelectorAll('.tile'));
  if (tiles.length === 0) return;

  const gap = 15; // tile gap in px
  const rows = {};

  // Group tiles by row (based on top position)
  tiles.forEach(tile => {
    const rect = tile.getBoundingClientRect();
    const top = Math.round(rect.top);

    if (!rows[top]) rows[top] = [];
    rows[top].push(tile);
  });

  const sortedTops = Object.keys(rows).map(Number).sort((a, b) => a - b);

  for (let i = 0; i < sortedTops.length - 1; i++) {
    const row1 = rows[sortedTops[i]];
    const row2 = rows[sortedTops[i + 1]];

    const rect1 = row1[0].getBoundingClientRect();
    const rect2 = row2[0].getBoundingClientRect();

    const y1 = rect1.bottom;
    const y2 = rect2.top;
    const midpoint = (y1 + y2) / 2 + window.scrollY;

    // Get leftmost and rightmost bounds
    const leftEdge = Math.min(...row1.map(tile => tile.getBoundingClientRect().left)) + window.scrollX;
    const rightEdge = Math.max(...row1.map(tile => tile.getBoundingClientRect().right)) + window.scrollX;

    const line = document.createElement("div");
    line.style.position = "absolute";
    line.style.top = `${midpoint}px`;
    line.style.left = `${leftEdge - 15}px`;
    line.style.width = `${(rightEdge - leftEdge) + 30}px`;
    line.style.borderTop = "none";
    line.style.height = "1px";
    line.style.backgroundImage = "repeating-linear-gradient(to right, #ccc 0, #ccc 4px, transparent 5px, transparent 9px)";
    line.style.pointerEvents = "none";
    line.style.zIndex = "10";

    document.body.appendChild(line);
  }
}


function drawVerticalDashedLines() {
  const container = document.getElementById("grid-container");
  const tiles = Array.from(container.querySelectorAll(".tile"));

  // Remove old lines
  document.querySelectorAll(".vertical-grid-line").forEach(line => line.remove());

  if (tiles.length === 0) return;

  const columns = new Map();

  tiles.forEach(tile => {
    const rect = tile.getBoundingClientRect();
    const left = Math.round(rect.left + window.scrollX);
    if (!columns.has(left)) columns.set(left, []);
    columns.get(left).push(rect);
  });

  const sortedColumns = [...columns.entries()].sort((a, b) => a[0] - b[0]);

  const topEdge = Math.min(...tiles.map(tile => tile.getBoundingClientRect().top + window.scrollY));
  const bottomEdge = Math.max(...tiles.map(tile => tile.getBoundingClientRect().bottom + window.scrollY));
  const gridHeight = bottomEdge - topEdge;

  for (let i = 0; i < sortedColumns.length - 1; i++) {
    const [left1, rects1] = sortedColumns[i];
    const [left2] = sortedColumns[i + 1];

    const midX = (left1 + rects1[0].width + left2) / 2;

    const line = document.createElement("div");
    line.className = "vertical-grid-line";
    line.style.position = "absolute";
    line.style.top = `${topEdge - 15}px`;
    line.style.left = `${midX}px`;
    line.style.height = `${gridHeight + 30}px`;
    line.style.width = "1px";
    line.style.backgroundImage = "repeating-linear-gradient(to bottom, #ccc 0, #ccc 4px, transparent 5px, transparent 9px)";
    line.style.pointerEvents = "none";
    line.style.zIndex = "10";

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