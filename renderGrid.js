function toggleMenu() {
  const menu = document.getElementById("menuItems");
  const isVisible = menu.style.display === "block";
  menu.style.display = isVisible ? "none" : "block";
}

const layout = [
  "blank", "data", "data", "hatch", "blank",
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
