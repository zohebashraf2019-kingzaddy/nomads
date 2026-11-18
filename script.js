/* ============================================================
   NO MESS EXPRESS — site config
   Edit these values when the client confirms their details.
   ============================================================ */
const CONFIG = {
  phone: "(775) 000-0000",          // TODO: client phone
  phoneRaw: "7750000000",           // digits only, used for tel: / sms:
  email: "info@nomessexpress.com",  // TODO: client email
  booksy: "https://booksy.com/en-us/1908080_nomessexpress_other_29331_sparks",
  // Optional: paste a Formspree / Web3Forms / FormSubmit endpoint to receive
  // estimate requests by email. Leave blank to fall back to email/text.
  formEndpoint: "",

  // Estimate pricing (truck-bed loads). Adjust to the client's real rates.
  loads: {
    min:     { label: "Single Item",  price: 75 },
    quarter: { label: "1/4 Load",     price: 125 },
    half:    { label: "1/2 Load",     price: 195 },
    three:   { label: "3/4 Load",     price: 265 },
    full:    { label: "Full Load",    price: 325 },
  },
  extras: {
    heavy:     { label: "Heavy items (concrete, dirt, tile)", price: 40 },
    appliance: { label: "Appliance / fridge disposal",        price: 30 },
    mattress:  { label: "Mattress / box spring",              price: 25 },
    stairs:    { label: "Stairs / long carry",                price: 20 },
    sameday:   { label: "Same-day service",                   price: 40 },
    tires:     { label: "Tires (each set of 4)",              price: 30 },
  },
  areaFees: {
    "Reno": 0, "Sparks": 0, "Sun Valley": 0, "Lemon Valley": 0, "Spanish Springs": 0, "Red Rock": 15,
    "Washoe Valley": 15, "Cold Springs": 15, "Verdi": 15,
    "Fernley": 30, "Carson City": 35, "Dayton": 35, "Minden / Gardnerville": 45,
    "Lake Tahoe (Incline / Crystal Bay)": 55, "South Lake Tahoe / Stateline": 65,
    "Other / Not sure": 0,
  },
};

/* ---------- Shared: contact links ---------- */
document.querySelectorAll("[data-phone]").forEach(el => {
  el.textContent = el.dataset.phone === "label" ? CONFIG.phone : el.textContent;
  el.setAttribute("href", "tel:" + CONFIG.phoneRaw);
});
document.querySelectorAll("[data-sms]").forEach(el => el.setAttribute("href", "sms:" + CONFIG.phoneRaw));
document.querySelectorAll("[data-email]").forEach(el => {
  if (el.dataset.email === "label") el.textContent = CONFIG.email;
  el.setAttribute("href", "mailto:" + CONFIG.email);
});
document.querySelectorAll("[data-booksy]").forEach(el => {
  el.setAttribute("href", CONFIG.booksy);
  el.setAttribute("target", "_blank");
  el.setAttribute("rel", "noopener");
});
document.querySelectorAll("[data-year]").forEach(el => (el.textContent = new Date().getFullYear()));

/* ---------- Mobile nav ---------- */
const burger = document.querySelector(".burger");
const links = document.querySelector(".nav-links");
if (burger && links) {
  burger.addEventListener("click", () => {
    links.classList.toggle("open");
    burger.setAttribute("aria-expanded", links.classList.contains("open"));
  });
  links.querySelectorAll("a").forEach(a => a.addEventListener("click", () => links.classList.remove("open")));
}

/* ---------- Scroll reveal ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

/* ---------- Count-up stats ---------- */
document.querySelectorAll("[data-count]").forEach(el => {
  const target = +el.dataset.count, suffix = el.dataset.suffix || "";
  const obs = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    let n = 0; const step = Math.max(1, Math.ceil(target / 50));
    const t = setInterval(() => { n = Math.min(target, n + step); el.textContent = n + suffix; if (n >= target) clearInterval(t); }, 28);
    obs.disconnect();
  });
  obs.observe(el);
});

/* ---------- Estimate builder (contact page) ---------- */
const estForm = document.getElementById("estimate-form");
if (estForm) {
  const areaSel = document.getElementById("area");
  Object.keys(CONFIG.areaFees).forEach(a => {
    const o = document.createElement("option");
    o.value = a; o.textContent = a; areaSel.appendChild(o);
  });

  // Pre-select service from ?service= in URL
  const params = new URLSearchParams(location.search);
  const svc = params.get("service");
  if (svc) { const s = document.getElementById("service"); [...s.options].forEach(o => { if (o.value === svc) s.value = svc; }); }

  const fmt = n => "$" + n.toLocaleString();
  const totalEl = document.getElementById("quote-total");
  const linesEl = document.getElementById("quote-lines");

  function calc() {
    const load = estForm.querySelector('input[name="load"]:checked')?.value || "quarter";
    const L = CONFIG.loads[load];
    const lines = [[L.label, L.price]];
    let total = L.price;
    estForm.querySelectorAll('input[name="extra"]:checked').forEach(x => {
      const E = CONFIG.extras[x.value]; lines.push([E.label, E.price]); total += E.price;
    });
    const fee = CONFIG.areaFees[areaSel.value] || 0;
    if (fee) { lines.push(["Travel — " + areaSel.value, fee]); total += fee; }
    const low = Math.round(total * 0.9 / 5) * 5, high = Math.round(total * 1.15 / 5) * 5;
    totalEl.textContent = fmt(low) + " – " + fmt(high);
    linesEl.innerHTML = lines.map(([l, p]) => `<li><span>${l}</span><span>${fmt(p)}</span></li>`).join("");
    return { load: L.label, lines, range: totalEl.textContent };
  }
  estForm.addEventListener("input", calc);
  estForm.addEventListener("change", calc);
  calc();

  estForm.addEventListener("submit", async e => {
    e.preventDefault();
    if (!estForm.reportValidity()) return;
    const q = calc();
    const d = Object.fromEntries(new FormData(estForm));
    const summary =
`New estimate request — No Mess Express
Name: ${d.name}
Phone: ${d.phone}
Email: ${d.email || "-"}
Service: ${d.service}
Area: ${d.area}
Address / cross streets: ${d.address || "-"}
Preferred date: ${d.date || "-"} (${d.time})
Load size: ${q.load}
Add-ons: ${q.lines.slice(1).map(l => l[0]).join(", ") || "none"}
Online estimate: ${q.range}
Details: ${d.details || "-"}`;

    const ok = document.getElementById("form-success");
    if (CONFIG.formEndpoint) {
      try {
        const r = await fetch(CONFIG.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ ...d, estimate: q.range, load: q.load, message: summary }),
        });
        if (!r.ok) throw new Error();
        ok.classList.add("show"); estForm.reset(); calc(); return;
      } catch (_) { /* fall through to email */ }
    }
    window.location.href = "mailto:" + CONFIG.email +
      "?subject=" + encodeURIComponent("Estimate request — " + d.name) +
      "&body=" + encodeURIComponent(summary);
    ok.classList.add("show");
  });
}
