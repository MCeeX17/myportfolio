import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, collection, addDoc, deleteDoc, doc, setDoc, onSnapshot, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBOEhoHh4JNkTyjXgZArpvi-WTfXi0UBWU",
  authDomain: "mopeli-portfolio.firebaseapp.com",
  projectId: "mopeli-portfolio",
  storageBucket: "mopeli-portfolio.firebasestorage.app",
  messagingSenderId: "712030847258",
  appId: "1:712030847258:web:ba9378ea9794ce9288eca3"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.documentElement.classList.add("js");
const $ = (id) => document.getElementById(id);
let isAdmin = false, projects = [];
let contacts = { github: "https://github.com/mceex17" }; // other fields come from Firestore (edit in admin)

$("year").textContent = new Date().getFullYear();

/* ---------- helpers ---------- */
const esc = (v = "") => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const safeUrl = (u = "") => { try { const x = new URL(u); return /^https?:$/.test(x.protocol) ? x.href : "#"; } catch { return "#"; } };
const fixLink = (v = "") => { v = v.trim(); return v && !/^https?:\/\//i.test(v) ? "https://" + v : v; };
const toast = (msg) => { const t = document.createElement("div"); t.className = "toast"; t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 1800); };

/* ---------- website icons: pasted link > site icon > favicon.ico > letter/star ---------- */
function iconCandidates(p) {
  const l = [];
  if (p.iconUrl) l.push(safeUrl(p.iconUrl));
  try {
    const u = new URL(p.url);
    l.push(`https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&url=${encodeURIComponent(u.href)}&size=128`);
    l.push(u.href.replace(/[^/]*$/, "") + "favicon.ico");   // sub-folder sites (GitHub Pages)
    l.push(u.origin + "/favicon.ico");
    l.push(`https://icons.duckduckgo.com/ip3/${u.hostname}.ico`);
  } catch {}
  return [...new Set(l)].filter((s) => s && s !== "#");
}
const fallbackChar = (t = "") => { const c = t.trim().charAt(0); return /[\p{L}\p{N}]/u.test(c) ? c.toUpperCase() : "\u2605"; };
function attachIcon(box, list, ch) {
  const fb = () => { box.innerHTML = ""; const s = document.createElement("span"); s.className = "fallback"; s.textContent = ch; box.appendChild(s); };
  let i = 0;
  const next = () => {
    if (i >= list.length) return fb();
    const img = new Image(); img.alt = ""; img.decoding = "async";
    img.onload = () => { if (img.naturalWidth < 2) { i++; return next(); } box.innerHTML = ""; box.appendChild(img); };
    img.onerror = () => { i++; next(); };
    img.src = list[i];
  };
  fb(); next();
}

/* ---------- projects ---------- */
function renderProjects() {
  const g = $("projects-grid"); g.innerHTML = "";
  $("empty-state").classList.toggle("hidden", projects.length > 0);
  $("project-count").textContent = projects.length ? `${projects.length} ${projects.length === 1 ? "website" : "websites"}` : "";
  countUp($("stat-projects"), projects.length);
  projects.forEach((p) => {
    const c = document.createElement("article");
    c.className = "card project";
    c.innerHTML = `
      <div class="card-top"><div class="favicon"></div>
        <div><h3>${esc(p.title)}</h3><span class="tech">${esc(p.tech)}</span></div></div>
      <p class="desc">${esc(p.desc)}</p>
      <a class="visit" href="${esc(safeUrl(p.url))}" target="_blank" rel="noopener">Visit website <i class="fa-solid fa-arrow-up-right-from-square"></i></a>
      ${isAdmin ? `<button type="button" class="delete-btn" data-id="${esc(p.id)}" aria-label="Delete ${esc(p.title)}">&times;</button>` : ""}`;
    attachIcon(c.querySelector(".favicon"), iconCandidates(p), fallbackChar(p.title));
    g.appendChild(c);
  });
}
$("projects-grid").addEventListener("click", async (e) => {
  const b = e.target.closest(".delete-btn");
  if (!b || !isAdmin || !confirm("Remove this website from your portfolio?")) return;
  try { await deleteDoc(doc(db, "projects", b.dataset.id)); } catch (err) { alert("Could not delete: " + err.message); }
});

/* ---------- contact cards ---------- */
function renderContacts() {
  const items = [];
  const c = contacts;
  if (c.email) items.push(["fa-solid fa-envelope", "Email me", c.email, `mailto:${c.email}`]);
  if (c.phone) items.push(["fa-solid fa-phone", "Call / WhatsApp", c.phone, `tel:${c.phone.replace(/[^\d+]/g, "")}`]);
  if (c.github) items.push(["fa-brands fa-github", "GitHub", c.github.replace(/^https?:\/\//, ""), safeUrl(c.github)]);
  if (c.instagram) items.push(["fa-brands fa-instagram", "Instagram", c.instagram.replace(/^https?:\/\/(www\.)?/, ""), safeUrl(c.instagram)]);
  if (c.facebook) items.push(["fa-brands fa-facebook", "Facebook", c.facebook.replace(/^https?:\/\/(www\.)?/, ""), safeUrl(c.facebook)]);
  $("contact-grid").innerHTML = items.map(([ic, label, val, href]) => `
    <a class="card contact" href="${esc(href)}" ${href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""} ${label === "Email me" ? `data-copy="${esc(val)}"` : ""}>
      <i class="${ic} ic"></i><div><h3>${label}</h3><p>${esc(val)}</p></div></a>`).join("")
    || `<p class="empty">Contact details coming soon.</p>`;
  ["email", "phone", "github", "instagram", "facebook"].forEach((k) => { const f = $("c-" + k); if (f && document.activeElement !== f) f.value = c[k] || ""; });
}

/* ---------- live data ---------- */
onSnapshot(query(collection(db, "projects"), orderBy("createdAt", "desc")),
  (s) => { projects = s.docs.map((d) => ({ id: d.id, ...d.data() })); renderProjects(); },
  (e) => console.error("Projects:", e));
onSnapshot(doc(db, "site", "profile"),
  (s) => { if (s.exists()) contacts = { ...contacts, ...s.data() }; renderContacts(); },
  () => renderContacts());
renderContacts();

/* ---------- auth + admin ---------- */
onAuthStateChanged(auth, (u) => {
  isAdmin = !!u;
  $("admin-panel").classList.toggle("hidden", !isAdmin);
  $("admin-pill").classList.toggle("hidden", !isAdmin);
  renderProjects();
});
const panel = $("admin-panel");
$("admin-toggle").addEventListener("click", () => panel.classList.toggle("collapsed"));
$("admin-pill").addEventListener("click", () => { panel.classList.remove("collapsed"); panel.scrollIntoView({ block: "end" }); });
document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => {
  document.querySelectorAll(".tab").forEach((x) => x.classList.toggle("on", x === t));
  document.querySelectorAll(".tabpane").forEach((p) => p.classList.toggle("hidden", p.dataset.pane !== t.dataset.tab));
}));
$("logout-btn").addEventListener("click", () => signOut(auth));

// secret login: click the M five times
let taps = 0, tapTimer;
$("secret-mark").addEventListener("click", () => {
  taps++; clearTimeout(tapTimer);
  const b = $("tap-badge"); b.textContent = taps; b.classList.toggle("hidden", taps < 2);
  tapTimer = setTimeout(() => { taps = 0; b.classList.add("hidden"); }, 1500);
  if (taps >= 5) { taps = 0; b.classList.add("hidden"); openLogin(); }
});
window.addEventListener("keydown", (e) => { if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "l") { e.preventDefault(); openLogin(); } });
function openLogin() {
  const m = $("login-modal");
  if (isAdmin || m.open) return;
  $("login-error").classList.add("hidden"); m.showModal(); $("admin-email").focus();
}
$("close-login").addEventListener("click", () => $("login-modal").close());
$("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, $("admin-email").value.trim(), $("admin-password").value);
    e.target.reset(); $("login-modal").close(); panel.classList.remove("collapsed");
  } catch {
    $("login-error").textContent = "That email or password isn't right. Try again.";
    $("login-error").classList.remove("hidden");
  }
});

$("project-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button[type=submit]"); btn.disabled = true;
  try {
    await addDoc(collection(db, "projects"), {
      title: $("project-title").value.trim(), url: fixLink($("project-url").value),
      tech: $("project-tech").value.trim(), desc: $("project-desc").value.trim(),
      iconUrl: fixLink($("project-icon").value), createdAt: serverTimestamp()
    });
    e.target.reset(); toast("Website published");
  } catch (err) { alert("Could not publish: " + err.message); }
  btn.disabled = false;
});

$("contact-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = e.target.querySelector("button[type=submit]"); btn.disabled = true;
  const data = {
    email: $("c-email").value.trim(), phone: $("c-phone").value.trim(),
    github: fixLink($("c-github").value), instagram: fixLink($("c-instagram").value), facebook: fixLink($("c-facebook").value)
  };
  try { await setDoc(doc(db, "site", "profile"), data, { merge: true }); toast("Contact info saved"); }
  catch (err) { alert("Could not save: " + err.message); }
  btn.disabled = false;
});

/* ---------- effects ---------- */
// typing role line
const roles = ["Full-Stack Developer", "React & Flutter Engineer", "Firebase Architect", "C# MVC Developer"];
let ri = 0, ci = 0, del = false;
(function type() {
  const el = $("typed"), w = roles[ri];
  el.textContent = w.slice(0, ci);
  if (!del && ci === w.length) { del = true; return setTimeout(type, 1600); }
  if (del && ci === 0) { del = false; ri = (ri + 1) % roles.length; }
  ci += del ? -1 : 1;
  setTimeout(type, del ? 35 : 70);
})();

// scroll reveal
const io = new IntersectionObserver((en) => en.forEach((x) => x.isIntersecting && (x.target.classList.add("in"), io.unobserve(x.target))), { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// photo tilt (desktop)
const photo = $("photo");
if (matchMedia("(hover:hover)").matches) {
  photo.parentElement.addEventListener("pointermove", (e) => {
    const r = photo.getBoundingClientRect();
    photo.style.setProperty("--ry", ((e.clientX - r.left) / r.width - 0.5) * 14 + "deg");
    photo.style.setProperty("--rx", (0.5 - (e.clientY - r.top) / r.height) * 14 + "deg");
  });
  photo.parentElement.addEventListener("pointerleave", () => { photo.style.setProperty("--rx", "0deg"); photo.style.setProperty("--ry", "0deg"); });
}

// card spotlight follows cursor
document.addEventListener("pointermove", (e) => {
  const c = e.target.closest?.(".card");
  if (!c) return;
  const r = c.getBoundingClientRect();
  c.style.setProperty("--mx", e.clientX - r.left + "px"); c.style.setProperty("--my", e.clientY - r.top + "px");
});

// count-up
function countUp(el, to) {
  const from = +el.textContent || 0, t0 = performance.now();
  (function step(t) {
    const k = Math.min((t - t0) / 700, 1);
    el.textContent = Math.round(from + (to - from) * k);
    if (k < 1) requestAnimationFrame(step);
  })(t0);
}

// click-to-copy email
$("contact-grid").addEventListener("click", (e) => {
  const a = e.target.closest("[data-copy]");
  if (a && navigator.clipboard) navigator.clipboard.writeText(a.dataset.copy).then(() => toast("Email copied"));
});
