/* UNMASKED — English / Persian. English DOM text is read from the page itself; Persian lives here. */
(function(){
const M = window.UM = window.UM || {};
let saved=null; try{ saved=localStorage.getItem('um-lang'); }catch(e){}
M.lang = saved==='fa' ? 'fa' : 'en';

const FA_DIGITS='۰۱۲۳۴۵۶۷۸۹';
M.num = v => M.lang==='fa' ? String(v).replace(/\d/g,d=>FA_DIGITS[d]) : String(v);
M.money = v => M.lang==='fa' ? M.num(v)+' دلار' : '$'+v;

/* ---------- strings used from JS ---------- */
const S = {
  en:{
    zones:['THE GROUNDS','THE LEGEND','THE FRONT DOOR','HALLWAY OF DOORS','COSTUME GALLERY','THE ITEM BOX','SAFE ROOM','SILENT HOLLOW','THE UNMASKING','THE END?'],
    loader:['Summoning ghosts…','Feeding the Great Dane…','Polishing the fog machine…','Hiding in the closet…','Checking under the bed…','Waxing the secret passages…'],
    sewing:'Sewing costumes…', building:'Building the haunted house…', hiding:'Hiding the biscuits…', ready:'Ready.', waiting:'The house is waiting.',
    t_intro:"Move your cursor — it's your flashlight. Every character has a hitbox: click them!",
    t_radio:'Your radio crackles. Something is near.', t_relief:'You feel a sense of relief.',
    t_eyes:'The eyes follow you. They always have.', t_herb:'You used a Green Herb. Condition: FINE.',
    t_full:'Your item box is full. (Classic.)', t_added:'{name} ({size}) — added to item box',
    t_snack:'Biscuit found! {n}/7 — Biscuit the Great Dane approves.', t_allsnacks:'All 7 biscuits! Code MEDDLINGKIDS unlocked — 30% off applied to your item box.',
    t_snackhelp:'Find 7 glowing biscuits hidden around the house. {n}/7 found.', t_news:'Welcome to the Mystery Club. (Demo — nothing was sent.)',
    t_clue:'Clue found! {n}/{t}', t_allclues:'Every clue found! You are an honorary meddling kid.', t_cluehelp:'Click every character, door and creature. {n}/{t} clues.',
    scares:'SCARES', on:'ON', off:'OFF', fine:'FINE', caution:'CAUTION', danger:'DANGER',
    quick:'Quick add · M', remove:'Remove',
    save_q:"There's a typewriter here.\nYou have {r} ink ribbon{s}.\n\nWill you save your order? ({n} item{p} · {tot})",
    save_empty:"There's a typewriter here.\n\nBut your item box is empty.\nNothing to save… yet.",
    save_noink:'You need an INK RIBBON to save.\n\n…kidding. Biscuit found three more under the couch.',
    save_ok:'ORDER SAVED.\n\n{n} costume{p} · {tot}{disc}\nArriving before midnight, October 31st.\n\nInk ribbons left: {r}',
    save_disc:' (saved {d} with biscuits)',
    marquee:["Ruh-roh","Don't go in the basement","They're heeere","Room 302","Stay out of the fog","Never sleep again","We all float","Be afraid","Have a nice day","Jinkies","Save your game","Unmask everything"],
    neon:'THE COLLECTION', closed:'CASE CLOSED', inspect:'CLICK TO INSPECT',
    lbl:{knock:'knock',stare:'stare back',save:'save order',box:'item box',herb:'green herb',snack:'biscuit!',door:'door',
      dog:'Biscuit',ghost:'Ghost',bo:'Bo',dot:'Dot',max:'Max',riley:'Riley',villain:'The Phantom',pyramid:'The Executioner',bat:'Bat',pumpkin:'Pumpkin'},
    lines:{
      dog:['Ruh-roh!','Biscuit? Where?!','Hehehehe!','Scooby-dooby… wait, wrong show.'],
      ghost:['BOOOOO!',"You can't catch meee…","I'm just a guy in a sheet, okay?"],
      bo:['Like, RUN, man!','Is there a snack in here?','Zoinks!'],
      dot:["My glasses! I can't see without my glasses!",'Jinkies! A clue!'],
      max:["Let's split up, gang!",'Time to set a trap.'],
      riley:['Jeepers! Nice costume.','This scarf is NOT getting dirty.'],
      villain:['Meddling kids!',"I would've gotten away with it!"],
      pyramid:['……','(heavy breathing)','*drags the great knife*'],
      bat:['Squeak!','Eek!'], pumpkin:['Boo-mpkin!','Stop poking me.'],
      door:['Wrong door.','Nothing here… yet.','Something slammed it from the other side.'],
      portrait:['…','The eyes follow you.']
    }
  },
  fa:{
    zones:['حیاط','افسانه','در ورودی','راهروی درها','گالری کاستوم','صندوق آیتم','اتاق امن','درهٔ خاموش','بی‌نقاب شدن','پایان؟'],
    loader:['در حال احضار روح‌ها…','غذا دادن به گریت‌دین…','براق کردن دستگاه مه…','قایم شدن توی کمد…','نگاه کردن زیر تخت…','واکس زدن راهروهای مخفی…'],
    sewing:'در حال دوختن کاستوم‌ها…', building:'ساختن خانهٔ جن‌زده…', hiding:'قایم کردن بیسکویت‌ها…', ready:'آماده.', waiting:'خانه منتظرته.',
    t_intro:'نشانگرت چراغ‌قوه‌ته. هر شخصیت یه هیت‌باکس داره: روشون کلیک کن!',
    t_radio:'رادیوت خش‌خش می‌کنه. یه چیزی همین نزدیکیه.', t_relief:'یه حس آرامش بهت دست می‌ده.',
    t_eyes:'چشم‌ها دنبالت می‌کنن. همیشه همین‌طور بوده.', t_herb:'از گیاه سبز استفاده کردی. وضعیت: خوب.',
    t_full:'صندوق آیتمت پره. (کلاسیک.)', t_added:'{name} ({size}) — به صندوق آیتم اضافه شد',
    t_snack:'بیسکویت پیدا شد! {n}/۷ — بیسکویتِ گریت‌دین تأیید می‌کنه.', t_allsnacks:'هر ۷ بیسکویت! کد MEDDLINGKIDS باز شد — ۳۰٪ تخفیف روی صندوق آیتمت اعمال شد.',
    t_snackhelp:'۷ بیسکویت درخشان توی خونه قایم شده. {n}/۷ پیدا شده.', t_news:'به باشگاه معما خوش اومدی. (نمایشی — چیزی ارسال نشد.)',
    t_clue:'سرنخ پیدا شد! {n}/{t}', t_allclues:'همهٔ سرنخ‌ها پیدا شد! حالا رسماً یکی از بچه‌های فضولی.', t_cluehelp:'روی همهٔ شخصیت‌ها، درها و موجودات کلیک کن. {n}/{t} سرنخ.',
    scares:'ترس', on:'روشن', off:'خاموش', fine:'خوب', caution:'احتیاط', danger:'خطر',
    quick:'افزودن سریع · M', remove:'حذف',
    save_q:'یه ماشین‌تحریر این‌جاست.\n{r} نوار جوهر داری.\n\nمی‌خوای سفارشت رو ذخیره کنی؟ ({n} آیتم · {tot})',
    save_empty:'یه ماشین‌تحریر این‌جاست.\n\nولی صندوق آیتمت خالیه.\nفعلاً چیزی برای ذخیره نیست…',
    save_noink:'برای ذخیره کردن به نوار جوهر نیاز داری.\n\n…شوخی کردم. بیسکویت سه تای دیگه زیر مبل پیدا کرد.',
    save_ok:'سفارش ذخیره شد.\n\n{n} کاستوم · {tot}{disc}\nتحویل قبل از نیمه‌شب ۳۱ اکتبر.\n\nنوار جوهر باقی‌مونده: {r}',
    save_disc:' ({d} صرفه‌جویی با بیسکویت‌ها)',
    marquee:['اوه‌اوه','نرو توی زیرزمین','اومدن…','اتاق ۳۰۲','از مه دور بمون','دیگه هیچ‌وقت نخواب','همه شناوریم','بترس','روز خوبی داشته باشی','وای! یه سرنخ','بازی رو ذخیره کن','همه‌چیز رو بی‌نقاب کن'],
    neon:'کلکسیون', closed:'پرونده بسته شد', inspect:'برای دیدن کلیک کن',
    lbl:{knock:'در زدن',stare:'خیره شو',save:'ذخیرهٔ سفارش',box:'صندوق آیتم',herb:'گیاه سبز',snack:'بیسکویت!',door:'در',
      dog:'بیسکویت',ghost:'روح',bo:'بو',dot:'دات',max:'مکس',riley:'رایلی',villain:'شبح',pyramid:'جلاد',bat:'خفاش',pumpkin:'کدو'},
    lines:{
      dog:['اوه‌اوه!','بیسکویت؟ کجا؟!','هه‌هه‌هه‌هه!','اسکوبی‌دوبی… نه، کارتونش فرق داره.'],
      ghost:['بووووو!','نمی‌تونی منو بگیری…','من فقط یه یارو زیر ملافه‌ام، باشه؟'],
      bo:['فرار کن رفیق!','این‌جا خوراکی پیدا میشه؟','وای وای وای!'],
      dot:['عینکم! بدون عینکم هیچی نمی‌بینم!','وای! یه سرنخ!'],
      max:['بچه‌ها، جدا شیم!','وقتشه یه تله بذاریم.'],
      riley:['وای! چه کاستوم قشنگی.','این شال‌گردن نباید کثیف بشه.'],
      villain:['بچه‌های فضول!','داشتم قسر در می‌رفتم!'],
      pyramid:['……','(نفس‌های سنگین)','*چاقوی بزرگش رو روی زمین می‌کشه*'],
      bat:['جیغ!','ایییی!'], pumpkin:['کدوی بوووو!','اِ، دست نزن!'],
      door:['در اشتباه.','این‌جا چیزی نیست… فعلاً.','یه چیزی از اون طرف در رو کوبید.'],
      portrait:['…','چشم‌ها دنبالت می‌کنن.']
    }
  }
};
M.t = (key, vars) => { let s=S[M.lang][key]; if(s==null) s=S.en[key]; if(typeof s==='string' && vars) s=s.replace(/\{(\w+)\}/g,(_,k)=>vars[k]!=null?vars[k]:''); return s; };

/* ---------- product translations ---------- */
M.productsFa = {
  phantom:{name:'ملافهٔ شبح',badge:'پروندهٔ ۰۰۱',desc:'کتان شبح‌وار دولایه روی یه قاب کلاه سبک. زیر نور بنفش می‌درخشه و طوری تکون می‌خوره که انگار جدیه.',culprit:'یه مشاور املاک که خریدارها رو از یه زمین «جن‌زده» فراری می‌داد تا ارزون بخردش.'},
  miner:{name:'روح معدنچی ۴۹',badge:'کیت درخشان',desc:'کلاه روح سبز فسفری، چراغ معدن LED واقعی و یه ریش از اکتوپلاسم خالص (پلی‌استر).',culprit:'بانکدار شهر که شب‌ها زیر معدن قدیمی دنبال طلا می‌گشت.'},
  witch:{name:'کلاه جادوگر مرداب',badge:'دست‌ساز',desc:'مخروط نمدی کج، نوار نارنجی کدویی، سگک برنجی و یه کرم شب‌تاب که نمی‌خواد بره.',culprit:'کتابدار شهر. جریمه‌های دیرکرد از کنترل خارج شده بود.'},
  jack:{name:'جک کدوی خزنده',badge:'نوردار',desc:'سر کدوی فومی تراشیده با LED شمعی و یقهٔ کنفی مترسکی.',culprit:'کشاورز همسایه، که می‌خواست داورهای مسابقهٔ کدو رو بترسونه.'},
  count:{name:'شنل کنت مخملی',badge:'پرفروش',desc:'شنل اپرای سه‌متری، آستر ساتن قرمز خونی، یقه‌ای که خودش وایمیسته و یه مدال یاقوتی.',culprit:'صاحب تئاتر، که همه رو از تابلوهای دزدی توی زیرشیروونی دور نگه می‌داشت.'},
  mummy:{name:'ست باند مومیایی',badge:'کهنه‌شده',desc:'۳۰ متر باند نخی چای‌خورده، لنزهای چشم درخشان و یه تکهٔ شل اضافه برای کشیدن روی زمین.',culprit:'متصدی موزه، که طلای فرعون رو «قرض» گرفته بود.'},
  cosmic:{name:'فضانورد جمجمه‌ای',badge:'از یه دنیای دیگه',desc:'کلاه شیشه‌ای رترو با یه جمجمهٔ خندون توش، چراغ‌های بنفش چشم و آنتنی که چشمک می‌زنه.',culprit:'یه بدلکار سینما که برای تبلیغ، فرود بشقاب‌پرنده رو جعل کرده بود.'},
  pyramid:{name:'کلاه هرمی سرخ',badge:'ادای دین شهر مه',desc:'کلاه پرچ‌دار بزرگ از فوم زنگ‌زده‌نما. همراه با یه چاقوی بزرگ که سنگین به نظر میاد (ولی خیلی سبکه).',culprit:'یه آهنگر سوءتفاهم‌شده. فقط می‌خواست با یکی حرف بزنه.'},
  pursuer:{name:'ماسک تعقیب‌گر',badge:'ادای دین بقای ترسناک',desc:'سر لاتکسی بخیه‌خورده، دندون‌های بیرون‌زده، یه چشم درخشان و یقهٔ بارونی مشکی که تهدیدآمیز خش‌خش می‌کنه.',culprit:'یه پیک که «تحویل تضمینی» رو زیادی جدی گرفته.'},
  nurse:{name:'پرستار شهر مه',badge:'ادای دین',desc:'فرم سر باندپیچی‌شده، کلاه آهارزده با صلیب قرمز و یقهٔ قدیمی. لرزیدن جداگانه فروخته می‌شه.',culprit:'منشی شیفت شب. از ملاقاتی‌ها متنفره.'},
  dane:{name:'کلاه گریت‌دین بیسکویت',badge:'اوه‌اوه!',desc:'کلاه پولیشی گریت‌دین با گوش‌های آویزون، قلادهٔ فیروزه‌ای و پلاک طلایی. بیسکویت همراهش نیست (توی خونه پیداش کن).',culprit:'هیچ‌کس — این فقط بیسکویته. همیشه فقط بیسکویته.'},
  kit:{name:'کیت بچه‌های فضول',badge:'پک گروهی',desc:'عینک قاب‌کلفت، دستمال‌گردن نارنجی، تل بنفش و ذره‌بین برنجی. با استایل معما حل کن.',culprit:'تو. حالا تو یکی از بچه‌های فضولی.'}
};
M.catsFa = { ghosts:'۰۱ · روح‌ها', ghouls:'۰۲ · هیولاها', gameover:'۰۳ · گیم اوور', gang:'۰۴ · گروه' };
M.pf = (p,field) => (M.lang==='fa' && M.productsFa[p.id] && M.productsFa[p.id][field]) || p[field];
M.catName = c => M.lang==='fa' ? M.catsFa[c] : M.cats[c];

/* ---------- DOM translations (keys match data-i18n) ---------- */
M.domFa = {
  ld_small:'فروشگاه کاستوم · از ۱۹۶۹', ld_enter:'ورود', ld_dare:'اگه جرئتش رو داری',
  ld_hint:'🎧 صدا روشن · هدفون پیشنهاد می‌شه · چراغ‌قوه‌ت رو با نشانگر حرکت بده',
  nav_ghosts:'روح‌ها', nav_ghouls:'هیولاها', nav_gameover:'گیم اوور', nav_gang:'گروه',
  soc_fb:'فیسبوک', soc_ig:'اینستاگرام', soc_tt:'تیک‌تاک',
  hero_title:'بی‌نقاب', hero_sub:'هر هیولایی فقط یه نفره توی یه کاستوم <em>خیلی</em> خوب.',
  hb_left:'با نشانگرت<br>ترسناک‌بازی کن<i></i>', cue:'اسکرول کن تا به خونه نزدیک بشی',
  cf_stamp:'پروندهٔ ۳۱۲ · بسته شد', cf_title:'افسانهٔ <span>بی‌نقاب</span>',
  cf_p1:'در سال <b>۱۹۶۹</b>، چهار تا بچهٔ فضول و یه سگ گریت‌دینِ فوق‌العاده ترسو به اسم <b>بیسکویت</b> با یه اتوبوس رنگی به اسم <b>اتوبوس سرنخ</b> وارد شهری شدن که مشکل روح داشت.',
  cf_p2:'حلش کردن. بعد <b>۳۱۱ تای دیگه</b> رو هم حل کردن. شبح‌ها، جادوگرهای مرداب، اسکلت‌های فضایی، یه مومیایی که وام مسکن داشت.',
  cf_p3:'آخرش معلوم شد همهٔ هیولاها <i>یه آدم توی کاستوم</i> بودن. و کاستوم‌ها… راستش؟ <b>محشر</b> بودن. واسه همین گروه نگهشون داشت.',
  cf_p4:'امروز اون‌ها رو می‌فروشیم — دوخت دقیق، امتحان‌پس‌داده، با تضمین اینکه حداقل یه گریت‌دین از ترس بپره بغل یکی.',
  g_max:'<b>مکس</b><span>نقشه</span>', g_dot:'<b>دات</b><span>مغز</span>', g_riley:'<b>رایلی</b><span>استایل</span>', g_bo:'<b>بو</b><span>اشتها</span>', g_biscuit:'<b>بیسکویت</b><span>شجاعت (صفر)</span>',
  knock1:'تق', knock2:'تق!', door_p:'در قفل نیست. هیچ‌وقت نبوده. اسکرول کن تا بری تو.', knock_btn:'در بزن',
  hall_k:'۰۳ — راهروی درها', hall_h:'اوه‌اوه!',
  hall_p:'یه چیزی دنبال بیسکویته. یه چیز دیگه هم دنبال <i>اون</i>ه. درها باز می‌شن. درها بسته می‌شن. هیچ‌کس از دری که رفته تو بیرون نمیاد.',
  hall_tip:'نکته: هر شخصیت، در و موجودی <b>هیت‌باکس</b> داره — روشون کلیک کن تا سرنخ جمع کنی. <b>۷ بیسکویت درخشان</b> هم توی خونه قایم شده — برای تخفیف مخفی پیداشون کن.',
  gal_k:'۰۴ — گالری کاستوم‌ها', gal_h:'چراغ‌قوه‌ت رو روشن کن.',
  gal_p:'دوازده شرورِ بی‌نقاب روی سکوهاشون استراحت می‌کنن. نور رو با نشانگرت بچرخون و روی یه کاستوم <b>کلیک کن</b> تا سه‌بعدی ببینیش.',
  gal_w:'توی گوشه‌های تاریک زیاد نمون. همه‌شون خالی نیستن.',
  cat_k:'۰۵ — صندوق آیتم', cat_h:'کلکسیون',
  f_all:'همه', f_ghosts:'۰۱ روح‌ها', f_ghouls:'۰۲ هیولاها', f_gameover:'۰۳ گیم اوور', f_gang:'۰۴ گروه',
  safe_k:'۰۶ — اتاق امن', safe_line:'یه ملودی آرامش‌بخش می‌شنوی. یه ماشین‌تحریر این‌جاست.', safe_h:'می‌خوای سفارشت رو ذخیره کنی؟',
  safe_b1:'استفاده از ماشین‌تحریر', safe_b2:'باز کردن صندوق آیتم', safe_ink:'نوار جوهر:', safe_herb:'· گیاه سبز: رایگان',
  fog_letter:'«در رؤیاهای بی‌قرارم، اون فروشگاه رو می‌بینم…»', fog_h1:'درهٔ', fog_h2:'خاموش',
  fog_p:'صدای آژیر یعنی حراج شروع شده. مه بخشی از تجربه‌ست. اون آقای قدبلند با کلاه هرمی هم <b>برای فروشه</b> (کلاهش، نه خود آقا).',
  fog_btn:'خرید کاسپلی‌های گیم اوور',
  fin_k:'۰۸ — لحظهٔ بی‌نقاب شدن', fin_q:'بیاید ببینیم این شبح <i>واقعاً</i> کیه…', fin_h:'آقای هالووِی پیر!',
  fin_quote:'«…و اگه شما بچه‌های فضول نبودید، قسر در رفته بودم!»',
  fin_p:'صاحب مغازه. از اول خودش بود. فقط خیلی، <i>خیلی</i> دلش می‌خواست یه چیزی رو امتحان کنی.', fin_cta:'بی‌نقاب شو — همین حالا خرید کن',
  foot_note:'برند نمایشی و خیالی. همهٔ شخصیت‌ها ادای دینِ اورجینال‌اند؛ همهٔ موسیقی‌ها و صداها زنده توی مرورگرت ساخته می‌شن (ملودی‌های آزاد باخ و گریگ و ساخته‌های اورجینال).',
  news_l:'به باشگاه معما بپیوند', news_b:'عضویت', news_s:'هر جمعه سیزدهم یه بیسکویت بگیر.',
  fl1:'ارسال قبل از نیمه‌شب ۳۱ اکتبر', fl2:'مرجوعی رایگان (اگه زنده موندی)', fl3:'راهنمای سایز برای روح‌ها', fl4:'© ۱۹۶۹–۲۰۲۶ کاستوم بی‌نقاب',
  drag:'برای چرخوندن بکش', m_unmasked:'بی‌نقاب شد:', m_add:'افزودن به صندوق آیتم',
  box_h:'صندوق آیتم', sub_l:'جمع جزء', disc_l:'تخفیف بیسکویت (MEDDLINGKIDS)', tot_l:'جمع کل', checkout:'ذخیرهٔ سفارش با ماشین‌تحریر',
  yes:'بله', no:'نه'
};

/* ---------- apply ---------- */
const enCache = new Map();
M.applyLang = () => {
  const fa = M.lang==='fa';
  document.documentElement.lang = fa?'fa':'en'; document.documentElement.dir = fa?'rtl':'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const k=el.dataset.i18n; if(!enCache.has(el)) enCache.set(el,el.innerHTML);
    el.innerHTML = fa && M.domFa[k]!=null ? M.domFa[k] : enCache.get(el);
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el=>{ el.placeholder = fa ? 'you@haunted.house' : 'you@haunted.house'; });
  document.querySelectorAll('.lang-btn').forEach(b=>b.classList.toggle('on',b.dataset.lang===M.lang));
  document.title = fa ? 'بی‌نقاب — فروشگاه کاستوم هالووین' : 'UNMASKED — Costume Co.';
};
M.setLang = (l) => { if(l===M.lang) return; M.lang=l; try{ localStorage.setItem('um-lang',l); }catch(e){} M.applyLang(); if(M.onLang) M.onLang(); };
})();
