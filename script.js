/* PAWS HAVEN — script.js v10 (LOCAL REAL PHOTOS, no CDN) */
(function(){
  "use strict";

  function esc(s){return String(s).replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[m]);}
  function pad(n){return String(n).padStart(3,"0");}

  // ====== ЛОКАЛЬНЫЕ ФОТО СОБАК (в assets/dogs/, загружены на GitHub Pages) ======
  const DOG_PHOTOS = ["assets/dogs/01-retriever-golden.jpg", "assets/dogs/02-corgi-cardigan.jpg", "assets/dogs/03-corgi.jpg", "assets/dogs/04-husky.jpg", "assets/dogs/05-german-shepherd.jpg", "assets/dogs/06-poodle-standard.jpg", "assets/dogs/07-beagle.jpg", "assets/dogs/08-bulldog-english.jpg", "assets/dogs/09-dachshund.jpg", "assets/dogs/10-chihuahua.jpg", "assets/dogs/11-pomeranian.jpg", "assets/dogs/12-collie-border.jpg", "assets/dogs/13-rottweiler.jpg", "assets/dogs/14-terrier-yorkshire.jpg", "assets/dogs/15-doberman.jpg", "assets/dogs/16-dalmatian.jpg", "assets/dogs/17-boxer.jpg", "assets/dogs/18-australian-shepherd.jpg", "assets/dogs/19-bulldog-french.jpg", "assets/dogs/20-dane-great.jpg", "assets/dogs/21-shihtzu.jpg", "assets/dogs/22-maltese.jpg", "assets/dogs/23-vizsla.jpg", "assets/dogs/24-weimaraner.jpg", "assets/dogs/25-samoyed.jpg"];

  function getPhoto(seed, w, h){
    return DOG_PHOTOS[Math.abs(seed) % DOG_PHOTOS.length];
  }

  // ====== HERO КИНО ======
  async function setupHeroCinema(){
    const frames = document.querySelectorAll(".hero-frame");
    const thumbs = document.getElementById("heroThumbs");
    if (!frames.length) return;
    let cur = 0;

    const urls = [
      DOG_PHOTOS[0 % DOG_PHOTOS.length],
      DOG_PHOTOS[1 % DOG_PHOTOS.length],
      DOG_PHOTOS[2 % DOG_PHOTOS.length],
      DOG_PHOTOS[3 % DOG_PHOTOS.length]
    ];

    [...frames].forEach((f,i)=>{
      f.querySelector(".hero-loader")?.remove();
      const img=document.createElement("img");
      img.src=urls[i]; img.alt="Собака"; img.loading="eager";
      img.classList.add("loaded");
      f.appendChild(img);
      if (thumbs){
        const t=document.createElement("button");
        t.className="hero-thumb"+(i===0?" active":"");
        t.style.backgroundImage=`url(${urls[i]})`;
        t.dataset.i=i;
        thumbs.appendChild(t);
      }
    });
    // Показываем первый кадр сразу
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

  // ====== RENDER STATIC ======
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

  // ====== STORIES ======
  let currentStory=0;
  function renderStories(){
    const grid=document.getElementById("storiesGrid");
    if(!grid) return;
    const all=window.PAWS.stories;

    grid.innerHTML = all.map((s,i)=>{
      const url=DOG_PHOTOS[(i*3+5)%DOG_PHOTOS.length];
      return `
        <article class="story-card visible" data-i="${i}">
          <div class="story-img" style="position:relative;overflow:hidden">
            <img src="${url}" alt="${esc(s.name)}" loading="lazy" decoding="async" style="width:100%;height:100%;object-fit:cover;display:block" class="loaded">
          </div>
          <div class="story-body">
            <h4>${esc(s.name)}</h4>
            <div class="story-breed">${esc(s.breed)}</div>
            <p class="story-text">${esc(s.text)}</p>
            <div class="story-meta">
              <span class="story-days">📅 ${s.days} дней</span>
              <button class="story-read" data-i="${i}">Читать историю →</button>
            </div>
          </div>
        </article>`;
    }).join("");

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

  // ====== LIGHTBOX ======
  function openLightbox(i){
    const s=window.PAWS.stories[i];
    if(!s) return;
    const box=document.getElementById("lightbox");
    const content=document.getElementById("lightboxContent");
    const url=DOG_PHOTOS[(i*7+11)%DOG_PHOTOS.length];
    content.innerHTML=`
      <div class="lb-img">
        <img src="${url}" alt="${esc(s.name)}" loading="lazy" class="loaded">
      </div>
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

  // ====== MARQUEE ======
  function setupMarqueePhotos(){
    const track1=document.getElementById("marqueePhotos");
    const track2=document.getElementById("marqueePhotos2");
    if(!track1||!track2) return;
    const selected = [...Array(14)].map((_,i) => DOG_PHOTOS[(i*2+1)%DOG_PHOTOS.length]);
    const build=(host)=>{
      const track=document.createElement("div");
      track.className="marquee-track-photos";
      track.innerHTML = selected.concat(selected).map((u)=>{
        return `<div class="marquee-photo">
          <img src="${u}" alt="" loading="lazy" class="loaded">
        </div>`;
      }).join("");
      host.appendChild(track);
    };
    build(track1); build(track2);
  }

  // ====== SERVICES PHOTO (для [data-photo^="card-"]) ======
  function setupServicePhotos(){
    const slots=document.querySelectorAll("[data-photo^='card-']");
    if (!slots.length) return;
    slots.forEach((s,i)=>{
      const url=DOG_PHOTOS[(i*5+8)%DOG_PHOTOS.length];
      const img=document.createElement("img");
      img.src=url; img.alt="Собака";
      img.loading="eager"; img.decoding="sync";
      img.style.cssText="width:100%;height:100%;object-fit:cover;display:block;position:absolute;inset:0";
      img.classList.add("loaded");
      // Стили для контейнера
      s.style.position="relative";
      s.style.overflow="hidden";
      s.style.minHeight="280px";
      // Background пока грузится
      s.style.background = `linear-gradient(135deg, hsl(${(i*60)%360},40%,25%), #0F1424)`;
      img.onload=()=>{ img.classList.add("loaded"); };
      img.onerror=()=>{};
      s.appendChild(img);
    });
  }

  // ====== ABOUT PHOTO (ротация) ======
  function setupAboutPhoto(){
    const slot=document.querySelector("[data-photo='about-side']");
    if(!slot) return;
    const url=DOG_PHOTOS[4%DOG_PHOTOS.length];
    const img=document.createElement("img");
    img.src=url; img.alt="";
    img.style.cssText="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity .6s";
    img.classList.add("loaded");
    slot.appendChild(img);
    let n=0;
    setInterval(()=>{
      n++;
      img.style.opacity=0;
      setTimeout(()=>{
        img.src=DOG_PHOTOS[(4+n*3)%DOG_PHOTOS.length];
        img.style.opacity=1;
      },600);
    }, 8000);
  }

  // ====== LOCATION PHOTO ======
  function setupLocationPhoto(){
    const slot=document.querySelector("[data-photo='location']");
    if(!slot) return;
    const url=DOG_PHOTOS[Math.min(27, DOG_PHOTOS.length-1)];
    const img=document.createElement("img");
    img.src=url; img.alt="";
    img.style.cssText="position:absolute;inset:0;width:100%;height:100%;object-fit:cover";
    img.classList.add("loaded");
    slot.appendChild(img);
  }

  // ====== FORM ======
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

  // ====== HEADER / BURGER ======
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

  // ====== COUNT-UP (сразу финальное значение, анимация при появлении) ======
  function setupCountUp(){
    const els=document.querySelectorAll("[data-count]");
    if (!els.length) return;
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
    // Сразу показать финальное значение чтобы SEO и до JS не было 0
    els.forEach(el=>{ el.textContent = parseInt(el.dataset.count,10)||0; });
    // Затем анимировать от 0 при попадании в viewport
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

  // ====== START ======
  document.addEventListener("DOMContentLoaded", ()=>{
    setupHeader();
    setupBurger();
    setupLightbox();
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
    renderServices();
    renderStories();

    setupServicePhotos();
    setupAboutPhoto();
    setupLocationPhoto();
    setupMarqueePhotos();
    setupHeroCinema();

    console.log("🐾 Paws Haven v10 loaded (LOCAL real photos, no CDN).");
  });
})();
