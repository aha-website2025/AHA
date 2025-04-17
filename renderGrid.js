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

// Load data and initialize grid + flip animation
fetch("https://junothecat.github.io/housing-catalogue/projects.json")
  .then(res => res.json())
  .then(data => {
    allProjects = data;
    renderGrid(allProjects);
    setTimeout(sequentialFlipProjects, 300); // 👈 trigger animation after render
  });

  function sequentialFlipProjects() {
    const allTiles = Array.from(document.querySelectorAll(".tile"));
    const columns = 5;
  
    const rows = [];
    for (let i = 0; i < allTiles.length; i += columns) {
      rows.push(allTiles.slice(i, i + columns));
    }
  
    rows.forEach((row, i) => {
      const projectTile = row.find(tile =>
        !tile.classList.contains("blank") &&
        !tile.classList.contains("hatch")
      );
  
      if (projectTile) {
        setTimeout(() => {
          projectTile.classList.add("flip-in");
        }, i * 400); // staggered delay per row
      }
    });
  }
  
  