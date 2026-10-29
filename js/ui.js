/* UNMASKED — DOM interface: catalog, product modal, item box, typewriter checkout, HUD, bubbles */
(function(){
const M = window.UM;
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const A=()=>M.audio, t=(k,v)=>M.t(k,v);
const UI = M.UI = { cart:[], ribbons:3, snacks:0, scares:true, discount:false, open:null, filterCat:'all', clues:new Set(), clueTotal:15 };
const fmt=n=>M.money(Math.round(n));

/* ---------------- toast ---------------- */
let toastT;
UI.toast=(msg,ms)=>{ const el=$('#toast'); el.textContent=msg; el.classList.add('on'); clearTimeout(toastT); toastT=setTimeout(()=>el.classList.remove('on'),ms||2600); };

/* ---------------- condition ECG ---------------- */
let scaresTaken=0, ecgState='fine';
const setEcg=st=>{ ecgState=st; $('#ecg').className='hud-ecg'+(st==='fine'?'':' '+st); $('#ecgTxt').textContent=t(st); };
UI.setEcg=setEcg;
UI.scared=()=>{ scaresTaken++; setEcg(scaresTaken>=3?'danger':'caution'); clearTimeout(UI._ecg); UI._ecg=setTimeout(()=>setEcg('fine'),9000); };

/* ---------------- text splitting (per letter in EN, per word in FA so Persian letters stay joined) ---------------- */
UI.split=()=>{ $$('[data-split]').forEach(el=>{ const txt=el.textContent;
  const parts=M.lang==='fa'?txt.split(/(\s+)/):txt.split('');
  el.innerHTML=parts.map(c=>/^\s+$/.test(c)?'&nbsp;':`<span class="split-c">${c}</span>`).join(''); }); };

/* ---------------- catalog ---------------- */
UI.renderCatalog=()=>{
  const grid=$('#grid');
  grid.innerHTML=M.products.map(p=>`
    <article class="card${UI.filterCat!=='all'&&p.cat!==UI.filterCat?' hide':''}" data-id="${p.id}" data-cat="${p.cat}" data-ui>
      <span class="badge">${M.pf(p,'badge')}</span>
      <div class="img"><img src="${M.thumbs[p.id]}" alt="${M.pf(p,'name')}"></div>
      <div class="meta"><div><span class="cat">${M.catName(p.cat)}</span><h4>${M.pf(p,'name')}</h4></div><div class="price">${fmt(p.price)}</div></div>
      <button class="quick" data-quick="${p.id}">${t('quick')}</button>
    </article>`).join('');
  $$('.card').forEach(c=>{
    c.addEventListener('mousemove',e=>{ const r=c.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width, y=(e.clientY-r.top)/r.height;
      c.style.setProperty('--mx',x*100+'%'); c.style.setProperty('--my',y*100+'%');
      gsap.to(c,{rotateY:(x-0.5)*10,rotateX:-(y-0.5)*10,duration:0.4,transformPerspective:800}); });
    c.addEventListener('mouseleave',()=>gsap.to(c,{rotateX:0,rotateY:0,duration:0.6}));
    c.addEventListener('mouseenter',()=>A().sfx('hover'));
    c.addEventListener('click',e=>{ const q=e.target.closest('[data-quick]'); if(q){ UI.add(q.dataset.quick,'M'); return; } UI.openProduct(c.dataset.id); });
  });
};
UI.filter=f=>{
  UI.filterCat=f; $$('#filters button').forEach(b=>b.classList.toggle('on',b.dataset.f===f));
  const cards=$$('.card');
  gsap.to(cards,{opacity:0,y:20,duration:0.2,onComplete:()=>{
    cards.forEach(c=>c.classList.toggle('hide',f!=='all'&&c.dataset.cat!==f));
    gsap.fromTo(cards.filter(c=>!c.classList.contains('hide')),{opacity:0,y:30},{opacity:1,y:0,duration:0.5,stagger:0.05,ease:'power3.out'}); }});
  A().sfx('click');
};

/* ---------------- product modal w/ live 3D ---------------- */
let viewRAF=0, drag=null, rotY=0, velY=0.006;
function fillProduct(p){
  $('#mCat').textContent=M.catName(p.cat); $('#mName').textContent=M.pf(p,'name'); $('#mPrice').textContent=fmt(p.price);
  $('#mDesc').textContent=M.pf(p,'desc'); $('#mCulprit').textContent=M.pf(p,'culprit');
}
UI.openProduct=id=>{
  const p=M.byId(id); if(!p) return; UI.open=id; UI.size='M'; fillProduct(p);
  $('#mSizes').innerHTML=['XS','S','M','L','XL','XXL'].map(s=>`<button data-s="${s}" class="${s==='M'?'on':''}">${s}</button>`).join('');
  $$('#mSizes button').forEach(b=>b.addEventListener('click',()=>{ UI.size=b.dataset.s; $$('#mSizes button').forEach(x=>x.classList.toggle('on',x===b)); A().sfx('click'); }));
  const view=$('#modalView'); view.classList.toggle('fogged',p.cat==='gameover');
  const st=M.studio; if(st.renderer.domElement.parentNode!==view) view.appendChild(st.renderer.domElement);
  st.set(id); rotY=-0.4; velY=0.006;
  const m=$('#modal'); m.classList.add('open'); m.setAttribute('aria-hidden','false');
  requestAnimationFrame(()=>{ const r=view.getBoundingClientRect(); st.renderer.setPixelRatio(Math.min(devicePixelRatio,2)); st.renderer.setSize(r.width,r.height,false); st.camera.aspect=r.width/r.height; st.camera.updateProjectionMatrix(); });
  gsap.fromTo('.modal-card',{opacity:0,y:60,scale:0.96},{opacity:1,y:0,scale:1,duration:0.6,ease:'expo.out'});
  gsap.fromTo('.modal-info > *',{opacity:0,x:M.lang==='fa'?-30:30},{opacity:1,x:0,duration:0.5,stagger:0.05,delay:0.15});
  A().sfx(p.cat==='gameover'?'radio':'whoosh'); M.lockScroll(true);
  cancelAnimationFrame(viewRAF);
  const loop=()=>{ if(!drag){ rotY+=velY; velY+=(0.006-velY)*0.02; } st.holder.rotation.y=rotY; st.holder.position.y=Math.sin(performance.now()/700)*0.03; st.render(); viewRAF=requestAnimationFrame(loop); }; loop();
};
UI.closeProduct=()=>{ const m=$('#modal'); if(!m.classList.contains('open')) return; gsap.to('.modal-card',{opacity:0,y:40,duration:0.3,onComplete:()=>{ m.classList.remove('open'); m.setAttribute('aria-hidden','true'); cancelAnimationFrame(viewRAF); }}); UI.open=null; M.lockScroll(false); };
(function bindDrag(){
  const v=document.getElementById('modalView'); let lx=0;
  v.addEventListener('pointerdown',e=>{ drag=true; lx=e.clientX; v.setPointerCapture(e.pointerId); });
  v.addEventListener('pointermove',e=>{ if(!drag) return; const dx=e.clientX-lx; lx=e.clientX; rotY+=dx*0.01; velY=dx*0.002; });
  v.addEventListener('pointerup',()=>{ drag=false; });
})();

/* ---------------- item box (cart) ---------------- */
UI.add=(id,size)=>{
  const ex=UI.cart.find(c=>c.id===id&&c.size===size);
  if(!ex && UI.cart.length>=8){ UI.toast(t('t_full')); A().sfx('slam'); return; }
  if(ex) ex.qty++; else UI.cart.push({id,size,qty:1});
  UI.renderCart(); A().sfx('reItem');
  UI.toast(t('t_added',{name:M.pf(M.byId(id),'name'),size}));
  gsap.fromTo('#cartCount',{scale:1.8},{scale:1,duration:0.5,ease:'back.out'});
};
UI.totals=()=>{ const sub=UI.cart.reduce((s,c)=>s+M.byId(c.id).price*c.qty,0); const disc=UI.discount?Math.round(sub*0.3):0; return {sub,disc,tot:sub-disc}; };
UI.renderCart=()=>{
  const n=UI.cart.reduce((s,c)=>s+c.qty,0); const cc=$('#cartCount'); cc.textContent=M.num(n); cc.classList.toggle('show',n>0);
  let h=''; for(let i=0;i<8;i++){ const c=UI.cart[i];
    h+=c?`<div class="slot" title="${M.pf(M.byId(c.id),'name')}"><img src="${M.thumbs[c.id]}" alt=""><span class="sz">${c.size}</span><span class="q">x${M.num(c.qty)}</span><button class="rm" data-rm="${i}" title="${t('remove')}">✕</button></div>`:'<div class="slot empty"></div>'; }
  $('#slots').innerHTML=h;
  $$('[data-rm]').forEach(b=>b.addEventListener('click',()=>{ UI.cart.splice(+b.dataset.rm,1); UI.renderCart(); A().sfx('click'); }));
  const tt=UI.totals(); $('#subT').textContent=fmt(tt.sub); $('#discT').textContent='-'+fmt(tt.disc); $('#totT').textContent=fmt(tt.tot);
  $('#discRow').classList.toggle('hidden',!UI.discount);
};
UI.openCart=()=>{ UI.renderCart(); $('#drawer').classList.add('open'); A().sfx('chest'); M.lockScroll(true);
  gsap.fromTo('.slot',{opacity:0,scale:0.6},{opacity:1,scale:1,duration:0.4,stagger:0.04,delay:0.2,ease:'back.out'}); };
UI.closeCart=()=>{ if(!$('#drawer').classList.contains('open')) return; $('#drawer').classList.remove('open'); M.lockScroll(false); };

/* ---------------- typewriter save (checkout) ---------------- */
let typeTok=0;
function typeOut(el,text,cb){ el.textContent=''; let i=0; const tok=++typeTok; const step=()=>{ if(tok!==typeTok) return; if(i>=text.length){ cb&&cb(); return; }
  el.textContent+=text[i]; if(text[i]!==' '&&text[i]!=='\n') A().sfx('type'); i++; setTimeout(step,text[i-1]==='\n'?260:34+Math.random()*36); }; step(); }
UI.openCheckout=()=>{
  UI.closeCart(); const s=$('#save'); s.classList.add('open'); M.lockScroll(true); A().duck(0.25);
  const ch=$('#saveChoices'); ch.classList.remove('on');
  const n=UI.cart.reduce((a,c)=>a+c.qty,0), fa=M.lang==='fa';
  const msg=n? t('save_q',{r:M.num(UI.ribbons),s:UI.ribbons===1||fa?'':'s',n:M.num(n),p:n>1&&!fa?'s':'',tot:fmt(UI.totals().tot)}) : t('save_empty');
  typeOut($('#saveText'),msg,()=>{ if(n) ch.classList.add('on'); else setTimeout(UI.closeCheckout,1600); });
};
UI.closeCheckout=()=>{ typeTok++; $('#save').classList.remove('open'); M.lockScroll(false); A().duck(0.75); };
UI.confirmSave=()=>{
  $('#saveChoices').classList.remove('on');
  if(UI.ribbons<=0){ typeOut($('#saveText'),t('save_noink'),()=>{ UI.ribbons=3; $('#ribbons').textContent=M.num(3); setTimeout(UI.confirmSave,900); }); return; }
  UI.ribbons--; $('#ribbons').textContent=M.num(UI.ribbons);
  const tt=UI.totals(), n=UI.cart.reduce((a,c)=>a+c.qty,0);
  typeOut($('#saveText'),t('save_ok',{n:M.num(n),p:n>1&&M.lang!=='fa'?'s':'',tot:fmt(tt.tot),disc:tt.disc?t('save_disc',{d:fmt(tt.disc)}):'',r:M.num(UI.ribbons)}),()=>{
    A().sfx('ding'); UI.cart=[]; UI.renderCart(); setTimeout(UI.closeCheckout,2600); });
};

/* ---------------- biscuits & clues ---------------- */
const counts=()=>{ $('#snackCount').textContent=M.num(UI.snacks)+'/'+M.num(7); $('#clueCount').textContent=M.num(UI.clues.size)+'/'+M.num(UI.clueTotal); };
const bump=sel=>{ const b=$(sel); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); };
UI.gotSnack=()=>{ UI.snacks++; counts(); bump('#snackBtn');
  if(UI.snacks>=7){ UI.discount=true; UI.renderCart(); UI.toast(t('t_allsnacks'),5000); A().sfx('scoobyDoo'); }
  else UI.toast(t('t_snack',{n:M.num(UI.snacks)})); };
UI.clue=key=>{ if(UI.clues.has(key)) return false; UI.clues.add(key); counts(); bump('#clueBtn');
  if(UI.clues.size>=UI.clueTotal){ UI.toast(t('t_allclues'),5000); A().sfx('scoobyDoo'); } else UI.toast(t('t_clue',{n:M.num(UI.clues.size),t:M.num(UI.clueTotal)}),1600);
  return true; };

/* ---------------- speech bubbles & hit markers ---------------- */
UI.bubble=(x,y,name,text)=>{
  const b=document.createElement('div'); b.className='bubble'; b.innerHTML=`<small>${name}</small>${text}`;
  b.style.left=Math.min(innerWidth-140,Math.max(140,x))+'px'; b.style.top=Math.max(90,y-18)+'px'; $('#bubbles').appendChild(b);
  gsap.fromTo(b,{scale:0.3,opacity:0,y:20,transformOrigin:'50% 100%'},{scale:1,opacity:1,y:0,duration:0.45,ease:'back.out(2)'});
  gsap.to(b,{opacity:0,y:-30,duration:0.5,delay:2.2,onComplete:()=>b.remove()});
};
UI.hitmark=(x,y,plus)=>{
  const h=document.createElement('div'); h.className='hitmark'; h.innerHTML='<i></i><i></i><i></i><i></i>'; h.style.left=x+'px'; h.style.top=y+'px'; $('#bubbles').appendChild(h);
  gsap.fromTo(h,{scale:1.8,opacity:1,rotate:-20},{scale:0.8,opacity:0,rotate:0,duration:0.5,ease:'power2.out',onComplete:()=>h.remove()});
  if(plus){ const p=document.createElement('div'); p.className='hit-plus'; p.textContent=plus; p.style.left=x+'px'; p.style.top=y+'px'; $('#bubbles').appendChild(p);
    gsap.fromTo(p,{y:0,opacity:1},{y:-60,opacity:0,duration:1.1,ease:'power2.out',onComplete:()=>p.remove()}); }
};

/* ---------------- marquee ---------------- */
let mqTween;
UI.marquee=()=>{ const html=t('marquee').map(x=>`<span>${x} ✦</span>`).join(''); const tr=$('#mq'); tr.innerHTML=html+html;
  if(mqTween) mqTween.kill(); gsap.set(tr,{xPercent:0}); mqTween=gsap.to(tr,{xPercent:M.lang==='fa'?50:-50,ease:'none',duration:40,repeat:-1}); };

const scareTxt=()=>{ $('#scareBtn').textContent=t('scares')+' · '+(UI.scares?t('on'):t('off')); };

/* ---------------- language change ---------------- */
UI.relang=()=>{
  UI.split(); UI.renderCatalog(); UI.renderCart(); UI.marquee(); scareTxt(); setEcg(ecgState); counts();
  $('#ribbons').textContent=M.num(UI.ribbons);
  if(UI.open) fillProduct(M.byId(UI.open));
  gsap.set('.split-c',{clearProps:'all'});
};

/* ---------------- wiring ---------------- */
UI.init=()=>{
  UI.split(); UI.renderCatalog(); UI.renderCart(); UI.marquee(); scareTxt(); setEcg('fine'); counts();
  $$('#filters button').forEach(b=>b.addEventListener('click',()=>UI.filter(b.dataset.f)));
  $$('[data-close]').forEach(e=>e.addEventListener('click',UI.closeProduct));
  $$('[data-close-cart]').forEach(e=>e.addEventListener('click',UI.closeCart));
  $('#mAdd').addEventListener('click',()=>{ UI.add(UI.open,UI.size); });
  $('#cartBtn').addEventListener('click',UI.openCart);
  $('#boxBtn').addEventListener('click',UI.openCart);
  $('#saveBtn').addEventListener('click',UI.openCheckout);
  $('#checkoutBtn').addEventListener('click',UI.openCheckout);
  $('#saveYes').addEventListener('click',UI.confirmSave);
  $('#saveNo').addEventListener('click',UI.closeCheckout);
  $('#knockBtn').addEventListener('click',()=>{ A().sfx('knock'); setTimeout(()=>A().sfx('moan'),1100); M.knock&&M.knock(); });
  $('#soundBtn').addEventListener('click',()=>{ const m=A().toggle(); document.body.classList.toggle('muted',m); });
  $('#scareBtn').addEventListener('click',()=>{ UI.scares=!UI.scares; scareTxt(); A().sfx('click'); });
  $('#snackBtn').addEventListener('click',()=>UI.toast(t('t_snackhelp',{n:M.num(UI.snacks)})));
  $('#clueBtn').addEventListener('click',()=>UI.toast(t('t_cluehelp',{n:M.num(UI.clues.size),t:M.num(UI.clueTotal)})));
  $('#newsForm').addEventListener('submit',e=>{ e.preventDefault(); e.target.reset(); UI.toast(t('t_news')); A().sfx('collect'); });
  $$('[data-cat]').forEach(a=>a.addEventListener('click',e=>{ e.preventDefault(); M.goCatalog(a.dataset.cat); }));
  $$('[data-cat-go]').forEach(a=>a.addEventListener('click',e=>{ e.preventDefault(); M.goCatalog(a.dataset.catGo); }));
  $$('.btn-solid,.btn-ghost,.nav a,.hb-num,.filters button,.hud-btn,.lang-btn').forEach(b=>b.addEventListener('mouseenter',()=>A().sfx('hover')));
  addEventListener('keydown',e=>{ if(e.key==='Escape'){ UI.closeProduct(); UI.closeCart(); if($('#save').classList.contains('open')) UI.closeCheckout(); } });
  const cur=$('#cursor'); const qx=gsap.quickTo(cur,'x',{duration:0.18}), qy=gsap.quickTo(cur,'y',{duration:0.18});
  addEventListener('pointermove',e=>{ qx(e.clientX); qy(e.clientY); });
  document.addEventListener('mouseover',e=>{ const hot=e.target.closest('a,button,.card,input'); if(hot){ cur.classList.add('hot'); cur.dataset.label=''; } else if(!M.hovering) cur.classList.remove('hot'); });
};
UI.setHot=(on,label)=>{ const cur=$('#cursor'); cur.classList.toggle('hot',on); cur.dataset.label=label||''; };
})();
