import { describe, expect, it } from 'vitest';
import { DESTINATIONS, readPassport, stars } from '../src/expedition/destinations';
import { expeditionMap, expeditionConfig } from '../src/expedition/maps';
import { spawnLevel } from '../src/core/mapgen/ladder';
import { World } from '../src/core/world';
import { Bot } from '../src/core/bot';
import { BUILDERS } from '../src/render/props';
import { OBJECT_TYPES, footprintOf, typeId } from '../src/config/objects';

describe('World Hole expedition',()=>{
  it('recovers corrupt saves and rejects untrusted or non-finite progress',()=>{
    expect(readPassport('broken').best).toEqual({});
    expect(readPassport('null').best).toEqual({});
    const p=readPassport(JSON.stringify({best:{tashkent:4,tokyo:-5,unknown:1},landmarks:['tashkent','unknown'],skin:99,quality:'broken'}));
    expect(p.best).toEqual({tashkent:1,tokyo:0});expect(p.landmarks).toEqual(['tashkent']);expect(p.skin).toBe(0);expect(p.quality).toBe('auto');expect(stars(p,'tashkent')).toBe(3);
  });
  for(const d of DESTINATIONS){
    it(`${d.name}: deterministic reachable layout, real landmark geometry and playable growth`,()=>{
      const m=expeditionMap(d),cfg=expeditionConfig(d,'explore',m);
      expect(m.spawns).toEqual(expeditionMap(d).spawns);
      expect(m.spawns.length).toBeGreaterThan(500);
      expect(m.spawns.filter(s=>s.type===d.landmark)).toHaveLength(1);
      expect(cfg.maxLevel).toBeGreaterThanOrEqual(Math.max(...m.spawns.map(spawnLevel)));
      const g=BUILDERS[d.landmark]();g.computeBoundingBox();const bb=g.boundingBox!,def=OBJECT_TYPES[typeId(d.landmark)];
      expect(bb.max.x-bb.min.x).toBeLessThanOrEqual(def.w+1);expect(bb.max.z-bb.min.z).toBeLessThanOrEqual(def.d+1);g.dispose();
      expect(m.spawns.filter(s=>Math.hypot(s.x,s.z)<5&&footprintOf(OBJECT_TYPES[typeId(s.type)],s.scale)<1).length).toBeGreaterThan(0);
      const w=new World(m,cfg,{seed:d.seed}),bot=new Bot(1);for(let i=0;i<3600;i++){w.input=bot.steer(w,1/30);w.step(1/30);w.events.length=0;}
      expect(w.eaten).toBeGreaterThan(50);expect(w.main.level).toBeGreaterThan(3);expect(Number.isFinite(w.main.x)).toBe(true);
    });
  }
  it('rush timer ends and abilities respect cooldowns',()=>{
    const d=DESTINATIONS[0],m=expeditionMap(d),w=new World(m,expeditionConfig(d,'rush',m));
    expect(w.useAbility('dash')).toBe(true);expect(w.useAbility('dash')).toBe(false);
    for(let i=0;i<190*30;i++){w.step(1/30);w.events.length=0;}
    expect(w.running).toBe(false);expect(w.ended).toBe(true);
  });
});
