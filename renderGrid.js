function toggleMenu() {
  const menu = document.getElementById("menuItems");
  const isVisible = menu.style.display === "block";
  menu.style.display = isVisible ? "none" : "block";
}

const layout = [
  "hatch", "data", "data", "hatch", "blank",
  "data", "data", "hatch", "data", "data",
  "blank", "data", "data", "data", "hatch",
  "data", "hatch", "data", "data", "blank",
  "hatch", "data", "blank", "data", "data"
];

let allProjects = [];

function createTile(type, project = null) {
  const div = document.createElement("div");

  if (type === "data" && project) {
    div.classList.add("tile", "flip-card");
    div.innerHTML = `
      <a href="project.html?slug=${project.slug}" class="project-card">  
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
}

function handleSearch() {
  const keyword = document.getElementById("searchInput").value.toLowerCase();

  const filtered = allProjects.filter(project =>
    Object.values(project).some(value =>
      String(value).toLowerCase().includes(keyword)
    )
  );

  renderGrid(filtered);
  setTimeout(drawDashedLinesBetweenTiles, 100);
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
  setTimeout(drawDashedLinesBetweenTiles, 100);
  document.getElementById("categoryMenu").style.display = "none"; // close menu
}

function showAllProjects() {
  renderGrid(allProjects);
  setTimeout(drawDashedLinesBetweenTiles, 100);
  document.getElementById("categoryMenu").style.display = "none"; // close the menu
}

function toggleCategoryMenu() {
  const menu = document.getElementById("categoryMenu");
  const isVisible = menu.style.display === "block";
  menu.style.display = isVisible ? "none" : "block";
}


// Load data and initialize grid + flip animation
fetch("https://aha-website2025.github.io/AHA/projects.json")
  .then(res => res.json())
  .then(data => {
    allProjects = data;
    renderGrid(allProjects);
    setTimeout(drawDashedLinesBetweenTiles, 100);
  });

function drawDashedLinesBetweenTiles() {
  const container = document.getElementById("grid-container");
  const tiles = Array.from(container.querySelectorAll(".tile"));

  // Remove old lines
  container.querySelectorAll(".grid-line").forEach(line => line.remove());

  for (let i = 0; i < tiles.length; i++) {
    const tileA = tiles[i];
    const rectA = tileA.getBoundingClientRect();

    for (let j = i + 1; j < tiles.length; j++) {
      const tileB = tiles[j];
      const rectB = tileB.getBoundingClientRect();

      // Horizontal adjacency
      if (Math.abs(rectA.top - rectB.top) < 5 &&
          Math.abs(rectA.right - rectB.left) < 5) {
        const line = document.createElement("div");
        line.className = "grid-line";
        line.style.position = "absolute";
        line.style.top = `${tileA.offsetTop}px`;
        line.style.left = `${tileA.offsetLeft + tileA.offsetWidth - 1}px`;
        line.style.width = "1px";
        line.style.height = `${tileA.offsetHeight}px`;
        line.style.borderLeft = "1px dashed #ccc";
        line.style.pointerEvents = "none";
        line.style.backgroundColor = "red"; // test visibility
        container.appendChild(line);
      }

      // Vertical adjacency
      if (Math.abs(rectA.left - rectB.left) < 5 &&
          Math.abs(rectA.bottom - rectB.top) < 5) {
        const line = document.createElement("div");
        line.className = "grid-line";
        line.style.position = "absolute";
        line.style.left = `${tileA.offsetLeft}px`;
        line.style.top = `${tileA.offsetTop + tileA.offsetHeight - 1}px`;
        line.style.width = `${tileA.offsetWidth}px`;
        line.style.height = "1px";
        line.style.borderTop = "1px dashed #ccc";
        line.style.pointerEvents = "none";
        line.style.backgroundColor = "red"; // test visibility
        container.appendChild(line);
      }
    }
  }
}


  