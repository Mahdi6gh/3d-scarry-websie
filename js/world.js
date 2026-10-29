/* UNMASKED — the haunted world: grounds, house, hallway chase, gallery, safe room, fog town, unmasking stage */
(function(){
const M = window.UM, T = THREE;

M.buildWorld = function(scene, camera){
  const {std, mesh, glow, tex} = M;
  const W = { interact:[], snacks:[], pedestals:[], hiders:[], portraits:[], flicker:[], bats:[], spin:[], doors:{L:[],R:[]} };
  const A = M.audio;
  const reTex=(t,rx,ry)=>{ const c=t.clone(); c.needsUpdate=true; c.wrapS=c.wrapT=T.RepeatWrapping; c.repeat.set(rx,ry); return c; };
  const box=(w,h,d,mat,x,y,z,parent)=>{ const m=mesh(new T.BoxGeometry(w,h,d),mat,x,y,z); (parent||scene).add(m); return m; };
  const rnd=(a,b)=>a+Math.random()*(b-a);
  const hitM=new T.MeshBasicMaterial({visible:false});
  // invisible hitbox attached to a character / object; act.obj is what reacts when it is hit
  const hitbox=(parent,w,h,d,y,act)=>{ const hb=new T.Mesh(new T.BoxGeometry(w,h,d),hitM); hb.position.y=y; hb.userData.act=act; hb.userData.hitbox=true; parent.add(hb); W.interact.push(hb); return hb; };
  W.hitbox=hitbox;

  /* ------------------------------------------------ textures */
  const TX = {
    grass: tex(512,512,(g,w,h)=>{ g.fillStyle='#0e0a13'; g.fillRect(0,0,w,h); for(let i=0;i<7000;i++){ const c=18+Math.random()*40|0; g.fillStyle=`rgba(${c},${c*0.85|0},${c*1.35|0},${Math.random()*0.7})`; g.fillRect(Math.random()*w,Math.random()*h,1.5,2+Math.random()*6);} }),
    siding: tex(512,512,(g,w,h)=>{ for(let y=0;y<h;y+=32){ const c=30+Math.random()*12|0; g.fillStyle=`rgb(${c},${c-8},${c+12})`; g.fillRect(0,y,w,32); g.fillStyle='rgba(0,0,0,.65)'; g.fillRect(0,y+29,w,3);
      for(let i=0;i<25;i++){ g.fillStyle=`rgba(0,0,0,${Math.random()*0.3})`; g.fillRect(Math.random()*w,y,Math.random()*90,29);} } }),
    shingle: tex(512,512,(g,w,h)=>{ g.fillStyle='#120c16'; g.fillRect(0,0,w,h); for(let y=0;y<h;y+=24){ for(let x=-(y/24%2)*16;x<w;x+=32){ const c=16+Math.random()*16|0; g.fillStyle=`rgb(${c},${c-4},${c+6})`; g.beginPath(); g.moveTo(x,y); g.lineTo(x+30,y); g.lineTo(x+30,y+18); g.quadraticCurveTo(x+15,y+26,x,y+18); g.fill(); } } }),
    wallpaper: tex(512,512,(g,w,h)=>{ g.fillStyle='#2a1238'; g.fillRect(0,0,w,h); g.strokeStyle='rgba(255,150,60,.2)'; g.lineWidth=3;
      for(let x=0;x<w;x+=64) for(let y=0;y<h;y+=96){ g.beginPath(); g.moveTo(x+32,y+4); g.quadraticCurveTo(x+60,y+48,x+32,y+92); g.quadraticCurveTo(x+4,y+48,x+32,y+4); g.stroke(); g.beginPath(); g.arc(x+32,y+48,7,0,7); g.stroke(); }
      g.fillStyle='rgba(0,0,0,.25)'; for(let x=0;x<w;x+=64) g.fillRect(x,0,3,h);
      for(let i=0;i<50;i++){ g.fillStyle=`rgba(0,0,0,${Math.random()*0.35})`; g.beginPath(); g.ellipse(Math.random()*w,Math.random()*h,Math.random()*60+10,Math.random()*120+10,0,0,7); g.fill(); } }),
    wood: tex(512,512,(g,w,h)=>{ for(let x=0;x<w;x+=64){ const c=38+Math.random()*22|0; g.fillStyle=`rgb(${c},${c*0.6|0},${c*0.38|0})`; g.fillRect(x,0,64,h);
      for(let i=0;i<50;i++){ g.strokeStyle=`rgba(0,0,0,${Math.random()*0.25})`; g.beginPath(); const xx=x+Math.random()*64; g.moveTo(xx,0); g.lineTo(xx+Math.random()*8-4,h); g.stroke(); }
      g.fillStyle='rgba(0,0,0,.7)'; g.fillRect(x,0,3,h); g.fillRect(x,Math.random()*h,64,3); } }),
    checker: tex(512,512,(g,w,h)=>{ const s=64; for(let x=0;x<w;x+=s) for(let y=0;y<h;y+=s){ g.fillStyle=((x+y)/s)%2?'#0b070f':'#2b1840'; g.fillRect(x,y,s,s); }
      for(let i=0;i<300;i++){ g.fillStyle=`rgba(255,255,255,${Math.random()*0.04})`; g.fillRect(Math.random()*w,Math.random()*h,Math.random()*40,1); } }),
    velvet: tex(256,256,(g,w,h)=>{ const gr=g.createLinearGradient(0,0,w,0); for(let i=0;i<=8;i++) gr.addColorStop(i/8,i%2?'#3a0d22':'#250716'); g.fillStyle=gr; g.fillRect(0,0,w,h); }),
    tiles: tex(512,512,(g,w,h)=>{ g.fillStyle='#1b1d16'; g.fillRect(0,0,w,h); for(let x=0;x<w;x+=64) for(let y=0;y<h;y+=64){ const c=48+Math.random()*16|0; g.fillStyle=`rgb(${c},${c+4},${c-8})`; g.fillRect(x+2,y+2,60,60); } }),
    saferoom: tex(512,512,(g,w,h)=>{ g.fillStyle='#3d3a2c'; g.fillRect(0,0,w,h); for(let x=0;x<w;x+=32){ g.fillStyle='rgba(0,0,0,.12)'; g.fillRect(x,0,14,h);} for(let i=0;i<40;i++){ g.fillStyle=`rgba(20,15,5,${Math.random()*0.25})`; g.beginPath(); g.ellipse(Math.random()*w,Math.random()*h,Math.random()*50,Math.random()*80,0,0,7); g.fill(); } }),
    asphalt: tex(512,512,(g,w,h)=>{ g.fillStyle='#3a3836'; g.fillRect(0,0,w,h); for(let i=0;i<9000;i++){ const c=30+Math.random()*50|0; g.fillStyle=`rgba(${c},${c},${c},.5)`; g.fillRect(Math.random()*w,Math.random()*h,2,2);}
      g.strokeStyle='rgba(10,10,10,.8)'; g.lineWidth=2; for(let i=0;i<8;i++){ g.beginPath(); let x=Math.random()*w,y=Math.random()*h; g.moveTo(x,y); for(let k=0;k<6;k++){ x+=rnd(-40,40); y+=rnd(-40,40); g.lineTo(x,y);} g.stroke(); } }),
    concrete: tex(256,512,(g,w,h)=>{ g.fillStyle='#5a5652'; g.fillRect(0,0,w,h); for(let y=16;y<h;y+=56) for(let x=16;x<w;x+=56){ g.fillStyle=Math.random()<0.15?'#7a6a40':'#1c1b1a'; g.fillRect(x,y,30,36);} for(let i=0;i<30;i++){ g.fillStyle=`rgba(40,20,10,${Math.random()*0.3})`; g.fillRect(Math.random()*w,Math.random()*h,4,Math.random()*120);} }),
    fence: tex(256,256,(g,w,h)=>{ g.clearRect(0,0,w,h); g.strokeStyle='#8a8580'; g.lineWidth=3; for(let i=-h;i<w+h;i+=24){ g.beginPath(); g.moveTo(i,0); g.lineTo(i+h,h); g.stroke(); g.beginPath(); g.moveTo(i+h,0); g.lineTo(i,h); g.stroke(); } }),
    mist: tex(256,256,(g,w,h)=>{ const r=g.createRadialGradient(128,128,0,128,128,128); r.addColorStop(0,'rgba(200,180,255,.55)'); r.addColorStop(1,'rgba(200,180,255,0)'); g.fillStyle=r; g.fillRect(0,0,w,h); }),
    glowDot: tex(128,128,(g,w,h)=>{ const r=g.createRadialGradient(64,64,0,64,64,64); r.addColorStop(0,'rgba(255,255,255,1)'); r.addColorStop(0.3,'rgba(255,255,255,.35)'); r.addColorStop(1,'rgba(255,255,255,0)'); g.fillStyle=r; g.fillRect(0,0,w,h); })
  };

  /* ================================================= EXTERIOR */
  const ground = mesh(new T.PlaneGeometry(400,400), std(0xffffff,{map:reTex(TX.grass,70,70),roughness:1}), 0,0,-60);
  ground.rotation.x=-Math.PI/2; ground.castShadow=false; scene.add(ground);
  const path = mesh(new T.PlaneGeometry(3,48), std(0x3a3540,{roughness:1,map:reTex(TX.asphalt,1,12)}), 0,0.01,-4); path.rotation.x=-Math.PI/2; scene.add(path);
  for(let z=18; z>-26; z-=1.6){ const s=mesh(new T.CylinderGeometry(rnd(.35,.55),rnd(.4,.6),0.08,7), std(0x47424e,{roughness:1}), rnd(-.6,.6),0.03,z); scene.add(s); }

  // moon
  const moon = new T.Mesh(new T.SphereGeometry(9,32,24), glow(0xffe9c4,1.6)); moon.position.set(34,46,-150); scene.add(moon);
  const halo = new T.Sprite(new T.SpriteMaterial({map:TX.glowDot,color:0xb48cff,transparent:true,opacity:0.55,depthWrite:false,blending:T.AdditiveBlending,fog:false}));
  halo.scale.set(80,80,1); halo.position.copy(moon.position); scene.add(halo);
  moon.material.fog=false;

  // iron fence + gate
  const iron = std(0x0c0a10,{roughness:0.4,metalness:0.7});
  for(let x=-22; x<=22; x+=0.45){ if(Math.abs(x)<2.2) continue;
    const b=mesh(new T.CylinderGeometry(0.03,0.03,2.0,6),iron,x,1.0,8); scene.add(b);
    const tip=mesh(new T.ConeGeometry(0.06,0.18,6),iron,x,2.08,8); scene.add(tip); }
  [-1,1].forEach(s=>{ box(15,0.06,0.06,iron,s*9.7,1.75,8); box(15,0.06,0.06,iron,s*9.7,0.4,8);
    const post=box(0.35,2.6,0.35,std(0x2a2630,{roughness:1}),s*2.3,1.3,8); const cap=M.pumpkin(0.28,true,false); cap.position.set(s*2.3,2.85,8); scene.add(cap); W.spin.push({o:cap,s:0}); });
  // gate leaves, half open
  [-1,1].forEach(s=>{ const pv=new T.Group(); pv.position.set(s*2.1,0,8); pv.rotation.y=s*-0.9; scene.add(pv);
    for(let k=0;k<5;k++){ const b=mesh(new T.CylinderGeometry(0.03,0.03,2.1,6),iron,-s*(0.2+k*0.4),1.05,0); pv.add(b); }
    const bar=mesh(new T.BoxGeometry(2,0.06,0.06),iron,-s*1.0,1.8,0); pv.add(bar); });

  // graves, trees, pumpkins
  for(let i=0;i<26;i++){ const s=Math.random()<0.5?-1:1; const g=M.grave(Math.random()<0.3?1:0); g.position.set(s*rnd(4.5,18),0,rnd(-6,16)); g.scale.setScalar(rnd(0.8,1.2)); scene.add(g); }
  [[-15,0,2,8],[14,0,-6,9],[-19,0,-18,10],[18,0,12,7],[-9,0,14,6],[24,0,-24,11]].forEach(([x,y,z,h])=>{ const t=M.deadTree(h); t.position.set(x,y,z); scene.add(t); });
  [[-1.8,0,-25.6,0.45,1],[1.9,0,-25.4,0.38,1],[-2.6,0.9,-27.2,0.35,1],[2.7,0.9,-27.3,0.42,1],[-1.6,0,12,0.5,0],[1.7,0,4,0.42,0],[-3.4,0,-12,0.6,1],[3.6,0,-17,0.55,0],[6,0,-22,0.8,0]].forEach(([x,y,z,r,l])=>{
    const p=M.pumpkin(r,true,!!l); p.position.set(x,y+r*0.78,z); p.rotation.y=rnd(-0.5,0.5)+(x>0?-0.3:0.3); scene.add(p); if(p.userData.light) W.flicker.push({l:p.userData.light,base:1.6});
    hitbox(p,r*2.2,r*2,r*2.2,0,{type:'char',who:'pumpkin',obj:p,far:true}); });

  // ground mist
  W.mists=[];
  for(let i=0;i<26;i++){ const m=new T.Mesh(new T.PlaneGeometry(14,14),new T.MeshBasicMaterial({map:TX.mist,transparent:true,opacity:0.22,depthWrite:false,color:0x9a7aff}));
    m.rotation.x=-Math.PI/2; m.position.set(rnd(-22,22),rnd(0.2,0.9),rnd(-28,20)); scene.add(m); W.mists.push({m,sp:rnd(0.2,0.6),ph:rnd(0,6)}); }

  // wisps (fireflies)
  { const n=160, g=new T.BufferGeometry(), pos=new Float32Array(n*3);
    for(let i=0;i<n;i++){ pos[i*3]=rnd(-25,25); pos[i*3+1]=rnd(0.3,6); pos[i*3+2]=rnd(-30,20); }
    g.setAttribute('position',new T.BufferAttribute(pos,3));
    W.wisps=new T.Points(g,new T.PointsMaterial({map:TX.glowDot,size:0.35,color:0xff9a3a,transparent:true,depthWrite:false,blending:T.AdditiveBlending}));
    scene.add(W.wisps); }

  // bats
  for(let i=0;i<16;i++){ const b=M.bat(); b.scale.setScalar(rnd(0.9,1.6)); scene.add(b); const o={b,r:rnd(8,20),h:rnd(10,18),sp:rnd(0.3,0.7)*(Math.random()<0.5?-1:1),ph:rnd(0,6.28),cz:-48,boost:0}; W.bats.push(o);
    hitbox(b,1.8,0.8,1.0,0,{type:'char',who:'bat',obj:b,bat:o,far:true}); }

  /* ================================================= HOUSE SHELL */
  const siding = std(0xffffff,{map:reTex(TX.siding,3,3),roughness:0.95});
  const trimM = std(0x1a1020,{roughness:0.8});
  // front wall with door gap  (front face at z=-30)
  box(7.8,9,0.4,siding,-5.1,4.5,-30.2); box(7.8,9,0.4,siding,5.1,4.5,-30.2); box(2.4,5.4,0.4,siding,0,6.3,-30.2);
  // side walls
  box(0.4,9,84,siding,-9,4.5,-72); box(0.4,9,84,siding,9,4.5,-72);
  // gable roof prism
  { const sh=new T.Shape(); sh.moveTo(-10.2,0); sh.lineTo(10.2,0); sh.lineTo(0,6.2); sh.lineTo(-10.2,0);
    const rg=new T.ExtrudeGeometry(sh,{depth:85,bevelEnabled:false}); const roof=mesh(rg,[std(0x1a1320,{roughness:1}),std(0xffffff,{map:reTex(TX.shingle,0.25,0.05),roughness:1})],0,9,-114.5); scene.add(roof);
    const gable=mesh(new T.ShapeGeometry(sh),siding,0,9,-30.05); scene.add(gable);
    const att=new T.Mesh(new T.CircleGeometry(1.0,32),glow(0xff8a2a,2.2)); att.position.set(0,11.6,-29.98); scene.add(att); W.attic=att;
    const attF=mesh(new T.TorusGeometry(1.05,0.12,8,32),trimM,0,11.6,-29.95); scene.add(attF);
    box(0.08,2,0.06,trimM,0,11.6,-29.94); box(2,0.08,0.06,trimM,0,11.6,-29.94);
    // eaves trim
    const eL=box(11.8,0.25,0.5,trimM,-5,12.1,-29.9); eL.rotation.z=0.545; const eR=box(11.8,0.25,0.5,trimM,5,12.1,-29.9); eR.rotation.z=-0.545; }
  // tower
  { const tw=new T.Group(); tw.position.set(-10,0,-33); scene.add(tw);
    tw.add(mesh(new T.CylinderGeometry(2.4,2.6,15,20),siding,0,7.5,0));
    tw.add(mesh(new T.ConeGeometry(3.1,6,20),std(0xffffff,{map:reTex(TX.shingle,2,1),roughness:1}),0,18,0));
    tw.add(mesh(new T.CylinderGeometry(0.04,0.04,2,6),iron,0,21.8,0));
    [[0,10.5,0x9a5cff],[0.8,5.5,0xff7a1a],[-0.8,13.2,0xff7a1a]].forEach(([a,y,c])=>{ const w=new T.Mesh(new T.PlaneGeometry(0.9,1.6),glow(c,2)); w.position.set(Math.sin(a)*2.62,y,Math.cos(a)*2.62); w.rotation.y=a; tw.add(w); W.flicker.push({m:w,base:2,c}); });
    W.tower=tw; }
  // front windows
  const winTex = tex(128,192,(g,w,h)=>{ g.fillStyle='#ff9a3a'; g.fillRect(0,0,w,h); const r=g.createRadialGradient(64,96,10,64,96,120); r.addColorStop(0,'rgba(255,240,180,.9)'); r.addColorStop(1,'rgba(120,20,0,.9)'); g.fillStyle=r; g.fillRect(0,0,w,h); });
  const ghostWinTex = tex(128,192,(g,w,h)=>{ g.fillStyle='#4a1d8a'; g.fillRect(0,0,w,h); g.fillStyle='rgba(10,0,20,.95)'; g.beginPath(); g.moveTo(40,190); g.lineTo(40,80); g.quadraticCurveTo(64,30,88,80); g.lineTo(88,190); for(let x=88;x>40;x-=12) g.lineTo(x-6,175); g.fill(); g.fillStyle='#b48cff'; g.fillRect(54,86,6,10); g.fillRect(68,86,6,10); });
  [[-4.6,2.6,0],[4.6,2.6,0],[-4.6,6.6,1],[4.6,6.6,0],[0,9.6,2]].forEach(([x,y,k],i)=>{ if(k===2) return;
    const mat=new T.MeshBasicMaterial({map:k?ghostWinTex:winTex}); mat.color.setScalar(k?1.8:1.6);
    const w=new T.Mesh(new T.PlaneGeometry(1.6,2.4),mat); w.position.set(x,y,-29.97); scene.add(w); W.flicker.push({m:w,base:k?1.8:1.6});
    box(1.9,0.15,0.2,trimM,x,y+1.27,-29.9); box(2.1,0.15,0.35,trimM,x,y-1.27,-29.85); box(0.08,2.4,0.08,trimM,x,y,-29.92); box(1.6,0.08,0.08,trimM,x,y+0.2,-29.92);
    box(0.5,2.6,0.1,trimM,x-1.15,y,-29.9).rotation.z=0.02; box(0.5,2.6,0.1,trimM,x+1.15,y,-29.9).rotation.z=-0.04; });
  // porch
  box(7,0.3,3.2,std(0x2a1d16,{map:reTex(TX.wood,2,1)}),0,0.45,-28.4); box(5,0.3,0.8,std(0x2a1d16),0,0.15,-26.5);
  box(7.4,0.25,3.8,trimM,0,4.2,-28.2); [-3.2,3.2].forEach(x=>{ box(0.25,3.9,0.25,trimM,x,2.25,-26.6); });
  const porchLamp=new T.PointLight(0xff8a2a,1.2,9,2); porchLamp.position.set(0,3.7,-28.6); scene.add(porchLamp); W.flicker.push({l:porchLamp,base:1.2});
  const lampBulb=new T.Mesh(new T.SphereGeometry(0.12,10,8),glow(0xffb070,4)); lampBulb.position.copy(porchLamp.position); scene.add(lampBulb);
  // the front door
  { const doorTex=tex(256,384,(g,w,h)=>{ g.fillStyle='#2b120a'; g.fillRect(0,0,w,h); g.strokeStyle='#120502'; g.lineWidth=10; g.strokeRect(30,30,w-60,150); g.strokeRect(30,210,w-60,150);
      for(let i=0;i<60;i++){ g.strokeStyle=`rgba(0,0,0,${Math.random()*0.3})`; g.lineWidth=1; g.beginPath(); const x=Math.random()*w; g.moveTo(x,0); g.lineTo(x+rnd(-4,4),h); g.stroke(); } });
    const pivot=new T.Group(); pivot.position.set(-1.2,0,-30.15); scene.add(pivot);
    const panel=mesh(new T.BoxGeometry(2.4,3.6,0.14),std(0xffffff,{map:doorTex,roughness:0.7}),1.2,1.8,0); pivot.add(panel);
    const knock=mesh(new T.TorusGeometry(0.16,0.035,8,20),std(0xd4a53a,{metalness:0.9,roughness:0.25}),1.2,2.2,0.12); pivot.add(knock);
    const kn=mesh(new T.SphereGeometry(0.09,12,10),std(0xd4a53a,{metalness:0.9,roughness:0.25}),1.2,2.4,0.1); pivot.add(kn);
    const handle=mesh(new T.SphereGeometry(0.08,10,8),std(0xd4a53a,{metalness:0.9,roughness:0.25}),2.1,1.6,0.12); pivot.add(handle);
    knock.userData.act={type:'knocker',label:'knock'}; W.interact.push(knock); panel.userData.act={type:'knocker',label:'knock'}; W.interact.push(panel);
    W.doorPanel=panel;
    W.frontDoor=pivot; box(0.3,3.9,0.5,trimM,-1.35,1.95,-30.0); box(0.3,3.9,0.5,trimM,1.35,1.95,-30.0); box(3,0.3,0.5,trimM,0,3.75,-30.0);
    const inside=new T.PointLight(0xff6a1a,2.0,14,2); inside.position.set(0,2.4,-33); scene.add(inside); }

  /* ================================================= HALLWAY  z -30 .. -58 */
  const wallM = std(0xffffff,{map:reTex(TX.wallpaper,7,1.4),roughness:0.9});
  const floorWood = std(0xffffff,{map:reTex(TX.wood,2,7),roughness:0.6,metalness:0.05});
  const ceilM = std(0x120a14,{roughness:1});
  { const f=mesh(new T.PlaneGeometry(8,28),floorWood,0,0.02,-44); f.rotation.x=-Math.PI/2; scene.add(f);
    const c=mesh(new T.PlaneGeometry(8,28),ceilM,0,5,-44); c.rotation.x=Math.PI/2; scene.add(c);
    box(0.2,5,28,wallM,-4.1,2.5,-44); box(0.2,5,28,wallM,4.1,2.5,-44);
    const wains=std(0x1a0a12,{roughness:0.7}); box(0.06,1.1,28,wains,-3.98,0.55,-44); box(0.06,1.1,28,wains,3.98,0.55,-44);
    box(0.1,0.1,28,std(0xb08a3a,{metalness:0.8,roughness:0.35}),-3.95,1.12,-44); box(0.1,0.1,28,std(0xb08a3a,{metalness:0.8,roughness:0.35}),3.95,1.12,-44);
    const rug=mesh(new T.PlaneGeometry(2.4,26),std(0x5a0a1a,{roughness:1}),0,0.03,-44); rug.rotation.x=-Math.PI/2; scene.add(rug);
    const rugB=mesh(new T.PlaneGeometry(2.7,26.2),std(0xc98a2a,{roughness:1}),0,0.025,-44); rugB.rotation.x=-Math.PI/2; scene.add(rugB); }
  // doors (3 per side)
  const DZ=[-35.5,-42.5,-49.5];
  const doorTex2=tex(128,256,(g,w,h)=>{ g.fillStyle='#3a1a0e'; g.fillRect(0,0,w,h); g.strokeStyle='#1a0904'; g.lineWidth=6; g.strokeRect(16,16,w-32,100); g.strokeRect(16,136,w-32,104); });
  const voidM=new T.MeshBasicMaterial({color:0x000000});
  ['L','R'].forEach(side=>{ const s=side==='L'?-1:1;
    DZ.forEach((z,i)=>{
      const v=new T.Mesh(new T.PlaneGeometry(1.4,2.65),voidM); v.position.set(s*3.99,1.33,z); v.rotation.y=-s*Math.PI/2; scene.add(v);
      const pivot=new T.Group(); pivot.position.set(s*3.94,0,z+0.68); scene.add(pivot);
      const dp=mesh(new T.BoxGeometry(0.08,2.6,1.34),std(0xffffff,{map:doorTex2,roughness:0.7}),0,1.3,-0.67); pivot.add(dp);
      dp.userData.act={type:'door',who:'door',side,i,label:'door'}; dp.userData.hitbox=true; W.interact.push(dp);
      pivot.add(mesh(new T.SphereGeometry(0.06,8,6),std(0xd4a53a,{metalness:0.9,roughness:0.3}),-s*0.07,1.25,-1.15));
      box(0.16,2.9,0.14,trimM,s*3.93,1.45,z+0.76); box(0.16,2.9,0.14,trimM,s*3.93,1.45,z-0.76); box(0.16,0.16,1.66,trimM,s*3.93,2.9,z);
      W.doors[side].push({pivot,open:side==='L'?-1.45:1.45,z});
    }); });
  // candle sconces
  [[-3.9,-39],[3.9,-39],[-3.9,-46],[3.9,-46],[-3.9,-53],[3.9,-53]].forEach(([x,z],i)=>{
    const s=x<0?1:-1; box(0.1,0.4,0.25,std(0xb08a3a,{metalness:0.8,roughness:0.3}),x,1.9,z);
    const c=mesh(new T.CylinderGeometry(0.05,0.05,0.25,8),std(0xf2e6c8),x+s*0.15,2.2,z); scene.add(c);
    const fl=new T.Mesh(new T.SphereGeometry(0.05,8,6),glow(0xffb050,5)); fl.scale.y=1.8; fl.position.set(x+s*0.15,2.39,z); scene.add(fl);
    if(i%2===0||i===5){ const l=new T.PointLight(0xff8a30,0.9,8,2); l.position.set(x+s*0.4,2.5,z); scene.add(l); W.flicker.push({l,base:0.9}); }
    W.flicker.push({m:fl,base:5,isFlame:true}); });
  // portraits with following eyes
  const paint=(kind)=>tex(256,340,(g,w,h)=>{
    const bg=g.createLinearGradient(0,0,0,h); bg.addColorStop(0,['#2a1a10','#1a1028','#10202a','#2a1010'][kind]); bg.addColorStop(1,'#050305'); g.fillStyle=bg; g.fillRect(0,0,w,h);
    g.fillStyle=['#1a1410','#2a0a3a','#0a1a10','#3a1010'][kind]; g.beginPath(); g.ellipse(128,330,110,90,0,0,7); g.fill();
    if(kind===2){ g.fillStyle='#8a5a2a'; g.beginPath(); g.ellipse(128,165,62,72,0,0,7); g.fill(); g.fillStyle='#3a2414'; g.beginPath(); g.ellipse(66,180,20,52,0.3,0,7); g.ellipse(190,180,20,52,-0.3,0,7); g.fill();
      g.fillStyle='#c49a64'; g.beginPath(); g.ellipse(128,205,36,26,0,0,7); g.fill(); g.fillStyle='#111'; g.beginPath(); g.ellipse(128,190,14,9,0,0,7); g.fill(); g.fillStyle='#2ec4b6'; g.fillRect(80,250,96,14); }
    else { g.fillStyle=['#d8b090','#e6d8e8','#c8a888','#dcc0a0'][kind]; g.beginPath(); g.ellipse(128,160,52,66,0,0,7); g.fill();
      g.fillStyle=['#e8e8e8','#111','#5a3a1a','#111'][kind]; g.beginPath(); g.ellipse(128,108,56,30,0,Math.PI,0); g.fill();
      if(kind===0){ g.fillStyle='#e8e8e8'; g.beginPath(); g.ellipse(128,200,40,22,0,0,Math.PI); g.fill(); }
      if(kind===1){ g.fillStyle='#8a0010'; g.fillRect(118,200,20,4); g.fillStyle='#fff'; g.fillRect(118,203,4,7); g.fillRect(134,203,4,7); }
      if(kind===3){ g.fillStyle='#2a1a3a'; g.beginPath(); g.moveTo(60,110); g.lineTo(128,20); g.lineTo(196,110); g.fill(); }
      g.strokeStyle='rgba(0,0,0,.6)'; g.lineWidth=3; g.beginPath(); g.arc(128,205,16,0.2,Math.PI-0.2); g.stroke(); }
    g.fillStyle='#f4ecd8'; [104,152].forEach(x=>{ g.beginPath(); g.arc(x,150,11,0,7); g.fill(); });
    for(let i=0;i<2500;i++){ g.fillStyle=`rgba(0,0,0,${Math.random()*0.2})`; g.fillRect(Math.random()*w,Math.random()*h,2,2); } });
  [[-3.95,-39,0],[3.95,-39,1],[-3.95,-46,2],[3.95,-46,3]].forEach(([x,z,k])=>{
    const p=new T.Group(); p.position.set(x,2.9,z); p.rotation.y=x<0?Math.PI/2:-Math.PI/2; scene.add(p);
    p.add(mesh(new T.BoxGeometry(1.45,1.85,0.08),std(0x9a7428,{metalness:0.85,roughness:0.35})));
    const pl=new T.Mesh(new T.PlaneGeometry(1.2,1.6),std(0xffffff,{map:paint(k),roughness:0.9})); pl.position.z=0.045; p.add(pl);
    const pupils=[-0.1125,0.1125].map(px=>{ const s=new T.Mesh(new T.SphereGeometry(0.03,10,8),new T.MeshBasicMaterial({color:0x050505})); s.position.set(px,0.094,0.06); s.userData.base=s.position.clone(); p.add(s); return s; });
    pl.userData.act={type:'portrait',who:'portrait',label:'stare',obj:p}; pl.userData.hitbox=true; W.interact.push(pl);
    W.portraits.push({p,pupils}); });

  // chase cast
  { const g=M.gang(); const ghost=new T.Group(); const gb=M.ghost(2.1,{ei:0.5}); ghost.add(gb); ghost.userData.inner=gb;
    W.chase={dog:g.dog,bo:g.bo,dot:g.dot,ghost};
    [g.dog,g.bo,g.dot,ghost].forEach(c=>{ c.visible=false; scene.add(c); });
    hitbox(g.dog,0.9,2.4,2.1,1.2,{type:'char',who:'dog',obj:g.dog});
    hitbox(ghost,1.4,2.4,1.2,1.3,{type:'char',who:'ghost',obj:gb});
    hitbox(g.bo,0.8,2.1,0.6,1.05,{type:'char',who:'bo',obj:g.bo});
    hitbox(g.dot,0.8,2.0,0.6,1.0,{type:'char',who:'dot',obj:g.dot});
    buildChase(); }

  function buildChase(){
    const C=W.chase; const tl=gsap.timeline({paused:true,repeat:-1,repeatDelay:0.6});
    const pt=(side,i,inside)=>new T.Vector3(side==='L'?(inside?-2.6:-4.8):(inside?2.6:4.8),0,DZ[i]);
    const door=(side,i,t)=>{ const d=W.doors[side][i];
      tl.to(d.pivot.rotation,{y:d.open,duration:0.2,ease:'power2.out'},Math.max(0,t-0.2));
      tl.call(()=>A.sfx('door'),null,Math.max(0,t-0.2));
      tl.to(d.pivot.rotation,{y:0,duration:0.35,ease:'bounce.out'},t+0.9); };
    const run=(ch,pts,t,speed,hold)=>{
      tl.call(()=>{ ch.visible=true; ch.position.copy(pts[0]); ch.rotation.set(0,Math.atan2(pts[1].x-pts[0].x,pts[1].z-pts[0].z),0); },null,t);
      for(let i=1;i<pts.length;i++){ const a=pts[i-1], b=pts[i]; const d=Math.max(0.05,a.distanceTo(b)/speed);
        if(i===2&&hold) t+=hold;
        const tt=t; tl.call(()=>{ ch.rotation.y=Math.atan2(b.x-a.x,b.z-a.z); },null,tt);
        tl.fromTo(ch.position,{x:a.x,y:a.y,z:a.z},{x:b.x,y:b.y,z:b.z,duration:d,ease:'none',immediateRender:false},tt); t+=d; }
      tl.call(()=>{ ch.visible=false; },null,t); return t; };
    const cross=(ch,fs,fi,ts,ti,t,speed,hold)=>{ door(fs,fi,t); const end=run(ch,[pt(fs,fi,0),pt(fs,fi,1),pt(ts,ti,1),pt(ts,ti,0)],t,speed,hold); door(ts,ti,end-0.4); return end; };

    tl.call(()=>A.sfx('ruhroh'),null,0.1);
    cross(C.dog,'L',0,'R',1,0.3,10,0.45); tl.call(()=>A.sfx('skid'),null,0.75);
    tl.call(()=>A.sfx('moan'),null,0.9); cross(C.ghost,'L',0,'R',1,1.0,7);
    cross(C.dog,'R',2,'L',1,3.0,10,0.3); tl.call(()=>A.sfx('skid'),null,3.3);
    cross(C.ghost,'R',0,'L',2,3.6,7);
    cross(C.bo,'L',2,'R',0,5.2,8,0.35); cross(C.dog,'L',2,'R',0,5.35,8.4,0.35); tl.call(()=>A.sfx('skid'),null,5.6);
    cross(C.ghost,'R',2,'L',0,6.4,7);
    cross(C.dot,'R',1,'L',1,8.0,2.4); cross(C.ghost,'R',1,'L',1,8.9,2.4);
    cross(C.ghost,'L',2,'R',2,12.6,9); cross(C.dog,'L',2,'R',2,13.1,9); tl.call(()=>A.sfx('bark'),null,13.2);
    // the big collision
    const T0=15.2, ctr=new T.Vector3(0,0,-42.5);
    [[C.dog,'L',0,-0.45,0],[C.ghost,'R',2,0.45,0],[C.bo,'L',2,0,0.35],[C.dot,'R',0,0,-0.35]].forEach(([ch,s,i,ox,oz])=>{
      door(s,i,T0); const c=ctr.clone().add(new T.Vector3(ox,0,oz));
      tl.call(()=>{ ch.visible=true; ch.position.copy(pt(s,i,0)); ch.rotation.set(0,Math.atan2(c.x-pt(s,i,0).x,c.z-pt(s,i,0).z),0); },null,T0);
      tl.fromTo(ch.position,{x:pt(s,i,0).x,y:0,z:pt(s,i,0).z},{x:c.x,y:0,z:c.z,duration:0.9,ease:'none',immediateRender:false},T0);
      tl.to(ch.position,{y:1.3,duration:0.3,ease:'power2.out',yoyo:true,repeat:1},T0+0.9);
      tl.to(ch.rotation,{y:'+='+Math.PI*2,duration:0.6,ease:'power1.inOut'},T0+0.9); });
    tl.call(()=>A.sfx('boing'),null,T0+0.9);
    const T1=T0+1.8;
    [[C.dog,'R',1],[C.ghost,'L',1],[C.bo,'R',2],[C.dot,'L',0]].forEach(([ch,s,i],k)=>{ const from=ctr.clone(); const inP=pt(s,i,1), out=pt(s,i,0);
      tl.call(()=>{ ch.rotation.y=Math.atan2(inP.x-ch.position.x,inP.z-ch.position.z); },null,T1+k*0.12);
      tl.to(ch.position,{x:inP.x,z:inP.z,duration:0.45,ease:'none'},T1+k*0.12);
      tl.to(ch.position,{x:out.x,z:out.z,duration:0.3,ease:'none'},T1+k*0.12+0.45);
      tl.call(()=>{ ch.visible=false; },null,T1+k*0.12+0.75);
      door(s,i,T1+k*0.12+0.55); });
    tl.call(()=>A.sfx('slam'),null,T1+1.6);
    W.chaseTL=tl;
  }

  /* ================================================= GALLERY  z -58 .. -94 */
  const velvet=std(0xffffff,{map:reTex(TX.velvet,10,1),roughness:0.95});
  { // dividing wall with arch (z=-58)
    box(5,6,0.3,velvet,-4.5,3,-58); box(5,6,0.3,velvet,4.5,3,-58); box(4,2.2,0.3,velvet,0,4.9,-58);
    const arch=mesh(new T.TorusGeometry(2,0.15,8,30,Math.PI),std(0xb08a3a,{metalness:0.8,roughness:0.3}),0,3.8,-57.84); scene.add(arch);
    const f=mesh(new T.PlaneGeometry(14,36),std(0xffffff,{map:reTex(TX.checker,7,18),roughness:0.25,metalness:0.2}),0,0.02,-76); f.rotation.x=-Math.PI/2; scene.add(f);
    const c=mesh(new T.PlaneGeometry(14,36),ceilM,0,6,-76); c.rotation.x=Math.PI/2; scene.add(c);
    box(0.3,6,36,velvet,-7.15,3,-76); box(0.3,6,36,velvet,7.15,3,-76);
    // far wall with doorway (z=-94)
    box(5.6,6,0.3,velvet,-4.2,3,-94); box(5.6,6,0.3,velvet,4.2,3,-94); box(2.8,3,0.3,velvet,0,4.5,-94);
    W.neonTex=()=>tex(1024,160,(g,w,h)=>{ g.clearRect(0,0,w,h); const fa=M.lang==='fa'; g.font=fa?'110px Lalezar, Vazirmatn, sans-serif':'bold 110px Creepster, cursive'; g.direction=fa?'rtl':'ltr'; g.textAlign='center'; g.shadowColor='#ff7a1a'; g.shadowBlur=30; g.fillStyle='#ffb36b'; g.fillText(M.t('neon'),w/2,fa?125:118); });
    const nm=new T.MeshBasicMaterial({map:W.neonTex(),transparent:true,depthWrite:false}); nm.color.setScalar(2.4);
    const n=new T.Mesh(new T.PlaneGeometry(7,1.1),nm); n.position.set(0,4.9,-93.8); scene.add(n); W.neon=n; W.flicker.push({m:n,base:2.4,neon:true});
    // empty gilded frames on walls
    for(let i=0;i<6;i++){ [-1,1].forEach(s=>{ const fr=mesh(new T.TorusGeometry(0.7,0.06,6,4),std(0xb08a3a,{metalness:0.85,roughness:0.3}),s*7.0,3.7,-62-i*5.8); fr.rotation.set(0,s*Math.PI/2,Math.PI/4); fr.scale.set(1,1.4,1); scene.add(fr); }); }
    // chandelier
    const ch=new T.Group(); ch.position.set(0,4.6,-76); scene.add(ch); W.chandelier=ch;
    ch.add(mesh(new T.TorusGeometry(1.2,0.05,8,32),std(0xb08a3a,{metalness:0.85,roughness:0.3})).rotateX(Math.PI/2));
    ch.add(mesh(new T.CylinderGeometry(0.02,0.02,1.4,6),iron,0,0.7,0));
    for(let i=0;i<8;i++){ const a=i/8*Math.PI*2; ch.add(mesh(new T.CylinderGeometry(0.04,0.04,0.2,8),std(0xf2e6c8),Math.cos(a)*1.2,0.12,Math.sin(a)*1.2));
      const fl=new T.Mesh(new T.SphereGeometry(0.045,8,6),glow(0xffb050,5)); fl.scale.y=1.8; fl.position.set(Math.cos(a)*1.2,0.28,Math.sin(a)*1.2); ch.add(fl); W.flicker.push({m:fl,base:5,isFlame:true}); }
    const cl=new T.PointLight(0xff9a40,1.4,20,2); cl.position.set(0,4.2,-76); scene.add(cl); W.flicker.push({l:cl,base:1.4});
    const pl1=new T.PointLight(0x7a3cff,1.2,16,2); pl1.position.set(0,1.0,-90); scene.add(pl1);
  }
  // pedestals with products
  const label=(p)=>tex(512,160,(g,w,h)=>{ const fa=M.lang==='fa'; g.fillStyle='rgba(7,5,11,.92)'; g.fillRect(0,0,w,h); g.strokeStyle='#ff7a1a'; g.lineWidth=4; g.strokeRect(6,6,w-12,h-12);
    g.direction=fa?'rtl':'ltr'; const s=fa?w-26:26, e=fa?26:w-26; g.textAlign=fa?'right':'left';
    g.fillStyle='#efe6d2'; g.font=fa?'42px Lalezar, Vazirmatn, sans-serif':'44px Anton, Impact, sans-serif'; g.fillText(fa?M.pf(p,'name'):p.name.toUpperCase(),s,68);
    g.fillStyle='#ff7a1a'; g.font=fa?'36px Lalezar, Vazirmatn, sans-serif':'40px Anton, Impact, sans-serif'; g.fillText(M.money(p.price),s,128);
    g.fillStyle='rgba(239,230,210,.6)'; g.font=fa?'22px Vazirmatn, sans-serif':'22px Space Grotesk, sans-serif'; g.textAlign=fa?'left':'right'; g.fillText(M.t('inspect'),e,128); });
  M.products.forEach((p,i)=>{
    const side=i<6?-1:1, k=i%6, x=side*4.3, z=-63-k*5.5;
    const g=new T.Group(); g.position.set(x,0,z); scene.add(g);
    g.add(mesh(new T.CylinderGeometry(0.62,0.75,1.1,28),std(0x1a1420,{roughness:0.25,metalness:0.4}),0,0.55,0));
    g.add(mesh(new T.CylinderGeometry(0.72,0.72,0.08,28),std(0xb08a3a,{metalness:0.85,roughness:0.3}),0,1.12,0));
    const ring=new T.Mesh(new T.TorusGeometry(0.66,0.02,6,40),glow(i%2?0x9a5cff:0xff7a1a,3)); ring.rotation.x=Math.PI/2; ring.position.y=1.17; g.add(ring);
    const item=M.fit(M.prod[p.id](),1.15); item.position.y=1.17; g.add(item);
    const lb=new T.Mesh(new T.PlaneGeometry(1.25,0.39),new T.MeshBasicMaterial({map:label(p)})); lb.position.set(-side*0.76,0.62,0); lb.rotation.y=-side*Math.PI/2; g.add(lb);
    const hit=new T.Mesh(new T.BoxGeometry(1.5,2.6,1.5),new T.MeshBasicMaterial({visible:false})); hit.position.y=1.3; g.add(hit);
    hit.userData.act={type:'product',id:p.id,label:p.name};
    W.interact.push(hit); W.pedestals.push({g,item,ring,id:p.id,ph:i,lb,p});
  });
  // lurking ghosts (jump scares)
  [[-6.1,-70.5],[6.1,-81.5],[-6.1,-87.5]].forEach(([x,z])=>{ const gh=M.ghost(2.2,{ei:0.9,emissive:0xff2a2a}); gh.position.set(x,0.1,z); gh.rotation.y=x<0?Math.PI/2:-Math.PI/2;
    gh.traverse(o=>{ if(o.material){ o.material=o.material.clone(); o.material.transparent=true; o.material.opacity=0; } }); gh.visible=false; scene.add(gh); W.hiders.push({g:gh,home:gh.position.clone(),used:false}); });

  /* ================================================= SAFE ROOM  z -94 .. -114 */
  { const sw=std(0xffffff,{map:reTex(TX.saferoom,6,1),roughness:0.95});
    const f=mesh(new T.PlaneGeometry(12,20),std(0xffffff,{map:reTex(TX.tiles,6,10),roughness:0.6}),0,0.02,-104); f.rotation.x=-Math.PI/2; scene.add(f);
    const c=mesh(new T.PlaneGeometry(12,20),std(0x14120c,{roughness:1}),0,4.5,-104); c.rotation.x=Math.PI/2; scene.add(c);
    box(0.25,4.5,20,sw,-6.1,2.25,-104); box(0.25,4.5,20,sw,6.1,2.25,-104);
    box(4.8,4.5,0.25,sw,-3.6,2.25,-114); box(4.8,4.5,0.25,sw,3.6,2.25,-114); box(2.4,1.7,0.25,sw,0,3.65,-114);
    // desk + typewriter
    const desk=new T.Group(); desk.position.set(3.6,0,-108.5); desk.rotation.y=-0.35; scene.add(desk);
    const dw=std(0x3a2414,{map:reTex(TX.wood,1,1),roughness:0.6}); desk.add(mesh(new T.BoxGeometry(2.4,0.1,1.2),dw,0,1.0,0));
    [[-1.1,-0.5],[1.1,-0.5],[-1.1,0.5],[1.1,0.5]].forEach(([x,z])=>desk.add(mesh(new T.BoxGeometry(0.1,1.0,0.1),dw,x,0.5,z)));
    const tw=new T.Group(); tw.position.set(0,1.05,0.05); desk.add(tw);
    const tm=std(0x2a3a2a,{roughness:0.35,metalness:0.5});
    tw.add(mesh(new T.BoxGeometry(0.8,0.22,0.6),tm,0,0.11,0)); const sl=mesh(new T.BoxGeometry(0.8,0.2,0.3),tm,0,0.25,-0.15); tw.add(sl);
    tw.add(mesh(new T.CylinderGeometry(0.07,0.07,0.95,14),std(0x111111),0,0.4,-0.2).rotateZ(Math.PI/2));
    const paper=mesh(new T.PlaneGeometry(0.5,0.6),std(0xf2ecd8,{roughness:0.9}),0,0.65,-0.26); paper.rotation.x=-0.25; tw.add(paper);
    for(let r=0;r<3;r++) for(let k=0;k<8;k++) tw.add(mesh(new T.CylinderGeometry(0.025,0.025,0.03,8),std(0xe8e0c8),-0.28+k*0.08,0.25+r*0.02,0.18-r*0.07));
    const hit=new T.Mesh(new T.BoxGeometry(1.2,1.2,1.2),new T.MeshBasicMaterial({visible:false})); hit.position.set(0,0.4,0); tw.add(hit);
    hit.userData.act={type:'typewriter',who:'typewriter',label:'save'}; W.interact.push(hit); W.typewriter=tw;
    // lamp
    desk.add(mesh(new T.CylinderGeometry(0.12,0.15,0.05,16),std(0x1a1a1a,{metalness:0.6}),-0.85,1.08,-0.3));
    desk.add(mesh(new T.CylinderGeometry(0.02,0.02,0.6,8),std(0x1a1a1a,{metalness:0.6}),-0.85,1.38,-0.3));
    desk.add(mesh(new T.ConeGeometry(0.25,0.25,20,1,true),std(0x2a5a3a,{side:T.DoubleSide,roughness:0.4}),-0.85,1.7,-0.3));
    desk.add(new T.Mesh(new T.SphereGeometry(0.06,10,8),glow(0xffd09a,5)).translateX(-0.85).translateY(1.62).translateZ(-0.3));
    const ll=new T.PointLight(0xffc080,2.2,14,2); ll.position.set(3.0,2.3,-108.5); scene.add(ll); W.flicker.push({l:ll,base:2.2,soft:true});
    // item box chest
    const chest=new T.Group(); chest.position.set(-4.2,0,-107); chest.rotation.y=0.4; scene.add(chest);
    const cw=std(0x5a3a1a,{map:reTex(TX.wood,1,1),roughness:0.7}), band=std(0x8a8a8a,{metalness:0.9,roughness:0.35});
    chest.add(mesh(new T.BoxGeometry(1.6,0.8,0.9),cw,0,0.4,0));
    const lid=new T.Group(); lid.position.set(0,0.8,-0.45); chest.add(lid);
    const lidM=mesh(new T.CylinderGeometry(0.45,0.45,1.6,20,1,false,0,Math.PI),cw,0,0,0.45); lidM.rotation.z=Math.PI/2; lid.add(lidM);
    [-0.5,0.5].forEach(x=>{ chest.add(mesh(new T.BoxGeometry(0.08,0.82,0.92),band,x,0.4,0)); });
    chest.add(mesh(new T.BoxGeometry(0.16,0.2,0.05),std(0xd4a53a,{metalness:0.9,roughness:0.3}),0,0.7,0.46));
    const chit=new T.Mesh(new T.BoxGeometry(1.8,1.5,1.2),new T.MeshBasicMaterial({visible:false})); chit.position.y=0.6; chest.add(chit); chit.userData.act={type:'chest',who:'chest',label:'box'}; W.interact.push(chit);
    W.chestLid=lid;
    // green herb
    const herb=new T.Group(); herb.position.set(-4.6,0,-111.5); scene.add(herb);
    herb.add(mesh(new T.CylinderGeometry(0.28,0.2,0.45,14),std(0x8a4a2a,{roughness:0.8}),0,0.22,0));
    for(let i=0;i<9;i++){ const l=mesh(new T.ConeGeometry(0.08,0.5,4),std(0x3fbf3a,{roughness:0.6,emissive:0x0a3a0a}),0,0.6,0); l.rotation.set(rnd(-0.7,0.7),i,rnd(-0.7,0.7)); l.position.x=Math.sin(i)*0.08; herb.add(l); }
    herb.userData.act={type:'herb',who:'herb',label:'herb'}; W.interact.push(...herb.children);
    // warm save-room rug & poster
    const rug=mesh(new T.CircleGeometry(2.4,40),std(0x3a1a12,{roughness:1}),0,0.03,-104); rug.rotation.x=-Math.PI/2; scene.add(rug);
    const poster=tex(256,360,(g,w,h)=>{ g.fillStyle='#d8cfb4'; g.fillRect(0,0,w,h); g.fillStyle='#2a3a2a'; g.font='bold 30px Special Elite, monospace'; g.textAlign='center'; g.fillText('SAFE ROOM',128,60);
      g.font='20px Special Elite, monospace'; ['No monsters','beyond this','point.','','(Probably.)'].forEach((t,i)=>g.fillText(t,128,130+i*30)); g.fillStyle='#3fbf3a'; g.beginPath(); g.arc(128,310,22,0,7); g.fill(); });
    const pm=mesh(new T.PlaneGeometry(1.1,1.55),std(0xffffff,{map:poster,roughness:1}),-5.95,2.3,-101); pm.rotation.y=Math.PI/2; scene.add(pm);
  }

  /* ================================================= FOG TOWN  z -114 .. -210 */
  { const road=mesh(new T.PlaneGeometry(80,100),std(0xffffff,{map:reTex(TX.asphalt,10,12),roughness:0.95}),0,0.012,-164); road.rotation.x=-Math.PI/2; scene.add(road);
    for(let z=-120;z>-205;z-=6){ const l=mesh(new T.PlaneGeometry(0.15,2.6),std(0xcfc6a0,{roughness:1}),0,0.02,z); l.rotation.x=-Math.PI/2; scene.add(l); }
    const conc=std(0xffffff,{map:reTex(TX.concrete,2,3),roughness:1});
    for(let i=0;i<14;i++){ [-1,1].forEach(s=>{ const w=rnd(6,10), h=rnd(8,22), d=rnd(6,10); const b=box(w,h,d,conc,s*rnd(13,18),h/2,-120-i*7.2); }); }
    [-1,1].forEach(s=>{ box(0.4,0.25,90,std(0x4a4744,{roughness:1}),s*6.5,0.12,-162); });
    const fm=new T.MeshStandardMaterial({map:TX.fence,transparent:true,alphaTest:0.4,side:T.DoubleSide,color:0x9a958f,metalness:0.6,roughness:0.6});
    [[-7.5,-132,10],[7.5,-150,14],[-7.5,-170,12]].forEach(([x,z,len])=>{ const f=new T.Mesh(new T.PlaneGeometry(len,3),fm); fm.map.wrapS=T.RepeatWrapping; f.position.set(x,1.5,z); f.rotation.y=Math.PI/2; scene.add(f);
      for(let k=-len/2;k<=len/2;k+=2.5) box(0.08,3.1,0.08,std(0x6a6560,{metalness:0.6}),x,1.55,z+k); });
    [[5.5,-128],[-5.5,-146],[5.5,-164],[-5.5,-180]].forEach(([x,z])=>{ box(0.15,6,0.15,std(0x2a2826,{metalness:0.6}),x,3,z); box(1.2,0.12,0.12,std(0x2a2826,{metalness:0.6}),x-Math.sign(x)*0.55,6,z);
      const b=new T.Mesh(new T.SphereGeometry(0.15,10,8),glow(0xffe8b0,2.5)); b.position.set(x-Math.sign(x)*1.1,5.85,z); scene.add(b); W.flicker.push({m:b,base:2.5,broken:Math.random()<0.5}); });
    const sl=new T.PointLight(0xfff0d0,1.0,14,2); sl.position.set(4.4,5.5,-128); scene.add(sl);
    // town sign
    const signTex=tex(512,256,(g,w,h)=>{ g.fillStyle='#1d4a2c'; g.fillRect(0,0,w,h); g.strokeStyle='#e8e8e0'; g.lineWidth=8; g.strokeRect(14,14,w-28,h-28);
      g.fillStyle='#e8e8e0'; g.textAlign='center'; g.font='bold 40px Space Grotesk, sans-serif'; g.fillText('WELCOME TO',w/2,80); g.font='bold 64px Space Grotesk, sans-serif'; g.fillText('SILENT HOLLOW',w/2,150); g.font='italic 30px Space Grotesk, sans-serif'; g.fillText('Have a nice day!',w/2,205);
      for(let i=0;i<500;i++){ g.fillStyle=`rgba(80,40,20,${Math.random()*0.4})`; g.fillRect(Math.random()*w,Math.random()*h,3,3);} });
    const sign=new T.Group(); sign.position.set(-4.2,0,-127); sign.rotation.y=0.35; scene.add(sign);
    sign.add(mesh(new T.BoxGeometry(3.2,1.6,0.08),std(0xffffff,{map:signTex,roughness:0.8}),0,2.6,0));
    [-1.2,1.2].forEach(x=>sign.add(mesh(new T.CylinderGeometry(0.06,0.06,2.6,8),std(0x5a5650,{metalness:0.6}),x,1.3,-0.06)));
    // abandoned car
    const car=new T.Group(); car.position.set(3.4,0,-139); car.rotation.y=0.25; scene.add(car); const cm=std(0x3a4a5a,{roughness:0.5,metalness:0.5});
    car.add(mesh(new T.BoxGeometry(1.9,0.7,4.2),cm,0,0.65,0)); car.add(mesh(new T.BoxGeometry(1.7,0.6,2.2),std(0x1a1d22,{roughness:0.1,metalness:0.8}),0,1.25,-0.2));
    [[-0.9,1.4],[0.9,1.4],[-0.9,-1.4],[0.9,-1.4]].forEach(([x,z])=>car.add(mesh(new T.CylinderGeometry(0.35,0.35,0.25,14),std(0x111111),x,0.35,z).rotateZ(Math.PI/2)));
    // pyramid gentleman
    const pm=M.pyramidMan(); pm.position.set(-1.5,0,-168); scene.add(pm); W.pyramid=pm;
    hitbox(pm,1.4,3.6,1.0,1.8,{type:'char',who:'pyramid',obj:pm,far:true});
    // drifting fog banks (billboards) through the whole street
    const fogTex=tex(512,256,(g,w,h)=>{ for(let i=0;i<70;i++){ const x=rnd(40,w-40), y=rnd(60,h-50), r=rnd(30,110); const gr=g.createRadialGradient(x,y,0,x,y,r); gr.addColorStop(0,'rgba(225,222,215,.22)'); gr.addColorStop(1,'rgba(225,222,215,0)'); g.fillStyle=gr; g.fillRect(0,0,w,h); } });
    W.fogBanks=[];
    for(let i=0;i<46;i++){ const m=new T.Mesh(new T.PlaneGeometry(rnd(14,26),rnd(5,9)),new T.MeshBasicMaterial({map:fogTex,transparent:true,depthWrite:false,opacity:0,color:0xd8d4cc,fog:false}));
      m.position.set(rnd(-14,14),rnd(0.6,4.5),rnd(-118,-200)); scene.add(m); W.fogBanks.push({m,sp:rnd(0.25,0.8)*(Math.random()<0.5?-1:1),base:rnd(0.35,0.75),ph:rnd(0,6)}); }
    // ash
    const n=2200, g=new T.BufferGeometry(), pos=new Float32Array(n*3);
    for(let i=0;i<n;i++){ pos[i*3]=rnd(-16,16); pos[i*3+1]=rnd(0,14); pos[i*3+2]=rnd(-210,-112); }
    g.setAttribute('position',new T.BufferAttribute(pos,3));
    W.ash=new T.Points(g,new T.PointsMaterial({color:0xd8d2c8,size:0.07,transparent:true,opacity:0.85,depthWrite:false})); scene.add(W.ash);
  }

  /* ================================================= UNMASKING STAGE */
  { const st=new T.Group(); st.position.set(0,0,-186); scene.add(st);
    st.add(mesh(new T.CylinderGeometry(5.5,5.8,0.35,48),std(0x1a0f24,{roughness:0.6}),0,0.17,0));
    st.add(new T.Mesh(new T.TorusGeometry(5.6,0.05,6,80),glow(0xff7a1a,3)).rotateX(Math.PI/2).translateZ(-0.36));
    const v=M.villain(); v.position.set(0,0.35,0); st.add(v); W.villain=v;
    const gg=M.gang(); W.finaleGang=gg;
    [[gg.max,-2.6,1.2,0.35,'max'],[gg.dot,-1.5,1.9,0.2,'dot'],[gg.riley,1.6,1.8,-0.2,'riley'],[gg.bo,2.7,1.1,-0.4,'bo'],[gg.dog,4.0,0.4,-0.9,'dog']].forEach(([c,x,z,r,who])=>{ c.position.set(x,0.35,z); c.rotation.y=r; st.add(c);
      if(who==='dog') hitbox(c,0.9,2.4,2.1,1.2,{type:'char',who,obj:c}); else hitbox(c,0.8,2.1,0.6,1.05,{type:'char',who,obj:c}); });
    hitbox(v,1.3,2.5,1.2,1.25,{type:'char',who:'villain',obj:v});
    const spot=new T.SpotLight(0xffb070,3.2,30,0.42,0.5,1.4); spot.position.set(0,10,-180); spot.target=v; scene.add(spot); W.stageSpot=spot;
    const back=new T.PointLight(0x9a5cff,2,20,2); back.position.set(0,4,-194); scene.add(back);
    W.bannerTex=()=>tex(1024,256,(g,w,h)=>{ g.clearRect(0,0,w,h); const fa=M.lang==='fa'; g.font=fa?'150px Lalezar, Vazirmatn, sans-serif':'150px Creepster, cursive'; g.direction=fa?'rtl':'ltr'; g.textAlign='center'; g.shadowColor='#9a5cff'; g.shadowBlur=40; g.fillStyle='#d6b8ff'; g.fillText(M.t('closed'),w/2,fa?190:175); });
    const bm=new T.MeshBasicMaterial({map:W.bannerTex(),transparent:true,opacity:0,depthWrite:false}); bm.color.setScalar(2.2);
    const bn=new T.Mesh(new T.PlaneGeometry(9,2.25),bm); bn.position.set(0,6.2,-192); scene.add(bn); W.banner=bn;
    // confetti
    const n=500, cg=new T.BufferGeometry(), cp=new Float32Array(n*3), cc=new Float32Array(n*3); const cols=[new T.Color(0xff7a1a),new T.Color(0x9a5cff),new T.Color(0xa6ff3d),new T.Color(0xefe6d2)];
    for(let i=0;i<n;i++){ cp[i*3]=rnd(-6,6); cp[i*3+1]=rnd(8,20); cp[i*3+2]=rnd(-192,-178); const c=cols[i%4]; cc[i*3]=c.r; cc[i*3+1]=c.g; cc[i*3+2]=c.b; }
    cg.setAttribute('position',new T.BufferAttribute(cp,3)); cg.setAttribute('color',new T.BufferAttribute(cc,3));
    W.confetti=new T.Points(cg,new T.PointsMaterial({size:0.08,vertexColors:true,transparent:true,opacity:0})); scene.add(W.confetti);
  }

  /* ================================================= BISCUITS (collectibles) */
  [[-6.5,0.6,3],[3.0,1.4,-27.4],[2.6,0.35,-47],[0,5.2,-76],[-5.4,0.35,-91.5],[4.6,1.3,-108.2],[-4,0.5,-152]].forEach(([x,y,z],i)=>{
    const b=M.biscuit(); b.position.set(x,y,z); scene.add(b);
    const hit=new T.Mesh(new T.SphereGeometry(0.55,8,6),new T.MeshBasicMaterial({visible:false})); b.add(hit);
    hit.userData.act={type:'snack',idx:i,label:'snack'}; W.interact.push(hit); W.snacks.push({b,hit,base:y,got:false});
    const l=new T.PointLight(0xff8a2a,0.6,3,2); b.add(l); });

  /* ================================================= controls */
  W.setDoor=p=>{ W.frontDoor.rotation.y=p*1.75; };
  W.setUnmask=p=>{ const v=W.villain.userData; const e=Math.min(1,Math.max(0,p));
    const q=gsap.parseEase('power2.inOut')(Math.min(1,e*1.6));
    v.mask.position.set(q*0.9,2.08+q*2.2,q*0.6); v.mask.rotation.set(-q*0.8,q*1.4,q*0.9);
    v.arms[0].rotation.z=-0.25-q*0.6; v.arms[1].rotation.z=0.25+q*0.6;
    const r=Math.max(0,(e-0.55)/0.45); W.banner.material.opacity=r; W.confetti.material.opacity=r;
    const g=W.finaleGang; ['max','dot','riley','bo'].forEach((k,i)=>{ const a=g[k].userData.arms; a[0].rotation.z=r*2.4; a[1].rotation.z=-r*2.4; });
    g.dog.userData.head.rotation.x=-r*0.4; };
  W.collect=i=>{ const s=W.snacks[i]; if(s.got) return false; s.got=true; W.interact.splice(W.interact.indexOf(s.hit),1);
    gsap.to(s.b.scale,{x:2.2,y:2.2,z:2.2,duration:0.25,ease:'back.out'}); gsap.to(s.b.position,{y:s.b.position.y+1.4,duration:0.6,ease:'power2.out'}); gsap.to(s.b.scale,{x:0.001,y:0.001,z:0.001,duration:0.3,delay:0.35,onComplete:()=>s.b.visible=false}); return true; };
  W.openChest=()=>{ gsap.to(W.chestLid.rotation,{x:-1.2,duration:0.6,ease:'back.out',yoyo:true,repeat:1,repeatDelay:1}); };

  W.relang=()=>{
    const swap=(mat,tx)=>{ if(mat.map) mat.map.dispose(); mat.map=tx; mat.needsUpdate=true; };
    W.pedestals.forEach(o=>swap(o.lb.material,label(o.p)));
    swap(W.neon.material,W.neonTex()); swap(W.banner.material,W.bannerTex());
  };

  /* ================================================= per-frame */
  const tmp=new T.Vector3();
  W.update=(t,dt,zone)=>{
    // exterior life
    W.bats.forEach(o=>{ o.boost*=0.985; o.ph+=dt*o.sp*o.boost*6; const a=t*o.sp+o.ph; o.b.position.set(Math.cos(a)*o.r,o.h+Math.sin(t*1.3+o.ph)*1.2,o.cz+Math.sin(a)*o.r*1.6); o.b.rotation.y=-a+(o.sp>0?0:Math.PI); const w=Math.sin(t*18+o.ph)*0.9; o.b.userData.wings[0].rotation.z=w; o.b.userData.wings[1].rotation.z=w; });
    W.mists.forEach(o=>{ o.m.position.x+=Math.sin(t*0.1+o.ph)*dt*o.sp; o.m.material.opacity=0.16+Math.sin(t*0.4+o.ph)*0.08; });
    { const p=W.wisps.geometry.attributes.position; for(let i=0;i<p.count;i++){ p.setY(i,p.getY(i)+Math.sin(t+i)*0.004); p.setX(i,p.getX(i)+Math.cos(t*0.7+i)*0.004); } p.needsUpdate=true; W.wisps.material.size=0.3+Math.sin(t*3)*0.08; }
    W.spin.forEach(o=>{ o.o.rotation.y=Math.sin(t*0.6)*0.4; });
    // flicker
    W.flicker.forEach(o=>{ let k=1;
      if(o.isFlame) k=0.75+Math.random()*0.35; else if(o.neon) k=Math.random()<0.03?0.15:1; else if(o.broken) k=Math.random()<0.08?0.1:1; else if(o.soft) k=0.95+Math.sin(t*2)*0.05; else k=0.8+Math.sin(t*9+o.base*3)*0.1+Math.random()*0.12;
      if(o.l) o.l.intensity=o.base*k;
      if(o.m && o.m.material.color){ if(o.c){ o.m.material.color.setHex(o.c).multiplyScalar(o.base*k); } else o.m.material.color.setScalar(o.base*k); } });
    // chase cast animation
    const C=W.chase; [C.dog,C.bo,C.dot].forEach(c=>{ if(c.visible) M.animateRun(c,t,24,1.0); });
    if(C.ghost.visible){ C.ghost.userData.inner.position.y=0.3+Math.sin(t*6)*0.12; C.ghost.userData.inner.rotation.z=Math.sin(t*5)*0.08; }
    // portraits follow camera
    W.portraits.forEach(o=>{ tmp.copy(camera.position); o.p.worldToLocal(tmp); const d=tmp.normalize();
      o.pupils.forEach(s=>{ s.position.x=s.userData.base.x+Math.max(-0.022,Math.min(0.022,d.x*0.05)); s.position.y=s.userData.base.y+Math.max(-0.018,Math.min(0.018,d.y*0.05)); }); });
    // gallery
    W.pedestals.forEach(o=>{ o.item.rotation.y=t*0.5+o.ph; o.item.position.y=1.17+Math.sin(t*1.5+o.ph)*0.05; });
    if(W.chandelier) W.chandelier.rotation.y=Math.sin(t*0.3)*0.1;
    // biscuits
    W.snacks.forEach(s=>{ if(!s.got){ s.b.rotation.y=t*2; s.b.rotation.z=Math.sin(t*2)*0.3; s.b.position.y=s.base+Math.sin(t*2.5+s.base)*0.12; } });
    // fog town
    if(zone>=6){ const p=W.ash.geometry.attributes.position; for(let i=0;i<p.count;i++){ let y=p.getY(i)-dt*(0.35+(i%7)*0.05); if(y<0) y=14; p.setY(i,y); p.setX(i,p.getX(i)+Math.sin(t*0.5+i)*0.003); } p.needsUpdate=true;
      const P=W.pyramid; P.position.z+=dt*0.9; if(P.position.z>-138) P.position.z=-172; const s=Math.sin(t*2.2); P.userData.legs[0].rotation.x=s*0.35; P.userData.legs[1].rotation.x=-s*0.35; P.userData.arms[0].rotation.x=-s*0.2; P.position.y=Math.abs(s)*0.05; }
    // fog banks: face the camera, drift, thicken inside Silent Hollow
    { const target=zone===7?1:zone===6?0.25:0;
      W.fogBanks.forEach(o=>{ o.m.quaternion.copy(camera.quaternion); o.m.position.x+=o.sp*dt; if(o.m.position.x>16) o.m.position.x=-16; if(o.m.position.x<-16) o.m.position.x=16;
        const op=o.base*target*(0.75+Math.sin(t*0.3+o.ph)*0.25); o.m.material.opacity+=(op-o.m.material.opacity)*0.03; o.m.visible=o.m.material.opacity>0.01; }); }
    // finale idle
    if(zone>=7){ const g=W.finaleGang; g.dog.userData.tail.rotation.z=Math.sin(t*10)*0.6; W.villain.rotation.y=Math.sin(t*0.8)*0.12;
      if(W.confetti.material.opacity>0){ const p=W.confetti.geometry.attributes.position; for(let i=0;i<p.count;i++){ let y=p.getY(i)-dt*(1+(i%5)*0.3); if(y<0) y=rnd(10,18); p.setY(i,y); p.setX(i,p.getX(i)+Math.sin(t*2+i)*0.01); } p.needsUpdate=true; } }
  };
  return W;
};
})();
