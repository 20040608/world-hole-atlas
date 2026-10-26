export interface Destination {
  id: string; name: string; country: string; region: string; flag: string;
  lat: number; lon: number; color: string; ground: string; sky: string;
  landmark: string; landmarkName: string; vegetation: 'tree' | 'palm' | 'pine' | 'rock';
  architecture: 'apartment' | 'shop' | 'office' | 'house' | 'shed'; seed: number; tagline: string;
}
export const DESTINATIONS: Destination[] = [
  { id:'tashkent', name:'Tashkent', country:'Uzbekistan', region:'Central Asia', flag:'UZ', lat:41, lon:69, color:'#80f7cf', ground:'#a4bf91', sky:'#b4dbea', landmark:'atlas-tower', landmarkName:'Tashkent TV Tower', vegetation:'tree', architecture:'apartment', seed:101, tagline:'A small hole. A very big appetite.' },
  { id:'samarkand', name:'Samarkand', country:'Uzbekistan', region:'Silk Road', flag:'UZ', lat:40, lon:67, color:'#5cdde6', ground:'#d3b78a', sky:'#a8dce9', landmark:'atlas-registan', landmarkName:'Registan', vegetation:'tree', architecture:'shop', seed:207, tagline:'Swallow a legend of the Silk Road.' },
  { id:'tokyo', name:'Tokyo', country:'Japan', region:'East Asia', flag:'JP', lat:36, lon:140, color:'#ff90bf', ground:'#6c7089', sky:'#797baf', landmark:'atlas-pagoda', landmarkName:'Five-storey pagoda', vegetation:'tree', architecture:'office', seed:313, tagline:'Neon streets. Non-stop snacks.' },
  { id:'dubai', name:'Dubai', country:'UAE', region:'Middle East', flag:'AE', lat:25, lon:55, color:'#ffd483', ground:'#ddbf86', sky:'#ebceb0', landmark:'atlas-burj', landmarkName:'Desert spire', vegetation:'palm', architecture:'office', seed:419, tagline:'From desert dust to the skyline.' },
  { id:'paris', name:'Paris', country:'France', region:'Europe', flag:'FR', lat:49, lon:2, color:'#ffbdad', ground:'#abb99d', sky:'#edcccd', landmark:'atlas-eiffel', landmarkName:'Eiffel Tower', vegetation:'tree', architecture:'apartment', seed:521, tagline:'The city of lights. Your next bite.' },
  { id:'london', name:'London', country:'United Kingdom', region:'Europe', flag:'GB', lat:51, lon:0, color:'#adc6ff', ground:'#8ea39b', sky:'#bdcbd6', landmark:'atlas-clock', landmarkName:'Clock tower', vegetation:'tree', architecture:'house', seed:631, tagline:'Tea time just became feeding time.' },
  { id:'newyork', name:'New York', country:'United States', region:'North America', flag:'US', lat:41, lon:-74, color:'#fce48a', ground:'#a2a7b0', sky:'#b9d7e9', landmark:'atlas-empire', landmarkName:'Empire tower', vegetation:'tree', architecture:'office', seed:743, tagline:'Take a bite of the Big Apple.' },
  { id:'rio', name:'Rio de Janeiro', country:'Brazil', region:'South America', flag:'BR', lat:-23, lon:-43, color:'#b4ed87', ground:'#8fc98f', sky:'#91d8ec', landmark:'atlas-christ', landmarkName:'Hilltop statue', vegetation:'palm', architecture:'house', seed:853, tagline:'Sun, palms and an endless appetite.' },
  { id:'cairo', name:'Cairo', country:'Egypt', region:'North Africa', flag:'EG', lat:30, lon:31, color:'#edc88a', ground:'#d4b477', sky:'#e5cda1', landmark:'atlas-pyramid', landmarkName:'Great pyramid', vegetation:'palm', architecture:'shop', seed:967, tagline:'Thousands of years. One giant gulp.' },
  { id:'capetown', name:'Cape Town', country:'South Africa', region:'Southern Africa', flag:'ZA', lat:-34, lon:18, color:'#f5a98d', ground:'#a7b889', sky:'#a3d5ea', landmark:'atlas-lighthouse', landmarkName:'Cape lighthouse', vegetation:'palm', architecture:'house', seed:1079, tagline:'Where two oceans meet your appetite.' },
  { id:'sydney', name:'Sydney', country:'Australia', region:'Oceania', flag:'AU', lat:-34, lon:151, color:'#7dd9ef', ground:'#9fbb9c', sky:'#9dd9ee', landmark:'atlas-opera', landmarkName:'Harbour opera house', vegetation:'palm', architecture:'apartment', seed:1193, tagline:'A harbour full of possibilities.' },
  { id:'antarctica', name:'Antarctica', country:'South Pole', region:'Antarctica', flag:'AQ', lat:-78, lon:10, color:'#d0f4ff', ground:'#d9e9ec', sky:'#adcedf', landmark:'atlas-station', landmarkName:'Polar research station', vegetation:'rock', architecture:'shed', seed:1301, tagline:'The final frontier is on the menu.' },
];
export const SAVE_KEY = 'world-hole-atlas-v1';
export interface Passport { best: Record<string, number>; landmarks: string[]; skin: number; muted: boolean; quality: 'auto' | 'low' | 'high'; }
export function readPassport(raw: string | null): Passport {
  const out: Passport = { best: {}, landmarks: [], skin: 0, muted: false, quality:'auto' };
  try { const p = JSON.parse(raw ?? '{}');
    for (const d of DESTINATIONS) if (typeof p.best?.[d.id] === 'number' && Number.isFinite(p.best[d.id])) out.best[d.id] = Math.max(0,Math.min(1,p.best[d.id]));
    out.landmarks = DESTINATIONS.filter(d => Array.isArray(p.landmarks) && p.landmarks.includes(d.id)).map(d=>d.id);
    if (Number.isInteger(p.skin) && p.skin >= 0 && p.skin < 4) out.skin=p.skin;
    out.muted=p.muted===true; if (['auto','low','high'].includes(p.quality)) out.quality=p.quality;
  } catch { /* Invalid saves cannot break startup. */ }
  return out;
}
export function stars(p: Passport, id: string): number { const b=p.best[id]??0; return Number(b>=.25)+Number(b>=.65)+Number(b>=.98); }
