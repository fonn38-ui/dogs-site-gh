/* PAWS HAVEN — script.js v7 (видимо всё, даже без фото и JS) */
(function(){
  "use strict";

  function esc(s){return String(s).replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[m]);}
  function pad(n){return String(n).padStart(3,"0");}

  // =================== СЕРВИС ФОТО (быстрый + 2-стоп fallback) ===================
  // Picsum: 99% uptime, быстрый, не блокирует
  // placedog: медленный но собачий
  // Локалка: гарантия
  // Таймаут короткий — 1.8s, потом fallback
  const LOCAL = [
    "assets/breeds/husky_1.jpg","assets/breeds/corgi_1.jpg","assets/breeds/collie_2.jpg",
    "assets/breeds/collie_3.jpg","assets/breeds/retriever_2.jpg",
    "assets/gallery/jackrussell.jpg","assets/gallery/cavalier.jpg"
  ];
  const DOGS = [
    "https://placedog.net/640/480?id=82","https://placedog.net/640/480?id=137","https://placedog.net/640/480?id=108",
    "https://placedog.net/640/480?id=55","https://placedog.net/640/480?id=171","https://placedog.net/640/480?id=29",
    "https://placedog.net/640/480?id=66","https://placedog.net/640/480?id=144"
  ];

  function tryImg(url, timeout){
    return new Promise(res=>{
      const img=new Image();
      let done=false;
      const ok=()=>{if(!done&&img.naturalWidth>40){done=true;res(img.src);}};
      const fail=()=>{if(!done){done=true;res(null);}};
      img.onload=ok; img.onerror=fail;
      img.src=url;
      setTimeout(fail,timeout);
    });
  }

  // ПАРАЛЛЕЛЬНАЯ загрузка всех попыток, возвращаем первый успешный
  function raceImg(urls, timeout){
    return new Promise(res=>{
      let answered=false;
      const finalize=(v)=>{if(!answered){answered=true;res(v);}};
      const try1=(u)=>tryImg(u, timeout).then(v=>v&&finalize(v));
      urls.forEach(try1);
      // Гарантированный fallback по таймауту
      setTimeout(()=>finalize(null), timeout+200);
    });
  }

  async function getPhoto(seed, w, h){
    const idx=Math.abs(seed*7+3)%DOGS.length;
    const placedogUrl = `${DOGS[idx]}&t=${seed}`; // ignored by server
    const picsumUrl   = `https://picsum.photos/seed/dog${seed}/${w}/${h}`;
    const localUrl    = LOCAL[seed%LOCAL.length];
    // Picsum обычно быстрее — пробуем его первым
    const got = await raceImg([picsumUrl, placedogUrl, localUrl], 2200);
    if (got) return got;
    return localUrl; // Гарантированный последний резерв
  }

  // =================== HERO КИНО ===================
  async function setupHeroCinema(){
    const frames = document.querySelectorAll(".hero-frame");
    const thumbs = document.getElementById("heroThumbs");
    if (!frames.length) return;
    let cur = 0;

    // Запускаем загрузку фото ПАРАЛЛЕЛЬНО
    const urls = await Promise.all(
      [...frames].map((_,i)=>getPhoto(i*5+1, 1600, 1000))
    );

    [...frames].forEach((f,i)=>{
      f.querySelector(".hero-loader")?.remove();
      const img=document.createElement("img");
      img.src=urls[i]; img.alt="Собака";
      if (urls[i]) img.classList.add("loaded");
      f.appendChild(img);
      if (thumbs){
        const t=document.createElement("button");
        t.className="hero-thumb"+(i===0?" active":"");
        t.style.backgroundImage=`url(${urls[i]})`;
        t.dataset.i=i;
        thumbs.appendChild(t);
      }
    });
    frames[0].classList.add("active");
    const tick=()=>{
      const next=(cur+1)%frames.length;
      frames[cur].classList.remove("active");
      frames[next].classList.add("active");
      thumbs?.querySelectorAll(".hero-thumb").forEach((t,j)=>t.classList.toggle("active", j===next));
      cur=next;
    };
    let timer=setInterval(tick,3800);
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

  // =================== УНИВЕРСАЛЬНЫЙ СЕТ ФОТО ===================
  async function fillPhotos(selector, seedOffset, w, h){
    const slots=document.querySelectorAll(selector);
    if (!slots.length) return;
    // Параллельно
    await Promise.all([...slots].map(async(s,i)=>{
      const url=await getPhoto(i+seedOffset, w, h);
      const img=document.createElement("img");
      img.src=url; img.alt=""; img.loading="lazy";
      img.classList.add("loaded");
      s.appendChild(img);
      s.querySelector(".story-img-shimmer, .lb-img-shimmer, .placeholder")?.remove();
    }));
  }

  // =================== RENDER STATIC ===================
  function renderProcess(){
    const grid=document.getElementById("processGrid");
    if(!grid) return;
    grid.innerHTML = window.PAWS.processSteps.map(s=>`
      <article class="process-step visible">
        <span class="step-num">${esc(s.n)}</span>
        <span class="step-icon">${s.icon}</span>
        <h4>${esc(s.title)}</h4>
        <p>${esc(s.text)}</p>
      </article>`).join("");
  }
  function renderDayTimeline(){
    const host=document.getElementById("dayTimeline");
    if(!host) return;
    host.innerHTML = window.PAWS.daySchedule.map(d=>`
      <div class="day-item visible">
        <div class="day-time">${esc(d.time)}</div>
        <div class="day-content">
          <h4><span class="emoji">${d.emoji}</span>${esc(d.title)}</h4>
          <p>${esc(d.text)}</p>
        </div>
      </div>`).join("");
  }
  function renderNoGo(){
    const grid=document.getElementById("nogoGrid");
    if(!grid) return;
    grid.innerHTML = window.PAWS.noGo.map(n=>`
      <article class="nogo-card visible">
        <div class="nogo-icon">${n.icon}</div>
        <div>
          <h4>${esc(n.title)}</h4>
          <p>${esc(n.text)}</p>
        </div>
      </article>`).join("");
  }
  function renderReviews(){
    const grid=document.getElementById("reviewsGrid");
    if(!grid) return;
    grid.innerHTML = window.PAWS.testimonials.map(t=>{
      const initials = t.name.split(" ").map(s=>s[0]).join("");
      return `
        <article class="review-card visible">
          <div class="review-stars">★ ★ ★ ★ ★</div>
          <p class="review-text">${esc(t.text)}</p>
          <div class="review-author">
            <div class="review-avatar">${esc(initials)}</div>
            <div>
              <div class="review-name">${esc(t.name)}</div>
              <div class="review-dog">${esc(t.dog)}</div>
            </div>
          </div>
        </article>`;
    }).join("");
  }
  function renderTeam(){
    const grid=document.getElementById("teamGrid");
    if(!grid) return;
    grid.innerHTML = window.PAWS.team.map(m=>{
      const initials = m.name.split(" ").map(s=>s[0]).join("");
      return `
        <article class="team-card visible">
          <div class="team-avatar">${esc(initials)}</div>
          <h4>${esc(m.name)}</h4>
          <div class="team-role">${esc(m.role)}</div>
          <p class="team-bio">${esc(m.bio)}</p>
        </article>`;
    }).join("");
  }
  function renderFaq(){
    const list=document.getElementById("faqList");
    if(!list) return;
    list.innerHTML = window.PAWS.faq.map(f=>`
      <details class="faq-item visible">
        <summary class="faq-q">${esc(f.q)}</summary>
        <div class="faq-a">${esc(f.a)}</div>
      </details>`).join("");
  }
  function renderLocation(){
    const L=window.PAWS.location;
    if(!document.getElementById("location")) return;
    document.getElementById("loc-address").textContent=L.address;
    document.getElementById("loc-nearest").textContent=L.nearest;
    document.getElementById("loc-metro").textContent=L.metro;
    document.getElementById("loc-parking").textContent=L.parking;
    document.getElementById("loc-features").innerHTML = L.features.map(f=>`<li>${esc(f)}</li>`).join("");
  }
  function renderPartners(){
    const grid=document.getElementById("partnersGrid");
    if(!grid) return;
    grid.innerHTML = window.PAWS.partners.map(p=>`<div class="partner-card visible">${esc(p)}</div>`).join("");
  }
  function renderServices(){
    const grid=document.getElementById("servicesGrid");
    if(!grid) return;
    grid.innerHTML = window.PAWS.services.map((s,i)=>`
      <article class="service-card visible">
        <div class="service-photo" data-service-photo="${i}"><div class="placeholder">${s.icon}</div></div>
        <div class="service-body">
          <span class="service-icon">${s.icon}</span>
          <h4>${esc(s.title)}</h4>
          <p>${esc(s.text)}</p>
        </div>
      </article>`).join("");
  }

  // =================== STORIES ===================
  let currentStory=0;
  async function renderStories(){
    const grid=document.getElementById("storiesGrid");
    if(!grid) return;
    const all=window.PAWS.stories;

    // СНАЧАЛА рендерим HTML (видимое), параллельно фото
    grid.innerHTML = all.map((s,i)=>`
      <article class="story-card visible" data-i="${i}">
        <div class="story-img" data-story-photo="${i}"><div class="placeholder">${s.name.charAt(0)}</div></div>
        <div class="story-body">
          <h4>${esc(s.name)}</h4>
          <div class="story-breed">${esc(s.breed)}</div>
          <p class="story-text">${esc(s.text)}</p>
          <div class="story-meta">
            <span class="story-days">📅 ${s.days} дней</span>
            <button class="story-read" data-i="${i}">Читать историю →</button>
          </div>
        </div>
      </article>`).join("");

    // Параллельная загрузка фото
    fillPhotos("[data-story-photo]", 100, 800, 640);

    const count=document.getElementById("storiesCount");
    const update=()=>{
      const i=((currentStory%all.length)+all.length)%all.length;
      count.textContent=`${pad(i+1)} / ${pad(all.length)}`;
      grid.querySelectorAll(".story-card").forEach((c,j)=>c.style.borderColor=j===i?"var(--accent)":"");
    };
    document.getElementById("storiesPrev")?.addEventListener("click",()=>{currentStory--;update();});
    document.getElementById("storiesNext")?.addEventListener("click",()=>{currentStory++;update();});
    grid.addEventListener("click",e=>{
      const r=e.target.closest(".story-read");
      if(r){e.preventDefault();openLightbox(parseInt(r.dataset.i,10));return;}
      const c=e.target.closest(".story-card");
      if(c) openLightbox(parseInt(c.dataset.i,10));
    });
    update();
  }

  // =================== LIGHTBOX ===================
  async function openLightbox(i){
    const s=window.PAWS.stories[i];
    if(!s) return;
    const box=document.getElementById("lightbox");
    const content=document.getElementById("lightboxContent");
    content.innerHTML=`
      <div class="lb-img" data-lb-photo><div class="placeholder">${s.name.charAt(0)}</div></div>
      <div class="lb-body">
        <h3>${esc(s.name)}</h3>
        <div class="lb-breed">${esc(s.breed)}</div>
        <p class="lb-quote">«${esc(s.text)}»</p>
        <div class="lb-meta">
          <span class="story-days">📅 ${s.days} дней под нашей крышей</span>
          <a class="story-read" href="#contact">Записаться →</a>
        </div>
      </div>`;
    box.classList.add("open");
    box.dataset.i=i;
    document.body.style.overflow="hidden";
    fillPhotos("[data-lb-photo]", i*23+11, 800, 800);
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
    document.getElementById("lightboxClose")?.addEventListener("click",closeLightbox);
    document.getElementById("lightboxPrev")?.addEventListener("click",()=>navLightbox(-1));
    document.getElementById("lightboxNext")?.addEventListener("click",()=>navLightbox(1));
    document.getElementById("lightbox")?.addEventListener("click",e=>{if(e.target.id==="lightbox") closeLightbox()});
    document.addEventListener("keydown",e=>{
      if(!document.getElementById("lightbox")?.classList.contains("open")) return;
      if(e.key==="Escape") closeLightbox();
      if(e.key==="ArrowLeft") navLightbox(-1);
      if(e.key==="ArrowRight") navLightbox(1);
    });
  }

  // =================== MARQUEE ФОТО ===================
  async function setupMarqueePhotos(){
    const track1=document.getElementById("marqueePhotos");
    const track2=document.getElementById("marqueePhotos2");
    if(!track1||!track2) return;
    const emojis=["🐕","🐶","🐾","🦴","🐕‍🦺","🐩","🦮","💛"];

    // Параллельно — сразу 28 фото
    const all = await Promise.all(
      [...Array(14)].map((_,i)=>getPhoto(i*11+50, 600, 420))
    );
    const build=(host)=>{
      const track=document.createElement("div");
      track.className="marquee-track-photos";
      track.innerHTML = all.concat(all).map((u,i)=>{
        const e = emojis[i%emojis.length];
        return `<div class="marquee-photo">
          <div class="placeholder">${e}</div>
          <img src="${u}" alt="" loading="lazy" class="loaded">
        </div>`;
      }).join("");
      host.appendChild(track);
    };
    build(track1); build(track2);
  }

  // =================== SERVICES PHOTO ===================
  async function setupServicePhotos(){
    const slots=document.querySelectorAll("[data-service-photo]");
    if (!slots.length) return;
    await Promise.all([...slots].map(async(s,i)=>{
      const url=await getPhoto(i*13+5, 600, 360);
      const img=document.createElement("img");
      img.src=url; img.alt=""; img.loading="lazy";
      img.classList.add("loaded");
      s.appendChild(img);
      s.querySelector(".placeholder")?.remove();
    }));
  }

  // =================== ABOUT PHOTO (ротация) ===================
  async function setupAboutPhoto(){
    const slot=document.querySelector("[data-photo='about-side']");
    if(!slot) return;
    const url=await getPhoto(99, 1000, 750);
    const img=document.createElement("img");
    img.src=url; img.alt="";
    img.classList.add("loaded");
    slot.appendChild(img);
    let n=0;
    setInterval(async()=>{
      n++;
      const newUrl=await getPhoto(99+n*11, 1000, 750);
      img.style.opacity=0;
      setTimeout(()=>{img.src=newUrl;img.style.opacity=1;},600);
    }, 8000);
  }

  // =================== LOCATION PHOTO ===================
  async function setupLocationPhoto(){
    const slot=document.querySelector("[data-photo='location']");
    if(!slot) return;
    const url=await getPhoto(151, 1000, 1250);
    const img=document.createElement("img");
    img.src=url; img.alt="";
    img.classList.add("loaded");
    slot.appendChild(img);
  }

  // =================== FORM ===================
  function setupForm(){
    const form=document.getElementById("contactForm");
    if(!form) return;
    form.addEventListener("submit",e=>{
      e.preventDefault();
      const data=Object.fromEntries(new FormData(form).entries());
      alert(`Спасибо, ${data.name}!\n\nЗаявка на ${esc(data.format)} для «${esc(data.dog||"собаки")}».\nПерезвоним в течение часа на ${esc(data.phone)}.`);
      form.reset();
    });
  }

  // =================== HEADER / BURGER ===================
  function setupHeader(){
    const h=document.getElementById("site-header");
    if(!h) return;
    window.addEventListener("scroll",()=>h.classList.toggle("scrolled",window.scrollY>60));
  }
  function setupBurger(){
    const btn=document.querySelector(".burger");
    const top=document.querySelector(".header");
    if(!btn||!top) return;
    btn.addEventListener("click",()=>top.classList.toggle("mobile-open"));
    document.querySelectorAll(".nav a").forEach(a=>a.addEventListener("click",()=>top.classList.remove("mobile-open")));
  }

  // =================== COUNT-UP (count от финального числа в HTML) ===================
  function setupCountUp(){
    const els=document.querySelectorAll("[data-count]");
    if (!els.length) return;
    // Сначала убедимся что HTML содержит финальное значение (на случай если в разметке был "0")
    els.forEach(el=>{
      const target=parseInt(el.dataset.count,10)||0;
      el.textContent=target; // показываем сразу финальное
    });
    // Анимируем от 0 до target при появлении в viewport
    const animate=(el)=>{
      const target=parseInt(el.dataset.count,10)||0;
      if (target<=0) return;
      el.textContent=0;
      const dur=1200; const t0=performance.now();
      const tick=(t)=>{
        const p=Math.min((t-t0)/dur,1);
        el.textContent=Math.floor(target*(1-Math.pow(1-p,3)));
        if(p<1) requestAnimationFrame(tick);
        else el.textContent=target;
      };
      requestAnimationFrame(tick);
    };
    if (!("IntersectionObserver" in window)){
      els.forEach(animate);
      return;
    }
    const io=new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          animate(e.target);
          io.unobserve(e.target);
        }
      });
    },{threshold:0.3});
    els.forEach(i=>io.observe(i));
  }

  // =================== START ===================
  document.addEventListener("DOMContentLoaded", async()=>{
    setupHeader();
    setupBurger();
    setupLightbox();
    setupCountUp();
    setupForm();

    // Рендерим всё текстовое СРАЗУ (без фото)
    renderPartners();
    renderProcess();
    renderDayTimeline();
    renderNoGo();
    renderReviews();
    renderTeam();
    renderFaq();
    renderLocation();
    renderServices();
    renderStories();

    // Фото — параллельно
    await Promise.all([
      setupHeroCinema(),
      setupServicePhotos(),
      setupAboutPhoto(),
      setupLocationPhoto(),
      setupMarqueePhotos()
    ]);

    console.log("🐾 Paws Haven v7 loaded (all-visible edition).");
  });
})();
