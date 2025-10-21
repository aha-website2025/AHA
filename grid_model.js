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
    },
    {
      class: "tile hatch",
      style: "grid-column: 1 / 2; grid-row: 4;",
      html: ""
    },
    {
      class: "tile blank",
      style: "grid-column: 3 / 4; grid-row: 4;",
      html: ""
    },
    {
      class: "tile blank",
      style: "grid-column: 2 / 3; grid-row: 5;",
      html: ""
    },
    {
      class: "tile hatch",
      style: "grid-column: 4 / 5; grid-row: 5;",
      html: ""
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
  console.log("Fetching all housing examples...");
  
  const res2 = await fetch("json_projects.json");
  const allProjects = await res2.json();
  console.log("All projects loaded:", allProjects.length);
  
  // Show all projects as related examples
  const relatedPool = allProjects.filter(p => p.slug !== slug);
  
  console.log("Projects to display:", relatedPool.length);

  const related = relatedPool
    .sort(() => 0.5 - Math.random()); // shuffle all projects
  
  console.log("Selected related projects:", related.length);

  // Row 3: 2 related projects (columns 1-2)
  if (related.length >= 2) {
    related.slice(0, 2).forEach((p, idx) => {
      const div = document.createElement('div');
      div.className = "tile flip-card";
      div.style.cssText = `grid-column: ${idx + 1} / ${idx + 2}; grid-row: 3;`;

      div.innerHTML = `
        <a href="page_project.html?slug=${p.slug}" class="project-card">
          <div class="flip-inner">
            <div class="flip-front">
              <img src="${p.image}" alt="${p.title}" />
            </div>
            <div class="flip-back">
              <div class="flip-text">
                <h4>${p.title}</h4>
                <p>${p.location || ''}</p>
              </div>
            </div>
          </div>
        </a>
      `;

      grid.appendChild(div);
      console.log("Added related project tile (row 3):", p.title);
    });
  }

  // Rows 4 onwards: Repeat pattern with hatches and blanks
  // Row 4 pattern: hatch (col 1), data (col 2), blank (col 3), data (col 4)
  // Row 5 pattern: data (col 1), blank (col 2), data (col 3), hatch (col 4)
  let projectIndex = 2; // Start after the first 2 projects in row 3
  let currentRow = 4;
  
  while (projectIndex < related.length) {
    const isEvenRow = (currentRow % 2) === 0;
    
    if (isEvenRow) {
      // Even row pattern: hatch, data, blank, data (cols 1, 2, 3, 4)
      
      // Hatch at column 1
      const hatchDiv = document.createElement('div');
      hatchDiv.className = "tile hatch";
      hatchDiv.style.cssText = `grid-column: 1 / 2; grid-row: ${currentRow};`;
      grid.appendChild(hatchDiv);
      
      // Data at column 2
      if (projectIndex < related.length) {
        const p = related[projectIndex];
        const div = document.createElement('div');
        div.className = "tile flip-card";
        div.style.cssText = `grid-column: 2 / 3; grid-row: ${currentRow};`;
        div.innerHTML = `
          <a href="page_project.html?slug=${p.slug}" class="project-card">
            <div class="flip-inner">
              <div class="flip-front">
                <img src="${p.image}" alt="${p.title}" />
              </div>
              <div class="flip-back">
                <div class="flip-text">
                  <h4>${p.title}</h4>
                  <p>${p.location || ''}</p>
                </div>
              </div>
            </div>
          </a>
        `;
        grid.appendChild(div);
        console.log(`Added related project tile (row ${currentRow}, col 2):`, p.title);
        projectIndex++;
      }
      
      // Blank at column 3
      const blankDiv = document.createElement('div');
      blankDiv.className = "tile blank";
      blankDiv.style.cssText = `grid-column: 3 / 4; grid-row: ${currentRow};`;
      grid.appendChild(blankDiv);
      
      // Data at column 4
      if (projectIndex < related.length) {
        const p = related[projectIndex];
        const div = document.createElement('div');
        div.className = "tile flip-card";
        div.style.cssText = `grid-column: 4 / 5; grid-row: ${currentRow};`;
        div.innerHTML = `
          <a href="page_project.html?slug=${p.slug}" class="project-card">
            <div class="flip-inner">
              <div class="flip-front">
                <img src="${p.image}" alt="${p.title}" />
              </div>
              <div class="flip-back">
                <div class="flip-text">
                  <h4>${p.title}</h4>
                  <p>${p.location || ''}</p>
                </div>
              </div>
            </div>
          </a>
        `;
        grid.appendChild(div);
        console.log(`Added related project tile (row ${currentRow}, col 4):`, p.title);
        projectIndex++;
      }
      
    } else {
      // Odd row pattern: data, blank, data, hatch (cols 1, 2, 3, 4)
      
      // Data at column 1
      if (projectIndex < related.length) {
        const p = related[projectIndex];
        const div = document.createElement('div');
        div.className = "tile flip-card";
        div.style.cssText = `grid-column: 1 / 2; grid-row: ${currentRow};`;
        div.innerHTML = `
          <a href="page_project.html?slug=${p.slug}" class="project-card">
            <div class="flip-inner">
              <div class="flip-front">
                <img src="${p.image}" alt="${p.title}" />
              </div>
              <div class="flip-back">
                <div class="flip-text">
                  <h4>${p.title}</h4>
                  <p>${p.location || ''}</p>
                </div>
              </div>
            </div>
          </a>
        `;
        grid.appendChild(div);
        console.log(`Added related project tile (row ${currentRow}, col 1):`, p.title);
        projectIndex++;
      }
      
      // Blank at column 2
      const blankDiv = document.createElement('div');
      blankDiv.className = "tile blank";
      blankDiv.style.cssText = `grid-column: 2 / 3; grid-row: ${currentRow};`;
      grid.appendChild(blankDiv);
      
      // Data at column 3
      if (projectIndex < related.length) {
        const p = related[projectIndex];
        const div = document.createElement('div');
        div.className = "tile flip-card";
        div.style.cssText = `grid-column: 3 / 4; grid-row: ${currentRow};`;
        div.innerHTML = `
          <a href="page_project.html?slug=${p.slug}" class="project-card">
            <div class="flip-inner">
              <div class="flip-front">
                <img src="${p.image}" alt="${p.title}" />
              </div>
              <div class="flip-back">
                <div class="flip-text">
                  <h4>${p.title}</h4>
                  <p>${p.location || ''}</p>
                </div>
              </div>
            </div>
          </a>
        `;
        grid.appendChild(div);
        console.log(`Added related project tile (row ${currentRow}, col 3):`, p.title);
        projectIndex++;
      }
      
      // Hatch at column 4
      const hatchDiv = document.createElement('div');
      hatchDiv.className = "tile hatch";
      hatchDiv.style.cssText = `grid-column: 4 / 5; grid-row: ${currentRow};`;
      grid.appendChild(hatchDiv);
    }
    
    currentRow++;
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
      console.log("Drawing dashed lines...");
      drawDashedLinesBetweenTileRows();
      drawVerticalDashedLines();
      console.log("Dashed lines complete");
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
  console.log("drawDashedLinesBetweenTileRows called");
  const tiles = Array.from(document.querySelectorAll('.tile, .project-page .description'));
  console.log("Found tiles:", tiles.length);
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
  if (!container) return;

  // remove old lines
  document.querySelectorAll(".vertical-grid-line").forEach(line => line.remove());

  const tiles = Array.from(container.querySelectorAll(".tile")).filter(el => el.offsetParent !== null);
  if (tiles.length === 0) return;

  // group by column (left edge)
  const columns = new Map();
  tiles.forEach(tile => {
    const r = tile.getBoundingClientRect();
    const left = Math.round(r.left + window.scrollX);
    if (!columns.has(left)) columns.set(left, { rects: [], width: r.width });
    columns.get(left).rects.push(r);
  });

  const colList = [...columns.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([left, info]) => {
      const tops = info.rects.map(rr => rr.top + window.scrollY);
      const bottoms = info.rects.map(rr => rr.bottom + window.scrollY);
      return {
        left,
        width: info.width,
        topMin: Math.min(...tops),
        bottomMax: Math.max(...bottoms)
      };
    });

  if (colList.length < 2) return;

  const topEdge = Math.min(...colList.map(c => c.topMin));

  // Calculate tile width and gap from first two columns
  const tileWidth = colList[0].width;
  const firstColRight = colList[0].left + colList[0].width;
  const secondColLeft = colList[1].left;
  const gap = secondColLeft - firstColRight;
  
  // Position of first divider (midway between columns 1 and 2)
  const firstDividerX = firstColRight + (gap / 2);
  
  // Increment for each subsequent divider (tile width + gap)
  const increment = tileWidth + gap;

  for (let i = 0; i < colList.length - 1; i++) {
    const c1 = colList[i];
    const c2 = colList[i + 1];

    // Calculate X position: first divider + (i * increment)
    const midX = firstDividerX + (i * increment);

    // ⬅️ use the TALLER of the two columns
    const bottomEdgeForDivider = Math.max(c1.bottomMax, c2.bottomMax);

    const h = bottomEdgeForDivider - topEdge;
    if (h <= 0) continue;

    const line = document.createElement("div");
    line.className = "vertical-grid-line";
    line.style.position = "absolute";
    line.style.top = `${topEdge - 15}px`;      // keep your vertical padding
    line.style.left = `${midX}px`;
    line.style.height = `${h + 30}px`;         // +30 (15 top + 15 bottom) padding
    line.style.width = "1px";
    line.style.backgroundImage =
      "repeating-linear-gradient(to bottom, #ccc 0, #ccc 4px, transparent 5px, transparent 9px)";
    line.style.pointerEvents = "none";
    line.style.zIndex = "1";

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

// ========================================
// Navigation Arrow Logic for Random Models
// ========================================

let allModels = [];

// Fetch all models and set up navigation arrows
async function setupModelNavigation() {
  try {
    const res = await fetch("json_models.json");
    allModels = await res.json();
    
    // Set random previews for both arrows
    setRandomModelPreview();
  } catch (error) {
    console.error("Error setting up model navigation:", error);
  }
}

// Pick a random model and attach its slug to the arrow container
function setRandomModelPreview() {
  const previews = document.querySelectorAll(".preview-card");

  previews.forEach(card => {
    const model = allModels[Math.floor(Math.random() * allModels.length)];

    // render the preview with model logo
    card.innerHTML = `
      <a href="page_model.html?slug=${model.slug}">
        <img src="models/${model.slug}/logo.png" alt="${model.title}" />
        <h4>${model.title}</h4>
      </a>
    `;

    // save the slug on the arrow wrapper so the arrow can use it
    const wrapper = card.closest(".nav-arrow");
    if (wrapper) wrapper.dataset.slug = model.slug;
  });
}

// make the arrow itself navigate to the previewed model
document.addEventListener("click", (e) => {
  const arrow = e.target.closest(".nav-arrow .arrow");
  if (!arrow) return;

  const wrapper = arrow.closest(".nav-arrow");
  const slug = wrapper && wrapper.dataset.slug;
  if (slug) {
    window.location.href = `page_model.html?slug=${slug}`;
  }
});

// Initialize navigation on page load
setupModelNavigation();