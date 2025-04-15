function resizeImageToFitTile(img, tileWidth, tileHeight) {
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const tileRatio = tileWidth / tileHeight;
  
    if (imgRatio > tileRatio) {
      img.style.height = tileHeight + "px";
      img.style.width = "auto";
      img.style.marginLeft = `-${(img.offsetWidth - tileWidth) / 2}px`;
      img.style.marginTop = "0";
    } else {
      img.style.width = tileWidth + "px";
      img.style.height = "auto";
      img.style.marginTop = `-${(img.offsetHeight - tileHeight) / 2}px`;
      img.style.marginLeft = "0";
    }
  
    img.style.position = "relative";
    img.style.objectFit = "unset"; // ensures it doesn't interfere
    img.style.display = "block";
  }

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
        class: "tile blank", // ← this creates an empty tile!
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
        style: "grid-column: 1 / 2;", // change position as needed
        html: ""
      },
      {
        class: "tile",
        style: "grid-column: 1 / 2;",
        html: `<img src="projects/${slug}/3.jpg" alt="Photo 3" />`
      },
      {
        class: "tile blank", // ← this creates an empty tile!
        style: "grid-column: 2 / 3;",
        html: ""
      },
      {
        class: "description",
        style: "grid-column: 4 / 5; grid-row: 3 / span 2;", 
        html: `<p>${project.description}</p>`
      }
    ];
  
    tiles.forEach(tile => {
      const div = document.createElement("div");
      div.className = tile.class;
      if (tile.style) div.style = tile.style;
      div.innerHTML = tile.html;
      grid.appendChild(div);

        // ✅ Resize image inside tile
    const img = div.querySelector("img");
    if (img) {
      img.addEventListener("load", () => {
        const tileRect = div.getBoundingClientRect();
        resizeImageToFitTile(img, tileRect.width, tileRect.height);
      });
     }
    });
  }
  
  window.onload = loadProject;
  