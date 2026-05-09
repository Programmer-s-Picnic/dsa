const DEFAULT_DATA = {
  brand: "Programmers Picnic AI-ML Classes by Champak Roy",
  type: "Education",
  tagline: "Learn AI, ML, Python and real-world coding step by step.",
  description: "A beginner-friendly learning website generated with Prompt Website Builder V9.",
  sections: ["Hero", "About", "Courses", "Services", "Testimonials", "Payment", "Contact"],
  whatsapp: "",
  email: "",
  paymentText: "Pay Now",
  ctaPrimary: "Start Learning",
  ctaSecondary: "View Courses",
  themeName: "Saffron",
  colors: {
    bg: "#fff7ed",
    text: "#241407",
    card: "#ffffff",
    primary: "#d97706",
    accent: "#f59e0b",
    muted: "#7c5b35",
    line: "#f2d6ad"
  },
  heroBullets: [
    "Beginner-friendly lessons",
    "Python, NumPy, AI and ML modules",
    "Practical projects and revision"
  ],
  about: "We help beginners learn programming, AI and machine learning through simple explanations, examples and practice projects.",
  services: [
    { title: "Beginner Classes", text: "Start from zero and build strong programming confidence." },
    { title: "AI/ML Modules", text: "Learn machine learning concepts with practical examples." },
    { title: "Projects", text: "Build small projects to understand real-world workflows." }
  ],
  courses: [
    { title: "Python Starter", text: "Variables, operators, loops, functions and problem solving." },
    { title: "NumPy Basics", text: "Arrays, shapes, calculations and data handling." },
    { title: "Machine Learning", text: "Classification, prediction, similarity and model thinking." }
  ],
  products: [
    { title: "Starter Digital Product", text: "A simple entry-level product for new customers." },
    { title: "Learning Resource Pack", text: "A helpful bundle of resources, notes or templates." },
    { title: "Premium Digital Bundle", text: "A complete package for customers who want maximum value." }
  ],
  testimonials: [
    "The lessons are clear and beginner friendly.",
    "The examples make coding easier to understand.",
    "A useful way to start AI and ML step by step."
  ],
  galleryLabels: ["Class", "Project", "Practice"],
  faq: [
    { q: "Who is this for?", a: "This is for beginners who want simple, structured and practical learning." },
    { q: "Can I join from zero level?", a: "Yes. The lessons are designed to start from the basics and move step by step." },
    { q: "How do I contact you?", a: "Use the contact section, email, or WhatsApp button." }
  ],
  notes: "",
  seoKeywords: ["AI ML classes", "Python classes", "Learn with Champak", "Programmers Picnic"]
};

let data = cloneData(DEFAULT_DATA);
let activeTab = "preview";
let lastJSONURL = "data.json";

const ALL_SECTIONS = [
  "Hero",
  "About",
  "Courses",
  "Services",
  "Products",
  "Doctors",
  "Gallery",
  "Testimonials",
  "Payment",
  "Contact",
  "FAQ"
];

const COLOR_FIELDS = [
  ["bg", "Background"],
  ["text", "Text"],
  ["card", "Card"],
  ["primary", "Primary"],
  ["accent", "Accent"],
  ["muted", "Muted Text"],
  ["line", "Border"]
];

function cloneData(obj) {
  if (typeof structuredClone === "function") return structuredClone(obj);
  return JSON.parse(JSON.stringify(obj));
}

function safe(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function slug(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function cleanPhone(value) {
  return String(value || "").replace(/\D/g, "");
}

function encodeBase64Unicode(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

function setStatus(message, type = "") {
  const box = document.getElementById("statusBox");
  if (!box) return;
  box.className = "status " + type;
  box.textContent = message;
}

function normalizeWebsiteData(input) {
  const next = cloneData(DEFAULT_DATA);
  if (!input || typeof input !== "object") return next;

  next.brand = input.brand || next.brand;
  next.type = input.type || next.type;
  next.tagline = input.tagline || next.tagline;
  next.description = input.description || input.tagline || next.description;
  next.sections = Array.isArray(input.sections) ? input.sections : next.sections;
  next.whatsapp = cleanPhone(input.whatsapp || next.whatsapp);
  next.email = input.email || next.email;
  next.paymentText = input.paymentText || next.paymentText;
  next.ctaPrimary = input.ctaPrimary || next.ctaPrimary;
  next.ctaSecondary = input.ctaSecondary || next.ctaSecondary;
  next.themeName = input.themeName || next.themeName;
  next.colors = { ...next.colors, ...(input.colors || {}) };
  next.heroBullets = Array.isArray(input.heroBullets) ? input.heroBullets : next.heroBullets;
  next.about = input.about || next.about;
  next.services = Array.isArray(input.services) ? input.services : next.services;
  next.courses = Array.isArray(input.courses) ? input.courses : next.courses;
  next.products = Array.isArray(input.products) ? input.products : next.products;
  next.testimonials = Array.isArray(input.testimonials) ? input.testimonials : next.testimonials;
  next.galleryLabels = Array.isArray(input.galleryLabels) ? input.galleryLabels : next.galleryLabels;
  next.faq = Array.isArray(input.faq) ? input.faq : next.faq;
  next.notes = input.notes || "";
  next.seoKeywords = Array.isArray(input.seoKeywords) ? input.seoKeywords : next.seoKeywords;

  if (!next.sections.includes("Hero")) next.sections.unshift("Hero");
  if (!next.sections.includes("Contact")) next.sections.push("Contact");

  return next;
}

async function loadJSONFromURL() {
  const input = document.getElementById("jsonUrlInput");
  const url = (input.value || "data.json").trim();

  if (!url) {
    setStatus("Please enter a JSON URL.", "bad");
    return;
  }

  try {
    setStatus("Loading JSON from URL...");
    const response = await fetch(url, { cache: "no-store" });

    if (!response.ok) {
      throw new Error("HTTP " + response.status + " " + response.statusText);
    }

    const parsed = await response.json();
    data = normalizeWebsiteData(parsed);
    lastJSONURL = url;
    localStorage.setItem("promptWebsiteBuilderJSONURL", url);

    renderInputs();
    updateAll();
    loadCurrentDataToJSONInput();

    setStatus("JSON loaded from URL: " + url, "good");
  } catch (error) {
    console.error(error);
    setStatus("Could not load JSON. Check URL, CORS, and JSON syntax.", "bad");
  }
}

function updateFromJSONURL() {
  const input = document.getElementById("jsonUrlInput");
  if (!input.value.trim()) input.value = lastJSONURL || "data.json";
  loadJSONFromURL();
}

function saveJSONURL() {
  const input = document.getElementById("jsonUrlInput");
  const url = (input.value || "data.json").trim();
  localStorage.setItem("promptWebsiteBuilderJSONURL", url);
  lastJSONURL = url;
  setStatus("JSON URL saved in this browser.", "good");
}

function generateFromJSON() {
  const box = document.getElementById("jsonInputBox");
  const raw = box.value.trim();

  if (!raw) {
    setStatus("Please paste or load JSON first.", "bad");
    return;
  }

  try {
    const parsed = JSON.parse(raw);
    data = normalizeWebsiteData(parsed);
    renderInputs();
    updateAll();
    setStatus("Website generated from JSON editor.", "good");
  } catch (error) {
    console.error(error);
    setStatus("Invalid JSON. Please check commas, quotes and brackets.", "bad");
  }
}

function loadCurrentDataToJSONInput() {
  const box = document.getElementById("jsonInputBox");
  if (!box) return;
  box.value = JSON.stringify(data, null, 2);
}

function formatJSONInput() {
  const box = document.getElementById("jsonInputBox");
  try {
    box.value = JSON.stringify(JSON.parse(box.value), null, 2);
    setStatus("JSON formatted.", "good");
  } catch (error) {
    setStatus("Cannot format. JSON is invalid.", "bad");
  }
}

function clearJSONInput() {
  const box = document.getElementById("jsonInputBox");
  if (!box) return;
  box.value = "";
  setStatus("JSON input cleared.");
}

function renderInputs() {
  document.getElementById("brandInput").value = data.brand;
  document.getElementById("typeInput").value = data.type;
  document.getElementById("taglineInput").value = data.tagline;
  document.getElementById("whatsappInput").value = data.whatsapp;
  document.getElementById("emailInput").value = data.email;
  document.getElementById("paymentInput").value = data.paymentText;
  renderSectionChips();
  renderColorGrid();
}

function renderSectionChips() {
  const wrap = document.getElementById("sectionChips");
  wrap.innerHTML = "";

  ALL_SECTIONS.forEach(section => {
    const chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = data.sections.includes(section) ? "✓ " + section : "+ " + section;
    chip.style.background = data.sections.includes(section) ? "var(--builder-primary)" : "#fff8ec";
    chip.style.color = data.sections.includes(section) ? "#fff" : "var(--builder-dark)";
    chip.onclick = () => toggleSection(section);
    wrap.appendChild(chip);
  });
}

function toggleSection(section) {
  const index = data.sections.indexOf(section);

  if (index >= 0) data.sections.splice(index, 1);
  else data.sections.push(section);

  if (!data.sections.includes("Hero")) data.sections.unshift("Hero");
  if (!data.sections.includes("Contact")) data.sections.push("Contact");

  renderSectionChips();
  updateAll();
  loadCurrentDataToJSONInput();
}

function renderColorGrid() {
  const grid = document.getElementById("colorGrid");
  grid.innerHTML = "";

  COLOR_FIELDS.forEach(([key, label]) => {
    const div = document.createElement("div");
    div.className = "color-field";
    div.innerHTML = `
      <label>${label}</label>
      <input type="color" value="${safe(data.colors[key])}" data-color="${key}">
      <input type="text" value="${safe(data.colors[key])}" data-color-text="${key}">
    `;
    grid.appendChild(div);
  });

  document.querySelectorAll("[data-color]").forEach(input => {
    input.addEventListener("input", function () {
      const key = this.getAttribute("data-color");
      data.colors[key] = this.value;
      const textInput = document.querySelector('[data-color-text="' + key + '"]');
      if (textInput) textInput.value = this.value;
      updateAll();
      loadCurrentDataToJSONInput();
    });
  });

  document.querySelectorAll("[data-color-text]").forEach(input => {
    input.addEventListener("input", function () {
      const key = this.getAttribute("data-color-text");
      if (/^#[0-9A-Fa-f]{6}$/.test(this.value)) {
        data.colors[key] = this.value;
        const colorInput = document.querySelector('[data-color="' + key + '"]');
        if (colorInput) colorInput.value = this.value;
        updateAll();
        loadCurrentDataToJSONInput();
      }
    });
  });
}

function syncFromInputs() {
  data.brand = document.getElementById("brandInput").value;
  data.type = document.getElementById("typeInput").value;
  data.tagline = document.getElementById("taglineInput").value;
  data.description = data.tagline;
  data.whatsapp = cleanPhone(document.getElementById("whatsappInput").value);
  data.email = document.getElementById("emailInput").value;
  data.paymentText = document.getElementById("paymentInput").value;
  updateAll();
  loadCurrentDataToJSONInput();
}

function buildWebsiteHTML() {
  const d = data;
  const c = d.colors;
  const keywords = (d.seoKeywords || []).join(", ");
  const phone = cleanPhone(d.whatsapp);

  let html = "";

  html += "<!doctype html>";
  html += '<html lang="en">';
  html += "<head>";
  html += '<meta charset="utf-8">';
  html += '<meta name="viewport" content="width=device-width,initial-scale=1">';
  html += "<title>" + safe(d.brand) + "</title>";
  html += '<meta name="description" content="' + safe(d.description || d.tagline) + '">';
  html += '<meta name="keywords" content="' + safe(keywords) + '">';
  html += '<meta property="og:title" content="' + safe(d.brand) + '">';
  html += '<meta property="og:description" content="' + safe(d.description || d.tagline) + '">';
  html += '<meta property="og:type" content="website">';
  html += '<meta name="theme-color" content="' + safe(c.primary) + '">';
  html += "<style>";
  html += ":root{";
  html += "--bg:" + c.bg + ";--text:" + c.text + ";--card:" + c.card + ";--primary:" + c.primary + ";--accent:" + c.accent + ";--muted:" + c.muted + ";--line:" + c.line + ";}";
  html += "*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;font-family:Arial,sans-serif;background:var(--bg);color:var(--text);line-height:1.65}a{text-decoration:none;color:inherit}.wrap{max-width:1120px;margin:auto;padding:0 22px}header{position:sticky;top:0;z-index:50;background:var(--card);border-bottom:1px solid var(--line)}.nav{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:16px 0}.brand{font-size:22px;font-weight:900;color:var(--primary)}nav{display:flex;gap:14px;flex-wrap:wrap;color:var(--muted);font-weight:800;font-size:14px}nav a:hover{color:var(--primary)}section{padding:70px 0}.hero{display:grid;grid-template-columns:1.15fr .85fr;gap:26px;align-items:center;min-height:72vh}h1{font-size:clamp(34px,6vw,66px);line-height:1.05;margin:0 0 16px}h2{font-size:clamp(26px,4vw,42px);margin:0 0 16px}h3{margin:0 0 8px}p{margin-top:0}.lead{font-size:20px;color:var(--muted);font-weight:700}.panel,.card{background:var(--card);border:1px solid var(--line);border-radius:24px;padding:24px;box-shadow:0 18px 45px rgba(0,0,0,.07)}.hero-card{position:relative;overflow:hidden}.hero-card:before{content:'';position:absolute;inset:-80px;background:radial-gradient(circle,var(--accent),transparent 58%);opacity:.18}.hero-card>*{position:relative}.btn-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:22px}.btn{display:inline-flex;align-items:center;justify-content:center;padding:13px 18px;border-radius:14px;background:var(--primary);color:white;font-weight:900}.btn.alt{background:var(--accent)}.panel .btn{margin:4px 6px 4px 0}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.two{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}.muted{color:var(--muted)}.pill{display:inline-flex;padding:8px 11px;border-radius:999px;background:var(--card);border:1px solid var(--line);font-weight:900;color:var(--primary);margin:5px}.photo{height:170px;border-radius:22px;border:1px solid var(--line);background:linear-gradient(135deg,var(--card),var(--bg));display:grid;place-items:center;color:var(--muted);font-weight:900}.quote{font-size:18px}.contact-box{display:grid;grid-template-columns:1fr 1fr;gap:16px}.field{padding:13px 14px;border-radius:14px;border:1px solid var(--line);background:var(--bg);margin-bottom:10px}footer{text-align:center;padding:32px 20px;background:var(--card);border-top:1px solid var(--line);color:var(--muted);font-weight:800}@media(max-width:850px){.hero,.grid,.two,.contact-box{grid-template-columns:1fr}.nav{align-items:flex-start}section{padding:48px 0}}";
  html += "</style></head><body>";

  html += "<header><div class='wrap nav'>";
  html += "<div class='brand'>" + safe(d.brand) + "</div><nav>";
  d.sections.forEach(section => {
    if (section !== "Hero") html += "<a href='#" + slug(section) + "'>" + safe(section) + "</a>";
  });
  html += "</nav></div></header><main>";

  if (d.sections.includes("Hero")) {
    html += "<section class='wrap hero'><div>";
    html += "<span class='pill'>" + safe(d.type) + "</span>";
    html += "<h1>" + safe(d.brand) + "</h1>";
    html += "<p class='lead'>" + safe(d.tagline) + "</p><div>";
    (d.heroBullets || []).forEach(item => { html += "<span class='pill'>✓ " + safe(item) + "</span>"; });
    html += "</div><div class='btn-row'>";
    html += "<a class='btn' href='#contact'>" + safe(d.ctaPrimary || "Contact Us") + "</a>";
    html += "<a class='btn alt' href='#services'>" + safe(d.ctaSecondary || "Explore") + "</a>";
    html += "</div></div><div class='panel hero-card'>";
    html += "<h2>Built for visitors who need clarity</h2>";
    html += "<p class='muted'>This website is generated from JSON and can be edited, exported and published.</p>";
    html += "<div class='grid' style='grid-template-columns:1fr;gap:10px'>";
    html += "<div class='field'>Fast mobile-friendly layout</div><div class='field'>SEO-ready title and description</div><div class='field'>Clear contact and action buttons</div>";
    html += "</div></div></section>";
  }

  if (d.sections.includes("About")) {
    html += "<section id='about' class='wrap'><div class='two'>";
    html += "<div><h2>About</h2><p class='lead'>" + safe(d.about) + "</p></div>";
    html += "<div class='panel'><h3>Why choose us?</h3><p class='muted'>We keep the experience simple, clear and useful for real visitors.</p><span class='pill'>Trusted</span><span class='pill'>Beginner Friendly</span><span class='pill'>Practical</span></div>";
    html += "</div></section>";
  }

  if (d.sections.includes("Courses")) {
    html += "<section id='courses' class='wrap'><h2>Courses</h2><div class='grid'>";
    (d.courses || []).forEach(course => { html += "<div class='card'><h3>" + safe(course.title) + "</h3><p class='muted'>" + safe(course.text) + "</p></div>"; });
    html += "</div></section>";
  }

  if (d.sections.includes("Products")) {
    html += "<section id='products' class='wrap'><h2>Products</h2><div class='grid'>";
    (d.products || []).forEach(product => {
      html += "<div class='card'><div class='photo'>Product</div><h3 style='margin-top:14px'>" + safe(product.title) + "</h3><p class='muted'>" + safe(product.text) + "</p><a class='btn' href='#payment'>Buy Now</a></div>";
    });
    html += "</div></section>";
  }

  if (d.sections.includes("Services")) {
    html += "<section id='services' class='wrap'><h2>Services</h2><div class='grid'>";
    (d.services || []).forEach(service => { html += "<div class='card'><h3>" + safe(service.title) + "</h3><p class='muted'>" + safe(service.text) + "</p></div>"; });
    html += "</div></section>";
  }

  if (d.sections.includes("Doctors")) {
    html += "<section id='doctors' class='wrap'><h2>Our Professionals</h2><div class='grid'>";
    ["Doctor / Therapist 1", "Doctor / Therapist 2", "Doctor / Therapist 3"].forEach(name => {
      html += "<div class='card'><div class='photo'>Photo</div><h3 style='margin-top:14px'>" + safe(name) + "</h3><p class='muted'>Professional profile, specialization and booking details can be added here.</p></div>";
    });
    html += "</div></section>";
  }

  if (d.sections.includes("Gallery")) {
    html += "<section id='gallery' class='wrap'><h2>Gallery</h2><div class='grid'>";
    (d.galleryLabels || ["Image 1", "Image 2", "Image 3"]).forEach(label => { html += "<div class='photo'>" + safe(label) + "</div>"; });
    html += "</div></section>";
  }

  if (d.sections.includes("Testimonials")) {
    html += "<section id='testimonials' class='wrap'><h2>Testimonials</h2><div class='grid'>";
    (d.testimonials || []).forEach(quote => { html += "<div class='card quote'>“" + safe(quote) + "”</div>"; });
    html += "</div></section>";
  }

  if (d.sections.includes("Payment")) {
    html += "<section id='payment' class='wrap'><div class='panel two'>";
    html += "<div><h2>Payment</h2><p class='muted'>Use this section for course fees, booking amount, products or service payments.</p></div>";
    html += "<div><a class='btn' href='#contact'>" + safe(d.paymentText || "Pay Now") + "</a><p class='muted' style='margin-top:12px'>Replace this with your real payment link or Razorpay button later.</p></div>";
    html += "</div></section>";
  }

  if (d.sections.includes("FAQ")) {
    html += "<section id='faq' class='wrap'><h2>FAQ</h2><div class='grid'>";
    (d.faq || []).forEach(item => { html += "<div class='card'><h3>" + safe(item.q) + "</h3><p class='muted'>" + safe(item.a) + "</p></div>"; });
    html += "</div></section>";
  }

  if (d.sections.includes("Contact")) {
    html += "<section id='contact' class='wrap'><h2>Contact</h2><div class='contact-box'>";
    html += "<div class='panel'><h3>Send an enquiry</h3><div class='field'>Your Name</div><div class='field'>Your Email / Phone</div><div class='field'>Your Message</div>";
    html += "<a class='btn' href='mailto:" + safe(d.email || "hello@example.com") + "'>Send Email</a>";
    if (phone) html += "<a class='btn alt' href='https://wa.me/" + safe(phone) + "' target='_blank' rel='noopener'>WhatsApp</a>";
    html += "</div><div class='panel'><h3>Contact Details</h3><p class='muted'>Email: " + safe(d.email || "Add your email") + "</p><p class='muted'>WhatsApp: " + safe(phone || "Add WhatsApp number") + "</p><p class='muted'>Website generated with Prompt Website Builder JSON URL.</p></div>";
    html += "</div></section>";
  }

  html += "</main><footer>© " + new Date().getFullYear() + " " + safe(d.brand) + ". All rights reserved.</footer>";
  html += "</body></html>";

  return html;
}

function updateAll() {
  const html = buildWebsiteHTML();
  document.getElementById("preview").srcdoc = html;
  document.getElementById("fullscreenFrame").srcdoc = html;
  document.getElementById("jsonView").textContent = JSON.stringify(data, null, 2);
  document.getElementById("htmlView").textContent = html;
  updateEditorLink(html);
}

function updateEditorLink(html) {
  try {
    const encoded = encodeBase64Unicode(html).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    document.getElementById("openEditorLink").href = "https://editor.learnwithchampak.live/samples/html/preview/#code=" + encoded;
  } catch (e) {
    document.getElementById("openEditorLink").href = "#";
  }
}

function showTab(tab) {
  activeTab = tab;
  document.getElementById("preview").classList.toggle("hidden", tab !== "preview");
  document.getElementById("jsonView").classList.toggle("hidden", tab !== "json");
  document.getElementById("htmlView").classList.toggle("hidden", tab !== "html");
  document.getElementById("previewTab").classList.toggle("active", tab === "preview");
  document.getElementById("jsonTab").classList.toggle("active", tab === "json");
  document.getElementById("htmlTab").classList.toggle("active", tab === "html");
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type });
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadHTML() {
  downloadFile("prompt-generated-website.html", buildWebsiteHTML(), "text/html");
  setStatus("HTML downloaded.", "good");
}

function downloadJSON() {
  downloadFile("data.json", JSON.stringify(data, null, 2), "application/json");
  setStatus("JSON downloaded. Upload it to your URL to update the live source.", "good");
}

function copyHTML() {
  navigator.clipboard.writeText(buildWebsiteHTML())
    .then(() => setStatus("HTML copied.", "good"))
    .catch(() => setStatus("Copy failed. Use Download HTML instead.", "bad"));
}

function copyJSON() {
  navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    .then(() => setStatus("JSON copied.", "good"))
    .catch(() => setStatus("Copy failed. Use Download JSON instead.", "bad"));
}

function saveProject() {
  localStorage.setItem("promptWebsiteBuilderJSONProject", JSON.stringify(data));
  setStatus("Project saved in this browser.", "good");
}

function loadProject() {
  const saved = localStorage.getItem("promptWebsiteBuilderJSONProject");
  if (!saved) {
    setStatus("No saved project found.", "bad");
    return;
  }
  try {
    data = normalizeWebsiteData(JSON.parse(saved));
    renderInputs();
    updateAll();
    loadCurrentDataToJSONInput();
    setStatus("Project loaded.", "good");
  } catch (e) {
    setStatus("Saved project is damaged.", "bad");
  }
}

function resetAll() {
  data = cloneData(DEFAULT_DATA);
  document.getElementById("jsonUrlInput").value = "data.json";
  renderInputs();
  updateAll();
  loadCurrentDataToJSONInput();
  setStatus("Reset complete.", "good");
}

function openPreviewNewTab() {
  const win = window.open("", "_blank");
  if (!win) {
    setStatus("Popup blocked. Allow popups or use Download HTML.", "bad");
    return;
  }
  win.document.open();
  win.document.write(buildWebsiteHTML());
  win.document.close();
}

function toggleFullscreenPreview() {
  const box = document.getElementById("fullscreenBox");
  box.classList.toggle("hidden");
  document.getElementById("fullscreenFrame").srcdoc = buildWebsiteHTML();
}

function init() {
  const savedURL = localStorage.getItem("promptWebsiteBuilderJSONURL");
  if (savedURL) {
    document.getElementById("jsonUrlInput").value = savedURL;
    lastJSONURL = savedURL;
  }

  renderInputs();
  updateAll();
  loadCurrentDataToJSONInput();
  loadJSONFromURL();
}

init();
