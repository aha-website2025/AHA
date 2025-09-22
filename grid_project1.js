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
      style: "grid-column: 4 / 5; grid-row: 1 / span 2;",
      image: "big1",
      alt: "Photo "
    },
    {
      class: "tile full-bleed",
      style: "grid-column: 1 / 2; grid-row: 2 / 3;",
      image: "1",
      alt: "Photo 3"
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
        <p><strong># of inhabitants: </strong>${project.inhabitants_per_unit}</p>`
    },
    {
      class: "tile hatch",
      style: "grid-column: 1 / 2;",
      html: ""
    },
    {
      class: "tile full-bleed",
      style: "grid-column: 2 / 3; grid-row: 3;",
      image: "3",
      alt: "Photo 4"
    },
    {
      class: "tile blank",
      style: "grid-column: 2 / 3;",
      html: ""
    },
    {
      class: "tile blank",
      style: "grid-column: 3 / 4; grid-row: 3;",
      html: ""
    },
    {
      class: "description",
      style: "grid-column: 4 / 5; grid-row: 3 / span 2;",
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
      class: "tile full-bleed double",
      style: "grid-column: 2 / 4; grid-row: 4 / span 2;",
      image: "big2",
      alt: "Photo 5"
    },
    {
      class: "tile full-bleed",
      style: "grid-column: 1 / 2; grid-row: 5;",
      image: "4",
      alt: "Photo 6"
    },
    {
      class: "tile full-bleed",
      style: "grid-column: 4 / 5; grid-row: 5;",
      image: "5",
      alt: "Photo 7"
    },
    {
      class: "tile hatch",
      style: "grid-column: 1 / 2; grid-row: 6;",
      html: ""
    },
    {
      class: "tile full-bleed double",
      style: "grid-column: 3 / 5; grid-row: 6 / span 2;",
      image: "big3",
      alt: "Photo 8"
    },
    {
      class: "tile full-bleed",
      style: "grid-column: 1 / 2; grid-row: 7;",
      image: "2",
      alt: "Photo 9"
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
  const container = document.getElementById("projectGrid");
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

let allProjects = []; // will be fetched from your JSON

// Fetch projects once
fetch("projects.json")
  .then(res => res.json())
  .then(data => {
    allProjects = data;
    setRandomPreview();
  });

// Pick random project and inject into preview cards
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
