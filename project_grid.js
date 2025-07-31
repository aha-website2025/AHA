function toggleMenu() {
  const menu = document.getElementById("menuItems");
  menu.style.display = menu.style.display === "block" ? "none" : "block";
}

// 📁 Dynamic fallback loader
function getImagePath(slug, filenameBase) {
  return new Promise(resolve => {
    const tryJpg = `projects/${slug}/${filenameBase}.jpg`;
    const tryPng = `projects/${slug}/${filenameBase}.png`;

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

  const res = await fetch("projects.json");
  const projects = await res.json();
  const project = projects.find(p => p.slug === slug);

  if (!project) {
    document.body.innerHTML = "<h1>Project not found</h1>";
    return;
  }

  const grid = document.getElementById("projectGrid");

  const tiles = [
    {
      class: "tile title",
      style: "grid-column: 1 / 2;",
      html: `<h2>${project.title.toUpperCase()}</h2><p>${project.location}</p>`
    },
    {
      class: "tile blank",
      style: "grid-column: 2 / 3;",
      html: ""
    },
    {
      class: "tile full-bleed",
      style: "grid-column: 3 / 4; grid-row: 1 / 2;",
      image: "1",
      alt: "Photo 1"
    },
    {
      class: "tile full-bleed double",
      style: "grid-column: 4 / 5; grid-row: 1 / span 2;",
      image: "big1",
      alt: "Photo 2"
    },
    {
      class: "tile full-bleed",
      style: "grid-column: 1 / 2; grid-row: 2 / 3;",
      image: "2",
      alt: "Photo 3"
    },
    {
      class: "tile text-left",
      style: "grid-column: 2 / 3;",
      html: `
        <p><strong>Year completed: </strong>${project.year_completed}</p>
        <p><strong>Owner: </strong>${project.owner}</p>
        <p><strong>Architect: </strong>${project.architect}</p>
        <p><strong>Lot size: </strong>${project.lot_size_sqft}</p>`
    },
    {
      class: "tile text-left",
      style: "grid-column: 3 / 4;",
      html: `
        <p><strong>Total floor space: </strong>${project.floor_space_sqft}</p>
        <p><strong># of units: </strong>${project.units}</p>
        <p><strong>Unit distribution: </strong>${project.unit_distribution}</p>
        <p><strong># of inhabitants: </strong>${project.inhabitants_per_unit}</p>`
    },
    {
      class: "tile hatch",
      style: "grid-column: 1 / 2;",
      html: ""
    },
    {
      class: "tile full-bleed",
      style: "grid-column: 2 / 3; grid-row: 3;",
      image: "3",
      alt: "Photo 4"
    },
    {
      class: "tile blank",
      style: "grid-column: 2 / 3;",
      html: ""
    },
    {
      class: "description",
      style: "grid-column: 4 / 5; grid-row: 3 / span 2;",
      html: project.description
        .split(/\n\s*\n/)
        .map(p => `<p>${p.trim()}</p>`)
        .join("") + `<div class="expand-indicator">expand →</div>`
    },
    {
      class: "tile full-bleed double",
      style: "grid-column: 2 / 4; grid-row: 4 / span 2;",
      image: "big2",
      alt: "Photo 5"
    },
    {
      class: "tile full-bleed",
      style: "grid-column: 1 / 2; grid-row: 5;",
      image: "4",
      alt: "Photo 6"
    },
    {
      class: "tile full-bleed",
      style: "grid-column: 4 / 5; grid-row: 5;",
      image: "5",
      alt: "Photo 7"
    },
    {
      class: "tile hatch",
      style: "grid-column: 1 / 2; grid-row: 6;",
      html: ""
    },
    {
      class: "tile full-bleed double",
      style: "grid-column: 3 / 5; grid-row: 6 / span 2;",
      image: "big3",
      alt: "Photo 8"
    },
    {
      class: "tile full-bleed",
      style: "grid-column: 1 / 2; grid-row: 7;",
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
  
  const titleTile = document.querySelector(".tile.title");
  const doubleTiles = document.querySelectorAll(".tile.full-bleed.double");
  const projectGrid = document.getElementById("projectGrid");

  if (titleTile && projectGrid) {
    const rowHeight = titleTile.offsetHeight;
    const gap = 15;
    const doubleHeight = 2 * rowHeight + gap;

    projectGrid.style.gridAutoRows = `${rowHeight}px`;

    doubleTiles.forEach(tile => {
      tile.style.height = `${doubleHeight}px`;
    });
  }
}

window.addEventListener("resize", () => {
  loadProject(); // reloads and recalculates layout
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

window.onload = loadProject;

