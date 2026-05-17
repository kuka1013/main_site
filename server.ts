import express from "express";
import path from "path";
import cors from "cors";
import fs from "fs";
import osmtogeojson from "osmtogeojson";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", vercel: !!process.env.VERCEL });
});

const typeMap: Record<string, string> = {
  // Shops
  'supermarket': 'Супермаркет', 'convenience': 'Продукты', 'clothes': 'Магазин одежды',
  'bakery': 'Пекарня', 'shoes': 'Обувной магазин', 'kiosk': 'Киоск', 'doityourself': 'Стройматериалы',
  'butcher': 'Мясной магазин', 'furniture': 'Мебельный магазин', 'jewelry': 'Ювелирный магазин', 
  'electronics': 'Магазин электроники', 'sports': 'Спортивный магазин', 'pet': 'Зоомагазин',
  'florist': 'Цветочный магазин', 'hardware': 'Хозяйственный магазин', 'alcohol': 'Алкогольный магазин',
  'books': 'Книжный магазин', 'mall': 'Торговый центр', 'gifts': 'Магазин подарков', 'car_parts': 'Автозапчасти',
  'beauty': 'Магазин косметики', 'mobile_phone': 'Салон связи', 'bicycle': 'Веломагазин', 'toys': 'Магазин игрушек',
  'copyshop': 'Копицентр', 'travel_agency': 'Турагентство', 'car': 'Автосалон', 'ticket': 'Билетная касса',

  // Amenities
  'cafe': 'Кофейня / Кафе', 'restaurant': 'Ресторан', 'fast_food': 'Фастфуд', 'bar': 'Бар', 'pub': 'Паб',
  'clinic': 'Клиника', 'pharmacy': 'Аптека', 'hospital': 'Больница', 'dentist': 'Стоматология', 
  'doctors': 'Врачи', 'veterinary': 'Ветеринарная клиника',
  'bank': 'Банк', 'atm': 'Банкомат', 'bureau_de_change': 'Обмен валют',
  'car_repair': 'Автосервис', 'car_wash': 'Автомойка', 'fuel': 'АЗС', 'parking': 'Парковка',
  'hairdresser': 'Салон красоты / Парикмахерская', 'beauty_salon': 'Салон красоты',
  'school': 'Школа', 'kindergarten': 'Детский сад', 'university': 'Университет', 'college': 'Колледж',
  'library': 'Библиотека', 'post_office': 'Почтовое отделение', 'police': 'Полиция',
  'cinema': 'Кинотеатр', 'theatre': 'Театр', 'nightclub': 'Ночной клуб',
  'marketplace': 'Рынок', 'car_rental': 'Прокат авто', 'vending_machine': 'Торговый автомат',
  'parcel_locker': 'Постамат', 'social_facility': 'Социальный объект', 'childcare': 'Присмотр за детьми',
  'events_venue': 'Ивент-площадка', 'massage': 'Массажный салон',
  
  // Leisure
  'fitness_centre': 'Фитнес-клуб', 'sports_centre': 'Спортивный центр', 'stadium': 'Стадион',
  'swimming_pool': 'Бассейн', 'park': 'Парк', 'playground': 'Детская площадка', 'dance': 'Школа танцев',
  'ice_rink': 'Каток', 'amusement_arcade': 'Зал игровых автоматов', 'escape_game': 'Квест',
  'sauna': 'Сауна / Баня', 'water_park': 'Аквапарк',

  // Healthcare
  'blood_donation': 'Центр крови', 'rehabilitation': 'Реабилитационный центр',

  // Offices & Craft
  'accountant': 'Бухгалтерские услуги', 'lawyer': 'Юридические услуги', 
  'tailor': 'Ателье', 'optician': 'Оптика', 'shoemaker': 'Ремонт обуви', 'key_cutter': 'Изготовление ключей',
  'photographer': 'Фотостудия', 'brewery': 'Пивоварня', 'caterer': 'Кейтеринг', 'cleaning': 'Клининг',
  
  // Extended requested translations
  'advertising_agency': 'Рекламное агентство', 'animal_training': 'Дрессировка животных',
  'arts_centre': 'Арт-центр', 'baby_goods': 'Детские товары', 'bathroom_furnishing': 'Сантехника',
  'beach_resort': 'База отдыха', 'beverages': 'Напитки', 'bookmaker': 'Букмекер',
  'car_seats': 'Автокресла', 'chemist': 'Бытовая химия', 'community_centre': 'Общественный центр',
  'company': 'Компания', 'cosmetics': 'Косметика', 'courthouse': 'Суд', 'craft': 'Ремесло',
  'driving_school': 'Автошкола', 'laundry': 'Прачечная', 'dry_cleaning': 'Химчистка',
  'travel_agent': 'Турагентство', 'newsagent': 'Газетный киоск', 'fabric': 'Ткани',
  'second_hand': 'Секонд-хенд', 'charity': 'Благотворительный фонд', 'antique': 'Антиквариат',
  'bicycle_repair': 'Ремонт велосипедов', 'motorcycle': 'Мотосалон', 'music': 'Музыкальный магазин',
  'musical_instrument': 'Музыкальные инструменты', 'photo': 'Фотосалон', 'seafood': 'Рыбный магазин',
  'stationery': 'Канцтовары', 'video': 'Видеомагазин', 'wine': 'Винный магазин', 'nutrition_supplements': 'Спортивное питание',
  
  // Real Estate & Mall
  'retail': 'Торговый центр', 'commercial': 'Бизнес-центр', 'office': 'Офис'
};

// Simple cache
const districtCache = new Map<string, { boundsGeoJson: any, businesses: any[], types: string[] }>();

// Predefined districts
const districtsList = [
  'Академический район', 'Алексеевский район', 'Алтуфьевский район', 'Бабушкинский район',
  'Басманный район', 'Бескудниковский район', 'Бутырский район', 'Войковский район',
  'Гагаринский район', 'Головинский район', 'Даниловский район', 'Дмитровский район',
  'Донской район', 'Краснопахорский район', 'Красносельский район', 'Ломоносовский район',
  'Лосиноостровский район', 'Мещанский район', 'Можайский район', 'Молжаниновский район',
  'Останкинский район', 'Пресненский район', 'Рязанский район', 'Савёловский район',
  'Таганский район', 'Тверской район', 'Тимирязевский район', 'Хорошёвский район',
  'Южнопортовый район', 'Ярославский район', 'район Арбат', 'район Аэропорт',
  'район Беговой', 'район Бирюлёво Восточное', 'район Бирюлёво Западное', 'район Богородское',
  'район Братеево', 'район Вешняки', 'район Внуково', 'район Восточное Дегунино',
  'район Восточное Измайлово', 'район Выхино-Жулебино', 'район Гольяново', 'район Дорогомилово',
  'район Замоскворечье', 'район Западное Дегунино', 'район Зюзино', 'район Зябликово',
  'район Ивановское', 'район Измайлово', 'район Капотня', 'район Коньково',
  'район Коптево', 'район Косино-Ухтомский', 'район Котловка', 'район Крылатское',
  'район Крюково', 'район Кузьминки', 'район Кунцево', 'район Куркино',
  'район Левобережный', 'район Лефортово', 'район Лианозово', 'район Люблино',
  'район Марфино', 'район Марьина Роща', 'район Марьино', 'район Матушкино',
  'район Метрогородок', 'район Митино', 'район Москворечье-Сабурово', 'район Нагатино-Садовники',
  'район Нагатинский Затон', 'район Нагорный', 'район Некрасовка', 'район Нижегородский',
  'район Ново-Переделкино', 'район Новокосино', 'район Обручевский', 'район Орехово-Борисово Северное',
  'район Орехово-Борисово Южное', 'район Очаково-Матвеевское', 'район Перово', 'район Печатники',
  'район Покровское-Стрешнево', 'район Преображенское', 'район Проспект Вернадского', 'район Раменки',
  'район Ростокино', 'район Савёлки', 'район Свиблово', 'район Северное Бутово',
  'район Северное Измайлово', 'район Северное Медведково', 'район Северное Тушино', 'район Северный',
  'район Силино', 'район Сокол', 'район Сокольники', 'район Солнцево',
  'район Старое Крюково', 'район Строгино', 'район Текстильщики', 'район Тёплый Стан',
  'район Тропарёво-Никулино', 'район Филевский Парк', 'район Фили-Давыдково', 'район Хамовники',
  'район Ховрино', 'район Хорошёво-Мнёвники', 'район Царицыно', 'район Черёмушки',
  'район Чертаново Северное', 'район Чертаново Центральное', 'район Чертаново Южное', 'район Щукино',
  'район Южное Бутово', 'район Южное Медведково', 'район Южное Тушино', 'район Якиманка',
  'район Ясенево'
];

app.get("/api/districts", (req, res) => {
  res.json(districtsList);
});

async function fetchDistrictData(district: string) {
  if (districtCache.has(district)) {
    return districtCache.get(district)!;
  }

  console.log(`Fetching real data for ${district}...`);
  const query = `
    [out:json][timeout:90];
    area["name"="${district}"]["admin_level"="8"]->.searchArea;
    rel["name"="${district}"]["admin_level"="8"];
    out geom;
    (
      nwr["shop"](area.searchArea);
      nwr["amenity"](area.searchArea);
      nwr["office"](area.searchArea);
      nwr["leisure"](area.searchArea);
      nwr["healthcare"](area.searchArea);
      nwr["craft"](area.searchArea);
      nwr["tourism"](area.searchArea);
      nwr["sport"](area.searchArea);
      nwr["club"](area.searchArea);
      nwr["man_made"](area.searchArea);
      nwr["building"](area.searchArea);
      nwr["historic"](area.searchArea);
      nwr["emergency"](area.searchArea);
      nwr(area.searchArea)["name"]["highway"!~"."]["route"!~"."]["boundary"!~"."]["place"!~"."]["public_transport"!~"."];
      nwr(area.searchArea)["brand"];
      nwr(area.searchArea)["operator"];
    );
    out center;
  `;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "MoscowBusinessRadar/1.0"
    },
    body: "data=" + encodeURIComponent(query)
  });
  
  if (!response.ok) throw new Error(`Overpass returned ${response.status}`);
  
  const data = await response.json();

  // 1. Generate Boundary GeoJSON from relations
  const boundaryRelations = data.elements.filter((e: any) => e.type === "relation" && e.tags?.admin_level === "8" && e.tags?.name === district);
  let boundsGeoJson = null;
  if (boundaryRelations.length > 0) {
    const geojsonData = osmtogeojson({ elements: boundaryRelations });
    if (geojsonData.features.length > 0) {
       boundsGeoJson = geojsonData.features[0]; // Polygon or MultiPolygon
    }
  }

  // 2. Parse businesses
  const boundaryIds = new Set(boundaryRelations.map((r: any) => r.id));
  const nodeElements = data.elements.filter((e: any) => !boundaryIds.has(e.id));
  
  let db = nodeElements
    .filter((e: any) => e.tags && (e.lat || e.center?.lat))
    .map((e: any) => {
      // Skip non-businesses that bloat the map
      if (e.tags.amenity && ['parking', 'parking_space', 'waste_basket', 'waste_disposal', 'recycling', 'bench', 'shelter', 'post_box', 'bicycle_parking', 'drinking_water', 'toilets', 'fountain', 'hunting_stand'].includes(e.tags.amenity)) return null;
      if (e.tags.leisure && ['playground', 'pitch', 'park', 'garden', 'nature_reserve', 'sports_centre', 'stadium', 'track'].includes(e.tags.leisure) && !e.tags.name) return null;
      if (e.tags.leisure === 'playground') return null; // Explicitly block playgrounds
      if (e.tags.highway || e.tags.public_transport || e.tags.railway) return null;
      if (e.tags.barrier) return null;
      
      let typeKey = e.tags.shop || e.tags.amenity || e.tags.office || e.tags.leisure || e.tags.craft || e.tags.healthcare || e.tags.tourism || e.tags.building || e.tags.man_made || e.tags.club || e.tags.sport || e.tags.historic || e.tags.emergency;
      
      let typeName = typeMap[typeKey];
      if (!typeName) {
         if (e.tags.shop) typeName = 'Магазин';
         else if (e.tags.office) typeName = 'Офис';
         else if (e.tags.craft) typeName = 'Сервис / Услуги';
         else if (e.tags.healthcare) typeName = 'Медицина';
         else if (e.tags.tourism) typeName = 'Туризм';
         else typeName = 'Другое';
      }

      // Skip non-business generic things if they just have "Другое" and no name
      if (typeName === 'Другое' && !e.tags.name && !e.tags.brand && !e.tags.operator && !e.tags['name:ru']) {
         return null;
      }

      // Skip non-business "buildings"
      if (e.tags.building && !e.tags.shop && !e.tags.amenity && !e.tags.office && !e.tags.leisure && !e.tags.craft && !e.tags.healthcare) {
         if (!e.tags.name && !e.tags.brand && !e.tags.operator && !e.tags['name:ru']) {
            return null; // Skip unnamed generic buildings
         }
      }

      let website = e.tags.website || e.tags['contact:website'] || e.tags['url'] || null;
      if (website && !website.startsWith('http')) website = 'https://' + website;

      // Ensure address is correctly formatted
      let street = e.tags['addr:street'];
      if (!street && e.tags['addr:place']) {
          street = e.tags['addr:place']; // fallback for places like "Ходынский бульвар" 
      }
      const addressParts = [street, e.tags['addr:housenumber']].filter(Boolean);
      let addressString = addressParts.join(', ');

      return {
        id: e.id,
        name: e.tags.name || e.tags.brand || e.tags['name:ru'] || e.tags.operator || (typeKey ? typeName : 'Организация'),
        type: typeName,
        lat: e.lat || e.center?.lat,
        lon: e.lon || e.center?.lon,
        address: addressString || 'г. Москва',
        phone: e.tags.phone || e.tags['contact:phone'] || 'Не указан',
        website: website,
        hasWebsite: !!website,
        status: 'none' // can be 'none', 'rejected', 'interested'
      };
    })
    .filter(Boolean);

  // Remove duplicates by coordinates roughly
  db = db.filter((v: any, i: number, a: any[]) => a.findIndex((t) => (Math.abs(t.lat - v.lat) < 0.0001 && Math.abs(t.lon - v.lon) < 0.0001)) === i);

  const types = Array.from(new Set(db.map((b: any) => b.type))).sort() as string[];

  const result = { boundsGeoJson, businesses: db, types };
  districtCache.set(district, result);
  return result;
}


app.get("/api/businesses", async (req, res) => {
  const { district } = req.query;
  
  if (!district || typeof district !== 'string') {
    return res.status(400).json({ error: 'district parameter is required' });
  }

  try {
    const data = await fetchDistrictData(district);
    
    res.json({
        boundsGeoJson: data.boundsGeoJson,
        businesses: data.businesses
    });
  } catch (err: any) {
    console.error("Error fetching data:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/businesses/:id/status", (req, res) => {
  const id = parseInt(req.params.id);
  const { district } = req.query;
  const { status } = req.body;
  
  if (district && typeof district === 'string' && districtCache.has(district)) {
      const data = districtCache.get(district)!;
      const business = data.businesses.find((b: any) => b.id === id);
      if (business) {
        business.status = status;
        return res.json(business);
      }
  }
  res.status(404).json({ error: "Not found" });
});

app.get("/api/business-types", async (req, res) => {
  const { district } = req.query;
  if (!district || typeof district !== 'string') {
    return res.status(400).json({ error: 'district parameter is required' });
  }
  
  try {
     const data = await fetchDistrictData(district);
     res.json(data.types);
  } catch (e) {
     res.status(500).json([]);
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Don't start the server if we're running as a Vercel serverless function
if (!process.env.VERCEL) {
  startServer();
}

export default app;

