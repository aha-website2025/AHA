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
      class: "tile",
      style: "grid-column: 1 / 2;",
      html: `
        <img src="${project.image}" alt="${project.title}" />
        <h2>${project.title.toUpperCase()}</h2>
        <p>${project.location}</p>
      `
    },
    {
      class: "tile blank",
      style: "grid-column: 2 / 3;",
      html: ""
    },
    {
      class: "tile full-bleed",
      style: "grid-column: 3 / 4; grid-row: 1 / 2;",
      html: `<img src="projects/${slug}/1.jpg" alt="Photo 1" />`
    },
    {
      class: "tile full-bleed double",
      style: "grid-column: 4 / 5; grid-row: 1 / span 2;",
      html: `<img src="projects/${slug}/big1.jpg" alt="Photo 2" />`
    },
    {
      class: "tile full-bleed",
      style: "grid-column: 1 / 2; grid-row: 2 / 3;",
      html: `<img src="projects/${slug}/2.jpg" alt="Photo 3" />`
    },
    {
      class: "tile",
      style: "grid-column: 2 / 3;",
      html: `
        <strong>Year completed:</strong> ${project.year_completed}<br>
        <strong>Owner:</strong> ${project.owner}<br>
        <strong>Architect:</strong> ${project.architect}<br>
        <strong>Lot size:</strong> ${project.lot_size_sqft} sqft
      `
    },
    {
      class: "tile",
      style: "grid-column: 3 / 4;",
      html: `
        <strong>Total floor space:</strong> ${project.floor_space_sqft} sqft<br>
        <strong># of units:</strong> ${project.units}<br>
        <strong>Unit distribution:</strong> ${project.unit_distribution}<br>
        <strong># of inhabitants:</strong> ${project.inhabitants_per_unit} people/unit
      `
    },
    {
      class: "tile hatch",
      style: "grid-column: 1 / 2;",
      html: ""
    },
    {
      class: "tile",
      style: "grid-column: 1 / 2;",
      html: `<img src="projects/${slug}/3.jpg" alt="Photo 3" />`
    },
    {
      class: "tile blank",
      style: "grid-column: 2 / 3;",
      html: ""
    },
    {
      class: "description",
      style: "grid-column: 4 / 5; grid-row: 3 / span 2;",
      html: `<p>${project.description}</p>`
    }
  ];

  // Render each tile
  tiles.forEach((tile, index) => {
    const div = document.createElement("div");
    div.className = tile.class;
    if (tile.style) div.style = tile.style;
    div.innerHTML = tile.html;
    grid.appendChild(div);

    // Add popup behavior to all image tiles except the first one
    const img = div.querySelector("img");
    if (img && index !== 0) {
      img.style.cursor = "pointer";
      img.addEventListener("click", () => {
        showPopup(img.src);
      });
    }
  });
}

// Helper to show popup
function showPopup(src) {
  const overlay = document.createElement("div");
  overlay.className = "image-popup-overlay";

  const popupImage = document.createElement("img");
  popupImage.className = "image-popup";
  popupImage.src = src;

  overlay.appendChild(popupImage);
  document.body.appendChild(overlay);

  overlay.addEventListener("click", () => {
    document.body.removeChild(overlay);
  });

  // Optional: lock scroll while open
  document.body.style.overflow = "hidden";
  overlay.addEventListener("click", () => {
    document.body.style.overflow = "";
  });
}

window.onload = loadProject;
