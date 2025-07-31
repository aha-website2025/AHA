const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

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
  const files = fs.readdirSync(projectsFolder).filter(f => f.endsWith('.txt'));
  const projects = [];

  for (const file of files) {
    const fullPath = path.join(projectsFolder, file);
    const content = fs.readFileSync(fullPath, 'utf-8');

    const title = extractField(content, 'title');
    const location = extractField(content, 'location');
    const lat = extractField(content, 'latitude');
    const lon = extractField(content, 'longitude');

    let coordinates = lat && lon ? { lat, lon } : null;

    if (!coordinates && location) {
      const query = `${title || ''}, ${location}`;
      console.log(`Looking up coordinates for "${query}"...`);
      coordinates = await getCoordinates(query);
    }

    const projectData = {
      title,
      location,
      ...coordinates && { coordinates }
    };

    projects.push(projectData);

    // (Optional) Write back GPS into original .txt file
    if (coordinates && !lat && !lon) {
      const newContent = content.trim() + `\nlatitude: ${coordinates.lat}\nlongitude: ${coordinates.lon}\n`;
      fs.writeFileSync(fullPath, newContent);
    }
  }

  fs.writeFileSync(outputFile, JSON.stringify(projects, null, 2));
  console.log(`Saved ${projects.length} projects with GPS to ${outputFile}`);
})();
