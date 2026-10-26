import { MapBuilder, buildRoadGrid, startSnacks, shrink, center, PALETTE } from '../core/mapgen/builder';
import { fillLadder, spawnLevel } from '../core/mapgen/ladder';
import { tourRoundConfig } from '../core/tour';
import type { Destination } from './destinations';

/** Fictional, seeded districts inspired by each destination, not geographic replicas. */
export function expeditionMap(d: Destination) {
  const b = new MapBuilder('downtown', 240, d.seed);
  const spacing = 36 + d.seed % 5;
  const lines = [-2,-1,0,1,2].map(v=>v*spacing);
  const grid = buildRoadGrid(b, lines, lines, {roadW:10,walkW:3,asphalt:d.id==='antarctica'?'#afc6cf':'#45515e',walk:'#cbd0cb',line:'#e8ce83',crosswalk:'#eef2eb'});
  const landmarkBlock = 6;
  grid.blocks.forEach((a,i)=>{
    const c = center(a);
    b.rectArea(a, i%3===0 ? d.ground : '#bac0b6');
    if(i===landmarkBlock){
      b.circle(c.x,c.z,14,'#e2d5b9');
      b.put(d.landmark,c.x,c.z,0,{force:true});
    } else if ((i+d.seed)%4===0) {
      b.circle(c.x,c.z,7,'#cbd7b3'); b.put('fountain',c.x,c.z,0);
      b.scatter(d.vegetation,shrink(a,2),10,{scale:[.6,1.2]});
    } else {
      for(const dx of [-7,7]) for(const dz of [-7,7]) b.put(d.architecture,c.x+dx,c.z+dz,0,{scale:.6+b.rng.next()*.35,tint:b.tint(PALETTE.building)});
      b.scatter(d.vegetation,shrink(a,1),5,{scale:[.5,.85]});
    }
    b.scatter('flower',a,9,{tint:()=>parseInt(d.color.slice(1),16)});
    b.scatter('trash',a,7); b.scatter('bench',a,4); b.scatter('bike',a,3);
    for(let j=0;j<8;j++) b.wanderer('person',shrink(a,1),1.1,{flee:true,tint:b.tint(PALETTE.shirt)});
  });
  for(const s of grid.walks){
    const length=Math.hypot(s.x1-s.x0,s.z1-s.z0);
    for(let t=0;t<length;t+=4){
      const f=t/length; b.put(b.rng.pick(['cone','hydrant','lamp','flower','trash']),s.x0+(s.x1-s.x0)*f,s.z0+(s.z1-s.z0)*f,0);
    }
  }
  b.traffic={graph:grid.graph,lane:2.2,speed:6,types:['car','taxi','van']};
  for(let i=0;i<35;i++) b.graphMover(i%5===0?'bus':'car',grid.graph,2.2,5+b.rng.next()*4,{tint:b.tint(PALETTE.car)});
  // An outer ring keeps a big hole supplied with bigger targets.
  for(let i=0;i<16;i++) {
    const a=i/16*Math.PI*2,x=Math.cos(a)*102,z=Math.sin(a)*102;
    b.put(i%3===0?'skyscraper':'office',x,z,a,{scale:.65,tint:b.tint(PALETTE.building)});
  }
  startSnacks(b,5);
  const m=b.build(d.ground,d.id==='antarctica'?'#8eafc6':'#709ca9',{sky:d.sky,fog:d.sky,sun:'#fff2dd',hemiSky:'#e3ecff',hemiGround:d.ground,sunIntensity:d.id==='tokyo'?1.3:2.1});
  fillLadder(m);
  return m;
}
export function expeditionConfig(d: Destination, mode: 'explore' | 'rush', map=expeditionMap(d)) {
  const cfg=tourRoundConfig('downtown');
  cfg.startLevel=0; cfg.maxLevel=Math.max(...map.spawns.map(spawnLevel))+1;
  cfg.xpMult=1.8; cfg.speedMult=1.25; cfg.magnetLevel=3;
  cfg.roundTime=mode==='rush'?180:Infinity;
  cfg.abilities={dash:{level:2,duration:1.8,cooldown:8},vortex:{level:2,duration:4,cooldown:22},mega:{level:2,duration:5,cooldown:32}};
  return cfg;
}
