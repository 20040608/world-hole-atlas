import './style.css';
import { World, ALIVE } from '../core/world';
import { OBJECT_TYPES } from '../config/objects';
import { SKINS, type AbilityId } from '../config/balance';
import { GameRenderer } from '../render/scene';
import { Input } from '../ui/input';
import { Audio } from '../audio/audio';
import { Bot } from '../core/bot';
import { showFatal } from '../ui/fatal';
import { DESTINATIONS, SAVE_KEY, readPassport, stars, type Passport } from './destinations';
import { expeditionMap, expeditionConfig } from './maps';

const COLORS=['#80f7cf','#ff90bf','#ffc875','#afaeff'];
const abilities: AbilityId[]=['dash','vortex','mega'];
const fmtTime=(n:number)=>`${Math.floor(n/60)}:${Math.floor(n%60).toString().padStart(2,'0')}`;
export class Expedition {
  private renderer: GameRenderer;
  private input: Input;
  private audio=new Audio();
  private bot=new Bot(.8);
  private world: World;
  private passport: Passport;
  private root=document.createElement('div');
  private selected=0;
  private mode:'explore'|'rush'='explore';
  private state:'atlas'|'playing'|'paused'|'results'='atlas';
  private last=performance.now();
  private refresh=0;
  private checkpoint=0;
  private visitedLandmark=false;
  private saveWarning=false;
  private completed=false;
  private minimap:HTMLCanvasElement|null=null;
  private status:HTMLElement|null=null;
  private message='Eat small objects to grow. The skyline comes later.';
  constructor(){
    let raw=null;try{raw=localStorage.getItem(SAVE_KEY);}catch{}
    this.passport=readPassport(raw);
    this.renderer=new GameRenderer(document.querySelector<HTMLCanvasElement>('#game')!,SKINS[0]);
    this.renderer.setQuality(this.passport.quality);this.renderer.setShadows(this.passport.quality!=='low');this.applySkin();
    this.input=new Input(document.querySelector('#game')!);
    this.input.onKey=(key)=>{if(key==='Escape')this.togglePause();};
    this.input.onAbility=i=>this.ability(abilities[i]);
    this.input.onPadButton=b=>{if(b===9)this.togglePause();if(b<3)this.ability(abilities[b]);};
    this.root.className='atlas-app';document.querySelector('#ui')!.append(this.root);
    this.root.addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('[data-action]');if(b)this.action(b.dataset.action!,b.dataset.value);});
    this.root.addEventListener('change',e=>{const el=e.target as HTMLSelectElement;if(el.id==='atlas-quality'){this.passport.quality=el.value as Passport['quality'];this.renderer.setQuality(this.passport.quality);this.renderer.setShadows(this.passport.quality!=='low');this.save();}});
    this.audio.setVolume(.55,this.passport.muted,true,true);
    this.world=this.createWorld(true);this.renderer.setWorld(this.world);this.renderAtlas();
    window.addEventListener('pagehide',()=>this.checkpointSave());
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&this.state==='playing')this.togglePause();this.audio.setHidden(document.hidden);this.last=performance.now();});
    const canvas=document.querySelector('#game')!;
    canvas.addEventListener('webglcontextlost',()=>{if(this.state==='playing')this.togglePause();this.message='Graphics paused. Reload if your browser cannot restore the scene.';});
    requestAnimationFrame(t=>this.frame(t));
  }
  private applySkin(){this.renderer.setSkin({...SKINS[0],rim:COLORS[this.passport.skin],glow:COLORS[this.passport.skin]});}
  private save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(this.passport));this.saveWarning=false;}catch{this.saveWarning=true;}}
  private checkpointSave(){if(this.state!=='atlas') {const id=DESTINATIONS[this.selected].id;this.passport.best[id]=Math.max(this.passport.best[id]??0,this.world.percentEaten);}this.save();}
  private createWorld(demo=false){const d=DESTINATIONS[this.selected],m=expeditionMap(d);return new World(m,expeditionConfig(d,this.mode,m),{demo,seed:d.seed});}
  private action(a:string,v?:string){
    if(a==='city'){this.checkpointSave();this.selected=Number(v);this.world=this.createWorld(true);this.renderer.setWorld(this.world);this.state='atlas';this.renderAtlas();}
    if(a==='start')this.start();
    if(a==='mode'){this.mode=v as typeof this.mode;this.renderAtlas();}
    if(a==='pause')this.togglePause();
    if(a==='home'){this.checkpointSave();this.state='atlas';this.input.enabled=false;this.input.reset();this.world=this.createWorld(true);this.renderer.setWorld(this.world);this.audio.setMusicMode('hub');this.renderAtlas();}
    if(a==='finish')this.finish();
    if(a==='next'){this.selected=(this.selected+1)%DESTINATIONS.length;this.start();}
    if(a==='ability')this.ability(v as AbilityId);
    if(a==='sound'){this.passport.muted=!this.passport.muted;this.audio.unlock();this.audio.setVolume(.55,this.passport.muted,true,true);this.save();const b=this.root.querySelector('[data-action="sound"]');if(b)b.textContent=this.passport.muted?'Sound off':'Sound on';}
    if(a==='skin'){this.passport.skin=Number(v);this.applySkin();this.save();this.renderAtlas();}
  }
  private renderAtlas(){
    const d=DESTINATIONS[this.selected],total=DESTINATIONS.reduce((n,d)=>n+stars(this.passport,d.id),0);
    this.root.innerHTML=`<header class="atlas-top"><a class="atlas-brand" href="./"><i></i> WORLD HOLE <span>ATLAS</span></a><div class="atlas-top-right"><span class="passport-count">${total} / 36 stars</span><button data-action="sound">${this.passport.muted?'Sound off':'Sound on'}</button><a href="?classic">Classic game ↗</a></div></header>
    <main class="atlas-lobby"><section class="atlas-intro"><div class="eyebrow"><span class="live-dot"></span> THE WORLD IS ON THE MENU</div><h1>Small hole.<br>World-sized<br><em>appetite.</em></h1><p>Start on a street. Swallow the skyline.<br>Leave your mark on every continent.</p>
    <div class="atlas-route"><span>01 — 12</span> YOUR NEXT DESTINATION</div><div class="city-heading"><span class="country-code">${d.flag}</span><div><h2>${d.name}</h2><p>${d.country} · ${d.region}</p></div></div><p class="city-tagline">${d.tagline}</p>
    <div class="mode-switch" aria-label="Game mode"><button data-action="mode" data-value="explore" aria-pressed="${this.mode==='explore'}">∞ Explore</button><button data-action="mode" data-value="rush" aria-pressed="${this.mode==='rush'}">◷ 3-minute rush</button></div>
    <button class="atlas-play" data-action="start">${this.mode==='rush'?'START THE RUSH':'DROP INTO '+d.name.toUpperCase()} <span>↗</span></button><div class="atlas-keyhint">WASD / arrows · mouse · touch · gamepad</div></section>
    <section class="atlas-view" aria-label="Live 3D destination preview"><div class="view-top"><span>${d.region.toUpperCase()}</span><span>${Math.abs(d.lat)}° ${d.lat>=0?'N':'S'} &nbsp; ${Math.abs(d.lon)}° ${d.lon>=0?'E':'W'}</span></div><div class="view-bottom"><span>LIVE DISTRICT PREVIEW</span><strong>${d.landmarkName}</strong><span>Landmark to devour ${this.passport.landmarks.includes(d.id)?'✓':''}</span></div></section></main>
    <section class="destination-section"><div class="dest-title"><h3>Choose your next bite <span>12 destinations. 7 continents.</span></h3><span>YOUR PASSPORT &nbsp; ${this.passport.landmarks.length}/12 landmarks</span></div><div class="destination-list">${DESTINATIONS.map((c,i)=>`<button class="destination-card ${i===this.selected?'selected':''}" style="--city:${c.color}" data-action="city" data-value="${i}" aria-pressed="${i===this.selected}"><span class="destination-number">${String(i+1).padStart(2,'0')} <b>${c.flag}</b></span><strong>${c.name}</strong><small>${c.region}</small><span class="card-stars">${'★'.repeat(stars(this.passport,c.id))}${'☆'.repeat(3-stars(this.passport,c.id))}<i>${Math.round((this.passport.best[c.id]??0)*100)}%</i></span></button>`).join('')}</div></section>
    <footer class="atlas-footer"><div class="skin-row">HOLE COLOR ${COLORS.map((c,i)=>`<button aria-label="Hole color ${i+1}" aria-pressed="${this.passport.skin===i}" style="--swatch:${c}" data-action="skin" data-value="${i}"></button>`).join('')}</div><label>GRAPHICS <select id="atlas-quality"><option value="auto" ${this.passport.quality==='auto'?'selected':''}>Auto</option><option value="low" ${this.passport.quality==='low'?'selected':''}>Low</option><option value="high" ${this.passport.quality==='high'?'selected':''}>High</option></select></label><span>${this.saveWarning?'Saving unavailable in this browser':'Progress saved on this device'} · Fictional city districts</span></footer>`;
    this.minimap=null;this.status=null;
  }
  private start(){
    this.state='playing';this.completed=false;this.visitedLandmark=false;this.message='Eat small objects to grow. The skyline comes later.';
    this.world=this.createWorld();this.renderer.setWorld(this.world);this.input.reset();this.input.enabled=true;
    this.audio.unlock();this.audio.setAmbient('downtown');this.audio.setMusicMode('round');this.audio.click();this.renderHud();
  }
  private renderHud(){const d=DESTINATIONS[this.selected];this.root.innerHTML=`<div class="play-header"><button class="back-button" data-action="pause">Ⅱ <span>Pause</span></button><div class="play-location"><small>${d.country.toUpperCase()}</small><h2>${d.name}</h2></div><div class="play-mode">${this.mode==='rush'?'3-MINUTE RUSH':'FREE EXPLORATION'}<strong id="play-clock">0:00</strong></div></div><div class="play-stats" id="play-stats"></div><div class="play-objective"><span>LANDMARK HUNT</span><strong>${d.landmarkName}</strong><p id="landmark-state">Grow big enough to swallow it.</p></div><canvas class="atlas-minimap" width="180" height="180" aria-label="Minimap: mint is edible, gold is landmark, white is your hole"></canvas><div class="play-bottom"><p id="play-message">${this.message}</p><div class="ability-row">${abilities.map((a,i)=>`<button data-action="ability" data-value="${a}"><kbd>${['SPACE','2','3'][i]}</kbd><strong>${['Dash','Vortex','Mega'][i]}</strong><small id="cd-${a}">Ready</small></button>`).join('')}</div><small>WASD / arrows to move · Drag on touch screens · Esc to pause</small></div><div id="atlas-overlay"></div>`;this.minimap=this.root.querySelector('.atlas-minimap');this.status=this.root.querySelector('#play-stats');this.updateHud();}
  private togglePause(){if(this.state==='playing'){this.state='paused';this.input.enabled=false;this.input.reset();this.audio.setMusicMode('paused');this.root.querySelector('#atlas-overlay')!.innerHTML=`<div class="atlas-modal-shade"><section class="atlas-modal"><div class="eyebrow">TAKE A BREATHER</div><h2>World on pause.</h2><p>Your current district is waiting for you.</p><button class="atlas-play" data-action="pause">RESUME ↗</button><button data-action="finish">Save result & finish district</button><button data-action="home">Back to destinations</button></section></div>`;}
    else if(this.state==='paused'){this.state='playing';this.input.enabled=true;this.audio.setMusicMode('round');this.root.querySelector('#atlas-overlay')!.innerHTML='';}}
  private ability(id:AbilityId){if(this.state==='playing'&&this.world.useAbility(id)){this.audio.ability(id);if(id==='dash')this.renderer.dashBurst(this.world);}}
  private finish(){if(this.completed)return;this.completed=true;this.state='results';this.input.enabled=false;this.input.reset();this.checkpointSave();this.audio.fanfare();const d=DESTINATIONS[this.selected],s=stars(this.passport,d.id);this.root.querySelector('#atlas-overlay')!.innerHTML=`<div class="atlas-modal-shade"><section class="atlas-modal"><div class="eyebrow">PASSPORT UPDATED</div><h2>${d.name}<br>was delicious.</h2><div class="result-stars">${'★'.repeat(s)}${'☆'.repeat(3-s)}</div><p>${Math.round(this.world.percentEaten*100)}% devoured · ${this.world.eaten} objects · ${fmtTime(this.world.time)}<br>${this.visitedLandmark?'Landmark collected!':'Landmark still standing. Come back for another bite.'}</p><p class="result-hint">Stars: devour 25%, 65% and 98% of the district.</p><button class="atlas-play" data-action="next">NEXT: ${DESTINATIONS[(this.selected+1)%12].name.toUpperCase()} ↗</button><button data-action="start">Play this district again</button><button data-action="home">Open passport</button></section></div>`;}
  private updateHud(){const w=this.world;if(!this.status)return;this.status.innerHTML=`<div><small>SIZE</small><strong>${w.main.level+1}</strong><progress max="1" value="${w.levelProgress}"></progress></div><div><small>DEVOURED</small><strong>${Math.floor(w.percentEaten*100)}<em>%</em></strong><progress max="1" value="${w.percentEaten}"></progress></div><div><small>OBJECTS</small><strong>${w.eaten}</strong></div>`;
    this.root.querySelector('#play-clock')!.textContent=fmtTime(this.mode==='rush'?Math.max(0,w.timeLeft):w.time);
    this.root.querySelector('#play-message')!.textContent=this.saveWarning?'Progress cannot be saved in this browser.':this.message;
    this.root.querySelector('#landmark-state')!.textContent=this.visitedLandmark?'✓ Landmark collected':`Grow and follow the gold dot on your radar.`;
    for(const a of abilities){this.root.querySelector('#cd-'+a)!.textContent=w.abilityReady(a)?'Ready':`${Math.ceil(w.abilities[a].cd)}s`;const b=this.root.querySelector<HTMLButtonElement>(`[data-value="${a}"]`)!;b.disabled=!w.abilityReady(a);}
    this.drawMinimap();
  }
  private drawMinimap(){const ctx=this.minimap?.getContext('2d');if(!ctx)return;const w=this.world,n=180,k=n/w.map.size;ctx.clearRect(0,0,n,n);ctx.fillStyle='#101f2b';ctx.fillRect(0,0,n,n);ctx.strokeStyle='#29404b';for(let i=0;i<n;i+=30){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,n);ctx.moveTo(0,i);ctx.lineTo(n,i);ctx.stroke();}
    for(const o of w.objects){if(o.state!==ALIVE)continue;const landmark=OBJECT_TYPES[o.t].id.startsWith('atlas-');ctx.fillStyle=landmark?'#ffd483':o.f<w.main.r*.9?'#80f7cf':'#486271';const r=landmark?3:1;ctx.fillRect((o.x+w.map.half)*k-r,(o.z+w.map.half)*k-r,r*2,r*2);}
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc((w.main.x+w.map.half)*k,(w.main.z+w.map.half)*k,4,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#80f7cf';ctx.beginPath();ctx.arc((w.main.x+w.map.half)*k,(w.main.z+w.map.half)*k,Math.max(6,w.main.r*k),0,Math.PI*2);ctx.stroke();}
  private frame(t:number){
    try { this.tick(t); } catch(err) {
      this.input.enabled=false;this.input.reset();this.checkpointSave();this.audio.setHidden(true);
      console.error(err);showFatal('World Hole stopped', 'A rendering or simulation error occurred. Your best recorded progress is kept on this device. Reload to continue.');
    }
  }
  private tick(t:number){const dt=Math.min(.05,Math.max(0,(t-this.last)/1000));this.last=t;this.input.pollGamepad();
    if(this.state==='playing'||this.state==='atlas'){
      this.world.input=this.state==='atlas'?this.bot.steer(this.world,dt):this.input.vector();this.world.step(dt);
      for(const e of this.world.events){if(this.state==='atlas')continue;if(e.k==='eat'){this.audio.gulp(e.o.f);if(OBJECT_TYPES[e.o.t].id.startsWith('atlas-')){this.visitedLandmark=true;const id=DESTINATIONS[this.selected].id;if(!this.passport.landmarks.includes(id))this.passport.landmarks.push(id);this.message='LANDMARK DEVOURED! Your passport has a new stamp.';this.renderer.landmarkBurst(this.world,e.o.f,true);this.checkpointSave();}}
        if(e.k==='level'){this.renderer.pulseHole();this.audio.levelUp();this.message=`Size ${e.level+1}! Bigger objects are now on the menu.`;}
        if(e.k==='end')this.finish();}
      this.world.events.length=0;
    }
    this.renderer.noteFrame(dt);this.renderer.render(this.state==='paused'?0:dt,this.world,this.state==='atlas'?'hub':'round');this.audio.endFrame();
    this.refresh+=dt;this.checkpoint+=dt;if(this.refresh>.15){if(this.state!=='atlas')this.updateHud();this.refresh=0;}if(this.checkpoint>10){if(this.state==='playing')this.checkpointSave();this.checkpoint=0;}
    requestAnimationFrame(n=>this.frame(n));
  }
}
