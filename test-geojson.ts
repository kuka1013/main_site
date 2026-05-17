import fs from "fs";
import osmtogeojson from "osmtogeojson";

async function run() {
  const query = `
    [out:json][timeout:90];
    area["name"="район Хорошёво-Мнёвники"]["admin_level"="8"]->.searchArea;
    rel["name"="район Хорошёво-Мнёвники"]["admin_level"="8"];
    out geom;
  `;
  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "data=" + encodeURIComponent(query)
  });
  const data = await response.json();
  const geojson = osmtogeojson(data);
  console.log("Features:", geojson.features.length);
  if (geojson.features.length) {
      console.log(geojson.features[0].geometry.type);
  }
}
run();
