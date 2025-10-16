function toggleMenu() {
  const menu = document.getElementById("menuItems");
  const isVisible = menu.style.display === "block";
  menu.style.display = isVisible ? "none" : "block";
}

const layout = [
  "hatch", "data", "data", "hatch", "blank",
  "data", "data", "hatch", "model", "data",
  "blank", "model", "data", "data", "hatch",
  "data", "hatch", "data", "data", "blank",
  "hatch", "data", "model", "hatch", "data"
];

let allProjects = [];
let allModels = [];


function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function createTile(type, project = null, modelImage = null) {
  const div = document.createElement("div");

  if (type === "data" && project) {
    div.classList.add("tile", "flip-card");
    div.innerHTML = `
      <a href="page_project.html?slug=${project.slug}" class="project-card">  
        <div class="flip-inner">
            <div class="flip-front">
              <img src="${project.image}" alt="${project.title}" />
            </div>
            <div class="flip-back">
              <div class="flip-text">
                <h4>${project.title}</h4>
                <p>${project.location}</p>
              </div>
            </div>
          </div>
      </a>
        `;
  } else if (type === "model") {
     div.classList.add("tile", "model-tile");
      div.innerHTML = `
        <a href="page_model.html?slug=${modelImage.slug}">
          <div class="model-content">
            <img src="${modelImage.logo_image}" alt="${modelImage.title}" class="model-image">
            <div class="model-label">${modelImage.title}</div>
          </div>
        </a>
    `;
  } else {
    div.classList.add("tile", type); // 'hatch' or 'blank'
  }

  return div;
}
function renderGrid(projects) {
  const container = document.getElementById("grid");
  container.innerHTML = "";

  if (projects.length < allProjects.length) {
    // FILTERED MODE (keep order as-is)
    container.classList.add('filtered');
    projects.forEach(project => container.appendChild(createTile("data", project)));
    return;
  }

  // FULL LAYOUT MODE — RANDOMIZE ORDER + REPEAT PATTERN
  container.classList.remove('filtered');

  const dataOrder = shuffleArray(projects);          // randomize projects on each full render
  const models    = shuffleArray(allModels || []);   // randomize models too
  let dataIndex   = 0;
  let modelIndex  = 0;

  // Keep emitting tiles by cycling over the pattern,
  // but STOP immediately after placing the final 'data' tile.
  for (let i = 0; ; i++) {
    const type = layout[i % layout.length];

    if (type === "data") {
      const p = dataOrder[dataIndex];
      if (!p) break; // no more projects, safety
      container.appendChild(createTile("data", p));
      dataIndex++;
      if (dataIndex === dataOrder.length) break; // STOP right after last data placed
    } else if (type === "model") {
      if (models.length > 0) {
        container.appendChild(createTile("model", null, models[modelIndex % models.length]));
        modelIndex++;
      } else {
        // if no models available, fall back to a decorative blank/hatch
        container.appendChild(createTile("hatch"));
      }
    } else {
      // 'hatch' or 'blank'
      container.appendChild(createTile(type));
    }
  }
}



function handleSearch() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();

  const filtered = allProjects.filter(project =>
    Object.values(project).some(value =>
      String(value).toLowerCase().includes(keyword)
    )
  );

  renderGrid(filtered);

  // draw BOTH kinds of guides for search results, just like filters
  setTimeout(() => {
    drawDashedLinesBetweenTileRows();  // rows - 1
    drawVerticalDashedLines();         // stop where the row stops
  }, 100);
}


function handleCategoryFilter(selectedCategory) {
  const filtered = allProjects.filter(project => {
    if (Array.isArray(project.categories)) {
      return project.categories.includes(selectedCategory);
    } else if (typeof project.category === 'string') {
      return project.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase();
    }
    return false;
  });

  renderGrid(filtered);
  setTimeout(drawDashedLinesBetweenTileRows, 100);
  document.getElementById("categoryMenu").style.display = "none"; // close menu
}

function showAllProjects() {
  renderGrid(allProjects);
  setTimeout(drawDashedLinesBetweenTileRows, 100);
  document.getElementById("categoryMenu").style.display = "none"; // close the menu
}

function showOnlyModels() {
  const grid = document.getElementById("grid");
  grid.innerHTML = ""; // clear grid

  allModels.forEach(model => {
    const tile = createTile("model", null, model);  // use "model" type and pass model as third param
    grid.appendChild(tile);
  });
  document.getElementById("categoryMenu").style.display = "none";
}



function toggleCategoryMenu() {
  const menu = document.getElementById("categoryMenu");
  const isVisible = menu.style.display === "block";
  menu.style.display = isVisible ? "none" : "block";
}


Promise.all([
  fetch("https://aha-website2025.github.io/AHA/json_projects.json").then(res => res.json()),
  fetch("https://aha-website2025.github.io/AHA/json_models.json").then(res => res.json())
]).then(([projectsData, modelsData]) => {
  allProjects = projectsData;
  allModels   = modelsData;

  // initial full grid render
  renderGrid(allProjects);

  // draw dashed lines once
  setTimeout(() => {
    drawDashedLinesBetweenTileRows();
    drawVerticalDashedLines();
  }, 100);

  // ✨ initialize filters after data + first render
  initAHAFilters({
    projects: allProjects,
    renderGrid, // pass the same render function you already use
    onAfterRender: () => {
      // redraw dashed lines after every filter action
      setTimeout(() => {
        drawDashedLinesBetweenTileRows();
        drawVerticalDashedLines();
      }, 100);
    }
  });
}).catch(err => console.error("Failed to load data:", err));



function drawDashedLinesBetweenTileRows() {
  const container = document.getElementById("grid");
  if (!container) return;

  // remove previous lines
  document.querySelectorAll(".horizontal-grid-line").forEach(line => line.remove());

  const tiles = Array.from(container.querySelectorAll(".tile"));
  if (tiles.length === 0) return;

  // group tiles by row based on top position
  const rows = {};
  tiles.forEach(tile => {
    const rect = tile.getBoundingClientRect();
    const top = Math.round(rect.top);
    if (!rows[top]) rows[top] = [];
    rows[top].push(tile);
  });

  const sortedTops = Object.keys(rows).map(Number).sort((a, b) => a - b);
  const rowCount = sortedTops.length;

  // draw only (rows - 1) lines
  for (let i = 0; i < rowCount - 1; i++) {
    const currentRowTiles = rows[sortedTops[i]];
    const rect = currentRowTiles[0].getBoundingClientRect();
    const nextRowTop = sortedTops[i + 1];

    const y = (rect.bottom + nextRowTop) / 2 + window.scrollY;

    // use min/max x bounds of the current row
    const leftEdge = Math.min(...currentRowTiles.map(t => t.getBoundingClientRect().left)) + window.scrollX;
    const rightEdge = Math.max(...currentRowTiles.map(t => t.getBoundingClientRect().right)) + window.scrollX;

    const line = document.createElement("div");
    line.className = "horizontal-grid-line";
    line.style.position = "absolute";
    line.style.top = `${y}px`;
    line.style.left = `${leftEdge - 15}px`;
    line.style.width = `${(rightEdge - leftEdge) + 30}px`;
    line.style.height = "1px";
    line.style.backgroundImage = "repeating-linear-gradient(to right, #ccc 0, #ccc 4px, transparent 5px, transparent 9px)";
    line.style.pointerEvents = "none";
    line.style.zIndex = "1";
    document.body.appendChild(line);
  }
}


function drawVerticalDashedLines() {
  const container = document.getElementById("grid");
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

  for (let i = 0; i < colList.length - 1; i++) {
    const c1 = colList[i];
    const c2 = colList[i + 1];

    // x midway between columns
    const midX = (c1.left + c1.width + c2.left) / 2;

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

