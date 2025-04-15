function toggleMenu() {
  const menu = document.getElementById("menuItems");
  const isVisible = menu.style.display === "block";
  menu.style.display = isVisible ? "none" : "block";
}

const layout = [
  "hatch", "data", "data", "hatch", "blank",
  "data", "data", "hatch", "data", "data",
  "blank", "data", "data", "data", "hatch",
  "data", "hatch", "data", "data", "blank"
];

let allProjects = [];

function createTile(type, project = null) {
  const div = document.createElement("div");

  if (type === "data" && project) {
    div.classList.add("tile");
    div.innerHTML = `
      <a href="project.html?slug=${project.slug}" class="project-card">
        <img src="${project.image}" alt="${project.title}" />
        <div class="info">
          <h4>${project.title}</h4>
          <p>${project.location}</p>
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

  let dataIndex = 0;

  layout.forEach(type => {
    let tileDiv;

    if (type === "data" && dataIndex < projects.length) {
      tileDiv = createTile("data", projects[dataIndex++]);
    } else {
      tileDiv = createTile(type);
    }

    container.appendChild(tileDiv);
  });
}

function handleSearch() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();

  const filtered = allProjects.filter(project =>
    Object.values(project).some(value =>
      String(value).toLowerCase().includes(keyword)
    )
  );

  renderGrid(filtered);
}

// Load data and initialize grid
fetch("https://junothecat.github.io/housing-catalogue/projects.json")
  .then(res => res.json())
  .then(data => {
    allProjects = data;
    renderGrid(allProjects);
  });

  function sequentialFlipByRow() {
    const tiles = Array.from(document.querySelectorAll(".tile"));
    const gridCols = 5; // Set to your actual column count
    const rowMap = new Map();
  
    // Group tiles by row
    tiles.forEach((tile, i) => {
      const row = Math.floor(i / gridCols);
      if (!rowMap.has(row)) rowMap.set(row, []);
      rowMap.get(row).push({ tile, index: i });
    });
  
    // Pick one tile per row to flip, stagger timing
    Array.from(rowMap.entries()).forEach(([row, rowTiles], i) => {
      // Pick a random tile in this row
      const blackTiles = rowTiles.filter(obj =>
        obj.tile.classList.contains("blank") ||
        obj.tile.classList.contains("tile") &&
        !obj.tile.querySelector("img") // no image = filler
      );
  
      if (blackTiles.length > 0) {
        const pick = blackTiles[Math.floor(Math.random() * blackTiles.length)].tile;
        setTimeout(() => {
          pick.classList.add("flip-in");
        }, i * 400); // stagger delay
      }
    });
  }
  
  // Call this after grid has been created
  window.addEventListener("load", () => {
    setTimeout(sequentialFlipByRow, 500); // short delay after render
  });
  