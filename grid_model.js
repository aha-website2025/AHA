async function loadModelGrid() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get("slug");

  const res = await fetch("models.json");
  const models = await res.json();
  const model = models.find(m => m.slug === slug);

  if (!model) {
    document.body.innerHTML = "<h1>Model not found</h1>";
    return;
  }

  const grid = document.getElementById("grid-container");

  const tiles = [
    {
      class: "tile title",
      style: "grid-column: 1 / 2; grid-row: 1;",
      html: `
        <div class="model-content">
          <img src="${model.logo_image}" alt="${model.type}" class="model-image" />
          <div class="model-label"><h2>${model.type}</h2>
        </div>
      `
    },
    {
      class: "tile blank",
      style: "grid-column: 2 / 3;",
      html: ""
    },
    {
      class: "tile diagram",
      style: "grid-column: 3 / 6; grid-row: 1 / span 2;",
      image: model.diagram_image,
      alt: "Diagram"
    },
    {
      class: "tile description",
      style: "grid-column: 1 / span 2; grid-row: 2;",
      html: `<p>${model.description}</p>`
    }
    // Add more tiles if needed
  ];

  for (const tile of tiles) {
    const div = document.createElement("div");
    div.className = tile.class;
    if (tile.style) div.style = tile.style;

    if (tile.image) {
      div.innerHTML = `<img src="${tile.image}" alt="${tile.alt}" />`;
    } else {
      div.innerHTML = tile.html;
    }

    grid.appendChild(div);
  }
}

window.onload = loadModelGrid;
