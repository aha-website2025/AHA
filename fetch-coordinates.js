const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const projectsFolder = './projects';
const outputFile = './projects.json';

const extractField = (text, field) => {
  const regex = new RegExp(`${field}:\\s*(.*)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : null;
};

const getCoordinates = async (query) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'affordable-housing-catalogue' } });
  const data = await res.json();
  if (data.length > 0) {
    return { lat: data[0].lat, lon: data[0].lon };
  }
  return null;
};

(async () => {
  const folders = fs.readdirSync(projectsFolder, { withFileTypes: true }).filter(f => f.isDirectory());
  const projects = [];

  for (const folder of folders) {
    const infoPath = path.join(projectsFolder, folder.name, 'info.txt');
    if (!fs.existsSync(infoPath)) continue;

    const content = fs.readFileSync(infoPath, 'utf-8');
    const title = extractField(content, 'title');
    const location = extractField(content, 'location');
    const category = extractField(content, 'category');
    const lat = extractField(content, 'latitude');
    const lon = extractField(content, 'longitude');

    // ⏭️ Skip utopian category
    if (category && category.toLowerCase() === 'utopian') {
      console.log(`⏭️ Skipping "${title}" (category: utopian)`);
      continue;
    }

    let coordinates = lat && lon ? { lat, lon } : null;

    // 🌍 Fetch coordinates if not found
    if (!coordinates && location) {
      const query = `${title || ''}, ${location}`;
      console.log(`Looking up coordinates for "${query}"...`);
      coordinates = await getCoordinates(query);
    }

    const projectData = {
      title,
      location,
      folder: folder.name,
      category,
      ...coordinates && { coordinates }
    };

    projects.push(projectData);

    // 📝 Append coordinates to info.txt
    if (coordinates && (!lat || !lon)) {
      const updatedContent = content.trim() + `\nlatitude: ${coordinates.lat}\nlongitude: ${coordinates.lon}\n`;
      fs.writeFileSync(infoPath, updatedContent);
    }
  }

  fs.writeFileSync(outputFile, JSON.stringify(projects, null, 2));
  console.log(`✅ Saved ${projects.length} projects with coordinates to ${outputFile}`);
})();
