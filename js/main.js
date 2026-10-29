/* UNMASKED — main: renderer, post-processing, scroll-driven camera, flashlight, hitboxes, scares, zones */
(function(){
const M = window.UM, T = THREE, A = M.audio, UI = M.UI;
T.ColorManagement.legacyMode = false;
if('scrollRestoration' in history) history.scrollRestoration='manual'; window.scrollTo(0,0);
gsap.registerPlugin(ScrollTrigger);
const $=s=>document.querySelector(s);
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const fill=$('#ldFill'), msg=$('#ldMsg');
const step=(p,t)=>{ fill.style.width=p+'%'; msg.textContent=t; return wait(30); };
const pick=a=>a[Math.floor(Math.random()*a.length)];

M.applyLang();

/* ---------------- renderer & scene ---------------- */
const canvas=$('#webgl');
const renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2)); renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true; renderer.shadowMap.type=T.PCFSoftShadowMap;
const scene=new T.Scene();
const camera=M.camera=new T.PerspectiveCamera(55,innerWidth/innerHeight,0.05,420); scene.add(camera);
scene.fog=new T.FogExp2(0x150a22,0.016); scene.background=new T.Color(0x150a22);

const hemi=new T.HemisphereLight(0x6a5aa8,0x120814,0.55); scene.add(hemi);
const moonL=new T.DirectionalLight(0x9aa6ff,1.0); moonL.position.set(34,46,-150); moonL.target.position.set(0,0,-20); scene.add(moonL,moonL.target);
const torch=new T.SpotLight(0xffe6c0,4,34,0.36,0.55,1.2); torch.position.set(0.25,-0.25,0.1); torch.castShadow=true; torch.shadow.mapSize.set(1024,1024); torch.shadow.camera.near=0.3; torch.shadow.bias=-0.0005;
camera.add(torch); const torchTarget=new T.Object3D(); scene.add(torchTarget); torch.target=torchTarget;

/* ---------------- hitbox reticle (corner brackets, survival-horror aim style) ---------------- */
const reticle=(()=>{ const p=[], c=0.5, l=0.16;
  for(const x of [-c,c]) for(const y of [-c,c]) for(const z of [-c,c]){ p.push(x,y,z, x-Math.sign(x)*l,y,z, x,y,z, x,y-Math.sign(y)*l,z, x,y,z, x,y,z-Math.sign(z)*l); }
  const g=new T.BufferGeometry(); g.setAttribute('position',new T.Float32BufferAttribute(p,3));
  const m=new T.LineBasicMaterial({color:0xff7a1a,depthTest:false,transparent:true}); m.color.multiplyScalar(3);
  const r=new T.LineSegments(g,m); r.renderOrder=999; r.visible=false; scene.add(r);
  const inner=new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(1,1,1)),new T.LineBasicMaterial({color:0xb48cff,depthTest:false,transparent:true,opacity:0.18})); inner.renderOrder=998; r.add(inner);
  return r; })();
const rbox=new T.Box3(), rsize=new T.Vector3(), rctr=new T.Vector3();
function fitReticle(obj,t){ if(!obj){ reticle.visible=false; return; }
  rbox.setFromObject(obj); rbox.getSize(rsize); rbox.getCenter(rctr);
  const k=1.08+Math.sin(t*8)*0.04; reticle.position.copy(rctr); reticle.scale.set(Math.max(rsize.x,0.3)*k,Math.max(rsize.y,0.3)*k,Math.max(rsize.z,0.3)*k); reticle.visible=true; }

/* ---------------- post: bloom + film shader ---------------- */
const composer=new T.EffectComposer(renderer);
composer.addPass(new T.RenderPass(scene,camera));
const bloom=new T.UnrealBloomPass(new T.Vector2(innerWidth,innerHeight),0.95,0.55,0.82); composer.addPass(bloom);
const film=new T.ShaderPass({
  uniforms:{tDiffuse:{value:null},time:{value:0},grain:{value:0.05},vig:{value:1.0},aberr:{value:0.0015},red:{value:0},exposure:{value:1.0},desat:{value:0},haze:{value:0}},
  vertexShader:'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
  fragmentShader:`uniform sampler2D tDiffuse; uniform float time,grain,vig,aberr,red,exposure,desat,haze; varying vec2 vUv;
    float rnd(vec2 c){ return fract(sin(dot(c,vec2(12.9898,78.233)))*43758.5453); }
    float vnoise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
      return mix(mix(rnd(i),rnd(i+vec2(1,0)),f.x),mix(rnd(i+vec2(0,1)),rnd(i+vec2(1,1)),f.x),f.y); }
    float fbm(vec2 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*vnoise(p); p*=2.03; a*=0.5; } return v; }
    vec3 aces(vec3 x){ return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.0,1.0); }
    void main(){ vec2 d=vUv-0.5; float a=aberr*(0.4+length(d)*2.0);
      vec3 c=vec3(texture2D(tDiffuse,vUv+d*a).r, texture2D(tDiffuse,vUv).g, texture2D(tDiffuse,vUv-d*a).b);
      c=aces(c*exposure);
      float l=dot(c,vec3(0.299,0.587,0.114)); c=mix(c,vec3(l)*vec3(1.0,0.97,0.92),desat);
      c=pow(c,vec3(1.0/2.2));
      // rolling screen-space fog (Silent Hollow)
      float f=fbm(vUv*vec2(3.0,2.0)+vec2(time*0.03,-time*0.01)) * fbm(vUv*vec2(1.5,4.0)-vec2(time*0.02,0.0));
      float band=smoothstep(1.05,0.25,vUv.y);
      c=mix(c,vec3(0.80,0.78,0.74),clamp(haze*(f*1.6+0.15)*band,0.0,0.85));
      c+= (rnd(vUv*vec2(1920.0,1080.0)+time)-0.5)*grain;
      c*= 1.0 - vig*dot(d,d)*1.6;
      c = mix(c, vec3(l*1.6+0.15,0.02,0.03), red);
      gl_FragColor=vec4(c,1.0); }`
});
composer.addPass(film);

/* ---------------- scroll keyframes ---------------- */
const V=(x,y,z)=>new T.Vector3(x,y,z);
const K=[
  {p:V(0,3.2,24),   l:V(0,5.6,-30),  fog:0x150a22,d:0.016,moon:1.0,hemi:0.55,torch:2.2,exp:1.05},
  {p:V(-8,2.4,8),   l:V(0,4.6,-30),  fog:0x150a22,d:0.018,moon:1.0,hemi:0.5, torch:2.4,exp:1.05},
  {p:V(0,2.3,-17),  l:V(0,2.3,-30),  fog:0x12081c,d:0.02, moon:0.8,hemi:0.42,torch:3,  exp:1.05},
  {p:V(0,2.1,-32.5),l:V(0,1.9,-60),  fog:0x07040a,d:0.03, moon:0.0,hemi:0.12,torch:5,  exp:1.15},
  {p:V(0,2.1,-38),  l:V(0,1.8,-62),  fog:0x07040a,d:0.03, moon:0.0,hemi:0.12,torch:5,  exp:1.15},
  {p:V(0,2.4,-66),  l:V(0,1.3,-82),  fog:0x0a0510,d:0.032,moon:0.0,hemi:0.1, torch:5.5,exp:1.2},
  {p:V(0,2.0,-99),  l:V(3,1.2,-110), fog:0x15120a,d:0.03, moon:0.0,hemi:0.25,torch:3,  exp:1.15},
  {p:V(0,1.8,-121), l:V(0,2.0,-160), fog:0x8d8a85,d:0.075,moon:0.0,hemi:1.15,torch:1.5,exp:1.0},
  {p:V(0,2.2,-168), l:V(0,2.2,-186), fog:0x1a0d2b,d:0.022,moon:0.0,hemi:0.35,torch:2.5,exp:1.1},
  {p:V(0,2.4,-174), l:V(0,2.5,-186), fog:0x1a0d2b,d:0.02, moon:0.0,hemi:0.35,torch:2.5,exp:1.1},
  {p:V(0,3.0,-176), l:V(0,2.6,-186), fog:0x1a0d2b,d:0.02, moon:0.0,hemi:0.35,torch:2.5,exp:1.1}
];
K.forEach(k=>k.fc=new T.Color(k.fog));
const TRACK=['toccata','toccata','toccata','mountain','musicbox','musicbox','saferoom','silent','finale','finale'];
const LAYERS={ wind:[.45,.45,.35,0,0,0,0,.3,.08,.08], drone:[0,0,.1,.22,.32,.28,0,.45,.1,.1], hum:[0,0,0,.3,.2,.2,.15,0,0,0], siren:[0,0,0,0,0,0,0,.22,0,0], static:[0,0,0,0,0,0,0,.1,0,0] };

const goal={p:K[0].p.clone(),l:K[0].l.clone(),fog:K[0].fc.clone(),d:K[0].d,moon:1,hemi:.55,torch:2.2,exp:1.05};
const cur={p:goal.p.clone(),l:goal.l.clone()};
let zone=-1, entered=false, W=null, unmaskSaid=false;
const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
function setFrom(i,p){
  const a=K[i], b=K[i+1]||K[i], e=ease(Math.min(1,Math.max(0,p)));
  goal.p.lerpVectors(a.p,b.p,e); goal.l.lerpVectors(a.l,b.l,e); goal.fog.copy(a.fc).lerp(b.fc,e);
  ['d','moon','hemi','torch','exp'].forEach(k=>goal[k]=a[k]+(b[k]-a[k])*e);
  if(!W) return;
  W.setDoor(i<2?0:i===2?Math.min(1,p*2.4):1);
  if(i===8){ const u=Math.min(1,Math.max(0,(p-0.08)/0.5)); W.setUnmask(u);
    const rb=$('#revealBox'); if(u>0.75&&!unmaskSaid){ unmaskSaid=true; A.sfx('laugh'); setTimeout(()=>A.sfx('scoobyLaugh'),1300); gsap.to(rb,{opacity:1,y:0,duration:0.8,ease:'expo.out'}); gsap.to('#finaleQ',{opacity:0.25,duration:0.5}); }
    if(u<0.4&&unmaskSaid){ unmaskSaid=false; gsap.to(rb,{opacity:0,y:40,duration:0.4}); gsap.to('#finaleQ',{opacity:1,duration:0.4}); } }
  else if(i>8) W.setUnmask(1); else if(i<8) W.setUnmask(0);
}
function setZone(i){
  if(i===zone) return; const prev=zone; zone=i; $('#zoneName').textContent=M.t('zones')[i]||'';
  $('#fogfx').classList.toggle('on',i===7);
  if(!entered) return;
  A.track(TRACK[i]); for(const k in LAYERS) A.layer(k,LAYERS[k][i]);
  if(W&&W.chaseTL){ if(i===3) W.chaseTL.play(); else W.chaseTL.pause(); }
  $('#scan').classList.toggle('on',i===7);
  if(i===7&&prev!==7){ A.sfx('radio'); UI.toast(M.t('t_radio')); }
  if(i===3&&prev<3) setTimeout(()=>A.sfx('slam'),300);
  if(i===6&&prev!==6){ A.sfx('reDoor'); setTimeout(()=>UI.toast(M.t('t_relief')),1800); }
}

/* ---------------- language switching ---------------- */
document.querySelectorAll('.lang-btn').forEach(b=>b.addEventListener('click',()=>{
  // keep the visitor in the same scene: remember section + offset, restore after the RTL/LTR relayout
  const secs=[...document.querySelectorAll('.sec')]; let si=0; secs.forEach((s,i)=>{ if(s.offsetTop<=scrollY+1) si=i; });
  const frac=(scrollY-secs[si].offsetTop)/Math.max(1,secs[si].offsetHeight);
  M.setLang(b.dataset.lang); A.sfx('click');
  requestAnimationFrame(()=>{ window.scrollTo(0,secs[si].offsetTop+frac*secs[si].offsetHeight); ScrollTrigger.update(); });
}));
M.onLang=()=>{ if(M.thumbs&&UI.relang) UI.relang(); if(W) W.relang(); $('#zoneName').textContent=M.t('zones')[Math.max(0,zone)]||''; if(!entered) msg.textContent=M.t('waiting'); ScrollTrigger.refresh(); };

/* ---------------- pointer & raycasting ---------------- */
const ray=new T.Raycaster(), ndc=new T.Vector2(0,0), mouse={x:0,y:0}; let overCanvas=true, hovered=null, hoveredObj=null, lastPt={x:0,y:0};
addEventListener('pointermove',e=>{ ndc.set(e.clientX/innerWidth*2-1,-(e.clientY/innerHeight)*2+1); mouse.x=ndc.x; mouse.y=ndc.y; lastPt.x=e.clientX; lastPt.y=e.clientY; overCanvas=(e.target===canvas); });
const shown=o=>{ while(o){ if(!o.visible) return false; o=o.parent; } return true; };
const findAct=o=>{ while(o){ if(o.userData&&o.userData.act) return {act:o.userData.act,obj:o}; o=o.parent; } return null; };
const labelOf=a=>{ if(a.type==='product') return M.pf(M.byId(a.id),'name'); const L=M.t('lbl'); return L[a.label]||L[a.who]||''; };
function pickAt(){
  const hits=ray.intersectObjects(W.interact,false);
  for(const h of hits){ if(!shown(h.object.parent)&&h.object.userData.hitbox) continue; if(!h.object.userData.hitbox&&!shown(h.object)) continue;
    const f=findAct(h.object); if(!f) continue; if(h.distance>(f.act.far?70:17)) return null; return {act:f.act,obj:f.obj,point:h.point}; }
  return null;
}
const projV=new T.Vector3();
function screenOf(v){ projV.copy(v).project(camera); return {x:(projV.x+1)/2*innerWidth,y:(1-projV.y)/2*innerHeight}; }

/* ---------------- reactions (what happens when a hitbox is hit) ---------------- */
const squash=o=>gsap.fromTo(o.scale,{x:o.scale.x*1.25,y:o.scale.y*0.7,z:o.scale.z*1.25},{x:o.scale.x,y:o.scale.y,z:o.scale.z,duration:0.8,ease:'elastic.out(1.2,0.35)'});
function react(h){
  const a=h.act, who=a.who||a.type, top=new T.Vector3(); rbox.setFromObject(h.obj); rbox.getCenter(top); top.y=rbox.max.y;
  const s=screenOf(top), line=pick(M.t('lines')[who]||['…']), name=labelOf(a);
  UI.hitmark(lastPt.x,lastPt.y, UI.clue(who)?'+1':null);
  const o=a.obj;
  switch(who){
    case 'dog': squash(o); A.sfx(pick(['ruhroh','scoobyLaugh','bark'])); if(o.userData.head) gsap.fromTo(o.userData.head.rotation,{z:0},{z:0.35,duration:0.15,yoyo:true,repeat:3}); break;
    case 'ghost': squash(o); A.sfx('moan'); if(o.userData.mat) gsap.fromTo(o.userData.mat,{emissiveIntensity:3},{emissiveIntensity:0.5,duration:1}); break;
    case 'bo': case 'dot': case 'max': case 'riley': squash(o); A.sfx(who==='bo'?'skid':'pop');
      if(o.userData.arms) gsap.fromTo(o.userData.arms.map(x=>x.rotation),{z:(i)=>i?-2.6:2.6},{z:(i)=>i?-0.08:0.08,duration:0.9,ease:'power2.out'}); break;
    case 'villain': squash(o); A.sfx('laugh'); break;
    case 'pyramid': A.sfx('bigclang'); UI.scared(); gsap.fromTo(o.userData.arms[1].rotation,{x:-2.2},{x:0,duration:1.4,ease:'bounce.out'}); gsap.fromTo(film.uniforms.aberr,{value:0.03},{value:0.004,duration:1}); break;
    case 'bat': A.sfx('squeak'); a.bat.boost=1; a.bat.h+= (Math.random()<0.5?-3:3); break;
    case 'pumpkin': squash(o); A.sfx('boing'); if(o.userData.light) gsap.fromTo(o.userData.light,{intensity:8},{intensity:1.6,duration:1}); break;
    case 'door': { const d=W.doors[a.side][a.i]; A.sfx('door'); gsap.timeline().to(d.pivot.rotation,{y:d.open*0.9,duration:0.2}).to(d.pivot.rotation,{y:0,duration:0.3,ease:'bounce.out',delay:0.6,onStart:()=>A.sfx(Math.random()<0.5?'slam':'moan')}); break; }
    case 'portrait': A.sfx('moan'); break;
  }
  UI.bubble(s.x,s.y,name,line);
}
addEventListener('click',e=>{
  if(e.target!==canvas||!hovered) return; const h=hoveredObj;
  const a=h.act;
  if(a.type==='product'){ UI.hitmark(lastPt.x,lastPt.y); UI.openProduct(a.id); }
  else if(a.type==='snack'){ if(W.collect(a.idx)){ A.sfx('collect'); UI.hitmark(lastPt.x,lastPt.y,'🦴'); UI.gotSnack(); } }
  else if(a.type==='knocker'){ A.sfx('knock'); M.knock(); UI.hitmark(lastPt.x,lastPt.y); }
  else if(a.type==='typewriter'){ UI.clue('typewriter'); UI.openCheckout(); }
  else if(a.type==='chest'){ UI.clue('chest'); W.openChest(); setTimeout(UI.openCart,350); }
  else if(a.type==='herb'){ UI.clue('herb'); A.sfx('herb'); UI.hitmark(lastPt.x,lastPt.y,'+HP'); UI.toast(M.t('t_herb')); UI.setEcg('fine'); }
  else react(h);
});
M.knock=()=>{ if(!W) return; gsap.fromTo(W.frontDoor.position,{z:-30.15},{z:-30.05,duration:0.06,yoyo:true,repeat:5}); };
M.hovering=false;

/* ---------------- scares ---------------- */
const tv=new T.Vector3(), dirV=new T.Vector3();
function checkScares(){
  if(!UI.scares||!(zone===4||zone===5)) return;
  dirV.copy(ray.ray.direction);
  W.hiders.forEach(h=>{ if(h.used) return; tv.copy(h.home).add(new T.Vector3(0,1.2,0)).sub(camera.position); const dist=tv.length(); if(dist>20) return;
    if(tv.normalize().angleTo(dirV)<0.16) scare(h); });
}
function scare(h){
  h.used=true; const g=h.g; g.visible=true; g.position.copy(h.home);
  const mats=[]; g.traverse(o=>{ if(o.material) mats.push(o.material); });
  gsap.to(mats,{opacity:0.95,duration:0.08});
  const to=camera.position.clone().lerp(h.home,0.35); to.y=0.3;
  g.lookAt(camera.position.x,g.position.y,camera.position.z);
  gsap.to(g.position,{x:to.x,y:to.y,z:to.z,duration:0.38,ease:'power3.in'});
  gsap.fromTo(g.scale,{x:1,y:1,z:1},{x:1.4,y:1.4,z:1.4,duration:0.38});
  A.sfx('sting'); setTimeout(()=>A.sfx('heartbeat'),700);
  gsap.fromTo('#scareFlash',{opacity:1},{opacity:0,duration:1.2,delay:0.2});
  gsap.fromTo(film.uniforms.red,{value:0.65},{value:0,duration:0.9,delay:0.15});
  gsap.fromTo(film.uniforms.aberr,{value:0.04},{value:0.0015,duration:1.2});
  UI.scared();
  gsap.to(mats,{opacity:0,duration:0.7,delay:0.7,onComplete:()=>{ g.visible=false; g.position.copy(h.home); g.scale.setScalar(1); setTimeout(()=>h.used=false,30000); }});
}

/* ---------------- lightning ---------------- */
let flash=0, nextBolt=6;
function lightning(t){
  if(zone>2||!entered) return;
  if(t>nextBolt){ nextBolt=t+8+Math.random()*10; flash=1; setTimeout(()=>{ flash=0.7; },120); setTimeout(()=>A.sfx('thunder'),300+Math.random()*900); }
}

/* ---------------- loop ---------------- */
const clock=new T.Clock(); let frame=0;
function tick(){
  const dt=Math.min(clock.getDelta(),0.05), t=clock.elapsedTime; frame++;
  const k=1-Math.exp(-dt*3.2);
  cur.p.lerp(goal.p,k); cur.l.lerp(goal.l,k);
  camera.position.copy(cur.p); camera.position.x+=mouse.x*0.25; camera.position.y+=mouse.y*0.12+Math.sin(t*1.3)*0.02;
  tv.copy(cur.l); tv.x+=mouse.x*1.2; tv.y+=mouse.y*0.7; camera.lookAt(tv);
  scene.fog.color.lerp(goal.fog,k); scene.background.copy(scene.fog.color); scene.fog.density+=(goal.d-scene.fog.density)*k;
  flash*=0.9; lightning(t);
  hemi.intensity=goal.hemi+flash*2.5; moonL.intensity=goal.moon+flash*4; torch.intensity=goal.torch*(0.94+Math.random()*0.06);
  const u=film.uniforms; u.exposure.value=goal.exp; u.time.value=t;
  u.desat.value+=((zone===7?0.55:0)-u.desat.value)*k; u.haze.value+=((zone===7?0.9:0)-u.haze.value)*k*0.6;
  if(zone!==7 && u.aberr.value<0.002) u.aberr.value=0.0015; else if(zone===7) u.aberr.value=Math.max(u.aberr.value*0.95,0.004);
  ray.setFromCamera(ndc,camera); torchTarget.position.copy(ray.ray.origin).addScaledVector(ray.ray.direction,12);
  if(W && frame%2===0){
    const h=overCanvas?pickAt():null; const act=h?h.act:null;
    hoveredObj=h;
    if(act!==hovered){ hovered=act; M.hovering=!!act; UI.setHot(!!act,act?labelOf(act):''); if(act) A.sfx('hover'); canvas.style.cursor=act?'pointer':''; }
    checkScares();
  }
  fitReticle(hoveredObj?hoveredObj.obj:null,t);
  if(W) W.update(t,dt,zone);
  composer.render(dt);
  requestAnimationFrame(tick);
}

addEventListener('resize',()=>{ camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth,innerHeight); composer.setSize(innerWidth,innerHeight); bloom.setSize(innerWidth,innerHeight); ScrollTrigger.refresh(); });

/* ---------------- scroll helpers ---------------- */
M.lockScroll=on=>{ document.documentElement.style.overflow=on?'hidden':''; };
M.goCatalog=cat=>{ if(!entered) return; UI.filter(cat||'all'); const el=$('#catalog'); window.scrollTo({top:el.offsetTop+2,behavior:'smooth'}); };

function setupScroll(){
  const secs=[...document.querySelectorAll('.sec')];
  secs.forEach((el,i)=>{
    ScrollTrigger.create({ trigger:el, start:'top top', end:'bottom top',
      onUpdate:s=>{ if(s.isActive) setFrom(i,s.progress); },
      onToggle:s=>{ if(s.isActive){ setZone(i); setFrom(i,s.progress); } } });
  });
  ScrollTrigger.create({ start:0, end:'max', onUpdate:s=>{ $('#progFill').style.width=(s.progress*100)+'%'; } });
  gsap.utils.toArray('.sec:not(.hero) .reveal').forEach(el=>gsap.from(el,{opacity:0,y:50,duration:1,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 85%',toggleActions:'play none none reverse'}}));
  gsap.utils.toArray('.sec:not(.hero) [data-split]').forEach(el=>gsap.from(el,{yPercent:40,opacity:0,duration:1,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 85%',toggleActions:'play none none reverse'}}));
  gsap.from('.case-file',{rotate:-8,x:120,opacity:0,duration:1.2,ease:'expo.out',scrollTrigger:{trigger:'.legend',start:'top 60%',toggleActions:'play none none reverse'}});
  gsap.from('#grid',{opacity:0,y:60,duration:0.8,ease:'expo.out',scrollTrigger:{trigger:'#grid',start:'top 85%'}});
  gsap.to('.hero-title',{yPercent:-60,opacity:0,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('.hero-bottom,.hero-sub,.scroll-cue',{opacity:0,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'40% top',scrub:true}});
  gsap.to('.gridlines',{opacity:0.35,ease:'none',scrollTrigger:{trigger:'.legend',start:'top bottom',end:'top top',scrub:true}});
  ScrollTrigger.create({trigger:'.safe',start:'top 50%',once:true,onEnter:()=>{ const el=$('#safeLine'), s=el.textContent; el.textContent=''; let i=0; const iv=setInterval(()=>{ el.textContent+=s[i++]||''; if(entered&&s[i-1]!==' ') A.sfx('type'); if(i>=s.length) clearInterval(iv); },45); }});
  setFrom(0,0); setZone(0);
}

/* ---------------- fog texture for the CSS fog layers ---------------- */
function makeFogImage(){
  const c=document.createElement('canvas'); c.width=1024; c.height=512; const g=c.getContext('2d');
  for(let i=0;i<140;i++){ const x=Math.random()*1024, y=120+Math.random()*392, r=60+Math.random()*180;
    const gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,'rgba(220,216,208,.16)'); gr.addColorStop(1,'rgba(220,216,208,0)'); g.fillStyle=gr; g.fillRect(0,0,1024,512);
    // wrap horizontally so the strip tiles seamlessly
    if(x<r){ const g2=g.createRadialGradient(x+1024,y,0,x+1024,y,r); g2.addColorStop(0,'rgba(220,216,208,.16)'); g2.addColorStop(1,'rgba(220,216,208,0)'); g.fillStyle=g2; g.fillRect(0,0,1024,512); }
    if(x>1024-r){ const g3=g.createRadialGradient(x-1024,y,0,x-1024,y,r); g3.addColorStop(0,'rgba(220,216,208,.16)'); g3.addColorStop(1,'rgba(220,216,208,0)'); g.fillStyle=g3; g.fillRect(0,0,1024,512); } }
  document.documentElement.style.setProperty('--fog',`url(${c.toDataURL('image/png')})`);
}

/* ---------------- boot ---------------- */
(async function boot(){
  let mi=0; msg.textContent=M.t('loader')[0]; const mt=setInterval(()=>{ const l=M.t('loader'); msg.textContent=l[++mi%l.length]; },900);
  await step(5,M.t('loader')[0]);
  try{ await Promise.race([Promise.all(['40px Creepster','40px Anton','20px "Special Elite"','20px "Space Grotesk"','20px Vazirmatn','40px Lalezar'].map(f=>document.fonts.load(f))),wait(4000)]); }catch(e){}
  await step(20,M.t('sewing'));
  M.studio=M.Studio(); M.thumbs={};
  for(let i=0;i<M.products.length;i++){ const p=M.products[i]; M.thumbs[p.id]=M.studio.shot(p.id); fill.style.width=(20+i/M.products.length*35)+'%'; await wait(10); }
  await step(60,M.t('building'));
  W=M.world=M.buildWorld(scene,camera); makeFogImage();
  await step(80,M.t('hiding'));
  UI.init(); setupScroll();
  renderer.compile(scene,camera); composer.render(0);
  requestAnimationFrame(tick);
  await step(100,M.t('ready'));
  clearInterval(mt); msg.textContent=M.t('waiting');
  const btn=$('#enterBtn'); btn.disabled=false;
  btn.addEventListener('click',enter,{once:true});
})();

function enter(){
  A.init(); entered=true; const z=zone; zone=-1; setZone(Math.max(0,z));
  A.sfx('thunder'); flash=1; setTimeout(()=>A.sfx('ruhroh'),1600);
  document.body.classList.remove('locked'); ScrollTrigger.refresh();
  const tl=gsap.timeline();
  tl.to('#loader',{opacity:0,duration:1.2,ease:'power2.inOut',onComplete:()=>$('#loader').remove()})
    .from('.hero-title .split-c',{yPercent:120,opacity:0,rotate:-12,stagger:0.07,duration:1.2,ease:'expo.out'},0.5)
    .fromTo('.hero-title .split-c',{opacity:0.2},{opacity:1,duration:0.05,repeat:5,yoyo:true,stagger:0.03},1.4)
    .from('.hero-sub',{opacity:0,y:20,duration:1},1.2)
    .fromTo('.logo,.burger,.nav a,.top-right .lang-switch',{opacity:0,y:-20},{opacity:1,y:0,stagger:0.06,duration:0.8,clearProps:'opacity,transform'},1.0)
    .fromTo('.hb-num,.hb-left',{opacity:0,y:40},{opacity:1,y:0,stagger:0.08,duration:0.8,ease:'expo.out',clearProps:'transform'},1.3)
    .fromTo('.socials a,.hud > *',{opacity:0,x:20},{opacity:1,x:0,stagger:0.06,duration:0.6,clearProps:'opacity,transform'},1.5);
  setTimeout(()=>UI.toast(M.t('t_intro'),4200),2200);
}
})();
