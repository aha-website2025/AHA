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

fetch("https://junothecat.github.io/housing-catalogue/projects.json")
  .then(res => res.json())
  .then(data => {
    allProjects = data;
    renderGrid(allProjects);
  });

function renderGrid(projects) {
  const container = document.getElementById("grid-container");
  container.innerHTML = "";
  let dataIndex = 0;

  layout.forEach(cell => {
    const div = document.createElement("div");

    if (cell === "data" && dataIndex < projects.length) {
      const item = projects[dataIndex++];
      div.classList.add("tile");
      div.innerHTML = `
        <a href="project.html?slug=${item.slug}" class="project-card">
          <img src="${item.image}" alt="${item.title}" />
          <div class="info">
            <h4>${item.title}</h4>
            <p>${item.location}</p>
          </div>
        </a>
      `;
    } else {
      div.classList.add("tile", cell);
    }

    container.appendChild(div);
  });
}

// 🔍 Search functionality
const searchInput = document.getElementById("searchInput");
if (searchInput) {
  searchInput.addEventListener("input", e => {
    const keyword = e.target.value.toLowerCase();

    const filtered = allProjects.filter(project =>
      Object.values(project).some(value =>
        String(value).toLowerCase().includes(keyword)
      )
    );

    renderGrid(filtered);
  });
}
