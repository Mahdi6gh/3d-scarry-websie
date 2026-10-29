/* UNMASKED — audio engine. Every sound and note is synthesized with WebAudio.
   Melodies: Bach "Toccata & Fugue in D minor" (public domain), Grieg "In the Hall of the
   Mountain King" (public domain) + original cues. */
(function(){
const M = window.UM = window.UM || {};
const A = M.audio = { ready:false, muted:false };
let ctx, master, comp, musicBus, sfxBus, rev, noiseB;
const layers = {}, tracks = {};
let currentTrack = null;

const NOTE = {C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
function f(n){ if(typeof n==='number') return n; const m=n.match(/^([A-G][#b]?)(-?\d)$/); return 440*Math.pow(2,(NOTE[m[1]]+(+m[2]+1)*12-69)/12); }
A.f = f;

function impulse(sec, decay){
  const len = ctx.sampleRate*sec|0, b = ctx.createBuffer(2,len,ctx.sampleRate);
  for(let c=0;c<2;c++){ const d=b.getChannelData(c); for(let i=0;i<len;i++) d[i]=(Math.random()*2-1)*Math.pow(1-i/len,decay); }
  return b;
}
function makeNoise(sec){
  const len=ctx.sampleRate*sec|0, b=ctx.createBuffer(1,len,ctx.sampleRate), d=b.getChannelData(0);
  for(let i=0;i<len;i++) d[i]=Math.random()*2-1; return b;
}

/* ---------- primitive voices ---------- */
function osc(type, freq, t, dur, vol, dest, o){
  o=o||{};
  const s=ctx.createOscillator(); s.type=type; s.frequency.setValueAtTime(freq,t);
  if(o.slide) s.frequency.exponentialRampToValueAtTime(o.slide, t+(o.slideT||dur));
  if(o.detune) s.detune.value=o.detune;
  const g=ctx.createGain(); const a=o.a||0.01;
  g.gain.setValueAtTime(0.0001,t);
  if(o.hold){ g.gain.linearRampToValueAtTime(vol,t+a); g.gain.setValueAtTime(vol,Math.max(t+a,t+dur-(o.r||0.12))); g.gain.linearRampToValueAtTime(0.0001,t+dur); }
  else { g.gain.exponentialRampToValueAtTime(vol,t+a); g.gain.exponentialRampToValueAtTime(0.0001,t+dur); }
  let n=s;
  if(o.lp||o.bp||o.hp){ const fl=ctx.createBiquadFilter(); fl.type=o.lp?'lowpass':o.bp?'bandpass':'highpass'; fl.frequency.value=o.lp||o.bp||o.hp; if(o.q) fl.Q.value=o.q; s.connect(fl); n=fl; }
  n.connect(g); g.connect(dest);
  s.start(t); s.stop(t+dur+0.05);
  return s;
}
function noise(t, dur, vol, dest, type, freq, q, o){
  o=o||{};
  const s=ctx.createBufferSource(); s.buffer=noiseB; s.loop=true;
  const fl=ctx.createBiquadFilter(); fl.type=type||'lowpass'; fl.frequency.setValueAtTime(freq||1000,t); if(q) fl.Q.value=q;
  if(o.sweep) fl.frequency.exponentialRampToValueAtTime(o.sweep,t+dur);
  const g=ctx.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(vol,t+(o.a||0.005)); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  s.connect(fl); fl.connect(g); g.connect(dest);
  s.start(t, Math.random()*3); s.stop(t+dur+0.05);
}

/* ---------- instruments ---------- */
const I = {
  organ(fr,t,dur,v,d){
    osc('sine',fr,t,dur,v,d,{hold:1,a:0.03,r:0.15});
    osc('sine',fr*2,t,dur,v*0.5,d,{hold:1,a:0.03,r:0.15});
    osc('sine',fr*3,t,dur,v*0.22,d,{hold:1,a:0.03,r:0.15});
    osc('sine',fr*4,t,dur,v*0.14,d,{hold:1,a:0.03,r:0.15});
    osc('triangle',fr*0.5,t,dur,v*0.35,d,{hold:1,a:0.05,r:0.15});
  },
  pluck(fr,t,dur,v,d){ osc('triangle',fr,t,Math.max(dur,0.3),v,d); osc('sawtooth',fr,t,0.25,v*0.35,d,{lp:1400}); },
  harpsi(fr,t,dur,v,d){ osc('sawtooth',fr,t,0.5,v*0.5,d,{hp:400}); osc('square',fr*2,t,0.3,v*0.15,d,{lp:3000}); },
  box(fr,t,dur,v,d){ osc('sine',fr,t,1.2,v,d,{detune:(Math.random()-.5)*24}); osc('sine',fr*4,t,0.4,v*0.25,d); osc('triangle',fr*2,t,0.6,v*0.15,d); },
  bell(fr,t,dur,v,d){ osc('sine',fr,t,dur*1.6,v,d,{a:0.004}); osc('sine',fr*2.01,t,dur,v*0.3,d,{a:0.004}); },
  pad(fr,t,dur,v,d){ [-9,0,8].forEach(dt=>osc('sawtooth',fr,t,dur,v*0.33,d,{hold:1,a:Math.min(0.8,dur*0.4),r:Math.min(0.9,dur*0.4),detune:dt,lp:900})); },
  bass(fr,t,dur,v,d){ osc('triangle',fr,t,dur,v,d); osc('sine',fr,t,dur,v*0.8,d); },
  kick(t,v,d){ osc('sine',150,t,0.3,v,d,{slide:40,slideT:0.25}); },
  snare(t,v,d){ noise(t,0.16,v,d,'bandpass',1900,0.7); osc('triangle',190,t,0.1,v*0.5,d); },
  hat(t,v,d){ noise(t,0.05,v,d,'highpass',7000); },
  clang(fr,t,v,d){ [1,2.76,5.4,8.93].forEach((r,i)=>osc('sine',fr*r,t,2.4/(i+1),v/(i+1),d,{a:0.002})); }
};

/* ---------- music tracks (each schedules one loop) ---------- */
function defTrack(name, len, build){ tracks[name]={name,len,build,next:0,gain:null,active:false}; }

defTrack('toccata', 25, (t,d)=>{
  const phr=(o,st)=>{ let x=st;
    [['A',.12],['G',.12],['A',1.3],[null,.35],['G',.14],['F',.14],['E',.14],['D',.14],['C#',.5],['D',1.6]].forEach(([n,du])=>{
      if(n){ I.organ(f(n+o),t+x,du+0.06,0.09,d); I.organ(f(n+(o-1)),t+x,du+0.06,0.07,d); } x+=du; });
    return x; };
  let x=phr(5,0); x=phr(4,x+0.6); x=phr(3,x+0.6); x+=0.4;
  I.organ(f('D2'),t+x,5.2,0.1,d);
  ['C#3','E3','G3','Bb3','C#4','E4','G4'].forEach((n,i)=>I.organ(f(n),t+x+i*0.09,4.6-i*0.09,0.05,d));
  x+=4.8; I.organ(f('D2'),t+x,3.2,0.1,d);
  ['D3','F3','A3','D4','F4'].forEach(n=>I.organ(f(n),t+x,3.2,0.06,d));
});

const MK_A=[['B3',1],['C#4',1],['D4',1],['E4',1],['F#4',1],['D4',1],['F#4',2],['F4',1],['C#4',1],['F4',2],['E4',1],['C4',1],['E4',2],
  ['B3',1],['C#4',1],['D4',1],['E4',1],['F#4',1],['D4',1],['F#4',1],['B4',1],['A4',1],['F#4',1],['D4',1],['F#4',1],['A4',4]];
const MK_B=[['F#4',1],['G#4',1],['A4',1],['B4',1],['C#5',1],['A4',1],['C#5',2],['C5',1],['G#4',1],['C5',2],['B4',1],['G4',1],['B4',2],
  ['F#4',1],['G#4',1],['A4',1],['B4',1],['C#5',1],['A4',1],['C#5',1],['F#5',1],['E5',1],['C#5',1],['A4',1],['C#5',1],['E5',4]];
const E8=60/172/2;
defTrack('mountain', 64*E8, (t,d)=>{
  let x=0; MK_A.concat(MK_B).forEach(([n,l])=>{ I.pluck(f(n),t+x*E8,l*E8,0.16,d); I.harpsi(f(n)*2,t+x*E8,l*E8,0.05,d); x+=l; });
  for(let q=0;q<32;q++){ const tt=t+q*2*E8; const lo=q<16?(q%2?'F#2':'B2'):(q%2?'C#3':'F#2');
    I.bass(f(lo),tt,E8*1.6,0.22,d); I.kick(tt,0.35,d); if(q%2) I.snare(tt,0.12,d); I.hat(tt+E8,0.05,d); }
});

const BX=60/92;
defTrack('musicbox', 24*BX, (t,d)=>{
  const mel=['A5','C6','E6','D6','C6','B5','C6','A5','E5','F5','E5','D5','E5','G#5','B5','D6','C6','B5','A5','E5','C5','A4',null,null];
  mel.forEach((n,i)=>{ if(n) I.box(f(n),t+i*BX,BX,0.07,d); });
  [['A2','E3','C4'],['D3','F3','A3'],['A2','E3','C4'],['D3','F3','A3'],['E2','B2','G#3'],['E2','B2','G#3'],['A2','E3','C4'],['A2','E3','A3']]
    .forEach((ch,b)=>ch.forEach(n=>I.pad(f(n),t+b*3*BX,3*BX+0.3,0.025,d)));
});

const SB=60/66;
defTrack('saferoom', 16*SB, (t,d)=>{
  const chords=[['A2','E3','A3','B3','C4','E4'],['F2','C3','F3','A3','C4','E4'],['C3','G3','C4','E4','G4','B4'],['E2','B2','E3','G#3','B3','E4']];
  chords.forEach((ch,b)=>{
    const tb=t+b*4*SB;
    I.pad(f(ch[0]),tb,4*SB+0.4,0.05,d); I.pad(f(ch[2]),tb,4*SB+0.4,0.03,d); I.pad(f(ch[4]),tb,4*SB+0.4,0.025,d);
    [1,2,3,4,5,4,3,2].forEach((ix,k)=>I.bell(f(ch[ix])*2,tb+k*SB/2,SB*1.2,0.05,d));
  });
});

defTrack('silent', 16, (t,d)=>{
  for(let i=0;i<8;i++){ osc('sine',45,t+i*2,1.6,0.35,d,{slide:30}); noise(t+i*2,0.4,0.05,d,'lowpass',200); }
  for(let i=0;i<5;i++) I.clang(140+Math.random()*260,t+Math.random()*15,0.05,d);
  const riff=[['E3',0],['B3',.5],['E4',1],['G4',1.5],['F#4',2.4],['D4',3.4],['E4',4.4]];
  riff.forEach(([n,x])=>I.pluck(f(n),t+6+x,1.4,0.1,d));
  riff.forEach(([n,x])=>I.pluck(f(n)*0.5,t+11+x*1.1,1.6,0.07,d));
});

const FB=60/138;
defTrack('finale', 16*FB, (t,d)=>{
  const bars=[['C4','E4','G4','A4','Bb4','A4','G4','E4'],['F4','A4','C5','D5','Eb5','D5','C5','A4'],['C4','E4','G4','A4','Bb4','A4','G4','E4'],['G4','B4','D5','E5','F5','E5','D5','B4']];
  const walk=[['C2','E2','G2','A2'],['F2','A2','C3','D3'],['C2','E2','G2','A2'],['G2','B2','D3','E3']];
  bars.forEach((bar,b)=>{
    const tb=t+b*4*FB;
    bar.forEach((n,k)=>{ const sw=Math.floor(k/2)*FB+(k%2?FB*0.66:0); I.organ(f(n),tb+sw,FB*0.45,0.05,d); });
    walk[b].forEach((n,k)=>{ I.bass(f(n),tb+k*FB,FB*0.9,0.2,d); if(k%2===0) I.kick(tb+k*FB,0.3,d); else I.snare(tb+k*FB,0.12,d); I.hat(tb+k*FB+FB*0.66,0.05,d); });
  });
});

function scheduler(){
  if(!ctx) return;
  const now=ctx.currentTime;
  for(const k in tracks){ const tr=tracks[k]; if(!tr.active) continue;
    if(now > tr.next-1.0){ if(tr.next<now) tr.next=now+0.1; tr.build(tr.next,tr.gain); tr.next+=tr.len; } }
}

/* ---------- ambience layers ---------- */
function buildLayers(){
  const mk=(name,dest)=>{ const g=ctx.createGain(); g.gain.value=0; g.connect(dest||sfxBus); layers[name]=g; return g; };
  // wind
  { const s=ctx.createBufferSource(); s.buffer=noiseB; s.loop=true; const bp=ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=500; bp.Q.value=0.9;
    const lfo=ctx.createOscillator(); lfo.frequency.value=0.09; const lg=ctx.createGain(); lg.gain.value=320; lfo.connect(lg); lg.connect(bp.frequency); lfo.start();
    s.connect(bp); bp.connect(mk('wind')); s.start(); }
  // drone
  { const g=mk('drone'); const lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=170; lp.connect(g);
    [55,55.6,82.6].forEach(fr=>{ const o=ctx.createOscillator(); o.type='sawtooth'; o.frequency.value=fr; const og=ctx.createGain(); og.gain.value=0.18; o.connect(og); og.connect(lp); o.start(); });
    const sub=ctx.createOscillator(); sub.frequency.value=27.5; const sg=ctx.createGain(); sg.gain.value=0.4; sub.connect(sg); sg.connect(g); sub.start(); }
  // siren
  { const g=mk('siren'); const o=ctx.createOscillator(); o.type='sawtooth'; o.frequency.value=520; const o2=ctx.createOscillator(); o2.type='sawtooth'; o2.frequency.value=520*1.5;
    const lfo=ctx.createOscillator(); lfo.frequency.value=0.07; const lg=ctx.createGain(); lg.gain.value=330; lfo.connect(lg); lg.connect(o.frequency); const lg2=ctx.createGain(); lg2.gain.value=495; lfo.connect(lg2); lg2.connect(o2.frequency);
    const lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=1600; const g2=ctx.createGain(); g2.gain.value=0.05;
    o.connect(lp); o2.connect(g2); g2.connect(lp); lp.connect(g); o.start(); o2.start(); lfo.start(); }
  // radio static
  { const g=mk('static'); const s=ctx.createBufferSource(); s.buffer=noiseB; s.loop=true; const bp=ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=2600; bp.Q.value=0.4;
    const amp=ctx.createGain(); amp.gain.value=0.3; s.connect(bp); bp.connect(amp); amp.connect(g); s.start();
    setInterval(()=>{ if(ctx) amp.gain.setTargetAtTime(Math.random()<0.3?0.9*Math.random():0.12,ctx.currentTime,0.02); },90); }
  // hum of the house (candles / old wiring)
  { const g=mk('hum'); const o=ctx.createOscillator(); o.frequency.value=60; o.type='square'; const lp=ctx.createBiquadFilter(); lp.type='lowpass'; lp.frequency.value=240; const og=ctx.createGain(); og.gain.value=0.05; o.connect(lp); lp.connect(og); og.connect(g); o.start(); }
}

/* ---------- cartoon formant voice (sound-alike, no recordings) ---------- */
const VOWEL={u:[320,800,2300],o:[500,900,2400],e:[530,1840,2480],i:[300,2200,3000],a:[750,1200,2500],r:[420,1100,1600]};
function voice(t,syl,dest,vol){
  // syl: [{v:'u',f0:[from,to],d:dur,gap}]
  let x=0;
  syl.forEach(s=>{
    const st=t+x, d=s.d;
    const src=ctx.createOscillator(); src.type='sawtooth'; src.frequency.setValueAtTime(s.f0[0],st); src.frequency.exponentialRampToValueAtTime(s.f0[1],st+d);
    const vib=ctx.createOscillator(); vib.frequency.value=7; const vg=ctx.createGain(); vg.gain.value=s.f0[0]*0.03; vib.connect(vg); vg.connect(src.frequency);
    const g=ctx.createGain(); g.gain.setValueAtTime(0.0001,st); g.gain.exponentialRampToValueAtTime(vol,st+0.03); g.gain.setValueAtTime(vol,st+d*0.7); g.gain.exponentialRampToValueAtTime(0.0001,st+d);
    const fs=VOWEL[s.v]; const mix=ctx.createGain(); mix.gain.value=1;
    fs.forEach((fr,i)=>{ const bp=ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=fr; bp.Q.value=i?9:6; const bg=ctx.createGain(); bg.gain.value=[1,0.55,0.25][i]*4; src.connect(bp); bp.connect(bg); bg.connect(mix); });
    mix.connect(g); g.connect(dest);
    noise(st,d*0.9,vol*0.18,dest,'bandpass',1800,1);  // rasp
    src.start(st); vib.start(st); src.stop(st+d+0.05); vib.stop(st+d+0.05);
    x+=d+(s.gap||0.02);
  });
}

/* ---------- sfx ---------- */
const S = {
  /* Scooby-style sound-alikes */
  ruhroh(){ voice(ctx.currentTime,[{v:'r',f0:[300,250],d:0.22,gap:0.08},{v:'o',f0:[360,210],d:0.42}],sfxBus,0.32); },
  scoobyLaugh(){ const t=ctx.currentTime; voice(t,[0,1,2,3,4,5].map(i=>({v:'e',f0:[420-i*14,360-i*14],d:0.11,gap:0.05})),sfxBus,0.28); },
  scoobyDoo(){ voice(ctx.currentTime,[{v:'u',f0:[330,300],d:0.16},{v:'i',f0:[300,280],d:0.12},{v:'u',f0:[280,260],d:0.14},{v:'i',f0:[270,250],d:0.12},{v:'u',f0:[250,420],d:0.9}],sfxBus,0.3); },
  skid(){ const t=ctx.currentTime; for(let i=0;i<18;i++) osc('sine',900+Math.random()*500,t+i*0.03,0.03,0.12,sfxBus,{a:0.002});
    osc('sine',500,t+0.5,0.35,0.15,sfxBus,{slide:1800}); noise(t+0.5,0.4,0.25,sfxBus,'bandpass',1500,2,{sweep:4000}); },
  slide(){ osc('sine',400,ctx.currentTime,0.5,0.15,sfxBus,{slide:1600}); },
  /* survival-horror sound-alikes */
  reItem(){ const t=ctx.currentTime; ['E5','B5','E6'].forEach((n,i)=>osc('sine',f(n),t+i*0.06,1.2,0.12,sfxBus,{a:0.004})); osc('triangle',f('E4'),t,0.9,0.08,sfxBus); },
  reDoor(){ const t=ctx.currentTime; S.creak(); [0.9,1.35,1.8].forEach(x=>noise(t+x,0.12,0.5,sfxBus,'lowpass',320)); noise(t+2.3,0.6,0.8,sfxBus,'lowpass',200); osc('sine',55,t+2.3,0.8,0.7,sfxBus,{slide:30}); },
  herb(){ const t=ctx.currentTime; ['A4','C#5','E5','A5','C#6'].forEach((n,i)=>osc('sine',f(n),t+i*0.08,0.9,0.1,sfxBus)); },
  bigclang(){ const t=ctx.currentTime; I.clang(95,t,0.35,sfxBus); I.clang(143,t+0.01,0.2,sfxBus); noise(t,0.3,0.6,sfxBus,'highpass',3000); },
  squeak(){ const t=ctx.currentTime; [0,0.09,0.2].forEach(x=>osc('sine',2800+Math.random()*800,t+x,0.06,0.1,sfxBus,{slide:3600})); },
  creak(){ const t=ctx.currentTime; const o=ctx.createOscillator(); o.type='sawtooth';
    const curve=new Float32Array(40); for(let i=0;i<40;i++) curve[i]=70+Math.abs(Math.sin(i*0.7))*110+Math.random()*40;
    o.frequency.setValueCurveAtTime(curve,t,1.8);
    const bp=ctx.createBiquadFilter(); bp.type='bandpass'; bp.frequency.value=900; bp.Q.value=5;
    const g=ctx.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.5,t+0.1); g.gain.setValueAtTime(0.5,t+1.4); g.gain.exponentialRampToValueAtTime(0.0001,t+1.85);
    o.connect(bp); bp.connect(g); g.connect(sfxBus); o.start(t); o.stop(t+1.9);
    noise(t+1.6,0.5,0.4,sfxBus,'lowpass',300); },
  knock(){ const t=ctx.currentTime; [0,0.3,0.6].forEach(x=>{ noise(t+x,0.12,0.9,sfxBus,'lowpass',500); osc('sine',110,t+x,0.15,0.6,sfxBus,{slide:60}); }); },
  slam(){ const t=ctx.currentTime; noise(t,0.5,0.9,sfxBus,'lowpass',380); osc('sine',90,t,0.4,0.8,sfxBus,{slide:35}); },
  door(){ const t=ctx.currentTime; osc('sawtooth',200+Math.random()*120,t,0.35,0.08,sfxBus,{slide:120,bp:1100,q:4}); },
  thunder(){ const t=ctx.currentTime; noise(t,0.25,0.6,sfxBus,'highpass',1500); noise(t,4.5,0.9,sfxBus,'lowpass',900,0.5,{sweep:70,a:0.05}); osc('sine',38,t,3,0.6,sfxBus); },
  sting(){ const t=ctx.currentTime; [880,932,1245,1661,1760].forEach(fr=>osc('sawtooth',fr,t,1.3,0.06,sfxBus,{detune:(Math.random()-.5)*60,lp:5000}));
    noise(t,0.6,0.7,sfxBus,'highpass',800); osc('sine',60,t,1.4,0.9,sfxBus,{slide:28}); },
  boing(){ const t=ctx.currentTime; const o=ctx.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(180,t); o.frequency.exponentialRampToValueAtTime(700,t+0.12); o.frequency.exponentialRampToValueAtTime(140,t+0.5);
    const g=ctx.createGain(); g.gain.setValueAtTime(0.4,t); g.gain.exponentialRampToValueAtTime(0.001,t+0.55); o.connect(g); g.connect(sfxBus); o.start(t); o.stop(t+0.6); },
  zip(){ const t=ctx.currentTime; osc('square',300,t,0.25,0.06,sfxBus,{slide:1600,lp:3000}); },
  step(){ noise(ctx.currentTime,0.07,0.25,sfxBus,'lowpass',260); },
  bark(){ const t=ctx.currentTime; [0,0.2].forEach((x,i)=>{ osc('sawtooth',i?330:400,t+x,0.16,0.3,sfxBus,{slide:i?200:240,bp:850,q:2}); noise(t+x,0.1,0.2,sfxBus,'bandpass',1200,1); }); },
  collect(){ const t=ctx.currentTime; ['C6','E6','G6','C7'].forEach((n,i)=>osc('triangle',f(n),t+i*0.07,0.5,0.15,sfxBus)); },
  hover(){ osc('sine',1300+Math.random()*200,ctx.currentTime,0.05,0.04,sfxBus); },
  click(){ osc('square',600,ctx.currentTime,0.05,0.05,sfxBus,{lp:2000}); },
  type(){ const t=ctx.currentTime; noise(t,0.04,0.35,sfxBus,'highpass',2500); osc('square',180+Math.random()*60,t,0.03,0.08,sfxBus,{lp:900}); },
  ding(){ const t=ctx.currentTime; osc('sine',2100,t,1.3,0.12,sfxBus,{a:0.002}); osc('sine',3150,t,0.8,0.05,sfxBus,{a:0.002}); },
  whoosh(){ noise(ctx.currentTime,0.7,0.35,sfxBus,'bandpass',300,1.2,{sweep:2400,a:0.2}); },
  moan(){ const t=ctx.currentTime; const o=ctx.createOscillator(); o.type='sine'; o.frequency.setValueAtTime(320,t); o.frequency.linearRampToValueAtTime(420,t+0.8); o.frequency.linearRampToValueAtTime(220,t+2.2);
    const v=ctx.createOscillator(); v.frequency.value=6; const vg=ctx.createGain(); vg.gain.value=12; v.connect(vg); vg.connect(o.frequency);
    const g=ctx.createGain(); g.gain.setValueAtTime(0.0001,t); g.gain.exponentialRampToValueAtTime(0.2,t+0.4); g.gain.exponentialRampToValueAtTime(0.0001,t+2.3);
    o.connect(g); g.connect(sfxBus); o.start(t); v.start(t); o.stop(t+2.4); v.stop(t+2.4); },
  laugh(){ const t=ctx.currentTime; for(let i=0;i<6;i++) osc('sawtooth',230-i*12,t+i*0.17,0.13,0.22,sfxBus,{slide:170-i*10,bp:800,q:2}); },
  heartbeat(){ const t=ctx.currentTime; [0,0.28].forEach(x=>osc('sine',55,t+x,0.25,0.9,sfxBus,{slide:35})); },
  chest(){ const t=ctx.currentTime; osc('sawtooth',120,t,0.6,0.15,sfxBus,{slide:260,bp:700,q:6}); noise(t+0.5,0.2,0.4,sfxBus,'lowpass',400); },
  radio(){ noise(ctx.currentTime,1.2,0.5,sfxBus,'bandpass',2800,0.5); },
  pop(){ osc('sine',500,ctx.currentTime,0.12,0.2,sfxBus,{slide:1200}); }
};

/* ---------- public API ---------- */
A.init = function(){
  if(ctx) return;
  ctx = new (window.AudioContext||window.webkitAudioContext)();
  master=ctx.createGain(); master.gain.value=0.0001; master.connect(ctx.destination);
  comp=ctx.createDynamicsCompressor(); comp.threshold.value=-14; comp.ratio.value=4; comp.connect(master);
  rev=ctx.createConvolver(); rev.buffer=impulse(3.6,2.4); const rg=ctx.createGain(); rg.gain.value=0.45; rev.connect(rg); rg.connect(comp);
  musicBus=ctx.createGain(); musicBus.gain.value=0.75; musicBus.connect(comp); musicBus.connect(rev);
  sfxBus=ctx.createGain(); sfxBus.gain.value=0.9; sfxBus.connect(comp); sfxBus.connect(rev);
  noiseB=makeNoise(5);
  for(const k in tracks){ const g=ctx.createGain(); g.gain.value=0; g.connect(musicBus); tracks[k].gain=g; }
  buildLayers();
  loadSamples();
  setInterval(scheduler,120);
  master.gain.exponentialRampToValueAtTime(0.9,ctx.currentTime+1.5);
  A.ready=true;
};
A.track = function(name){
  if(!ctx || name===currentTrack) return;
  const t=ctx.currentTime;
  if(currentTrack){ const old=tracks[currentTrack]; old.gain.gain.cancelScheduledValues(t); old.gain.gain.setTargetAtTime(0,t,0.5); const o=old; setTimeout(()=>{ if(currentTrack!==o.name) o.active=false; },3000); }
  currentTrack=name;
  if(name && tracks[name]){ const tr=tracks[name]; if(!tr.active){ tr.active=true; tr.next=t+0.15; } tr.gain.gain.cancelScheduledValues(t); tr.gain.gain.setTargetAtTime(1,t,0.6); scheduler(); }
};
A.layer = function(name, v, tc){ if(!ctx||!layers[name]) return; layers[name].gain.setTargetAtTime(v, ctx.currentTime, tc||0.8); };
/* Optional real recordings: drop your own licensed files into sounds/<name>.mp3 (or .ogg/.wav)
   and they replace the synthesized version of that sound. See sounds/README.txt */
const samples={};
A.SAMPLE_NAMES=['ruhroh','scoobyLaugh','scoobyDoo','skid','bark','moan','laugh','sting','reItem','reDoor','herb','type','ding','creak','knock','slam','thunder','bigclang','squeak','radio','boing'];
function loadSamples(){
  if(location.protocol==='file:') return;
  fetch('sounds/manifest.json').then(r=>r.ok?r.json():{}).then(man=>{
    Object.keys(man).forEach(n=>{ if(!A.SAMPLE_NAMES.includes(n)) return;
      fetch('sounds/'+man[n]).then(r=>r.arrayBuffer()).then(buf=>ctx.decodeAudioData(buf)).then(b=>{ samples[n]=b; }).catch(()=>{}); });
  }).catch(()=>{});
}
function playSample(n){ const s=ctx.createBufferSource(); s.buffer=samples[n]; s.connect(sfxBus); s.start(); }
A.sfx = function(name){ if(!ctx||A.muted) return; try{ if(samples[name]) playSample(name); else if(S[name]) S[name](); }catch(e){} };
A.toggle = function(){ if(!ctx) return A.muted; A.muted=!A.muted; master.gain.setTargetAtTime(A.muted?0:0.9,ctx.currentTime,0.2); return A.muted; };
A.duck = function(v){ if(ctx) musicBus.gain.setTargetAtTime(v,ctx.currentTime,0.3); };
})();
