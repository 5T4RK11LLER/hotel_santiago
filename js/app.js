/* Lógica de la app: rutas por hash (#/ y #/room/id), filtros, paginación, calculadora y calendario */
const $ = (s, el = document) => el.querySelector(s);
const app = $("#app"), PER = 6;
const usd = n => new Intl.NumberFormat("es-ES", {style:"currency", currency:"USD"}).format(n);
const iso = d => d.toISOString().slice(0, 10);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const state = {filter:"all", page:1};

/* Imagen con fallback visual si Unsplash falla */
const img = (src, alt) => `<img src="${src}" alt="${alt}" loading="lazy" onerror="this.onerror=null;this.src='data:image/svg+xml,'+encodeURIComponent('<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22600%22 height=%22600%22><rect width=%22100%25%22 height=%22100%25%22 fill=%22%23333%22/><text x=%2250%25%22 y=%2250%25%22 fill=%22%23A67C52%22 font-size=%2224%22 text-anchor=%22middle%22>Hotel Santiago</text></svg>')">`;

const match = (r, f) => f === "all" || (f === "real" ? r.name.includes("The Level") : r.cat === f);
const card = r => `<a class="card" href="#/room/${r.id}">${img(r.imgs[0], r.name)}
  <div class="card__info"><h3>${r.name}</h3>
  <div class="card__meta"><span>${r.guests} huéspedes</span><span>${r.size} m²</span></div>
  <div class="card__price">${r.id === "estandar" ? "Oferta desde " : "Desde "}${usd(r.from)}${r.quote ? " · Cotizar" : ""}</div></div></a>`;

/* ---------- Vista 1: catálogo ---------- */
function catalog() {
  $("#hero").hidden = false;
  const list = ROOMS.filter(r => match(r, state.filter));
  const pages = Math.max(1, Math.ceil(list.length / PER));
  state.page = Math.min(state.page, pages);
  const slice = list.slice((state.page - 1) * PER, state.page * PER);
  app.innerHTML = `
    <div class="filters">${FILTERS.map(([k, l]) => `<button class="chip ${k === state.filter ? "on" : ""}" data-f="${k}">${l}</button>`).join("")}</div>
    <div class="grid">${slice.map(card).join("") || '<p class="empty">No hay habitaciones en esta categoría.</p>'}</div>
    ${pages > 1 ? `<div class="pager">${Array.from({length:pages}, (_, i) => `<button class="${i + 1 === state.page ? "on" : ""}" data-p="${i + 1}">${i + 1}</button>`).join("")}
      ${state.page < pages ? `<button data-p="${state.page + 1}">Sig. »</button>` : ""}</div>` : ""}`;
}
app.addEventListener("click", e => {
  const f = e.target.closest("[data-f]"), p = e.target.closest("[data-p]");
  if (f) { state.filter = f.dataset.f; state.page = 1; catalog(); }
  if (p) { state.page = +p.dataset.p; catalog(); scrollTo({top: 300}); }
});

/* ---------- Vista 2: detalle ---------- */
function detail(room) {
  $("#hero").hidden = true;
  const others = ROOMS.filter(r => r.id !== room.id).slice(0, 3);
  let g = 0; // índice de la galería
  const today = new Date();
  const q = {in: iso(today), out: iso(addDays(today, 1)), ad: 1, ch: 0, rm: 1, plan: 0, ex: new Set()};

  app.innerHTML = `
  <div class="gallery" id="gal"></div>
  <div class="detail">
   <section>
    <h1>${room.name}</h1>
    <div class="attrs"><span>👥 ${room.guests} huéspedes</span><span>📐 ${room.size} m²</span><span>🛏 ${room.bed}</span>${room.units ? `<span>🏨 ${room.units} hab.</span>` : ""}</div>
    <p>${room.desc}</p>
    <h3>Planes y tarifas de referencia</h3>
    <table class="plans">${room.plans.map(([n, p]) => `<tr><td>${n}</td><td>${usd(p)}</td></tr>`).join("")}</table>
    <h3>Amenidades</h3><div class="amen">${AMENITIES.map(([i, n]) => `<span>${i} ${n}</span>`).join("")}</div>
    <h3>Características</h3><ul class="ticks">${FEATURES.map(f => `<li>${f}</li>`).join("")}</ul>
    <h3>Horarios</h3><p>Check-in: 12:00 pm<br>Check-out: 11:00 am</p>
    <h3>Calendario de disponibilidad</h3><div class="cal" id="cal"></div>
   </section>
   <aside class="book">
    <div class="book__head"><h3>${room.quote ? "Cotizar" : "Reservar"}</h3><span>Desde <b>${usd(room.from)}</b> / noche</span></div>
    <div class="row2"><div><label for="in">Entrada</label><input type="date" id="in" min="${iso(today)}" value="${q.in}"></div>
      <div><label for="out">Salida</label><input type="date" id="out" value="${q.out}"></div></div>
    <div class="row2" id="steps"></div>
    <label for="plan">Plan</label>
    <select id="plan">${room.plans.map(([n, p], i) => `<option value="${i}">${n} · ${usd(p)}</option>`).join("")}</select>
    <h4>Servicios extra</h4>
    ${EXTRAS.map(x => `<label class="extra"><span><input type="checkbox" data-x="${x.id}">${x.n}</span><em>${usd(x.p)} / ${x.unit === "night" ? "noche" : "estancia"}</em></label>`).join("")}
    <div class="total"><h4>Total estimado</h4><b id="total"></b></div>
    <p class="note" id="note"></p>
    <button class="btn btn--block" id="go">${room.quote ? "Solicitar cotización" : "Reservar"}</button>
   </aside>
  </div>
  <section class="more"><h2>Otras habitaciones</h2><div class="grid">${others.map(card).join("")}</div>
   <p style="margin-top:30px"><a class="btn" href="#/">Volver al catálogo</a></p></section>`;

  /* Galería: 3 fotos con flechas */
  const gal = $("#gal");
  const paintGal = () => {
    const n = room.imgs.length;
    gal.innerHTML = [0, 1, 2].map(k => img(room.imgs[(g + k) % n], room.name)).join("") +
      `<button class="gallery__nav gallery__nav--p" aria-label="Anterior">‹</button><button class="gallery__nav gallery__nav--n" aria-label="Siguiente">›</button>`;
  };
  gal.addEventListener("click", e => {
    if (e.target.closest(".gallery__nav--p")) g = (g + room.imgs.length - 1) % room.imgs.length;
    else if (e.target.closest(".gallery__nav--n")) g = (g + 1) % room.imgs.length;
    else return;
    paintGal();
  });
  paintGal();

  /* Contadores +/- */
  const defs = [["ad", "Adultos", 1, room.guests], ["ch", "Niños", 0, room.guests], ["rm", "Habitaciones", 1, 10]];
  const steps = $("#steps");
  const paintSteps = () => steps.innerHTML = defs.map(([k, l]) => `<div><label>${l}</label><div class="step"><button data-k="${k}" data-d="-1" aria-label="Menos ${l}">−</button><span>${q[k]}</span><button data-k="${k}" data-d="1" aria-label="Más ${l}">+</button></div></div>`).join("");
  steps.addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    const d = defs.find(x => x[0] === b.dataset.k);
    q[d[0]] = Math.max(d[2], Math.min(d[3], q[d[0]] + +b.dataset.d));
    paintSteps(); calc();
  });

  /* Calculadora en tiempo real */
  const nights = () => Math.max(1, Math.round((new Date(q.out) - new Date(q.in)) / 864e5));
  function calc() {
    const n = nights(), rate = room.plans[q.plan][1];
    let t = rate * n * q.rm;
    EXTRAS.filter(x => q.ex.has(x.id)).forEach(x => t += x.p * q.rm * (x.unit === "night" ? n : 1));
    $("#total").textContent = usd(t);
    $("#note").textContent = `${n} noche${n > 1 ? "s" : ""} · ${q.rm} hab. · ${q.ad + q.ch} huésped${q.ad + q.ch > 1 ? "es" : ""}`;
    paintCal();
    return {n, t, rate};
  }
  $("#in").onchange = e => { q.in = e.target.value; if (q.out <= q.in) { q.out = iso(addDays(new Date(q.in), 1)); $("#out").value = q.out; } calc(); };
  $("#out").onchange = e => { q.out = e.target.value > q.in ? e.target.value : iso(addDays(new Date(q.in), 1)); e.target.value = q.out; calc(); };
  $("#plan").onchange = e => { q.plan = +e.target.value; calc(); };
  app.querySelectorAll("[data-x]").forEach(c => c.onchange = () => { c.checked ? q.ex.add(c.dataset.x) : q.ex.delete(c.dataset.x); calc(); });

  /* Calendario: clic para elegir entrada y salida */
  let view = new Date(today.getFullYear(), today.getMonth(), 1), pick = false;
  function paintCal() {
    const y = view.getFullYear(), m = view.getMonth(), first = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
    let cells = "<b>L</b><b>M</b><b>X</b><b>J</b><b>V</b><b>S</b><b>D</b>" + "<span></span>".repeat(first);
    for (let d = 1; d <= days; d++) {
      const s = iso(new Date(Date.UTC(y, m, d))), past = s < iso(today);
      const cls = s === q.in || s === q.out ? "edge" : s > q.in && s < q.out ? "in" : "";
      cells += `<button class="${cls}" data-d="${s}" ${past ? "disabled" : ""}>${d}</button>`;
    }
    $("#cal").innerHTML = `<div class="cal__top"><button data-m="-1" aria-label="Mes anterior">‹</button>${view.toLocaleDateString("es-ES", {month:"long", year:"numeric"})}<button data-m="1" aria-label="Mes siguiente">›</button></div><div class="cal__g">${cells}</div>`;
  }
  $("#cal").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.m) { view.setMonth(view.getMonth() + +b.dataset.m); return paintCal(); }
    const s = b.dataset.d;
    if (!pick || s <= q.in) { q.in = s; q.out = iso(addDays(new Date(s), 1)); pick = true; }
    else { q.out = s; pick = false; }
    $("#in").value = q.in; $("#out").value = q.out; calc();
  });

  /* Resumen al reservar */
  $("#go").onclick = () => {
    const {n, t, rate} = calc();
    const ex = EXTRAS.filter(x => q.ex.has(x.id)).map(x => x.n).join(", ") || "Ninguno";
    $("#dlgBody").innerHTML = `<h3>${room.quote ? "Solicitud de cotización" : "Resumen de reserva"}</h3>
      <p><span>Habitación</span><b>${room.name}</b></p><p><span>Fechas</span><b>${q.in} → ${q.out}</b></p>
      <p><span>Noches</span><b>${n}</b></p><p><span>Huéspedes</span><b>${q.ad} adulto(s), ${q.ch} niño(s)</b></p>
      <p><span>Habitaciones</span><b>${q.rm}</b></p><p><span>Plan</span><b>${room.plans[q.plan][0]}</b></p>
      <p><span>Tarifa / noche</span><b>${usd(rate)}</b></p><p><span>Extras</span><b>${ex}</b></p>
      <p><span>Total estimado</span><b>${usd(t)}</b></p>
      <p style="font-size:12px">Importe orientativo; confirmación sujeta a disponibilidad.</p>`;
    $("#dlg").showModal();
  };
  paintSteps(); calc();
}
$("#dlgClose").onclick = () => $("#dlg").close();

/* ---------- Router ---------- */
function route() {
  if (location.hash === "#footer") return;   // el enlace Contacto solo desplaza al footer
  const m = location.hash.match(/^#\/room\/(.+)$/), room = m && ROOMS.find(r => r.id === m[1]);
  room ? detail(room) : catalog();
  if (location.hash !== "#footer") scrollTo({top: 0});
}
addEventListener("hashchange", route);
route();

/* Botón volver arriba */
const toTop = $("#toTop");
addEventListener("scroll", () => toTop.classList.toggle("show", scrollY > 500));
toTop.onclick = () => scrollTo({top: 0, behavior: "smooth"});

/* Menú móvil (hamburguesa) */
const burger = $("#burger"), nav = $("#nav");
const setMenu = open => { nav.classList.toggle("open", open); burger.setAttribute("aria-expanded", open); burger.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú"); };
burger.onclick = () => setMenu(!nav.classList.contains("open"));
nav.addEventListener("click", e => { if (e.target.closest("a")) setMenu(false); });
addEventListener("keydown", e => { if (e.key === "Escape") setMenu(false); });
addEventListener("resize", () => { if (innerWidth > 980) setMenu(false); });