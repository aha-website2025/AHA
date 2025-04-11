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
  
  fetch("https://junothecat.github.io/housing-catalogue/projects.json")
    .then(res => res.json())
    .then(data => {
      const container = document.getElementById("grid-container");
      let dataIndex = 0;
  
      layout.forEach(cell => {
        const div = document.createElement("div");
  
        if (cell === "data" && dataIndex < data.length) {
          const item = data[dataIndex++];
          div.classList.add("tile");
          div.innerHTML = `
            <img src="${item.image}" alt="${item.title}" />
            <div class="info">
              <h4>${item.title}</h4>
              <p>${item.location}</p>
            </div>
          `;
        } else {
          div.classList.add("tile", cell);
        }
  
        container.appendChild(div);
      });
    });
  