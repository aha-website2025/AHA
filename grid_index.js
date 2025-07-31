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
  "hatch", "data", "model", "blank", "data"
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
            <img src="${modelImage.logo_image}" alt="${modelImage.type}" class="model-image">
            <div class="model-label">${modelImage.type}</div>
          </div>
        </a>
    `;
  } else {
    div.classList.add("tile", type); // 'hatch' or 'blank'
  }

  return div;
}

function renderGrid(projects) {
  const container = document.getElementById("grid-container");
  container.innerHTML = "";

  if (projects.length < allProjects.length) {
     // 🔥 Add filtered class
     container.classList.add('filtered');

     // Render filtered projects (simple flex)
     projects.forEach(project => {
       const tileDiv = createTile("data", project);
       container.appendChild(tileDiv);
     });
   } else {
     // 🔥 Remove filtered class
     container.classList.remove('filtered');
 
     // Full grid layout
     let dataIndex = 0;
     const shuffledModelImages = shuffleArray(allModels);
    let modelIndex = 0;
     layout.forEach(type => {
       let tileDiv;
 
       if (type === "data" && dataIndex < projects.length) {
         tileDiv = createTile("data", projects[dataIndex++]);
       } else if (type === "model" && modelIndex < shuffledModelImages.length) {
         tileDiv = createTile("model", null, shuffledModelImages[modelIndex++]);
       } else {
         tileDiv = createTile(type);
       }

      container.appendChild(tileDiv);
  });
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
  setTimeout(drawDashedLinesBetweenTileRows, 100);
}

function handleCategoryFilter(selectedCategory) {
  const filtered = allProjects.filter(project => {
    if (Array.isArray(project.categories)) {
      return project.categories.includes(selectedCategory);
    } else if (typeof project.category === 'string') {
      return project.category.toLowerCase() === selectedCategory.toLowerCase();
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

function toggleCategoryMenu() {
  const menu = document.getElementById("categoryMenu");
  const isVisible = menu.style.display === "block";
  menu.style.display = isVisible ? "none" : "block";
}


Promise.all([
  fetch("https://aha-website2025.github.io/AHA/projects.json").then(res => res.json()),
  fetch("https://aha-website2025.github.io/AHA/models.json").then(res => res.json())
]).then(([projectsData, modelsData]) => {
  allProjects = projectsData;
  allModels = modelsData;
  renderGrid(allProjects);

    setTimeout(() => {
      drawDashedLinesBetweenTileRows(); // horizontal lines
      drawVerticalDashedLines();        // vertical lines
    }, 100);
  });


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
    line.style.zIndex = "1000";

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
    line.style.zIndex = "1000";

    document.body.appendChild(line);
  }
}
