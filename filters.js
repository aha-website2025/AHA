/* filters.js — AHA filters with a global, right-aligned pill board
   Use: initAHAFilters({ projects, renderGrid, gridSelector, infoPath, onAfterRender })
*/
(function (w) {
  // ---------- helpers ----------
  const toArr = v => !v ? [] : String(v).split(/[;,\/|]/).map(s => s.trim()).filter(Boolean);
  const norm  = s => String(s).toLowerCase();
  const cap   = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const esc   = s => (window.CSS && CSS.escape) ? CSS.escape(s) : s.replace(/[^\w-]/g, '\\$&');

  function parseInfoTxt(text) {
    const out = {};
    text.split(/\r?\n/).forEach(line => {
      const m = line.match(/^\s*([A-Za-z0-9 _\-/#+&]+)\s*:\s*(.+)\s*$/);
      if (!m) return;
      const key = m[1].trim().toLowerCase().replace(/\s+/g, "_");
      out[key]  = m[2].trim();
    });
    return out;
  }

  async function augmentFromInfo(projects, infoPath) {
    await Promise.all(projects.map(async p => {
      try {
        const txt  = await (await fetch(infoPath(p.slug))).text();
        const meta = parseInfoTxt(txt);
        p._typology = toArr(meta.typology).map(norm);
        // Collect all material_1, material_2, material_3, material_4 values
        // Format: "Material (Description)" - extract only "Material" for filter
        p._material = [
          meta.material_1,
          meta.material_2,
          meta.material_3,
          meta.material_4
        ].filter(Boolean).map(v => {
          const trimmed = v.trim();
          // Extract text before parenthesis if present
          const match = trimmed.match(/^([^(]+)/);
          if (match) {
            const materialName = match[1].trim().toLowerCase();
            
            // Special case: "CLT" - all caps
            if (materialName === 'clt') {
              return 'CLT';
            }
            
            // Special case: "reinforced concrete" - keep full phrase
            if (materialName === 'reinforced concrete') {
              return 'reinforced concrete';
            }
            
            return materialName;
          }
          return norm(trimmed);
        });
        p._model    = toArr(meta.model).map(norm);
      } catch {
        p._typology = []; p._material = []; p._model = [];
      }
    }));
  }

  // ---------- GLOBAL pill board ----------
// ---------- GLOBAL pill board anchored to Typology (left of it) ----------
function ensureGlobalPillBoard() {
  // anchor on the Typology group
  const anchor = document.querySelector('.filter-group[data-key="typology"]');
  if (!anchor) return null;

  // make the anchor a positioning context
  if (getComputedStyle(anchor).position === 'static') {
    anchor.style.position = 'relative';
  }

  // create board if missing
  let board = document.getElementById('pillBoard');
  if (!board) {
    board = document.createElement('div');
    board.id = 'pillBoard';

    // position: to the LEFT of Typology, baseline-aligned with buttons
    board.style.position = 'absolute';
    board.style.right = '100%';    // sit just left of the anchor
    board.style.marginRight = '10px'; // gap between pills and Typology
    board.style.bottom = '0';      // baseline align with buttons

    // stack upward, right-justified
    board.style.display = 'flex';
    board.style.flexDirection = 'column-reverse';
    board.style.alignItems = 'flex-end';
    board.style.gap = '6px';
    board.style.zIndex = '20';

    anchor.appendChild(board);
  }
  return board;
}


  function addPillGlobal(key, value) {
    const board = ensureGlobalPillBoard();
    if (!board) return;
    if (board.querySelector(`.filter-pill[data-key="${key}"][data-value="${esc(value)}"]`)) return;

    const pill = document.createElement('span');
    pill.className = 'filter-pill';
    pill.dataset.key = key;
    pill.dataset.value = value;
    pill.innerHTML = `${cap(value)}<button type="button" class="pill-x" aria-label="Remove ${value}">&times;</button>`;
    board.appendChild(pill);
  }

  function removePillGlobal(key, value) {
    const board = ensureGlobalPillBoard();
    if (!board) return;
    const pill = board.querySelector(`.filter-pill[data-key="${key}"][data-value="${esc(value)}"]`);
    if (pill) pill.remove();
  }

  function clearPillBoard() {
    const board = ensureGlobalPillBoard();
    if (board) board.innerHTML = "";
  }

  // ---------- Menus ----------
  function buildMenus(state) {
    const { projects, selected } = state;
    const sets = { typology:new Set(), material:new Set(), model:new Set() };

    projects.forEach(p => {
      p._typology.forEach(v => sets.typology.add(v));
      p._material.forEach(v => sets.material.add(v));
      p._model.forEach(v => sets.model.add(v));
    });

    ["typology","material","model"].forEach(key => {
      const group = document.querySelector(`.filter-group[data-key="${key}"]`);
      if (!group) return;

      const menu = group.querySelector(".filter-menu");
      const btn  = group.querySelector(".filter-toggle");
      menu.innerHTML = "";

      // Build options
      [...sets[key]].sort().forEach(v => {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "filter-chip";
        chip.dataset.value = v;
        chip.textContent = cap(v);

        // initial sync (if state pre-populated)
        if (selected[key].has(v)) {
          chip.classList.add("active");
          addPillGlobal(key, v);
        }

        chip.addEventListener("click", e => {
          e.stopPropagation();
          if (selected[key].has(v)) {
            selected[key].delete(v);
            chip.classList.remove("active");
            removePillGlobal(key, v);
          } else {
            selected[key].add(v);
            chip.classList.add("active");
            addPillGlobal(key, v);       // pill immediately
          }
          applyFilters(state);
        });

        menu.appendChild(chip);
      });

      // open/close this dropdown
      btn.addEventListener("click", e => {
        e.stopPropagation();
        document.querySelectorAll(".filter-menu.open").forEach(m => m.classList.remove("open"));
        menu.classList.toggle("open");
      });
    });

    // click outside closes menus
    document.addEventListener("click", () =>
      document.querySelectorAll(".filter-menu.open").forEach(m => m.classList.remove("open"))
    );

    // Global pill remove (handles any key)
    document.addEventListener('click', e => {
      if (!e.target.classList.contains('pill-x')) return;
      const pill  = e.target.closest('.filter-pill');
      const key   = pill.dataset.key;
      const value = pill.dataset.value;

      // update state + unhighlight corresponding chip
      state.selected[key].delete(value);
      const group = document.querySelector(`.filter-group[data-key="${key}"]`);
      if (group) {
        const chip = group.querySelector(`.filter-chip[data-value="${esc(value)}"]`);
        if (chip) chip.classList.remove('active');
      }

      pill.remove();
      applyFilters(state);
    });

    // CLEAR ALL
    const clearBtn = document.getElementById("clearFilters");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        Object.values(selected).forEach(s => s.clear());
        document.querySelectorAll(".filter-chip.active").forEach(c => c.classList.remove("active"));
        clearPillBoard();
        applyFilters(state);
      });
    }
  }

  // ---------- filtering ----------
  function applyFilters(state) {
    const { projects, renderGrid, selected, onAfterRender } = state;
    const wants = {
      typology: [...selected.typology],
      material: [...selected.material],
      model:    [...selected.model]
    };
    const okIn = (arr, list) => list.length === 0 ? true : list.some(v => arr.includes(v));

    const filtered = projects.filter(p =>
      okIn(p._typology, wants.typology) &&
      okIn(p._material, wants.material) &&
      okIn(p._model,    wants.model)
    );

    renderGrid(filtered);
    if (typeof onAfterRender === "function") onAfterRender();
  }

  // ---------- init ----------
  async function initAHAFilters({
    projects,
    renderGrid,
    gridSelector = "#grid",
    infoPath = slug => `projects/${encodeURIComponent(slug)}/info.txt`,
    onAfterRender
  }) {
    if (!projects || !renderGrid) {
      console.error("initAHAFilters: provide { projects, renderGrid }");
      return;
    }

    const state = {
      projects,
      renderGrid,
      gridEl: document.querySelector(gridSelector),
      selected: { typology:new Set(), material:new Set(), model:new Set() },
      onAfterRender
    };

    await augmentFromInfo(state.projects, infoPath);
    buildMenus(state);
    ensureGlobalPillBoard();    // make sure the board exists

    // expose applyFilters for rare external triggers
    w.applyFilters = () => applyFilters(state);

    // initial render
    applyFilters(state);
  }

  w.initAHAFilters = initAHAFilters;
})(window);
