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
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get("slug");
    
    console.log("Loading model with slug:", slug);

  const res = await fetch("json_models.json");
  const projects = await res.json();
  const project = projects.find(p => p.slug === slug);

  if (!project) {
    console.error("Project not found for slug:", slug);
    document.body.innerHTML = "<h1>Project not found</h1>";
    return;
  }
  
  console.log("Found project:", project);

  const grid = document.getElementById("grid-container");

  const tiles = [

    {
      class: "tile title",
      style: "grid-column: 1 / 2; grid-row: 1;",
      html: `
        <img src="models/${slug}/logo.png" alt="${project.title}" class="model-logo" />
        <p class="model-title">${project.title}</p>
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

  console.log("Total tiles to render:", tiles.length);
  
  for (const tile of tiles) {
    console.log("Rendering tile:", tile.class);
    const div = document.createElement("div");
    div.className = tile.class;
    if (tile.style) div.style.cssText = tile.style;

    // Load image fallback if needed
    if (tile.image) {
      const src = await getImagePath(slug, tile.image);
      console.log("Image loaded for", tile.class, ":", src);
      div.innerHTML = `<img src="${src}" alt="${tile.alt}" />`;
    } else {
      div.innerHTML = tile.html;
    }

    grid.appendChild(div);
    console.log("Tile appended:", tile.class);

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

  // Add related projects after all main tiles
  const res2 = await fetch("json_projects.json");
  const allProjects = await res2.json();
  const relatedPool = allProjects.filter(
    p => p.category && project.category && 
         p.category.toLowerCase() === project.category.toLowerCase() && 
         p.slug !== project.slug
  );

  const related = relatedPool
    .sort(() => 0.5 - Math.random()) // shuffle
    .slice(0, 2); // take 2

  related.forEach((p, idx) => {
    const div = document.createElement('div');
    div.className = "tile full-bleed";
    div.style = `grid-column: ${idx + 1} / ${idx + 2}; grid-row: 3;`;

    div.innerHTML = `
      <a href="page_project.html?slug=${p.slug}">
        <img src="projects/${p.slug}/image.jpg" alt="${p.title}" style="width: 100%; height: 100%; object-fit: cover;" />
      </a>
    `;

    grid.appendChild(div);
  });
  
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
  } catch (error) {
    console.error("Error loading project:", error);
    console.error("Error stack:", error.stack);
  }
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
  const tiles = Array.from(document.querySelectorAll('.tile, .project-page .description'));
  if (tiles.length === 0) return;

  const rowThreshold = 10; // Allow up to 10px difference in top values to group tiles in same row
  const rows = [];

  // Group tiles into rows based on vertical position (within threshold)
  tiles.forEach(tile => {
    const rect = tile.getBoundingClientRect();
    const top = rect.top;

    let foundRow = false;
    for (let row of rows) {
      if (Math.abs(row.top - top) < rowThreshold) {
        row.tiles.push(tile);
        foundRow = true;
        break;
      }
    }

    if (!foundRow) {
      rows.push({ top, tiles: [tile] });
    }
  });

  // Sort rows by top position
  rows.sort((a, b) => a.top - b.top);

  // Compute max horizontal span across all rows
  let maxLeft = Infinity;
  let maxRight = -Infinity;

  rows.forEach(row => {
    row.tiles.forEach(tile => {
      const rect = tile.getBoundingClientRect();
      maxLeft = Math.min(maxLeft, rect.left);
      maxRight = Math.max(maxRight, rect.right);
    });
  });

  const totalLineWidth = maxRight - maxLeft;

  // Draw lines between each row
  for (let i = 0; i < rows.length - 1; i++) {
    const row1 = rows[i];
    const row2 = rows[i + 1];

    const rect1 = row1.tiles[0].getBoundingClientRect();
    const rect2 = row2.tiles[0].getBoundingClientRect();

    const y1 = rect1.bottom + window.scrollY;
    const y2 = rect2.top + window.scrollY;
    const midpoint = (y1 + y2) / 2;

    const line = document.createElement("div");
    line.style.position = "absolute";
    line.style.top = `${midpoint}px`;
    line.style.left = `${maxLeft - 15 + window.scrollX}px`;
    line.style.width = `${totalLineWidth + 30}px`;
    line.style.height = "1px";
    line.style.backgroundImage = "repeating-linear-gradient(to right, #ccc 0, #ccc 4px, transparent 5px, transparent 9px)";
    line.style.pointerEvents = "none";
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