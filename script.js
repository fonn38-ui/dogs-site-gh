/* PAWS HAVEN — script.js v6 (полная версия) */
(function(){
  "use strict";

  function escapeHtml(s){return String(s).replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[m]);}

  // ===== Загрузка фото: placedog.net + Unsplash + локалка =====
  const LOCAL_FALLBACK = [
    "assets/breeds/husky_1.jpg","assets/breeds/corgi_1.jpg","assets/breeds/collie_2.jpg",
    "assets/breeds/collie_3.jpg","assets/breeds/retriever_2.jpg",
    "assets/gallery/jackrussell.jpg","assets/gallery/cavalier.jpg"
  ];

  function pad(n){return String(n).padStart(3,"0");}

  // пытаемся placedog.net — 3 попытки (id 50-180)
  async function tryPlacedog(w, h, seed){
    const id = (seed % 150) + 50;
    const url = `https://placedog.net/${w}/${h}?id=${id}&t=${Date.now()}`;
    return await tryImg(url, 4500);
  }
  async function tryImg(url, timeout=5000){
    return new Promise(res=>{
      const img = new Image();
      let done=false;
      const ok=()=>{if(done)return;done=true;res(img.src);};
      const fail=()=>{if(done)return;done=true;res(null);};
      img.onload=()=>{ if(img.naturalWidth>50) ok(); else fail(); };
      img.onerror=fail;
      img.src=url;
      setTimeout(fail,timeout);
    });
  }
  async function localFallback(seed=0){
    const pick = LOCAL_FALLBACK[seed % LOCAL_FALLBACK.length];
    const r = await tryImg(pick, 3000);
    return r || pick;
  }
  async function getPhoto(seed=0, w=1200, h=800){
    const u = await tryPlacedog(w, h, seed*7+1);
    if (u) return u;
    return await localFallback(seed);
  }

  // ===== HERO КИНО-СЛАЙДЕР =====
  async function setupHeroCinema(){
    const frames = document.querySelectorAll(".hero-frame");
    const thumbs = document.getElementById("heroThumbs");
    let cur = 0;
    const urls = [];
    for(let i=0;i<frames.length;i++){
      const url = await getPhoto(i*5+1, 1600, 1000);
      urls.push(url);
      const img = document.createElement("img");
      img.src=url; img.alt="Собака";
      frames[i].querySelector(".hero-loader")?.remove();
      frames[i].appendChild(img);
      if (thumbs){
        const t=document.createElement("button");
        t.className="hero-thumb"+(i===0?" active":"");
        t.style.backgroundImage=`url(${url})`;
        t.dataset.i=i;
        thumbs.appendChild(t);
      }
    }
    frames[0].classList.add("active");
    let timer=setInterval(tick,3800);
    function tick(){
      const next=(cur+1)%frames.length;
      frames[cur].classList.remove("active");
      frames[next].classList.add("active");
      thumbs?.querySelectorAll(".hero-thumb").forEach((t,j)=>t.classList.toggle("active", j===next));
      cur=next;
    }
    const hero=document.querySelector(".hero");
    hero.addEventListener("mouseenter",()=>clearInterval(timer));
    hero.addEventListener("mouseleave",()=>{timer=setInterval(tick,3800)});
    thumbs?.addEventListener("click",e=>{
      const t=e.target.closest(".hero-thumb"); if(!t) return;
      const i=parseInt(t.dataset.i,10);
      frames[cur].classList.remove("active");
      frames[i].classList.add("active");
      thumbs.querySelectorAll(".hero-thumb").forEach((t2,j)=>t2.classList.toggle("active", j===i));
      cur=i;
    });
    hero.addEventListener("mousemove",e=>{
      const r=hero.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-0.5;
      const y=(e.clientY-r.top)/r.height-0.5;
      const active=hero.querySelector(".hero-frame.active img");
      if(active) active.style.transform=`translate(${x*-20}px, ${y*-20}px) scale(1.16)`;
    });
    hero.addEventListener("mouseleave",()=>{
      const active=hero.querySelector(".hero-frame.active img");
      if(active) active.style.transform="";
    });
  }

  // ===== FEATURES фото =====
  async function setupFeaturePhotos(){
    const slots = document.querySelectorAll("[data-photo^='card-']");
    for(let i=0;i<slots.length;i++){
      const slot=slots[i];
      const url = await getPhoto(i*7+11, 800, 450);
      const img=document.createElement("img");
      img.src=url; img.alt=""; img.loading="lazy";
      img.onload=()=>{img.classList.add("loaded");slot.querySelector(".story-img-shimmer")?.remove();};
      slot.appendChild(img);
    }
  }

  // ===== ABOUT SIDE PHOTO =====
  async function setupAboutPhoto(){
    const slot=document.querySelector("[data-photo='about-side']");
    if(!slot) return;
    const url=await getPhoto(99, 1000, 750);
    const img=document.createElement("img");
    img.src=url; img.alt="";
    img.onload=()=>img.classList.add("loaded");
    slot.appendChild(img);
    let n=0;
    setInterval(async()=>{
      n++;
      const newUrl=await getPhoto(99+n*11, 1000, 750);
      img.style.opacity=0;
      setTimeout(()=>{
        img.onload=()=>{img.style.opacity=1};
        img.src=newUrl;
      },600);
    }, 8000);
  }

  // ===== LOCATION PHOTO =====
  async function setupLocationPhoto(){
    const slot=document.querySelector("[data-photo='location']");
    if(!slot) return;
    const url=await getPhoto(151, 1000, 1250);
    const img=document.createElement("img");
    img.src=url; img.alt="";
    img.onload=()=>img.classList.add("loaded");
    slot.appendChild(img);
  }

  // ====== PROCESS STEPS (4 шага) ======
  function renderProcess(){
    const grid=document.getElementById("processGrid");
    if(!grid) return;
    grid.innerHTML = window.PAWS.processSteps.map(s=>`
      <article class="process-step reveal">
        <span class="step-num">${escapeHtml(s.n)}</span>
        <span class="step-icon">${s.icon}</span>
        <h4>${escapeHtml(s.title)}</h4>
        <p>${escapeHtml(s.text)}</p>
      </article>
    `).join("");
  }

  // ====== DAY TIMELINE ======
  function renderDayTimeline(){
    const host=document.getElementById("dayTimeline");
    if(!host) return;
    host.innerHTML = window.PAWS.daySchedule.map(d=>`
      <div class="day-item reveal">
        <div class="day-time">${escapeHtml(d.time)}</div>
        <div class="day-content">
          <h4><span class="emoji">${d.emoji}</span>${escapeHtml(d.title)}</h4>
          <p>${escapeHtml(d.text)}</p>
        </div>
      </div>
    `).join("");
  }

  // ====== NO-GO ======
  function renderNoGo(){
    const grid=document.getElementById("nogoGrid");
    if(!grid) return;
    grid.innerHTML = window.PAWS.noGo.map(n=>`
      <article class="nogo-card reveal">
        <div class="nogo-icon">${n.icon}</div>
        <div>
          <h4>${escapeHtml(n.title)}</h4>
          <p>${escapeHtml(n.text)}</p>
        </div>
      </article>
    `).join("");
  }

  // ====== SERVICES (с фото и иконкой) ======
  async function renderServices(){
    const grid=document.getElementById("servicesGrid");
    if(!grid) return;
    grid.innerHTML = window.PAWS.services.map((s,i)=>`
      <article class="service-card reveal">
        <div class="service-photo" data-service-photo="${i}"></div>
        <div class="service-body">
          <span class="service-icon">${s.icon}</span>
          <h4>${escapeHtml(s.title)}</h4>
          <p>${escapeHtml(s.text)}</p>
        </div>
      </article>
    `).join("");
    for(let i=0;i<window.PAWS.services.length;i++){
      const slot=document.querySelector(`[data-service-photo="${i}"]`);
      if(!slot) continue;
      slot.innerHTML = `<div class="story-img-shimmer"></div>`;
      const url = await getPhoto(i*13+5, 600, 360);
      const img=document.createElement("img");
      img.src=url; img.alt=""; img.loading="lazy";
      img.onload=()=>{img.classList.add("loaded");slot.querySelector(".story-img-shimmer")?.remove();};
      slot.appendChild(img);
    }
  }

  // ====== STORIES ======
  let currentStory=0;
  async function renderStories(){
    const grid=document.getElementById("storiesGrid");
    if(!grid) return;
    const all=window.PAWS.stories;

    const htmlPromises = all.map(async(s,i)=>{
      const url=await getPhoto(i*17+3, 800, 640);
      return `
        <article class="story-card reveal" data-i="${i}">
          <div class="story-img">
            <img src="${url}" alt="${escapeHtml(s.name)}" loading="lazy">
          </div>
          <div class="story-body">
            <h4>${escapeHtml(s.name)}</h4>
            <div class="story-breed">${escapeHtml(s.breed)}</div>
            <p class="story-text">${escapeHtml(s.text)}</p>
            <div class="story-meta">
              <span class="story-days">📅 ${s.days} дней</span>
              <button class="story-read" data-i="${i}">Читать историю →</button>
            </div>
          </div>
        </article>`;
    });
    grid.innerHTML=(await Promise.all(htmlPromises)).join("");
    grid.querySelectorAll(".story-img img").forEach(img=>{
      if(img.complete){img.classList.add("loaded")}
      else img.addEventListener("load",()=>img.classList.add("loaded"));
    });

    const count=document.getElementById("storiesCount");
    const update=()=>{
      const i=((currentStory%all.length)+all.length)%all.length;
      count.textContent=`${pad(i+1)} / ${pad(all.length)}`;
      grid.querySelectorAll(".story-card").forEach((c,j)=>c.style.borderColor=j===i?"var(--accent)":"");
    };
    document.getElementById("storiesPrev").addEventListener("click",()=>{currentStory--;update();});
    document.getElementById("storiesNext").addEventListener("click",()=>{currentStory++;update();});
    grid.addEventListener("click",e=>{
      const r=e.target.closest(".story-read");
      if(r){e.preventDefault();openLightbox(parseInt(r.dataset.i,10));return;}
      const c=e.target.closest(".story-card");
      if(c) openLightbox(parseInt(c.dataset.i,10));
    });
    update();
  }

  // ====== LIGHTBOX ======
  async function openLightbox(i){
    const s=window.PAWS.stories[i];
    if(!s) return;
    const box=document.getElementById("lightbox");
    const content=document.getElementById("lightboxContent");
    content.innerHTML=`
      <div class="lb-img"><div class="lb-img-shimmer"></div></div>
      <div class="lb-body">
        <h3>${escapeHtml(s.name)}</h3>
        <div class="lb-breed">${escapeHtml(s.breed)}</div>
        <p class="lb-quote">«${escapeHtml(s.text)}»</p>
        <div class="lb-meta">
          <span class="story-days">📅 ${s.days} дней под нашей крышей</span>
          <a class="story-read" href="#contact">Записаться →</a>
        </div>
      </div>`;
    box.classList.add("open");
    box.dataset.i=i;
    document.body.style.overflow="hidden";
    const slot=box.querySelector(".lb-img");
    const url = await getPhoto(i*23+11, 800, 800);
    const img=document.createElement("img");
    img.src=url; img.alt=escapeHtml(s.name);
    img.onload=()=>{img.classList.add("loaded");slot.querySelector(".lb-img-shimmer")?.remove();};
    slot.appendChild(img);
  }
  function closeLightbox(){
    document.getElementById("lightbox").classList.remove("open");
    document.body.style.overflow="";
  }
  function navLightbox(dir){
    const box=document.getElementById("lightbox");
    const i=(parseInt(box.dataset.i,10)+dir+window.PAWS.stories.length)%window.PAWS.stories.length;
    openLightbox(i);
  }
  function setupLightbox(){
    document.getElementById("lightboxClose").addEventListener("click",closeLightbox);
    document.getElementById("lightboxPrev").addEventListener("click",()=>navLightbox(-1));
    document.getElementById("lightboxNext").addEventListener("click",()=>navLightbox(1));
    document.getElementById("lightbox").addEventListener("click",e=>{if(e.target.id==="lightbox") closeLightbox()});
    document.addEventListener("keydown",e=>{
      if(!document.getElementById("lightbox").classList.contains("open")) return;
      if(e.key==="Escape") closeLightbox();
      if(e.key==="ArrowLeft") navLightbox(-1);
      if(e.key==="ArrowRight") navLightbox(1);
    });
  }

  // ====== REVIEWS ======
  function renderReviews(){
    const grid=document.getElementById("reviewsGrid");
    if(!grid) return;
    grid.innerHTML = window.PAWS.testimonials.map(t=>{
      const initials = t.name.split(" ").map(s=>s[0]).join("");
      return `
        <article class="review-card reveal">
          <div class="review-stars">★ ★ ★ ★ ★</div>
          <p class="review-text">${escapeHtml(t.text)}</p>
          <div class="review-author">
            <div class="review-avatar">${escapeHtml(initials)}</div>
            <div>
              <div class="review-name">${escapeHtml(t.name)}</div>
              <div class="review-dog">${escapeHtml(t.dog)}</div>
            </div>
          </div>
        </article>`;
    }).join("");
  }

  // ====== TEAM ======
  function renderTeam(){
    const grid=document.getElementById("teamGrid");
    if(!grid) return;
    grid.innerHTML = window.PAWS.team.map(m=>{
      const initials = m.name.split(" ").map(s=>s[0]).join("");
      return `
        <article class="team-card reveal">
          <div class="team-avatar">${escapeHtml(initials)}</div>
          <h4>${escapeHtml(m.name)}</h4>
          <div class="team-role">${escapeHtml(m.role)}</div>
          <p class="team-bio">${escapeHtml(m.bio)}</p>
        </article>`;
    }).join("");
  }

  // ====== LOCATION ======
  function renderLocation(){
    const L=window.PAWS.location;
    if(!document.getElementById("location")) return;
    document.getElementById("loc-address").textContent=L.address;
    document.getElementById("loc-nearest").textContent=L.nearest;
    document.getElementById("loc-metro").textContent=L.metro;
    document.getElementById("loc-parking").textContent=L.parking;
    document.getElementById("loc-features").innerHTML = L.features.map(f=>`<li>${escapeHtml(f)}</li>`).join("");
  }

  // ====== FAQ ======
  function renderFaq(){
    const list=document.getElementById("faqList");
    if(!list) return;
    list.innerHTML = window.PAWS.faq.map((f,i)=>`
      <details class="faq-item reveal">
        <summary class="faq-q">${escapeHtml(f.q)}</summary>
        <div class="faq-a">${escapeHtml(f.a)}</div>
      </details>
    `).join("");
  }

  // ====== MARQUEE с фото ======
  async function setupMarqueePhotos(){
    const track1=document.getElementById("marqueePhotos");
    const track2=document.getElementById("marqueePhotos2");
    if(!track1||!track2) return;
    const emojis=["🐕","🐶","🐾","🦴","🐕‍🦺","🐩","🐶","🐕","🐾","🦮"];

    async function build(host){
      const track=document.createElement("div");
      track.className="marquee-track-photos";
      const imgs=[];
      for(let i=0;i<14;i++){
        const url=await getPhoto(i*11+50, 600, 420);
        imgs.push(url);
      }
      const html = imgs.concat(imgs).map((u,i)=>{
        const e = emojis[i%emojis.length];
        return `<div class="marquee-photo">
          <div class="placeholder">${e}</div>
          <img src="${u}" alt="" loading="lazy">
        </div>`;
      }).join("");
      track.innerHTML=html;
      track.querySelectorAll("img").forEach(img=>{
        if(img.complete) img.classList.add("loaded");
        else img.addEventListener("load",()=>{
          img.classList.add("loaded");
          img.previousElementSibling?.remove();
        });
      });
      host.appendChild(track);
    }
    build(track1); build(track2);
  }

  // ====== PARTNERS ======
  function renderPartners(){
    const grid=document.getElementById("partnersGrid");
    if(!grid) return;
    grid.innerHTML = window.PAWS.partners.map(p=>`<div class="partner-card reveal">${escapeHtml(p)}</div>`).join("");
  }

  // ====== FORM ======
  function setupForm(){
    const form=document.getElementById("contactForm");
    if(!form) return;
    form.addEventListener("submit",e=>{
      e.preventDefault();
      const data=Object.fromEntries(new FormData(form).entries());
      alert(`Спасибо, ${data.name}!\n\nЗаявка на ${escapeHtml(data.format)} для «${escapeHtml(data.dog||"собаки")}».\nПерезвоним в течение часа на ${escapeHtml(data.phone)}.`);
      form.reset();
    });
  }

  // ====== HEADER ======
  function setupHeader(){
    const h=document.getElementById("site-header");
    if(!h) return;
    window.addEventListener("scroll",()=>h.classList.toggle("scrolled",window.scrollY>60));
  }

  // ====== REVEAL ======
  function setupReveal(){
    const items=document.querySelectorAll(".reveal, .feature-card, .service-card, .metric-card, .story-card, .partner-card, .stories-tag-cloud .tag, .process-step, .day-item, .nogo-card, .review-card, .team-card, .faq-item");
    items.forEach(i=>i.classList.add("reveal"));
    const io=new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          e.target.classList.add("visible");
          io.unobserve(e.target);
        }
      });
    },{threshold:0.12});
    items.forEach(i=>io.observe(i));
  }

  // ====== COUNT-UP ======
  function setupCountUp(){
    const els=document.querySelectorAll("[data-count]");
    const io=new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          const el=e.target;
          const target=parseInt(el.dataset.count,10)||0;
          const dur=900; const t0=performance.now();
          const tick=(t)=>{
            const p=Math.min((t-t0)/dur,1);
            el.textContent=Math.floor(target*(1-Math.pow(1-p,3)));
            if(p<1) requestAnimationFrame(tick);
            else el.textContent=target;
          };
          requestAnimationFrame(tick);
          io.unobserve(el);
        }
      });
    },{threshold:0.5});
    els.forEach(i=>io.observe(i));
  }

  // ====== BURGER ======
  function setupBurger(){
    const btn=document.querySelector(".burger");
    const top=document.querySelector(".header");
    if(!btn||!top) return;
    btn.addEventListener("click",()=>top.classList.toggle("mobile-open"));
    document.querySelectorAll(".nav a").forEach(a=>a.addEventListener("click",()=>top.classList.remove("mobile-open")));
  }

  // ====== START ======
  document.addEventListener("DOMContentLoaded", async()=>{
    setupHeader();
    setupBurger();
    setupLightbox();
    setupReveal();
    setupCountUp();
    setupForm();
    renderPartners();
    renderProcess();
    renderDayTimeline();
    renderNoGo();
    renderReviews();
    renderTeam();
    renderFaq();
    renderLocation();

    await setupHeroCinema();
    await renderStories();
    await renderServices();
    await setupFeaturePhotos();
    await setupAboutPhoto();
    await setupLocationPhoto();
    await setupMarqueePhotos();

    console.log("🐾 Paws Haven v6 loaded (full version).");
  });
})();
