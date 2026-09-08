const SITE_BASE=(document.currentScript&&document.currentScript.src)?document.currentScript.src.replace(/site\.js.*$/,''):'/';
document.addEventListener('DOMContentLoaded',function(){
  const html=document.documentElement;
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('yr').textContent=new Date().getFullYear();

  /* starbursts: drawn here rather than shipped as an asset */
  function burst(svg,n){
    let s='';
    for(let i=0;i<n;i++){const a=i*Math.PI/n;const x=Math.cos(a)*96,y=Math.sin(a)*96;
      s+=`<line x1="${100+x}" y1="${100+y}" x2="${100-x}" y2="${100-y}" stroke="currentColor" stroke-width="0.6"/>`;}
    svg.innerHTML=s;
  }
  burst(document.getElementById('sun'),36);
  document.querySelectorAll('[data-spin]').forEach(s=>burst(s,+s.dataset.lines||24));

  /* theme */
  const th=localStorage.getItem('theme');
  if(th==='light')html.setAttribute('data-theme','light');
  document.getElementById('themeBtn').addEventListener('click',()=>{
    const light=html.getAttribute('data-theme')==='light';
    if(light)html.removeAttribute('data-theme');else html.setAttribute('data-theme','light');
    localStorage.setItem('theme',light?'dark':'light');
    document.querySelector('meta[name=theme-color]').content=light?'#0D0D0D':'#EDEBE5';
  });

  /* language */
  const params=new URLSearchParams(location.search);
  const saved=params.get('lang')||localStorage.getItem('lang')||(navigator.language.startsWith('ja')?'ja':'en');
  function setLang(l){
    html.setAttribute('data-lang',l);html.setAttribute('lang',l);
    const ot=document.getElementById('ovtext');if(ot){ot.textContent=(ot.dataset[l]||ot.dataset.en).repeat(24);}
    localStorage.setItem('lang',l);
    document.querySelectorAll('.lang-toggle span').forEach(s=>s.classList.toggle('on',s.dataset.l===l));
    document.title=l==='ja'?'平田滋睦 | 日本とニュージーランドでのクリエイティブ・マーケティング・コンサルティング':'James Hirata | Creative, marketing and consulting across Japan and New Zealand';
  }
  setLang(saved==='ja'?'ja':'en');
  document.getElementById('langBtn').addEventListener('click',()=>setLang(html.getAttribute('data-lang')==='ja'?'en':'ja'));

  document.querySelectorAll('.case-img img').forEach(im=>{
    const mark=()=>im.parentElement.classList.add('has-img');
    if(im.complete&&im.naturalWidth)mark();else im.addEventListener('load',mark);
  });

  /* marquees */
  function loop(id,dur){const tr=document.getElementById(id);for(let i=0;i<3;i++)tr.innerHTML+=tr.innerHTML;
  }
  loop('bottrack',40);

  /* matrix rain: katakana and code glyphs, columns react to the pointer, click for a surge */
  (function(){
    const cv=document.getElementById('matrix');if(!cv)return;
    const ctx=cv.getContext('2d');
    const words=['ELOPEMENTS','WEDDINGS','REAL ESTATE','PLANNING','VIDEOGRAPHY','PHOTOGRAPHY','写真','ビデオ','ウェブデザイン','プランニング','インバウンド婚','不動産','投資','ニセコ','神戸','ニュージーランド','日本','北海道','クイーンズタウン','ウェリントン','東京','京都','沖縄','OKINAWA','KYOTO','HOKKAIDO','TOKYO','JAPAN','NEW ZEALAND','NOMADO'];
    let W,H,cols,drops,speeds,glow,wordCol,dpr,fs=16,mouse={x:-1e4,y:-1e4},surge=0,running=false,last=0;
    function size(){
      dpr=Math.min(devicePixelRatio||1,1.5);
      const r=cv.getBoundingClientRect();W=r.width;H=r.height;
      cv.width=W*dpr;cv.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);
      fs=Math.max(12,Math.round(W/34));cols=Math.ceil(W/fs);
      drops=Array.from({length:cols},()=>Math.random()*-H/fs);
      speeds=Array.from({length:cols},()=>.6+Math.random()*.9);
      glow=new Float32Array(cols);wordCol={};
      ctx.fillStyle='#0A0A0A';ctx.fillRect(0,0,W,H);
    }
    function frame(t){
      if(!running)return;
      requestAnimationFrame(frame);
      if(t-last<33)return;last=t;
      ctx.fillStyle='rgba(10,10,10,.16)';ctx.fillRect(0,0,W,H);
      ctx.font=fs+'px "Hanken Grotesk","Noto Sans JP",monospace';ctx.textBaseline='top';
      const mr=fs*4;
      for(let i=0;i<cols;i++){
        const x=i*fs,y=drops[i]*fs;
        const d=Math.hypot(x+fs/2-mouse.x,y-mouse.y);
        const near=d<mr?1-d/mr:0;
        glow[i]=Math.max(glow[i]*.9,near,surge);
        // every column spells a keyword, then leaves a short gap, then the next one
        let wc=wordCol[i];
        if(!wc||wc.i>=wc.w.length){wc=wordCol[i]={w:words[(Math.random()*words.length)|0]+'   ',i:0};}
        const ch=wc.w[wc.i++];
        const g=glow[i];
        // trail glyph in yellow, head in white; nearby columns burn brighter
        ctx.fillStyle=g>.5?'#FFFFFF':g>0?`rgba(255,${200+g*55|0},120,${.6+g*.4})`:'rgba(232,182,55,.75)';
        ctx.fillText(ch,x,y);
        if(g>0){ctx.fillStyle=`rgba(232,182,55,${g*.25})`;ctx.fillRect(x,0,fs,H);}
        drops[i]+=speeds[i]*(1+g*2.5)+surge*2;
        if(y>H&&Math.random()>.965)drops[i]=Math.random()*-20;
      }
      surge*=.92;
    }
    function start(){if(running)return;running=true;requestAnimationFrame(frame);}
    function stop(){running=false;}
    size();
    new ResizeObserver(size).observe(cv);
    new IntersectionObserver(e=>e[0].isIntersecting?start():stop(),{threshold:.05}).observe(cv);
    cv.addEventListener('pointermove',e=>{const r=cv.getBoundingClientRect();mouse.x=e.clientX-r.left;mouse.y=e.clientY-r.top;});
    cv.addEventListener('pointerleave',()=>{mouse.x=mouse.y=-1e4;});
    cv.addEventListener('pointerdown',()=>{surge=1;});
    if(reduce){for(let k=0;k<40;k++)frame(k*40);stop();}
  })();

  const GS=SITE_BASE+'js/';
  function loadGsap(cb){
    if(window.gsap&&window.ScrollTrigger)return cb();
    const add=(f,done)=>{const sc=document.createElement('script');sc.src=GS+f;sc.onload=done;sc.onerror=()=>{console.warn('jameshirata: could not load '+GS+f+', showing the static site');cb();};document.head.appendChild(sc);};
    add('gsap.min.js',()=>add('ScrollTrigger.min.js',cb));
  }
  const phone=matchMedia('(max-width:800px)').matches;
  const loaderEl=document.getElementById('loader');
  setTimeout(()=>{const l=document.getElementById('loader');if(l&&!html.classList.contains('fx')){l.remove();html.classList.add('static');}},4000);
  if(phone||reduce){
    // phones: show everything at once and only fetch the animation library after the first touch or scroll
    loaderEl.remove();html.classList.add('static');
    if(!reduce){const go=()=>{['scroll','touchstart','pointerdown','keydown'].forEach(ev=>removeEventListener(ev,go));loadGsap(boot);};
      ['scroll','touchstart','pointerdown','keydown'].forEach(ev=>addEventListener(ev,go,{passive:true}));}
  } else loadGsap(boot);

  function boot(){
  const hasGsap=typeof gsap!=='undefined';
  if(hasGsap)gsap.registerPlugin(ScrollTrigger);
  if(!hasGsap||reduce){const l=document.getElementById('loader');if(l)l.remove();html.classList.add('static');return;}
  html.classList.remove('static');

  const loader=document.getElementById('loader');
  const rows=document.querySelectorAll('.part .hr');
  if(matchMedia('(max-width:800px)').matches)document.querySelectorAll('.part:not(.p1) .hr').forEach(r=>r.style.opacity=1);
  function reveal(){
    if(!hasGsap||reduce){html.classList.add('static');return;}
    const tl=gsap.timeline();
    tl.to(loader,{yPercent:-100,duration:.7,ease:'power4.inOut'});
    const vec=[[-60,-60],[60,60],[0,0],[0,0], [-60,-60],[60,-60],[60,60],[0,0], [0,60],[0,60],[0,-60],[-60,60], [60,-60],[0,0],[-60,60],[60,-60]];
    rows.forEach((r,i)=>{
      const [dx,dy]=vec[i%vec.length];
      if(!dx&&!dy){tl.set(r,{opacity:1},0.6);return;}
      tl.fromTo(r,{opacity:0,x:dx,y:dy},{opacity:1,x:0,y:0,duration:2,ease:'power4.out'},0.6);
    });
    tl.to('.lines i',{scaleY:1,duration:.9,stagger:.05,ease:'power3.out'},0.85)
      .to('#sun',{opacity:.35,duration:1.2},1.2);
  }
  if(!loader){rows.forEach(r=>r.style.opacity=1);gsap.set('.lines i',{scaleY:1});gsap.set('#sun',{opacity:.35});}
  else{
    const c={v:0};const cnt=document.getElementById('cnt'),pct=document.getElementById('pct');
    gsap.to(c,{v:100,duration:1.1,ease:'power2.inOut',onUpdate:()=>{cnt.textContent=pct.textContent=Math.round(c.v)},onComplete:reveal});
  }
  html.classList.add('fx');
  const idle=window.requestIdleCallback||(f=>setTimeout(f,120));
  idle(function(){

  /* custom cursor: dot follows tight, ring lags; ring grows on links, becomes a "view" badge on cases */
  const cur=document.getElementById('cur'),dot=cur.querySelector('.cur-dot'),ring=cur.querySelector('.cur-ring'),ctxt=cur.querySelector('.cur-txt');
  if(matchMedia('(pointer:fine)').matches){
    const qx=gsap.quickTo(ring,'x',{duration:.35,ease:'power3'}),qy=gsap.quickTo(ring,'y',{duration:.35,ease:'power3'});
    window.addEventListener('mousemove',e=>{gsap.set(dot,{x:e.clientX,y:e.clientY});qx(e.clientX);qy(e.clientY);});
    document.querySelectorAll('a,button').forEach(el=>{el.addEventListener('mouseenter',()=>cur.classList.add('hover'));el.addEventListener('mouseleave',()=>cur.classList.remove('hover'));});
    document.querySelectorAll('.case').forEach(c=>{c.addEventListener('mouseenter',()=>{ctxt.textContent=html.getAttribute('data-lang')==='ja'?'見る':'view';cur.classList.add('view');});c.addEventListener('mouseleave',()=>cur.classList.remove('view'));});
    const mcv=document.getElementById('matrix');if(mcv){mcv.addEventListener('mouseenter',()=>{cur.classList.remove('view');cur.classList.add('fine');});mcv.addEventListener('mouseleave',()=>{cur.classList.remove('fine');cur.classList.add('view');});}
  }

  /* mouse parallax on the hero */
  const sunEl=document.getElementById('sunwrap'),me=document.querySelector('.me');
  const sx=gsap.quickTo(sunEl,'x',{duration:1,ease:'power2'}),sy=gsap.quickTo(sunEl,'y',{duration:1,ease:'power2'});
  const mx=gsap.quickTo(me,'x',{duration:1,ease:'power2'}),my=gsap.quickTo(me,'y',{duration:1,ease:'power2'});
  const wall=document.querySelector('.wall');gsap.set(wall,{transformPerspective:1400});
  const rx=gsap.quickTo(wall,'rotationX',{duration:1.2,ease:'power2'}),ry=gsap.quickTo(wall,'rotationY',{duration:1.2,ease:'power2'});
  window.addEventListener('mousemove',e=>{
    if(window.scrollY>innerHeight)return;
    const nx=(e.clientX/innerWidth-.5),ny=(e.clientY/innerHeight-.5);
    sx(nx*-40);sy(ny*-40);mx(nx*14);my(ny*14);rx(ny*-4);ry(nx*4);
  },{passive:true});

  /* liquid distortion on hover (one shared filter) */
  const wT=document.getElementById('warpT'),wD=document.getElementById('warpD');const wv={f:0,s:0};
  function warp(el,on){
    document.querySelectorAll('.distort.warping').forEach(x=>x!==el&&x.classList.remove('warping'));
    el.classList.add('warping');
    gsap.to(wv,{f:on?.018:0,s:on?22:0,duration:on?.5:.6,ease:on?'power2.out':'power2.inOut',overwrite:true,
      onUpdate:()=>{wT.setAttribute('baseFrequency',`${wv.f} ${wv.f*2}`);wD.setAttribute('scale',wv.s);},
      onComplete:()=>{if(!on)el.classList.remove('warping');}});
  }
  document.querySelectorAll('.distort').forEach(el=>{el.addEventListener('mouseenter',()=>warp(el,true));el.addEventListener('mouseleave',()=>warp(el,false));});

  /* headings arrive letter by letter */
  function split(el){
    const walk=n=>{[...n.childNodes].forEach(c=>{
      if(c.nodeType===3&&c.textContent.trim()){const f=document.createDocumentFragment();[...c.textContent].forEach(ch=>{const sp=document.createElement('span');sp.className='ch';sp.textContent=ch===' '?' ':ch;f.appendChild(sp);});c.replaceWith(f);}
      else if(c.nodeType===1&&c.tagName!=='BR')walk(c);});};
    walk(el);
  }
  document.querySelectorAll('.h-big,.h-thin').forEach(h=>{
    if(h.closest('.numbers'))return;
    split(h);
    gsap.fromTo(h.querySelectorAll('.ch'),{yPercent:110,rotate:6,opacity:0},{yPercent:0,rotate:0,opacity:1,duration:1.1,stagger:.025,ease:'power4.out',scrollTrigger:{trigger:h,start:'top 88%',once:true}});
  });

  /* cases lean with scroll velocity, images drift */
  const wrap=document.querySelector('.cases .wrap');
  const skew=gsap.quickTo(wrap,'skewY',{duration:.6,ease:'power3'});
  ScrollTrigger.create({onUpdate:st=>skew(gsap.utils.clamp(-4,4,st.getVelocity()/-350))});


  const ot=document.getElementById('ovtext');
  if(ot){const phrase=()=>{const one=(ot.dataset[html.getAttribute('data-lang')]||ot.dataset.en).length;try{return ot.getSubStringLength(0,one);}catch(e){return 200;}};
    let tw;const run=()=>{if(tw)tw.kill();ot.setAttribute('startOffset',0);tw=gsap.to(ot,{attr:{startOffset:-phrase()},duration:6,repeat:-1,ease:'none'});};run();document.getElementById('langBtn').addEventListener('click',()=>setTimeout(run,50));}
  gsap.to('.hand',{rotation:180,ease:'none',scrollTrigger:{trigger:'.hand',start:'top 75%',end:'top 25%',scrub:true}});

  /* section titles and rules */
  document.querySelectorAll('[data-rule]').forEach(r=>{
    gsap.fromTo(r,{rotation:80,opacity:0},{rotation:0,opacity:.35,duration:1,ease:'power3.out',scrollTrigger:{trigger:r,start:'top 88%',once:true}});
  });
  document.querySelectorAll('.numbers .stack > *').forEach((el,i)=>{
    gsap.fromTo(el,{opacity:0,y:50},{opacity:1,y:0,duration:1.2,delay:i*.15,ease:'power3.out',scrollTrigger:{trigger:'.numbers',start:'top 75%',once:true}});
  });
  document.querySelectorAll('.row .ln').forEach((ln,i)=>{
    gsap.to(ln,{scaleX:1,duration:1,ease:'power3.out',scrollTrigger:{trigger:ln.parentElement,start:'top 92%',once:true}});
  });
  document.querySelectorAll('[data-count]').forEach(el=>{
    const end=+el.dataset.count, suffix=el.textContent.replace(/[0-9]/g,'');const o={v:0};
    ScrollTrigger.create({trigger:el,start:'top 90%',once:true,onEnter:()=>gsap.to(o,{v:end,duration:1.4,ease:'power3.out',onUpdate:()=>el.textContent=Math.round(o.v)+suffix})});
  });
  document.querySelectorAll('.case').forEach(c=>{
    gsap.fromTo(c,{opacity:0,y:60},{opacity:1,y:0,duration:1.2,ease:'power3.out',scrollTrigger:{trigger:c,start:'top 90%',once:true}});
    const im=c.querySelector('.case-img img');
    if(im)gsap.fromTo(im,{yPercent:-6},{yPercent:6,ease:'none',scrollTrigger:{trigger:c,start:'top bottom',end:'bottom top',scrub:true}});
  });
  document.querySelectorAll('.contact .big .l').forEach((l,i)=>{
    gsap.fromTo(l,{opacity:0,y:40},{opacity:1,y:0,duration:1.2,delay:i*.12,ease:'power3.out',scrollTrigger:{trigger:'.contact',start:'top 70%',once:true}});
  });
  },{timeout:1500});
  }
});