const fs = require('fs');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';
const projects = require('../projects.json');

async function geocodeAddress(address) {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${accessToken}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.features?.[0]?.center || null; // [lng, lat]
}

(async () => {
  for (const project of projects) {
    if (
      project.category === 'utopian' || // skip utopian
      project.coords ||                 // skip if already has coords
      !project.address                  // skip if no address
    ) continue;

    console.log(`Looking up: ${project.address}`);
    const coords = await geocodeAddress(project.address);
    if (coords) {
      project.coords = coords; // store in correct format for Mapbox
      project.longitude = coords[0];
      project.latitude = coords[1];
    } else {
      console.warn(`❌ Failed to find coordinates for: ${project.title}`);
    }
  }

  fs.writeFileSync('./projects.json', JSON.stringify(projects, null, 2));
  console.log('✅ Coordinates added to projects.json');
})();
