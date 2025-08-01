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
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug");

  const res = await fetch("json_models.json");
  const projects = await res.json();
  const project = projects.find(p => p.slug === slug);

  if (!project) {
    document.body.innerHTML = "<h1>Project not found</h1>";
    return;
  }

  const grid = document.getElementById("grid-container");

  const tiles = [

    {
      class: "tile title",
      style: "grid-column: 1 / 2; grid-row: 1;",
      html: `
        <img src="models/${slug}/logo.png" alt="${project.category}" class="model-logo" />
        <p>${project.category}</p>
    `,
    },
    {
      class: "tile full-bleed triple",
      style: "grid-column: 3 / 5; grid-row: 1 / span 2;",
      image: "diagram",
      alt: "Diagram"
    },
    {
      class: "tile hatch",
      style: "grid-column: 2 / 3; grid-row: 2;",
      html: ""
    },
    {
      class: "tile full-bleed",
      style: "grid-column: 1 / 2; grid-row: 3;",
      image: "6",
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
    div.classList.toggle("expanded");
      });
    }
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
  
}

async function loadRelatedProjects() {
  const res = await fetch("json_projects.json");
  const projects = await res.json();

  const relatedContainer = document.getElementById("related-projects");

  projects.forEach(project => {
    const div = document.createElement("div");
    div.classList.add("tile", "related-tile");
    div.innerHTML = `
      <a href="page_project.html?slug=${project.slug}">
        <img src="${project.thumbnail}" alt="${project.title}" />
        <p>${project.title}</p>
      </a>
    `;
    relatedContainer.appendChild(div);
  });
}


window.addEventListener("resize", () => {
  loadProject();
  loadRelatedProjects();
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
  await loadRelatedProjects();
};