import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Map as MapIcon, Filter, Layers, Info, FilterX, EyeOff, MapPin, CheckCircle, X, ChevronDown, User, LogOut } from 'lucide-react';
import { YMaps, Map, ObjectManager, ZoomControl, GeolocationControl, Polygon } from '@pbe/react-yandex-maps';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { auth, db } from './firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, Timestamp } from 'firebase/firestore';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

function CustomSelect({ value, onChange, options, icon: Icon, placeholder }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find((o: any) => o.value === value)?.label || placeholder;

  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
     const handler = (e: MouseEvent) => {
       if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
     };
     document.addEventListener('mousedown', handler);
     return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div 
        className={cn("w-full relative flex items-center bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 transition-all cursor-pointer", isOpen && "ring-2 ring-blue-500 bg-white border-blue-500")}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon className="ml-3 text-gray-400 shrink-0" size={16} />
        <div className="w-full pl-2 pr-10 py-2.5 text-sm text-gray-700 truncate">{selectedLabel}</div>
        <ChevronDown className={cn("absolute right-3 text-gray-400 transition-transform", isOpen && "rotate-180")} size={16} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
            className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
          >
            {options.map((o: any) => (
              <div 
                key={o.value} 
                onClick={() => { onChange(o.value); setIsOpen(false); }}
                className={cn("px-4 py-2.5 text-sm cursor-pointer transition-colors", value === o.value ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50 text-gray-700")}
              >
                {o.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface Business {
  id: number;
  name: string;
  type: string;
  lat: number;
  lon: number;
  address: string;
  phone: string;
  website: string | null;
  hasWebsite: boolean;
  status: 'none' | 'rejected' | 'interested';
}

const YANDEX_API_KEY = '6fe0bb30-68ab-4f00-8e7a-040b20adc406';

export default function App() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [types, setTypes] = useState<string[]>([]);
  
  const [districts, setDistricts] = useState<string[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [isDistrictDropdownOpen, setIsDistrictDropdownOpen] = useState(false);
  const [districtSearch, setDistrictSearch] = useState('');
  
  const [districtBoundsGeoJson, setDistrictBoundsGeoJson] = useState<any>(null);

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [searchDebounced, setSearchDebounced] = useState('');
  
  const [selectedType, setSelectedType] = useState('all');
  const [websiteFilter, setWebsiteFilter] = useState<'all' | 'true' | 'false' | 'interested'>('all');
  const [hideRejected, setHideRejected] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);

  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [firestoreStatuses, setFirestoreStatuses] = useState<Record<number, string>>({});

  const [mapState, setMapState] = useState({
    center: [55.751574, 37.573856],
    zoom: 11
  });

  const mapRef = useRef<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    fetch('/api/districts')
      .then(r => r.json())
      .then(d => {
        setDistricts(d);
        setInitialLoading(false);
      });
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setSearchDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!selectedDistrict || !districts.includes(selectedDistrict)) {
       setBusinesses([]);
       setDistrictBoundsGeoJson(null);
       return;
    }
    
    setLoading(true);

    let isSubscribed = true;
    const abortController = new AbortController();

    fetch(`/api/businesses?district=${encodeURIComponent(selectedDistrict)}`, { signal: abortController.signal })
      .then(async res => {
          if (!res.ok) throw new Error('Server error');
          return res.json();
      })
      .then(data => {
        if (!isSubscribed) return;
        setBusinesses(data.businesses);
        if (data.boundsGeoJson) {
           setDistrictBoundsGeoJson(data.boundsGeoJson);
        }
        setLoading(false);
      })
      .catch(err => {
        if (err.name === 'AbortError') return;
        if (!isSubscribed) return;
        console.error(err);
        setLoading(false);
      });
      
    return () => { 
      isSubscribed = false; 
      abortController.abort();
    };
  }, [selectedDistrict]);

  // Firestore Sync Effect
  useEffect(() => {
    if (!selectedDistrict || !user) return;
    
    const q = query(collection(db, 'business_statuses'), where('district', '==', selectedDistrict));
    const unsubscribe = onSnapshot(q, (snapshot) => {
       const statusMap: Record<number, string> = {};
       snapshot.forEach(doc => {
          const bid = parseInt(doc.id);
          if (!isNaN(bid)) {
             statusMap[bid] = doc.data().status;
          }
       });
       setFirestoreStatuses(statusMap);
    }, (error) => {
        const errInfo = {
          error: error instanceof Error ? error.message : String(error),
          authInfo: { userId: auth.currentUser?.uid },
          operationType: 'list',
          path: 'business_statuses'
        };
        console.error('Firestore Error: ', JSON.stringify(errInfo));
    });

    return () => unsubscribe();
  }, [selectedDistrict, user]);

  const filteredAndSyncedBusinesses = useMemo(() => {
     let filtered = businesses.map(b => ({
        ...b,
        status: (firestoreStatuses[b.id] as 'none' | 'rejected' | 'interested') || 'none'
     }));

     if (hideRejected) {
       filtered = filtered.filter(b => b.status !== 'rejected');
     }
     
     if (selectedType !== 'all') {
       filtered = filtered.filter(b => b.type === selectedType);
     }
     
     if (websiteFilter !== 'all') {
       if (websiteFilter === 'interested') {
         filtered = filtered.filter(b => b.status === 'interested');
       } else if (websiteFilter === 'rejected') {
         filtered = filtered.filter(b => b.status === 'rejected');
       } else {
         const isTrue = websiteFilter === 'true';
         filtered = filtered.filter(b => b.hasWebsite === isTrue);
       }
     }
     
     if (searchDebounced) {
       const lowerQuery = searchDebounced.toLowerCase();
       filtered = filtered.filter((b: any) => 
         (b.name && b.name.toLowerCase().includes(lowerQuery)) || 
         (b.address && b.address.toLowerCase().includes(lowerQuery)) ||
         (b.type && b.type.toLowerCase().includes(lowerQuery))
       );
     }
     
     return filtered;
  }, [businesses, firestoreStatuses, hideRejected, selectedType, websiteFilter, searchDebounced]);

  useEffect(() => {
    if (selectedDistrict && districts.includes(selectedDistrict)) {
      fetch(`/api/business-types?district=${encodeURIComponent(selectedDistrict)}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setTypes(data);
        });
    }
  }, [selectedDistrict, districts]);

  const updateStatus = async (id: number, status: 'none' | 'rejected' | 'interested') => {
    if (!selectedDistrict || !user) return;
    try {
      await setDoc(doc(db, 'business_statuses', id.toString()), {
        status: status,
        district: selectedDistrict,
        updatedAt: Timestamp.now()
      });
      // Selected business update is optimistic, map uses filteredAndSyncedBusinesses
      if (selectedBusiness?.id === id) {
        setSelectedBusiness(prev => prev ? { ...prev, status } : null);
      }
    } catch (err: any) {
      console.error(err);
      alert("Ошибка при сохранении статуса: " + err.message);
    }
  };

  const getMarkerColor = (b: Business | null) => {
    if (!b) return '#9ca3af';
    if (b.status === 'rejected') return '#9ca3af'; 
    if (b.status === 'interested') return '#eab308'; // yellow
    if (b.hasWebsite) return '#ef4444'; // red
    return '#22c55e'; // green
  };

  const objectManagerFeatures = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: filteredAndSyncedBusinesses.map(b => {
        const color = getMarkerColor(b);
        const websiteText = b.hasWebsite ? `Сайт: <a href="${b.website}" target="_blank">${b.website}</a>` : 'Нет веб-сайта';
        let statusText = '';
        if (b.status === 'rejected') statusText = '<br><strong style="color:#9ca3af;">Отказ / Не интересно</strong>';
        if (b.status === 'interested') statusText = '<br><strong style="color:#eab308;">Заинтересованы!</strong>';

        return {
          type: 'Feature',
          id: b.id,
          geometry: {
            type: 'Point',
            coordinates: [b.lat, b.lon]
          },
          properties: {
            hintContent: b.name,
            balloonContent: `
              <div style="padding: 5px; min-width: 200px; font-family: sans-serif;">
                <div style="font-size: 10px; text-transform: uppercase; color: #6b7280; font-weight: bold; margin-bottom: 2px;">${b.type}</div>
                <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px;">${b.name}</div>
                <div style="font-size: 12px; margin-bottom: 4px; color: #374151;">${b.address}</div>
                <div style="font-size: 12px; margin-bottom: 8px; color: #374151;">${b.phone}</div>
                <div style="font-size: 12px; color: ${color};">
                  ${websiteText}
                  ${statusText}
                </div>
              </div>
            `,
            clusterCaption: b.name
          },
          options: {
            preset: 'islands#circleIcon',
            iconColor: color
          }
        };
      })
    };
  }, [businesses]);

  const onObjectEvent = (e: any) => {
    if (e.get('type') === 'click') {
      const objectId = e.get('objectId');
      const business = filteredAndSyncedBusinesses.find(b => b.id === objectId);
      if (business) {
        setSelectedBusiness(business);
      }
    }
  };

  const districtPolygonCoords = useMemo(() => {
     if (!districtBoundsGeoJson) return null;
     
     const type = districtBoundsGeoJson.geometry.type;
     const coords = districtBoundsGeoJson.geometry.coordinates;

     let rings: any[][] = [];
     if (type === 'Polygon') {
        rings.push(coords[0].map((c: number[]) => [c[1], c[0]]));
     } else if (type === 'MultiPolygon') {
        coords.forEach((poly: any) => {
           rings.push(poly[0].map((c: number[]) => [c[1], c[0]]));
        });
     }

     return rings;
  }, [districtBoundsGeoJson]);

  const restrictBounds = useMemo(() => {
      if (!districtPolygonCoords || districtPolygonCoords.length === 0) return null;
      let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
      for (let i = 0; i < districtPolygonCoords.length; i++) {
        districtPolygonCoords[i].forEach((c: number[]) => {
            if (c[0] < minLat) minLat = c[0];
            if (c[0] > maxLat) maxLat = c[0];
            if (c[1] < minLon) minLon = c[1];
            if (c[1] > maxLon) maxLon = c[1];
         });
      }
      return [[minLat, minLon], [maxLat, maxLon]];
  }, [districtPolygonCoords]);

  useEffect(() => {
     if (mapRef.current && restrictBounds) {
         try {
             mapRef.current.setBounds(restrictBounds, { checkZoomRange: true });
         } catch(e) {}
     }
  }, [restrictBounds]);

  const mapElement = useMemo(() => (
    <YMaps query={{ apikey: YANDEX_API_KEY }}>
      <Map 
        state={mapState} 
        instanceRef={mapRef}
        className="w-full h-full"
        options={{ 
           suppressMapOpenBlock: true
        }}
        onMouseDown={() => setSelectedBusiness(null)}
      >
        <ZoomControl options={{ position: { right: 10, top: 108 } }} />
        <GeolocationControl options={{ position: { right: 10, top: 250 } }} />
        
        {districtPolygonCoords && districtPolygonCoords.map((ring, idx) => (
            <Polygon 
                key={idx}
                geometry={[ring]} 
                options={{
                    fillOpacity: 0,
                    strokeColor: '#3b82f6',
                    strokeWidth: 3,
                    strokeOpacity: 0.9,
                }} 
            />
        ))}

        <ObjectManager
          options={{
            clusterize: true,
            gridSize: 64,
            clusterDisableClickZoom: false,
          }}
          objects={{
            openBalloonOnClick: false,
            preset: 'islands#circleIcon',
          }}
          clusters={{
            openBalloonOnClick: false,
            preset: 'islands#invertedBlueClusterIcons',
          }}
          features={objectManagerFeatures}
          modules={[
            'objectManager.addon.objectsBalloon',
            'objectManager.addon.objectsHint',
          ]}
          onClick={onObjectEvent}
        />
      </Map>
    </YMaps>
  ), [mapState, districtPolygonCoords, objectManagerFeatures]);

  const stats = useMemo(() => {
    let hasWeb = 0;
    let noWeb = 0;
    let interested = 0;
    let rejected = 0;
    
    // Stats calculated from all raw businesses for the district + firestore sync, ignoring search filters
    const allDistrictSynced = businesses.map(b => ({
       ...b,
       status: (firestoreStatuses[b.id] as 'none' | 'rejected' | 'interested') || 'none'
    }));

    allDistrictSynced.forEach(b => {
      if (b.status === 'rejected') rejected++;
      else if (b.status === 'interested') interested++;
      else if (b.hasWebsite) hasWeb++;
      else noWeb++;
    });
    
    return { hasWeb, noWeb, interested, rejected, total: allDistrictSynced.length };
  }, [businesses, firestoreStatuses]);

  const displayBusinesses = useMemo(() => filteredAndSyncedBusinesses.slice(0, 300), [filteredAndSyncedBusinesses]);

  const filteredDistricts = useMemo(() => 
    districts.filter(d => d.toLowerCase().includes(districtSearch.toLowerCase())),
  [districts, districtSearch]);

  if (initialLoading || authLoading) {
    return (
     <div className="flex bg-white h-screen w-full items-center justify-center">
       <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
     </div>
    );
  }

  if (!user) {
    return (
      <div className="w-full h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white p-8 rounded-2xl border border-gray-200 shadow-xl">
           <div className="flex justify-center mb-6">
              <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <MapIcon size={24} />
              </div>
           </div>
           <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Вход в систему</h1>
           <p className="text-gray-500 text-center text-sm mb-6">Бизнес-радар МСК</p>
           
           <form onSubmit={async (e) => {
             e.preventDefault();
             setAuthError('');
             try {
               await signInWithEmailAndPassword(auth, email, password);
             } catch(err: any) {
               setAuthError('Неверный логин или пароль. Владелец должен создать аккаунт в базе Firebase.');
             }
           }} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Пароль</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full mt-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              {authError && <div className="text-red-600 text-sm">{authError}</div>}
              
              <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-md transition-colors mt-2">
                 Войти
              </button>
           </form>
           <p className="text-xs text-center text-gray-400 mt-6">
             Чтобы получить доступ, попросите администратора создать аккаунт (Authentication) в консоли Firebase.
           </p>
        </div>
      </div>
    )
  }

  const selectedColor = getMarkerColor(selectedBusiness);

  return (
    <div className="flex h-screen w-full bg-gray-50 flex-col md:flex-row font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-[400px] bg-white shadow-xl z-20 flex flex-col h-[60vh] md:h-full border-b md:border-b-0 md:border-r border-gray-200">
        <div className="p-5 pb-4 border-b border-gray-100 flex-shrink-0 bg-white">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-600 text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 shrink-0">
              <MapIcon size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Бизнес-радар МСК</h1>
              <p className="text-xs text-gray-500 font-medium">B2B | {user.email}</p>
            </div>
            <button onClick={() => signOut(auth)} className="ml-auto p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-colors">
               <LogOut size={20} />
            </button>
          </div>

          <div className="space-y-4">
            
            {/* Custom AutoComplete Dropdown for District */}
            <div className="relative">
              <div 
                className="w-full relative flex items-center bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all cursor-text rounded-xl"
                onClick={() => setIsDistrictDropdownOpen(true)}
              >
                <MapPin className="ml-3 text-gray-400 shrink-0" size={18} />
                <input 
                  type="text"
                  value={isDistrictDropdownOpen ? districtSearch : (selectedDistrict || '')}
                  onChange={(e) => setDistrictSearch(e.target.value)}
                  onFocus={() => {
                     setIsDistrictDropdownOpen(true);
                     setDistrictSearch('');
                  }}
                  onBlur={() => setTimeout(() => setIsDistrictDropdownOpen(false), 200)}
                  placeholder="Выберите район МСК..."
                  className="w-full bg-transparent pl-2 pr-10 py-2.5 text-sm focus:outline-none placeholder-gray-400"
                />
                <button
                  onMouseDown={(e) => {
                     e.preventDefault();
                     setIsDistrictDropdownOpen(!isDistrictDropdownOpen);
                  }}
                  className="absolute right-2 p-1"
                >
                   <ChevronDown className={cn("text-gray-400 transition-transform", isDistrictDropdownOpen && "rotate-180")} size={16} />
                </button>
              </div>

              <AnimatePresence>
                {isDistrictDropdownOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                    className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto"
                  >
                    {filteredDistricts.length === 0 ? (
                      <div className="p-3 text-sm text-gray-400 text-center">Район не найден</div>
                    ) : (
                      filteredDistricts.map(d => (
                        <div 
                          key={d} 
                          onMouseDown={() => {
                            setSelectedDistrict(d);
                            setIsDistrictDropdownOpen(false);
                            setDistrictSearch('');
                          }}
                          className={cn("px-4 py-2.5 text-sm cursor-pointer transition-colors", selectedDistrict === d ? "bg-blue-50 text-blue-700 font-medium" : "hover:bg-gray-50 text-gray-700")}
                        >
                          {d}
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Поиск по названию или адресу..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <CustomSelect 
                value={selectedType}
                onChange={setSelectedType}
                options={[
                  { value: 'all', label: 'Все категории' },
                  ...types.map(t => ({ value: t, label: t }))
                ]}
                icon={Layers}
                placeholder="Все категории"
              />

              <CustomSelect 
                value={websiteFilter}
                onChange={setWebsiteFilter}
                options={[
                  { value: 'all', label: 'Все статусы' },
                  { value: 'false', label: 'Лиды (Нет сайта)' },
                  { value: 'true', label: 'Есть сайт' },
                  { value: 'interested', label: 'В работе' },
                  { value: 'rejected', label: 'Не интересно (Отказ)' }
                ]}
                icon={Filter}
                placeholder="Все статусы"
              />
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
              <input 
                type="checkbox" 
                id="hideRejected"
                checked={hideRejected}
                onChange={(e) => setHideRejected(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="hideRejected" className="text-sm text-gray-600 font-medium cursor-pointer select-none">
                Скрыть отклоненные (Отказ)
              </label>
            </div>

            {/* Counters */}
            {selectedDistrict && !loading && businesses.length > 0 && (
              <div className="flex flex-col gap-2 overflow-hidden pb-1 mt-1">
                <div className="flex flex-wrap gap-2 text-[11px] font-bold">
                   <div className="bg-gray-100 text-gray-600 px-2 py-1.5 rounded-md shrink-0 flex items-center gap-1.5 shadow-sm">Всего: {stats.total}</div>
                   <div className="bg-green-100 text-green-700 px-2 py-1.5 rounded-md shrink-0 flex items-center gap-1.5 shadow-sm"><span className="w-2 h-2 rounded-full bg-green-500" /> {stats.noWeb}</div>
                   <div className="bg-red-100 text-red-700 px-2 py-1.5 rounded-md shrink-0 flex items-center gap-1.5 shadow-sm"><span className="w-2 h-2 rounded-full bg-red-500" /> {stats.hasWeb}</div>
                   <div className="bg-yellow-100 text-yellow-700 px-2 py-1.5 rounded-md shrink-0 flex items-center gap-1.5 shadow-sm"><span className="w-2 h-2 rounded-full bg-yellow-500" /> В работе: {stats.interested}</div>
                   <div className="bg-gray-100 text-gray-500 px-2 py-1.5 rounded-md shrink-0 flex items-center gap-1.5 shadow-sm"><span className="w-2 h-2 rounded-full bg-gray-400" /> Отказ: {stats.rejected}</div>
                </div>
                
                {(() => {
                  const processedCount = stats.interested + stats.rejected;
                  const progressPercent = stats.total > 0 ? (processedCount / stats.total) * 100 : 0;
                  const interestedPercent = processedCount > 0 ? (stats.interested / processedCount) * 100 : 0;
                  const rejectedPercent = processedCount > 0 ? (stats.rejected / processedCount) * 100 : 0;
                  
                  return (
                    <div className="mt-2 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                      <div className="flex justify-between text-[10px] text-gray-500 font-bold tracking-wider uppercase mb-1.5">
                        <span>Прогресс района</span>
                        <span>{processedCount} / {stats.total} ({progressPercent.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden flex">
                         <div className="bg-blue-500 h-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
                      </div>
                      
                      {processedCount > 0 && (
                        <div className="flex items-center justify-between text-[10px] font-medium text-gray-400">
                          <div className="flex gap-3">
                            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-yellow-400"></span> В работе {interestedPercent.toFixed(0)}%</span>
                            <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span> Отказ {rejectedPercent.toFixed(0)}%</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-50/50 p-4">
          {!selectedDistrict ? (
             <div className="flex flex-col items-center justify-center h-full text-center px-4 opacity-70">
                <MapPin className="w-12 h-12 text-blue-500 mb-4" />
                <h3 className="font-semibold text-gray-900 mb-2">Район не выбран</h3>
                <p className="text-sm text-gray-500">Выберите район Москвы, чтобы начать поиск потенциальных B2B клиентов.</p>
             </div>
          ) : loading ? (
             <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h3 className="font-semibold text-gray-900 mb-1">Сбор данных</h3>
                <p className="text-sm text-gray-500">Скачивание заведений района...</p>
             </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                   Найдено компаний: {filteredAndSyncedBusinesses.length}
                </span>
              </div>
              <div className="space-y-3">
                <AnimatePresence>
                  {displayBusinesses.map(b => {
                    const isSelected = selectedBusiness?.id === b.id;
                    return (
                      <motion.div 
                        layout 
                        initial={{ opacity: 0, y: 10 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        key={b.id} 
                        onClick={() => setSelectedBusiness(b)}
                        className={cn(
                          "p-4 bg-white border rounded-xl hover:shadow-md cursor-pointer transition-all group relative overflow-hidden",
                          isSelected ? "border-blue-500 ring-1 ring-blue-500 shadow-sm" : "border-gray-100 hover:border-blue-300",
                          b.status === 'rejected' ? "opacity-50" : "",
                          b.status === 'interested' ? "bg-yellow-50/30" : ""
                        )}
                      >
                        {/* Status Left Bar */}
                        <div className={cn(
                          "absolute top-0 left-0 w-1 h-full",
                          b.status === 'rejected' ? "bg-gray-400" : 
                          b.status === 'interested' ? "bg-yellow-400" :
                          (b.hasWebsite ? 'bg-red-500' : 'bg-green-500')
                        )}></div>
                        
                        <div className="flex justify-between items-start mb-1.5 pl-1">
                          <h3 className={cn("font-bold transition-colors w-3/4 leading-snug", isSelected ? "text-blue-700" : "text-gray-900 group-hover:text-blue-600")}>{b.name}</h3>
                          <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 whitespace-nowrap">{b.type}</span>
                        </div>
                        <p className="text-[11px] font-medium text-gray-400 truncate pl-1">{b.address}</p>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
                {filteredAndSyncedBusinesses.length === 0 && !loading && (
                  <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-300">
                    <Info className="mx-auto text-gray-400 mb-2" size={24} />
                    <p className="text-gray-500 text-sm">В этом районе ничего не найдено по вашим фильтрам</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Map Area */}
      <main className="flex-1 relative h-[40vh] md:h-full bg-gray-100 overflow-hidden">
        {mapElement}

        {/* Selected Business Floating Card */}
        <AnimatePresence>
        {selectedBusiness && (
          <motion.div 
            drag
            dragMomentum={false}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className={cn(
              "absolute bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-6 md:top-6 md:bottom-auto z-10 w-11/12 md:w-80 bg-white rounded-2xl shadow-2xl border-2 overflow-hidden touch-none",
              selectedColor === '#ef4444' ? 'border-red-500/20' : 
              selectedColor === '#22c55e' ? 'border-green-500/20' : 
              selectedColor === '#eab308' ? 'border-yellow-500/30' : 'border-gray-200'
            )}
          >
            <div className="p-5 cursor-move">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex flex-col items-start gap-2">
                  <div className={cn(
                    "inline-flex items-center justify-center px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest",
                    selectedBusiness.hasWebsite && selectedBusiness.status === 'none' ? "bg-red-50 text-red-600" :
                    !selectedBusiness.hasWebsite && selectedBusiness.status === 'none' ? "bg-green-50 text-green-700" :
                    selectedBusiness.status === 'interested' ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-500"
                  )}>
                    {selectedBusiness.type}
                  </div>
                  <h2 className="font-bold text-lg text-gray-900 leading-tight pr-4">{selectedBusiness.name}</h2>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); setSelectedBusiness(null); }}
                  className="p-1.5 shrink-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors absolute top-4 right-4"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Адрес</p>
                  <p className="text-sm text-gray-800 font-medium">{selectedBusiness.address}</p>
                </div>
                {selectedBusiness.phone && selectedBusiness.phone !== 'Не указан' && (
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">Телефон</p>
                    <p className="text-sm text-gray-800 font-medium">{selectedBusiness.phone}</p>
                  </div>
                )}
                <div>
                  <a 
                    href={`https://yandex.ru/maps/?text=${selectedBusiness.lat},${selectedBusiness.lon}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                    onPointerDown={(e) => e.stopPropagation()}
                  >
                    <MapPin size={12} /> Яндекс.Карты
                  </a>
                </div>
              </div>

              <div className="space-y-2">
                {selectedBusiness.hasWebsite ? (
                  <a 
                    href={selectedBusiness.website!} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex w-full items-center justify-center py-2.5 px-4 bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Перейти на сайт
                  </a>
                ) : (
                  <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl mb-3 flex items-start gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                    <p className="text-sm font-semibold leading-tight text-green-700">Нет веб-сайта (Лид)</p>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {selectedBusiness.status !== 'interested' ? (
                     <button 
                       onClick={() => updateStatus(selectedBusiness.id, 'interested')}
                       className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-yellow-50 text-yellow-700 border border-yellow-200 text-xs font-bold uppercase tracking-wide rounded-xl hover:bg-yellow-100 transition-colors"
                     >
                       <CheckCircle size={14} /> В работу
                     </button>
                  ) : (
                     <button 
                       onClick={() => updateStatus(selectedBusiness.id, 'none')}
                       className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-white text-gray-500 border border-gray-200 text-xs font-bold uppercase tracking-wide rounded-xl hover:bg-gray-50 transition-colors"
                     >
                       Отменить
                     </button>
                  )}

                  {selectedBusiness.status !== 'rejected' ? (
                     <button 
                       onClick={() => updateStatus(selectedBusiness.id, 'rejected')}
                       className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-gray-50 text-gray-500 border border-gray-200 text-xs font-bold uppercase tracking-wide rounded-xl hover:bg-gray-100 hover:text-gray-700 transition-colors"
                     >
                       <X size={14} /> Отказ
                     </button>
                  ) : (
                     <button 
                       onClick={() => updateStatus(selectedBusiness.id, 'none')}
                       className="flex items-center justify-center gap-1.5 py-2.5 px-2 bg-white text-gray-500 border border-gray-200 text-xs font-bold uppercase tracking-wide rounded-xl hover:bg-gray-50 transition-colors"
                     >
                       Вернуть
                     </button>
                  )}
                </div>

                {selectedBusiness.status === 'rejected' && (
                  <div className="flex items-center justify-center gap-2 py-2 mt-2 text-gray-500 text-xs font-medium bg-gray-50 rounded-lg">
                    <EyeOff className="w-3 h-3" />
                    Организация скрыта (Отказ)
                  </div>
                )}
                {selectedBusiness.status === 'interested' && (
                   <div className="flex items-center justify-center py-2 mt-2 text-yellow-600 text-xs font-bold bg-yellow-50/50 rounded-lg border border-yellow-100">
                      В списке заинтересованных
                   </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </main>
    </div>
  );
}
