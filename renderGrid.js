function toggleMenu() {
  const menu = document.getElementById("menuItems");
  const isVisible = menu.style.display === "block";
  menu.style.display = isVisible ? "none" : "block";
}

let allProjects = [];

// Renders a tile (either project or filler)
function createTile(type, project = null) {
  const div = document.createElement("div");

  if (type === "project") {
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

// Generate a grid layout with fillers
function renderGrid(projects) {
  const container = document.getElementById("grid-container");
  container.innerHTML = "";

  const totalColumns = 5;
  const totalItems = projects.length;
  const tiles = [];

  for (let i = 0; i < totalItems; i++) {
    tiles.push({ type: "project", project: projects[i] });

    // Add hatch/blank every 3–5 tiles
    if (Math.random() < 0.2) {
      tiles.push({ type: Math.random() > 0.5 ? "hatch" : "blank" });
    }
  }

  tiles.forEach(tile => {
    const div =
      tile.type === "project"
        ? createTile("project", tile.project)
        : createTile(tile.type);
    container.appendChild(div);
  });
}

// Load data
fetch("https://junothecat.github.io/housing-catalogue/projects.json")
  .then(res => res.json())
  .then(data => {
    allProjects = data;
    renderGrid(allProjects);
  });

// 🔍 Search
function handleSearch() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();
  const filtered = allProjects.filter(project =>
    Object.values(project).some(value =>
      String(value).toLowerCase().includes(keyword)
    )
  );
  renderGrid(filtered);
}
