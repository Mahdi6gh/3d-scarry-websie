/* UNMASKED — procedural 3D models (characters, props, products) */
(function(){
const M = window.UM = window.UM || {};
const T = THREE;

function std(color,o){ return new T.MeshStandardMaterial(Object.assign({color:color,roughness:0.75,metalness:0.05},o||{})); }
function glow(color,k){ const m=new T.MeshBasicMaterial({color:color}); m.color.multiplyScalar(k||2.5); return m; }
function mesh(geo,mat,x,y,z){ const m=new T.Mesh(geo,mat); m.position.set(x||0,y||0,z||0); m.castShadow=true; m.receiveShadow=true; return m; }
function tex(w,h,draw,rep){ const c=document.createElement('canvas'); c.width=w; c.height=h; draw(c.getContext('2d'),w,h);
  const t=new T.CanvasTexture(c); t.encoding=T.sRGBEncoding; t.anisotropy=8;
  if(rep){ t.wrapS=t.wrapT=T.RepeatWrapping; t.repeat.set(rep[0],rep[1]); } return t; }
M.std=std; M.glow=glow; M.mesh=mesh; M.tex=tex;

/* ---------------- pumpkin ---------------- */
M.pumpkin=function(r,carved,light,color){
  r=r||1; const g=new T.Group();
  const geo=new T.SphereGeometry(r,48,32), p=geo.attributes.position, v=new T.Vector3();
  for(let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i); const th=Math.atan2(v.z,v.x);
    const rib=1-0.075*Math.pow(Math.abs(Math.sin(th*5)),0.5); v.x*=rib; v.z*=rib; v.y*=0.78; p.setXYZ(i,v.x,v.y,v.z); }
  geo.computeVertexNormals();
  g.add(mesh(geo,std(color||0xff6a00,{roughness:0.5})));
  const stem=mesh(new T.CylinderGeometry(r*0.07,r*0.12,r*0.4,7),std(0x3d5a1a,{roughness:0.9}),0,r*0.85,0); stem.rotation.z=0.25; g.add(stem);
  if(carved){
    const em=glow(0xffa030,3.2);
    const eyeG=new T.CircleGeometry(r*0.17,3);
    [-1,1].forEach(s=>{ const e=new T.Mesh(eyeG,em); e.position.set(s*r*0.32,r*0.16,r*0.885); e.rotation.set(0,s*0.35,Math.PI/2); g.add(e); });
    const nose=new T.Mesh(new T.CircleGeometry(r*0.08,3),em); nose.position.set(0,-r*0.02,r*0.93); nose.rotation.z=Math.PI/2; g.add(nose);
    const sh=new T.Shape(); sh.moveTo(-0.5,0.05); sh.lineTo(-0.36,-0.06); sh.lineTo(-0.26,0.06); sh.lineTo(-0.12,-0.08); sh.lineTo(0,0.05);
    sh.lineTo(0.12,-0.08); sh.lineTo(0.26,0.06); sh.lineTo(0.36,-0.06); sh.lineTo(0.5,0.05); sh.quadraticCurveTo(0,-0.55,-0.5,0.05);
    const mouth=new T.Mesh(new T.ShapeGeometry(sh),em); mouth.scale.setScalar(r*0.95); mouth.position.set(0,-r*0.2,r*0.9); g.add(mouth);
    if(light){ const pl=new T.PointLight(0xff7a1a,1.6,r*10,2); pl.position.set(0,0,r*1.2); g.add(pl); g.userData.light=pl; }
  }
  return g;
};

/* ---------------- ghost ---------------- */
M.ghost=function(h,o){
  h=h||2; o=o||{}; const g=new T.Group(); const pts=[];
  for(let i=0;i<=24;i++){ const t=i/24, y=h*(1-t); const r=t<0.38?Math.sin(t/0.38*Math.PI/2)*h*0.3:h*0.3+(t-0.38)*h*0.32; pts.push(new T.Vector2(Math.max(r,0.0005),y)); }
  const geo=new T.LatheGeometry(pts,48), p=geo.attributes.position, v=new T.Vector3();
  for(let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i); if(v.y<h*0.18){ const th=Math.atan2(v.z,v.x), k=1-v.y/(h*0.18);
    p.setY(i,v.y+Math.sin(th*7)*h*0.06*k); const sc=1+0.08*k*Math.sin(th*7+1); p.setX(i,v.x*sc); p.setZ(i,v.z*sc); } }
  geo.computeVertexNormals();
  const mat=new T.MeshStandardMaterial({color:o.color||0xf2efff,emissive:o.emissive||0x6b5cff,emissiveIntensity:o.ei==null?0.35:o.ei,roughness:0.6,transparent:true,opacity:o.opacity||0.93,side:T.DoubleSide});
  g.add(mesh(geo,mat));
  const black=new T.MeshBasicMaterial({color:0x000000,transparent:true});
  const eyeG=new T.SphereGeometry(h*0.045,16,12);
  [-1,1].forEach(s=>{ const e=new T.Mesh(eyeG,black); e.scale.set(1,1.5,0.5); e.position.set(s*h*0.085,h*0.78,h*0.215); g.add(e); });
  const m=new T.Mesh(new T.SphereGeometry(h*0.05,16,12),black); m.scale.set(1,1.4,0.5); m.position.set(0,h*0.64,h*0.29); g.add(m);
  const armG=new T.CapsuleGeometry(h*0.05,h*0.18,6,10);
  [-1,1].forEach(s=>{ const a=mesh(armG,mat); a.position.set(s*h*0.33,h*0.55,h*0.08); a.rotation.set(-0.6,0,s*-1.1); g.add(a); });
  g.userData.mat=mat; g.userData.black=black;
  return g;
};

/* ---------------- Biscuit the Great Dane ---------------- */
M.dogHead=function(){
  const h=new T.Group();
  const fur=std(0x9a6a35,{roughness:0.85}), dark=std(0x3b2414,{roughness:0.9}), blk=std(0x0d0806,{roughness:0.35}), white=std(0xffffff,{roughness:0.3}), muz=std(0xc49a64,{roughness:0.85});
  const skull=mesh(new T.SphereGeometry(0.3,24,18),fur); skull.scale.set(0.92,0.95,1.05); h.add(skull);
  const snout=mesh(new T.CapsuleGeometry(0.15,0.26,8,14),muz,0,-0.08,0.3); snout.rotation.x=Math.PI/2; snout.scale.set(1.05,1,0.9); h.add(snout);
  const nose=mesh(new T.SphereGeometry(0.075,12,10),blk,0,-0.02,0.585); nose.scale.set(1.3,0.85,1); h.add(nose);
  [-1,1].forEach(s=>{
    h.add(mesh(new T.SphereGeometry(0.075,14,10),white,s*0.11,0.1,0.235));
    h.add(mesh(new T.SphereGeometry(0.036,10,8),blk,s*0.105,0.1,0.3));
    const brow=mesh(new T.BoxGeometry(0.1,0.025,0.03),blk,s*0.11,0.2,0.25); brow.rotation.z=s*-0.25; h.add(brow);
    const ear=mesh(new T.CapsuleGeometry(0.09,0.28,6,10),dark,s*0.27,-0.1,-0.02); ear.scale.set(0.38,1,0.85); ear.rotation.z=s*0.3; h.add(ear);
  });
  const sp=mesh(new T.SphereGeometry(0.09,10,8),dark,0.1,0.22,-0.1); sp.scale.set(1,0.4,1.3); h.add(sp);
  const mouth=mesh(new T.TorusGeometry(0.08,0.012,6,16,Math.PI),blk,0,-0.17,0.4); mouth.rotation.set(0.3,0,Math.PI); h.add(mouth);
  return h;
};
M.dog=function(){
  const g=new T.Group(); const fur=std(0x9a6a35,{roughness:0.85}), spot=std(0x2a1a0e,{roughness:0.9}), paw=std(0x7a5228);
  const body=mesh(new T.CapsuleGeometry(0.36,1.0,8,16),fur,0,1.2,0); body.rotation.x=Math.PI/2; g.add(body);
  [[0.6,0.3],[-0.9,-0.2],[0.2,-0.45],[1.3,0.1],[-0.4,0.45],[-1.4,-0.3]].forEach(([a,z])=>{ const s=mesh(new T.SphereGeometry(0.11,12,8),spot,Math.sin(a)*0.335,1.2+Math.cos(a)*0.335,z); s.scale.set(1.2,0.5,1.4); s.lookAt(0,1.2,z); g.add(s); });
  const legs=[];
  [[-0.2,0.5],[0.2,0.5],[-0.2,-0.5],[0.2,-0.5]].forEach(([x,z],i)=>{ const pv=new T.Group(); pv.position.set(x,1.08,z);
    if(i>1) pv.add(mesh(new T.SphereGeometry(0.17,12,10),fur));
    pv.add(mesh(new T.CylinderGeometry(0.075,0.062,1.0,10),fur,0,-0.5,0));
    const pw=mesh(new T.SphereGeometry(0.1,10,8),paw,0,-1.0,0.04); pw.scale.set(1,0.6,1.35); pv.add(pw);
    g.add(pv); legs.push(pv); });
  const neck=mesh(new T.CylinderGeometry(0.15,0.2,0.65,12),fur,0,1.6,0.62); neck.rotation.x=0.55; g.add(neck);
  const collar=mesh(new T.TorusGeometry(0.19,0.045,8,24),std(0x2ec4b6,{roughness:0.4}),0,1.52,0.58); collar.rotation.x=-1.02; g.add(collar);
  g.add(mesh(new T.OctahedronGeometry(0.07),std(0xffcc33,{metalness:0.9,roughness:0.25}),0,1.36,0.74));
  const head=M.dogHead(); head.position.set(0,2.0,0.88); g.add(head);
  const tail=new T.Group(); tail.position.set(0,1.38,-0.68); const tg=new T.CylinderGeometry(0.025,0.05,0.62,8); tg.translate(0,0.31,0);
  tail.add(mesh(tg,fur)); tail.rotation.x=-0.75; g.add(tail);
  g.userData={legs,head,tail,kind:'dog'};
  return g;
};

/* ---------------- the gang (people) ---------------- */
M.person=function(o){
  const g=new T.Group(); const skin=std(o.skin||0xf1c9a0,{roughness:0.6}), shirt=std(o.shirt), pants=std(o.pants||0x223355), shoe=std(o.shoes||0x1a1a1a), hairM=std(o.hair||0x3a2414,{roughness:0.9});
  const legs=[],arms=[];
  [-1,1].forEach(s=>{ const p=new T.Group(); p.position.set(s*0.12,0.95,0);
    p.add(mesh(new T.CylinderGeometry(0.085,0.075,0.9,10),pants,0,-0.45,0)); p.add(mesh(new T.BoxGeometry(0.16,0.1,0.28),shoe,0,-0.9,0.05)); g.add(p); legs.push(p); });
  if(o.skirt) g.add(mesh(new T.CylinderGeometry(0.2,o.skirtW||0.36,o.skirtH||0.42,16),std(o.skirt),0,1.0-(o.skirtH||0.42)/2+0.07,0));
  g.add(mesh(new T.CylinderGeometry(0.21,0.19,0.62,14),shirt,0,1.28,0));
  const sh=mesh(new T.SphereGeometry(0.21,14,10),shirt,0,1.56,0); sh.scale.set(1.15,0.5,0.9); g.add(sh);
  [-1,1].forEach(s=>{ const p=new T.Group(); p.position.set(s*0.27,1.55,0);
    p.add(mesh(new T.CylinderGeometry(0.06,0.055,0.62,8),o.sleeve?std(o.sleeve):shirt,0,-0.31,0)); p.add(mesh(new T.SphereGeometry(0.065,10,8),skin,0,-0.65,0));
    p.rotation.z=s*0.08; g.add(p); arms.push(p); });
  g.add(mesh(new T.CylinderGeometry(0.06,0.07,0.12,8),skin,0,1.66,0));
  const head=new T.Group(); head.position.set(0,1.84,0); g.add(head);
  head.add(mesh(new T.SphereGeometry(0.19,20,16),skin));
  const eyeW=std(0xffffff,{roughness:0.3}), eyeB=std(0x111111);
  [-1,1].forEach(s=>{ head.add(mesh(new T.SphereGeometry(0.035,10,8),eyeW,s*0.068,0.02,0.163)); head.add(mesh(new T.SphereGeometry(0.018,8,6),eyeB,s*0.068,0.02,0.193)); });
  head.add(mesh(new T.SphereGeometry(0.03,8,6),skin,0,-0.03,0.19));
  head.add(mesh(new T.SphereGeometry(0.205,20,14,0,Math.PI*2,0,Math.PI*0.42),hairM,0,0.02,-0.01));
  const back=(th,sx)=>{ const b=mesh(new T.SphereGeometry(0.215,20,14,Math.PI*5/6,Math.PI*4/3,0,Math.PI*th),hairM,0,0,-0.01); b.scale.set(sx||1.06,1,1.05); head.add(b); };
  switch(o.hairStyle){
    case 'blond': { const sw=mesh(new T.BoxGeometry(0.3,0.07,0.12),hairM,0.03,0.15,0.13); sw.rotation.z=-0.2; head.add(sw); back(0.55); break; }
    case 'bob': back(0.62,1.12); head.add(mesh(new T.BoxGeometry(0.32,0.07,0.08),hairM,0,0.12,0.16)); break;
    case 'long': back(0.72,1.1); head.add(mesh(new T.BoxGeometry(0.4,0.55,0.12),hairM,0,-0.3,-0.12));
      { const hb=mesh(new T.TorusGeometry(0.205,0.018,6,30),std(0x8a3fd1),0,0.07,0); hb.rotation.x=Math.PI/2-0.35; head.add(hb); } break;
    case 'scruffy': back(0.58); for(let i=0;i<7;i++){ const c=mesh(new T.ConeGeometry(0.05,0.13,6),hairM,(Math.random()-.5)*0.3,0.17+Math.random()*0.04,(Math.random()-.5)*0.25); c.rotation.set(Math.random()-.5,0,Math.random()-.5); head.add(c); }
      head.add(mesh(new T.BoxGeometry(0.06,0.06,0.04),hairM,0,-0.18,0.13)); break;
  }
  (o.extras||[]).forEach(x=>{
    if(x==='ascot'){ const a=mesh(new T.ConeGeometry(0.07,0.16,8),std(0xff7a1a),0,1.58,0.18); a.rotation.x=Math.PI; g.add(a); g.add(mesh(new T.SphereGeometry(0.045,8,6),std(0xff7a1a),0,1.66,0.17)); }
    if(x==='glasses'){ const gm=std(0x111111); [-1,1].forEach(s=>{ const r=mesh(new T.TorusGeometry(0.05,0.009,6,18),gm,s*0.068,0.02,0.2); head.add(r); }); head.add(mesh(new T.BoxGeometry(0.04,0.01,0.01),gm,0,0.03,0.205)); }
    if(x==='scarf'){ const s=mesh(new T.TorusGeometry(0.1,0.04,8,20),std(0x3fbf6a),0,1.65,0); s.rotation.x=Math.PI/2; g.add(s); const t=mesh(new T.BoxGeometry(0.06,0.14,0.03),std(0x3fbf6a),0.07,1.56,0.1); g.add(t); }
    if(x==='turtleneck'){ g.add(mesh(new T.CylinderGeometry(0.08,0.1,0.1,12),shirt,0,1.66,0)); }
  });
  if(o.scale) g.scale.setScalar(o.scale);
  g.userData={legs,arms,head,kind:'person'};
  return g;
};
M.gang=function(){
  return {
    max:  M.person({shirt:0xf4f4f0,pants:0x2a4fa8,hair:0xf2c14e,hairStyle:'blond',extras:['ascot'],shoes:0x6b3f1f}),
    dot:  M.person({shirt:0xff7a1a,pants:0xff7a1a,skirt:0xb3202a,skirtH:0.34,hair:0x5a3216,hairStyle:'bob',extras:['glasses','turtleneck'],shoes:0xb3202a,scale:0.93}),
    riley:M.person({shirt:0x7b3fbf,pants:0xd48fb0,skirt:0x7b3fbf,skirtH:0.48,skirtW:0.4,hair:0xd2541e,hairStyle:'long',extras:['scarf'],shoes:0x7b3fbf}),
    bo:   M.person({shirt:0x86b043,pants:0x8a6a3a,hair:0x8a5a2b,hairStyle:'scruffy',shoes:0x2a1a12,scale:1.07}),
    dog:  M.dog()
  };
};

/* run-cycle helper */
M.animateRun=function(ch,t,speed,amp){
  const u=ch.userData; if(!u) return; amp=amp==null?0.9:amp;
  if(u.kind==='dog'){ const s=Math.sin(t*speed); u.legs[0].rotation.x=s*amp; u.legs[1].rotation.x=-s*amp; u.legs[2].rotation.x=-s*amp; u.legs[3].rotation.x=s*amp; u.tail.rotation.z=Math.sin(t*speed*1.5)*0.6; }
  else if(u.kind==='person'){ const s=Math.sin(t*speed); u.legs[0].rotation.x=s*amp; u.legs[1].rotation.x=-s*amp; u.arms[0].rotation.x=-s*amp*1.1; u.arms[1].rotation.x=s*amp*1.1; }
};
M.resetPose=function(ch){ const u=ch.userData; if(!u||!u.legs) return; u.legs.forEach(l=>l.rotation.x=0); if(u.arms) u.arms.forEach(a=>a.rotation.x=0); };

/* ---------------- villain (Mr. Holloway in phantom costume) ---------------- */
M.villain=function(){
  const g=new T.Group(); const robe=std(0x2a0f3d,{roughness:0.9}), skin=std(0xe3b48f,{roughness:0.6}), hairW=std(0xeeeeee,{roughness:0.9});
  g.add(mesh(new T.ConeGeometry(0.62,1.7,24,1,true),robe,0,0.85,0));
  g.add(mesh(new T.CylinderGeometry(0.24,0.3,0.5,16),robe,0,1.6,0));
  const arms=[];
  [-1,1].forEach(s=>{ const p=new T.Group(); p.position.set(s*0.3,1.72,0); p.add(mesh(new T.CylinderGeometry(0.07,0.13,0.7,10),robe,0,-0.35,0)); p.add(mesh(new T.SphereGeometry(0.07,10,8),skin,0,-0.72,0)); p.rotation.z=s*0.25; g.add(p); arms.push(p); });
  const face=new T.Group(); face.position.set(0,2.08,0); g.add(face);
  face.add(mesh(new T.SphereGeometry(0.2,20,16),skin));
  [-1,1].forEach(s=>{ const tuft=mesh(new T.SphereGeometry(0.085,10,8),hairW,s*0.17,0.03,-0.04); tuft.scale.set(0.7,1,1.2); face.add(tuft);
    face.add(mesh(new T.SphereGeometry(0.03,8,6),std(0x111111),s*0.07,0.03,0.18));
    const mu=mesh(new T.CapsuleGeometry(0.03,0.08,4,8),hairW,s*0.055,-0.06,0.18); mu.rotation.z=Math.PI/2+s*0.3; face.add(mu); });
  face.add(mesh(new T.SphereGeometry(0.045,8,6),std(0xd6936b),0,-0.01,0.2));
  [-1,1].forEach(s=>{ const r=mesh(new T.TorusGeometry(0.045,0.008,6,16),std(0xc9a227,{metalness:0.8,roughness:0.3}),s*0.07,0.03,0.205); face.add(r); });
  // the mask: skull + hood
  const mask=new T.Group(); mask.position.set(0,2.08,0); g.add(mask);
  const bone=std(0xe8e0c8,{roughness:0.5}), blk=new T.MeshBasicMaterial({color:0x050505});
  const sk=mesh(new T.SphereGeometry(0.235,24,18),bone); sk.scale.set(1,1.1,1.02); mask.add(sk);
  [-1,1].forEach(s=>{ const e=new T.Mesh(new T.SphereGeometry(0.06,12,10),blk); e.position.set(s*0.085,0.03,0.2); e.scale.set(1,1.2,0.6); mask.add(e);
    const gl=new T.Mesh(new T.SphereGeometry(0.022,8,6),glow(0x7dff3a,4)); gl.position.set(s*0.085,0.03,0.225); mask.add(gl); });
  const nose=new T.Mesh(new T.ConeGeometry(0.03,0.06,3),blk); nose.position.set(0,-0.06,0.23); nose.rotation.x=Math.PI; mask.add(nose);
  for(let i=0;i<6;i++){ mask.add(mesh(new T.BoxGeometry(0.03,0.05,0.02),bone,-0.075+i*0.03,-0.16,0.205)); }
  const hood=mesh(new T.SphereGeometry(0.3,22,16,Math.PI*0.8,Math.PI*1.4,0,Math.PI*0.75),robe,0,0.02,-0.03); hood.material=hood.material.clone(); hood.material.side=T.DoubleSide; mask.add(hood);
  g.userData={arms,mask,face};
  return g;
};

/* ---------------- red pyramid executioner (homage) ---------------- */
M.pyramidMan=function(){
  const g=new T.Group(); const skin=std(0x8f7f6c,{roughness:0.95}), apron=std(0x4f3f2e,{roughness:1}), rust=std(0x7a3b1a,{roughness:0.65,metalness:0.6}), boot=std(0x1a1410);
  const legs=[];
  [-1,1].forEach(s=>{ const p=new T.Group(); p.position.set(s*0.16,1.05,0); p.add(mesh(new T.CylinderGeometry(0.11,0.09,1.0,10),skin,0,-0.5,0)); p.add(mesh(new T.BoxGeometry(0.2,0.14,0.34),boot,0,-1.0,0.05)); g.add(p); legs.push(p); });
  g.add(mesh(new T.CylinderGeometry(0.34,0.5,1.5,18,1,true),apron,0,0.95,0));
  g.add(mesh(new T.CylinderGeometry(0.33,0.3,0.75,14),skin,0,2.0,0));
  const arms=[];
  [-1,1].forEach(s=>{ const p=new T.Group(); p.position.set(s*0.42,2.3,0); p.add(mesh(new T.CylinderGeometry(0.1,0.08,1.0,10),skin,0,-0.5,0)); g.add(p); arms.push(p); });
  const helm=mesh(new T.ConeGeometry(0.7,1.25,4),rust,0.0,3.0,0.1); helm.rotation.set(0.1,Math.PI/4,0); g.add(helm);
  const knife=new T.Group(); knife.position.set(0,-1.0,0); arms[1].add(knife);
  const blade=mesh(new T.BoxGeometry(0.06,2.6,0.32),std(0x5d5a55,{metalness:0.8,roughness:0.5}),0,-1.0,0.35); blade.rotation.x=0.9; knife.add(blade);
  g.scale.setScalar(1.15);
  g.userData={legs,arms,kind:'pyramid'};
  return g;
};

/* ---------------- bat ---------------- */
M.bat=function(){
  const g=new T.Group(); const m=std(0x0b0710,{roughness:0.8,side:T.DoubleSide});
  g.add(mesh(new T.SphereGeometry(0.12,10,8),m));
  [-1,1].forEach(s=>{ const ear=mesh(new T.ConeGeometry(0.035,0.1,4),m,s*0.05,0.13,0.05); g.add(ear);
    const e=new T.Mesh(new T.SphereGeometry(0.018,6,4),glow(0xff2a2a,4)); e.position.set(s*0.04,0.04,0.11); g.add(e); });
  const sh=new T.Shape(); sh.moveTo(0,0.04); sh.lineTo(0.25,0.14); sh.lineTo(0.55,0.12); sh.lineTo(0.78,0.02); sh.quadraticCurveTo(0.64,-0.02,0.6,-0.13);
  sh.quadraticCurveTo(0.48,-0.05,0.4,-0.15); sh.quadraticCurveTo(0.3,-0.06,0.2,-0.13); sh.quadraticCurveTo(0.12,-0.04,0,-0.06);
  const wg=new T.ShapeGeometry(sh); wg.rotateX(-Math.PI/2);
  const wings=[];
  [-1,1].forEach(s=>{ const pv=new T.Group(); pv.position.x=s*0.06; pv.scale.x=s; pv.add(new T.Mesh(wg,m)); g.add(pv); wings.push(pv); });
  g.userData.wings=wings;
  return g;
};

/* ---------------- dead tree & graves ---------------- */
M.deadTree=function(h){
  h=h||6; const g=new T.Group(); const m=std(0x16100c,{roughness:1});
  function branch(parent,len,rad,depth){
    const geo=new T.CylinderGeometry(rad*0.62,rad,len,6); geo.translate(0,len/2,0);
    const b=new T.Mesh(geo,m); b.castShadow=true; parent.add(b);
    if(depth>0){ const n=depth>3?2:3; for(let i=0;i<n;i++){ const pv=new T.Group(); pv.position.y=len*(0.55+Math.random()*0.45);
      pv.rotation.set((Math.random()-.5)*1.3,Math.random()*6.28,(Math.random()-.5)*1.5); b.add(pv); branch(pv,len*0.7,rad*0.6,depth-1); } }
  }
  branch(g,h*0.42,h*0.06,4); return g;
};
M.grave=function(kind){
  const g=new T.Group(); const st=std(0x4a4652,{roughness:0.95});
  if(kind===1){ g.add(mesh(new T.BoxGeometry(0.16,1.3,0.16),st,0,0.65,0)); g.add(mesh(new T.BoxGeometry(0.75,0.16,0.16),st,0,0.95,0)); }
  else { g.add(mesh(new T.BoxGeometry(0.9,1.0,0.2),st,0,0.5,0)); const top=mesh(new T.CylinderGeometry(0.45,0.45,0.2,20,1,false,0,Math.PI),st,0,1.0,0); top.rotation.order='ZYX'; top.rotation.set(Math.PI/2,0,Math.PI/2); g.add(top);
    const rip=new T.Mesh(new T.PlaneGeometry(0.6,0.3),new T.MeshBasicMaterial({map:M.tex(128,64,(c)=>{c.fillStyle='#4a4652';c.fillRect(0,0,128,64);c.fillStyle='#1d1a22';c.font='bold 34px serif';c.textAlign='center';c.fillText('R.I.P',64,44);}),transparent:false}));
    rip.position.set(0,0.75,0.101); g.add(rip); }
  g.add(mesh(new T.BoxGeometry(1.1,0.08,1.6),std(0x1c1520,{roughness:1}),0,0.04,0.8));
  g.rotation.z=(Math.random()-.5)*0.25; g.rotation.y=(Math.random()-.5)*0.4;
  return g;
};

/* ---------------- biscuit (collectible) ---------------- */
M.biscuit=function(){
  const g=new T.Group(); const m=std(0xffa040,{emissive:0xff6a00,emissiveIntensity:1.6,roughness:0.5});
  const bar=new T.Mesh(new T.CylinderGeometry(0.06,0.06,0.42,10),m); bar.rotation.z=Math.PI/2; g.add(bar);
  [[-0.21,0.05],[-0.21,-0.05],[0.21,0.05],[0.21,-0.05]].forEach(([x,y])=>{ const s=new T.Mesh(new T.SphereGeometry(0.075,10,8),m); s.position.set(x,y,0); g.add(s); });
  return g;
};

/* ======================================================================
   PRODUCTS — each returns a group roughly 1.2 units tall, base at y=0
   ====================================================================== */
function manne(col){ const g=new T.Group(); const m=std(col||0x2b2733,{roughness:0.35,metalness:0.25});
  g.add(mesh(new T.CylinderGeometry(0.3,0.36,0.1,28),m,0,0.05,0)); g.add(mesh(new T.CylinderGeometry(0.1,0.13,0.4,16),m,0,0.3,0));
  const h=mesh(new T.SphereGeometry(0.28,24,18),m,0,0.72,0); h.scale.set(0.9,1.1,1); g.add(h); return g; }
function bust(col){ const g=new T.Group(); const m=std(col||0x2b2733,{roughness:0.35,metalness:0.25});
  g.add(mesh(new T.CylinderGeometry(0.22,0.3,0.1,24),m,0,0.05,0)); g.add(mesh(new T.CylinderGeometry(0.05,0.05,0.25,10),m,0,0.2,0));
  const t=mesh(new T.CylinderGeometry(0.3,0.22,0.5,24),m,0,0.55,0); t.scale.z=0.65; g.add(t); return g; }

M.prod={
  phantom(){ const g=M.ghost(1.25,{ei:0.5}); return g; },
  miner(){ const g=new T.Group(); const gh=M.ghost(0.95,{color:0xc8ffd0,emissive:0x3dff6e,ei:0.6,opacity:0.85}); g.add(gh);
    const hel=new T.Group(); hel.position.set(0,0.8,0); g.add(hel);
    hel.add(mesh(new T.SphereGeometry(0.27,20,12,0,Math.PI*2,0,Math.PI/2),std(0x7a5a24,{roughness:0.5,metalness:0.3})));
    const brim=mesh(new T.CylinderGeometry(0.36,0.36,0.03,24),std(0x6a4a1c,{roughness:0.5}),0,0,0); hel.add(brim);
    const lamp=mesh(new T.CylinderGeometry(0.07,0.08,0.1,14),std(0x333333,{metalness:0.8}),0,0.14,0.24); lamp.rotation.x=Math.PI/2; hel.add(lamp);
    const lens=new T.Mesh(new T.CircleGeometry(0.06,14),glow(0xfff2a0,5)); lens.position.set(0,0.14,0.3); hel.add(lens);
    const beard=mesh(new T.ConeGeometry(0.14,0.32,10),std(0xdfffe4,{emissive:0x3dff6e,emissiveIntensity:0.3,transparent:true,opacity:0.85}),0,0.48,0.2); beard.rotation.x=Math.PI+0.3; g.add(beard);
    return g; },
  witch(){ const g=new T.Group(); const felt=std(0x22113a,{roughness:0.95});
    g.add(mesh(new T.CylinderGeometry(0.62,0.62,0.035,48),felt,0,0.03,0));
    const cg=new T.ConeGeometry(0.3,1.0,32,12); const p=cg.attributes.position;
    for(let i=0;i<p.count;i++){ const y=p.getY(i)+0.5; p.setX(i,p.getX(i)+Math.pow(y,2.4)*0.42); p.setY(i,p.getY(i)-Math.pow(y,3)*0.08); }
    cg.computeVertexNormals(); g.add(mesh(cg,felt,0,0.55,0));
    g.add(mesh(new T.CylinderGeometry(0.29,0.3,0.1,32),std(0xff7a1a,{roughness:0.5}),0,0.1,0));
    const b=mesh(new T.BoxGeometry(0.13,0.11,0.03),std(0xffd04a,{metalness:0.9,roughness:0.25}),0,0.1,0.29); g.add(b);
    const sp=mesh(new T.SphereGeometry(0.03,8,6),glow(0xa6ff3d,4),0.37,1.0,0); g.add(sp);
    return g; },
  jack(){ const g=new T.Group(); g.add(mesh(new T.CylinderGeometry(0.22,0.46,0.35,14),std(0x8a6a3a,{roughness:1}),0,0.17,0));
    for(let i=0;i<8;i++){ const s=mesh(new T.ConeGeometry(0.04,0.22,4),std(0xc9a85a,{roughness:1}),Math.cos(i*0.8)*0.4,0.06,Math.sin(i*0.8)*0.4); s.rotation.z=Math.PI; g.add(s); }
    const p=M.pumpkin(0.45,true,false); p.position.y=0.66; g.add(p); return g; },
  count(){ const g=bust(0x141018); const skin=std(0xdcd6e6,{roughness:0.45});
    const head=mesh(new T.SphereGeometry(0.22,22,16),skin,0,1.02,0); head.scale.set(0.9,1.12,0.95); g.add(head);
    const hair=mesh(new T.SphereGeometry(0.225,22,14,0,Math.PI*2,0,Math.PI*0.45),std(0x0a0a0a,{roughness:0.3,metalness:0.4}),0,1.05,-0.01); hair.scale.set(0.92,1.12,0.97); g.add(hair);
    const pk=mesh(new T.ConeGeometry(0.05,0.1,3),std(0x0a0a0a),0,1.17,0.17); pk.rotation.x=Math.PI+0.5; g.add(pk);
    [-1,1].forEach(s=>{ const e=new T.Mesh(new T.SphereGeometry(0.025,8,6),glow(0xff1a1a,4)); e.position.set(s*0.07,1.05,0.19); g.add(e);
      const f=mesh(new T.ConeGeometry(0.012,0.05,6),std(0xffffff),s*0.035,0.89,0.18); f.rotation.x=Math.PI; g.add(f); });
    const outG=new T.CylinderGeometry(0.5,0.3,0.7,40,1,true,Math.PI*0.32,Math.PI*1.36);
    g.add(mesh(outG,std(0x0b0b0e,{roughness:0.6,side:T.FrontSide}),0,0.95,-0.02));
    g.add(mesh(outG,std(0xb3001b,{roughness:0.35,side:T.BackSide}),0,0.95,-0.02));
    const med=mesh(new T.CylinderGeometry(0.07,0.07,0.02,20),std(0xffcc33,{metalness:0.9,roughness:0.2}),0,0.62,0.2); med.rotation.x=Math.PI/2; g.add(med);
    const gem=new T.Mesh(new T.OctahedronGeometry(0.035),glow(0xff1a3a,3)); gem.position.set(0,0.62,0.215); g.add(gem);
    return g; },
  mummy(){ const g=manne(0x2b2733); const ban=std(0xd9c9a3,{roughness:1});
    for(let i=0;i<11;i++){ const t=mesh(new T.TorusGeometry(0.265+Math.random()*0.03,0.035,6,30),ban,0,0.5+i*0.05,0); t.rotation.set(Math.PI/2+(Math.random()-.5)*0.6,(Math.random()-.5)*0.4,0); t.scale.set(0.95,1.05,1); g.add(t); }
    [-1,1].forEach(s=>{ const e=new T.Mesh(new T.SphereGeometry(0.03,8,6),glow(0xffd23d,4)); e.position.set(s*0.09,0.76,0.27); g.add(e); });
    const loose=mesh(new T.BoxGeometry(0.06,0.5,0.01),ban,0.2,0.45,0.2); loose.rotation.z=0.3; g.add(loose);
    return g; },
  cosmic(){ const g=new T.Group(); const suit=std(0xe8e8ee,{roughness:0.5});
    const sh=mesh(new T.CylinderGeometry(0.42,0.5,0.3,28),suit,0,0.15,0); sh.scale.z=0.7; g.add(sh);
    g.add(mesh(new T.TorusGeometry(0.33,0.05,10,32),std(0xb0b0c0,{metalness:0.9,roughness:0.2}),0,0.33,0).rotateX(Math.PI/2));
    const sk=new T.Group(); sk.position.y=0.68; g.add(sk); const bone=std(0xf2ecdc,{roughness:0.4}), blk=new T.MeshBasicMaterial({color:0});
    const c=mesh(new T.SphereGeometry(0.2,20,16),bone); c.scale.set(0.95,1.05,1); sk.add(c);
    sk.add(mesh(new T.BoxGeometry(0.2,0.1,0.14),bone,0,-0.17,0.06));
    [-1,1].forEach(s=>{ const e=new T.Mesh(new T.SphereGeometry(0.05,10,8),blk); e.position.set(s*0.07,0.0,0.17); e.scale.z=0.5; sk.add(e);
      const gl=new T.Mesh(new T.SphereGeometry(0.018,8,6),glow(0xb48cff,5)); gl.position.set(s*0.07,0.0,0.185); sk.add(gl); });
    const glass=new T.Mesh(new T.SphereGeometry(0.42,32,24),new T.MeshPhysicalMaterial({color:0xbfe8ff,roughness:0.05,metalness:0,transparent:true,opacity:0.22,clearcoat:1,side:T.DoubleSide}));
    glass.position.y=0.7; g.add(glass);
    const ant=mesh(new T.CylinderGeometry(0.01,0.01,0.25,6),std(0xb0b0c0,{metalness:0.9}),0.2,1.18,0); g.add(ant);
    g.add(new T.Mesh(new T.SphereGeometry(0.035,8,6),glow(0xff7a1a,5)).translateX(0.2).translateY(1.32));
    return g; },
  pyramid(){ const g=new T.Group(); const rust=std(0x4a2210,{roughness:0.55,metalness:0.7});
    g.add(mesh(new T.CylinderGeometry(0.16,0.2,0.3,14),std(0x8f7f6c,{roughness:0.9}),0,0.15,0));
    g.add(mesh(new T.BoxGeometry(0.5,0.06,0.5),rust,0,0.33,0).rotateY(Math.PI/4));
    const c=mesh(new T.ConeGeometry(0.58,0.95,4),rust,0,0.83,0); c.rotation.y=Math.PI/4; g.add(c);
    for(let i=0;i<4;i++){ const a=i*Math.PI/2; for(let k=1;k<5;k++){ const r=0.58*(1-k/5); g.add(mesh(new T.SphereGeometry(0.018,6,4),std(0x3a2a20,{metalness:0.8}),Math.sin(a)*r*0.99,0.36+k*0.19,Math.cos(a)*r*0.99)); } }
    return g; },
  pursuer(){ const g=new T.Group(); const coat=std(0x1a1a1c,{roughness:0.5,metalness:0.1}), skin=std(0x8e8285,{roughness:0.8}), blk=std(0x0a0a0a);
    const col=new T.CylinderGeometry(0.42,0.32,0.55,36,1,true,Math.PI*0.25,Math.PI*1.5); g.add(mesh(col,std(0x1a1a1c,{side:T.DoubleSide,roughness:0.5}),0,0.28,0));
    const h=mesh(new T.SphereGeometry(0.26,24,18),skin,0,0.72,0); h.scale.set(0.95,1.18,1); g.add(h);
    for(let i=0;i<5;i++){ const s=mesh(new T.BoxGeometry(0.14,0.012,0.012),blk,-0.08+i*0.04,0.95-i*0.02,0.17); s.rotation.set(0.5,0,Math.PI/2.2); g.add(s); }
    const scar=mesh(new T.BoxGeometry(0.2,0.012,0.012),blk,0.02,0.92,0.2); scar.rotation.set(0.4,0,0.4); g.add(scar);
    const e=new T.Mesh(new T.SphereGeometry(0.035,8,6),glow(0xff2020,4)); e.position.set(-0.08,0.76,0.24); g.add(e);
    g.add(mesh(new T.SphereGeometry(0.03,8,6),blk,0.08,0.76,0.24));
    const mouth=mesh(new T.BoxGeometry(0.2,0.08,0.06),std(0x2a0505),0,0.6,0.22); g.add(mouth);
    for(let i=0;i<7;i++) g.add(mesh(new T.BoxGeometry(0.022,0.05,0.02),std(0xe8e0c0),-0.08+i*0.027,0.6,0.25));
    return g; },
  nurse(){ const g=bust(0xd8d0d4); const skin=std(0xb8a593,{roughness:0.95});
    const hg=new T.SphereGeometry(0.26,32,24), p=hg.attributes.position, v=new T.Vector3();
    for(let i=0;i<p.count;i++){ v.fromBufferAttribute(p,i); const n=1+0.12*Math.sin(v.x*18)*Math.sin(v.y*14+1)*Math.cos(v.z*16); v.multiplyScalar(n); p.setXYZ(i,v.x,v.y,v.z); }
    hg.computeVertexNormals(); const h=mesh(hg,skin,0,1.02,0); h.scale.set(0.95,1.08,1); g.add(h);
    const stain=mesh(new T.SphereGeometry(0.08,10,8),std(0x5a0b0b,{roughness:0.4}),-0.08,0.92,0.22); stain.scale.set(1,0.6,0.25); g.add(stain);
    const cap=mesh(new T.BoxGeometry(0.34,0.12,0.2),std(0xf4f0ec,{roughness:0.6}),0,1.3,0.02); cap.rotation.x=-0.25; g.add(cap);
    const cr=glow(0xff2020,2.5); const c1=new T.Mesh(new T.PlaneGeometry(0.03,0.08),cr), c2=new T.Mesh(new T.PlaneGeometry(0.08,0.03),cr);
    [c1,c2].forEach(c=>{ c.position.set(0,1.32,0.125); c.rotation.x=-0.25; g.add(c); });
    g.add(mesh(new T.CylinderGeometry(0.12,0.15,0.12,16),std(0xf4f0ec),0,0.82,0));
    return g; },
  dane(){ const g=new T.Group(); const h=M.dogHead(); h.scale.setScalar(1.55); h.position.y=0.72; g.add(h);
    const hood=mesh(new T.CylinderGeometry(0.3,0.42,0.35,24),std(0x9a6a35,{roughness:0.9}),0,0.2,0); g.add(hood);
    const c=mesh(new T.TorusGeometry(0.33,0.05,10,28),std(0x2ec4b6,{roughness:0.4}),0,0.36,0); c.rotation.x=Math.PI/2; g.add(c);
    g.add(mesh(new T.OctahedronGeometry(0.08),std(0xffcc33,{metalness:0.9,roughness:0.25}),0,0.24,0.36));
    return g; },
  kit(){ const g=manne(0x3a3346); const gm=std(0x111111,{roughness:0.3});
    [-1,1].forEach(s=>{ const r=mesh(new T.TorusGeometry(0.08,0.014,8,22),gm,s*0.1,0.76,0.27); g.add(r);
      const l=new T.Mesh(new T.CircleGeometry(0.075,20),new T.MeshPhysicalMaterial({color:0xddeeff,transparent:true,opacity:0.25,roughness:0})); l.position.set(s*0.1,0.76,0.27); g.add(l); });
    g.add(mesh(new T.BoxGeometry(0.06,0.015,0.015),gm,0,0.77,0.28));
    const a=mesh(new T.ConeGeometry(0.11,0.26,10),std(0xff7a1a,{roughness:0.6}),0,0.36,0.14); a.rotation.x=Math.PI; g.add(a);
    g.add(mesh(new T.SphereGeometry(0.06,10,8),std(0xff7a1a),0,0.48,0.12));
    const hb=mesh(new T.TorusGeometry(0.255,0.02,6,30),std(0x8a3fd1),0,0.88,0); hb.rotation.x=Math.PI/2-0.35; g.add(hb);
    const mg=new T.Group(); mg.position.set(0.42,0.5,0.1); mg.rotation.z=-0.5; g.add(mg);
    mg.add(mesh(new T.TorusGeometry(0.1,0.018,8,24),std(0xc9a227,{metalness:0.9,roughness:0.25})));
    mg.add(new T.Mesh(new T.CircleGeometry(0.09,20),new T.MeshPhysicalMaterial({color:0xcfe8ff,transparent:true,opacity:0.3})));
    mg.add(mesh(new T.CylinderGeometry(0.018,0.022,0.22,8),std(0x3b2414),0,-0.21,0));
    return g; }
};

/* normalize to height h, centered, base at y=0 */
M.fit=function(obj,h){
  const box=new T.Box3().setFromObject(obj), size=new T.Vector3(), c=new T.Vector3(); box.getSize(size); box.getCenter(c);
  const s=(h||1.2)/Math.max(size.y,size.x*0.85); obj.scale.multiplyScalar(s);
  obj.position.x-=c.x*s; obj.position.z-=c.z*s; obj.position.y-=box.min.y*s;
  const w=new T.Group(); w.add(obj); return w;
};

/* studio renderer: product thumbnails + interactive modal viewer */
M.Studio=function(){
  const r=new T.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});
  r.setPixelRatio(1); r.setSize(520,520); r.outputEncoding=T.sRGBEncoding; r.toneMapping=T.ACESFilmicToneMapping; r.toneMappingExposure=1.25; r.setClearColor(0x000000,0);
  const sc=new T.Scene(), cam=new T.PerspectiveCamera(30,1,0.1,50); cam.position.set(0,0.95,3.7); cam.lookAt(0,0.6,0);
  sc.add(new T.HemisphereLight(0xb48cff,0x1a0a00,0.7));
  const key=new T.DirectionalLight(0xffd2a0,2.2); key.position.set(2,3,3); sc.add(key);
  const rim=new T.DirectionalLight(0x9a5cff,2.6); rim.position.set(-3,2,-2); sc.add(rim);
  const rim2=new T.DirectionalLight(0xff6a00,2.2); rim2.position.set(3,1,-3); sc.add(rim2);
  const holder=new T.Group(); sc.add(holder);
  return {
    renderer:r, scene:sc, camera:cam, holder,
    set(id){ holder.clear(); holder.rotation.set(0,0,0); const o=M.fit(M.prod[id](),1.2); holder.add(o); return o; },
    shot(id,angle){ this.set(id); holder.rotation.y=angle||-0.45; r.render(sc,cam); return r.domElement.toDataURL('image/png'); },
    render(){ r.render(sc,cam); }
  };
};
})();
