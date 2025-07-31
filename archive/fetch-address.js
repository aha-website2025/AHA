const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// 🔐 Insert your Mapbox access token here
const MAPBOX_TOKEN = 'pk.eyJ1IjoiYWhhdGxhcyIsImEiOiJjbWF1Nm15YmMwNjk5Mmtwc2loc2Rud2loIn0.IucseItbLdKhoVw9bslAzQ';

const projectsFolder = './projects';
const outputFile = './projects.json';

const extractField = (text, field) => {
  const regex = new RegExp(`${field}:\\s*(.*)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : null;
};

const getAddressFromMapbox = async (query) => {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_TOKEN}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.features && data.features.length > 0) {
    return data.features[0].place_name;
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
    const existingAddress = extractField(content, 'address');
    const category = extractField(content, 'category');

    if (existingAddress || !location || !title || category?.toLowerCase() === 'utopian') {
      console.log(`⏭️ Skipping ${title}...`);
      continue;
    }

    const query = `${title}, ${location}`;
    console.log(`🔎 Searching address for: ${query}`);
    const address = await getAddressFromMapbox(query);

    if (address) {
      console.log(`📍 Found: ${address}`);
      const updatedContent = content.trim() + `\naddress: ${address}\n`;
      fs.writeFileSync(infoPath, updatedContent);

      projects.push({ title, location, address, folder: folder.name });
    } else {
      console.log(`❌ Address not found for: ${query}`);
    }
  }

  fs.writeFileSync(outputFile, JSON.stringify(projects, null, 2));
  console.log(`✅ Saved ${projects.length} project addresses to ${outputFile}`);
})();
