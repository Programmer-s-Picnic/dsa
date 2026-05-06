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
    {
      title: "Beginner Classes",
      text: "Start from zero and build strong programming confidence."
    },
    {
      title: "AI/ML Modules",
      text: "Learn machine learning concepts with practical examples."
    },
    {
      title: "Projects",
      text: "Build small projects to understand real-world workflows."
    }
  ],
  courses: [
    {
      title: "Python Starter",
      text: "Variables, operators, loops, functions and problem solving."
    },
    {
      title: "NumPy Basics",
      text: "Arrays, shapes, calculations and data handling."
    },
    {
      title: "Machine Learning",
      text: "Classification, prediction, similarity and model thinking."
    }
  ],
  testimonials: [
    "The lessons are clear and beginner friendly.",
    "The examples make coding easier to understand.",
    "A useful way to start AI and ML step by step."
  ],
  galleryLabels: ["Class", "Project", "Practice"],
  notes: "",
  seoKeywords: ["AI ML classes", "Python classes", "Learn with Champak", "Programmers Picnic"]
};

let data = structuredClone(DEFAULT_DATA);
let activeTab = "preview";

const ALL_SECTIONS = [
  "Hero",
  "About",
  "Courses",
  "Services",
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

const samples = {
  education:
    "Create an AI ML classes website for Programmers Picnic AI-ML Classes by Champak Roy. Use saffron theme. Add hero, about, courses, services, testimonials, payment and contact. Add WhatsApp button. Make it beginner friendly and SEO ready.",

  healthcare:
    "Create a healthcare website for Curesia. Use green and white theme. Add doctors, services, gallery, testimonials, contact, WhatsApp and appointment call to action. Make the design professional and trustworthy.",

  portfolio:
    "Create a personal portfolio website for Champak Roy. Use dark saffron theme. Add hero, about, skills, projects, testimonials and contact. Make it clean, modern and professional.",

  business:
    "Create a business website for a local service company. Use saffron and white theme. Add hero, about, services, testimonials, payment and contact. Make it simple and conversion focused.",

  ecommerce:
    "Create an e-commerce landing page for digital products. Use saffron theme. Add hero, product cards, benefits, testimonials, payment and contact. Make it sales focused and SEO ready."
};

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
  box.className = "status " + type;
  box.textContent = message;
}

function useSample(key) {
  document.getElementById("promptBox").value = samples[key] || samples.education;
  setStatus("Sample prompt inserted.", "good");
}

function clearPrompt() {
  document.getElementById("promptBox").value = "";
  setStatus("Prompt cleared.");
}

function improvePrompt() {
  const current = document.getElementById("promptBox").value.trim();

  if (!current) {
    document.getElementById("promptBox").value =
      "Create a professional website for [brand name]. Use saffron theme. Add hero, about, services, testimonials, payment and contact. Include WhatsApp button, SEO title, meta description and beginner-friendly layout.";
    setStatus("Starter prompt added.", "good");
    return;
  }

  document.getElementById("promptBox").value =
    current +
    "\n\nAlso make the website mobile-friendly, SEO-ready, clear for beginners, visually polished, and include strong call-to-action buttons.";

  setStatus("Prompt improved.", "good");
}

function generateFromPrompt() {
  const prompt = document.getElementById("promptBox").value.trim();

  if (!prompt) {
    setStatus("Please enter a prompt first.", "bad");
    return;
  }

  data = interpretPrompt(prompt);
  renderInputs();
  updateAll();
  setStatus("Website generated from prompt.", "good");
}

function interpretPrompt(prompt) {
  const p = prompt.toLowerCase();
  const next = structuredClone(DEFAULT_DATA);

  next.notes = prompt;

  const brand = extractBrand(prompt);
  if (brand) next.brand = brand;

  if (
    p.includes("health") ||
    p.includes("doctor") ||
    p.includes("clinic") ||
    p.includes("hospital") ||
    p.includes("therapy") ||
    p.includes("psychotherapist")
  ) {
    next.type = "Healthcare";
    next.tagline = "Professional care, trusted guidance and simple appointment support.";
    next.about = "We provide reliable healthcare support with a caring team, clear communication and patient-friendly services.";
    next.sections = ["Hero", "About", "Services", "Doctors", "Gallery", "Testimonials", "Contact"];
    next.services = [
      { title: "Consultation", text: "Speak with professionals and get guided support." },
      { title: "Therapy Support", text: "Personalized sessions for better mental and emotional wellness." },
      { title: "Care Plans", text: "Structured support designed around your needs." }
    ];
    next.galleryLabels = ["Clinic", "Team", "Care"];
    next.testimonials = [
      "The team was kind, professional and supportive.",
      "The service felt clear and trustworthy.",
      "Booking and communication were very smooth."
    ];
    next.seoKeywords = ["healthcare", "clinic", "doctors", "therapy", "appointment"];
    applyTheme(next, "green");
  }

  else if (p.includes("portfolio") || p.includes("resume") || p.includes("personal")) {
    next.type = "Portfolio";
    next.tagline = "A clean portfolio for work, projects and professional presence.";
    next.sections = ["Hero", "About", "Services", "Gallery", "Testimonials", "Contact"];
    next.services = [
      { title: "Web Projects", text: "Modern websites, pages and useful tools." },
      { title: "Teaching", text: "Clear lessons, examples and practical guidance." },
      { title: "Consulting", text: "Support for ideas, content, code and digital systems." }
    ];
    next.galleryLabels = ["Project", "Work", "Result"];
    next.seoKeywords = ["portfolio", "projects", "web developer", "teacher"];
    applyTheme(next, p.includes("dark") ? "dark" : "saffron");
  }

  else if (
    p.includes("shop") ||
    p.includes("ecommerce") ||
    p.includes("e-commerce") ||
    p.includes("product") ||
    p.includes("store")
  ) {
    next.type = "E-commerce";
    next.tagline = "Discover useful products and simple buying options.";
    next.sections = ["Hero", "About", "Services", "Gallery", "Testimonials", "Payment", "Contact", "FAQ"];
    next.services = [
      { title: "Featured Product", text: "Highlight your best product or offer." },
      { title: "Simple Checkout", text: "Guide visitors clearly towards purchase." },
      { title: "Support", text: "Help buyers with questions before and after purchase." }
    ];
    next.galleryLabels = ["Product 1", "Product 2", "Product 3"];
    next.ctaPrimary = "Shop Now";
    next.ctaSecondary = "View Products";
    next.paymentText = "Buy Now";
    next.seoKeywords = ["online store", "products", "buy online", "digital products"];
    applyTheme(next, "saffron");
  }

  else if (
    p.includes("ai") ||
    p.includes("ml") ||
    p.includes("class") ||
    p.includes("course") ||
    p.includes("education") ||
    p.includes("learn") ||
    p.includes("python")
  ) {
    next.type = "Education";
    next.tagline = "Learn coding, AI and machine learning with simple step-by-step lessons.";
    next.sections = ["Hero", "About", "Courses", "Services", "Testimonials", "Payment", "Contact"];
    next.about = "We teach programming and AI/ML in a beginner-friendly way with examples, projects, tests and revision.";
    next.services = [
      { title: "Live Classes", text: "Structured sessions for beginners with simple explanations." },
      { title: "Practice Tasks", text: "Assignments and small projects to build confidence." },
      { title: "Doubt Solving", text: "Revision, support and guided doubt clearing." }
    ];
    next.courses = [
      { title: "Python Basics", text: "Start with variables, operators, loops and functions." },
      { title: "NumPy Module", text: "Learn arrays, calculations, shapes and practical data handling." },
      { title: "AI/ML Starter", text: "Understand models, prediction, similarity and basic workflows." }
    ];
    next.ctaPrimary = "Join Class";
    next.ctaSecondary = "View Modules";
    next.paymentText = "Enroll Now";
    next.seoKeywords = ["AI ML classes", "Python course", "NumPy classes", "machine learning beginner"];
    applyTheme(next, "saffron");
  }

  else {
    next.type = "Business";
    next.tagline = "A modern website for your services, customers and online presence.";
    next.sections = ["Hero", "About", "Services", "Testimonials", "Payment", "Contact"];
    next.services = [
      { title: "Service 1", text: "Explain your first important service." },
      { title: "Service 2", text: "Explain your second important service." },
      { title: "Service 3", text: "Explain your third important service." }
    ];
    next.seoKeywords = ["business website", "services", "contact", "local business"];
    applyTheme(next, "saffron");
  }

  if (p.includes("green")) applyTheme(next, "green");
  if (p.includes("blue")) applyTheme(next, "blue");
  if (p.includes("dark")) applyTheme(next, "dark");
  if (p.includes("saffron") || p.includes("orange")) applyTheme(next, "saffron");
  if (p.includes("pink")) applyTheme(next, "pink");
  if (p.includes("purple")) applyTheme(next, "purple");

  if (p.includes("gallery") && !next.sections.includes("Gallery")) next.sections.push("Gallery");
  if ((p.includes("doctor") || p.includes("doctors")) && !next.sections.includes("Doctors")) next.sections.push("Doctors");
  if (p.includes("payment") && !next.sections.includes("Payment")) next.sections.push("Payment");
  if (p.includes("faq") && !next.sections.includes("FAQ")) next.sections.push("FAQ");
  if (p.includes("course") && !next.sections.includes("Courses")) next.sections.splice(2, 0, "Courses");

  const phone = extractPhone(prompt);
  if (phone) next.whatsapp = phone;

  const email = extractEmail(prompt);
  if (email) next.email = email;

  const tagline = extractAfter(prompt, ["tagline:", "tagline is", "subtitle:", "subtitle is"]);
  if (tagline) next.tagline = tagline;

  next.description = next.tagline;
  return next;
}

function extractBrand(prompt) {
  const patterns = [
    /(?:for|called|named)\s+([A-Z][A-Za-z0-9&.\- ]{2,80})(?:\.|,|\n| with | using | add | include |$)/,
    /website\s+for\s+([A-Z][A-Za-z0-9&.\- ]{2,80})(?:\.|,|\n| with | using | add | include |$)/i,
    /brand\s*:\s*([^\n.,]{2,80})/i
  ];

  for (const pattern of patterns) {
    const match = prompt.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }

  return "";
}

function extractEmail(text) {
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0] : "";
}

function extractPhone(text) {
  const match = text.match(/(?:\+?\d[\d\s\-()]{8,}\d)/);
  return match ? cleanPhone(match[0]) : "";
}

function extractAfter(text, keys) {
  const lower = text.toLowerCase();

  for (const key of keys) {
    const idx = lower.indexOf(key);
    if (idx >= 0) {
      const raw = text.slice(idx + key.length).split(/\n|\.|,/)[0].trim();
      if (raw.length > 2) return raw;
    }
  }

  return "";
}

function applyTheme(target, name) {
  target.themeName = name;

  const themes = {
    saffron: {
      bg: "#fff7ed",
      text: "#241407",
      card: "#ffffff",
      primary: "#d97706",
      accent: "#f59e0b",
      muted: "#7c5b35",
      line: "#f2d6ad"
    },
    green: {
      bg: "#f0fdf4",
      text: "#102018",
      card: "#ffffff",
      primary: "#15803d",
      accent: "#22c55e",
      muted: "#4b6354",
      line: "#bbf7d0"
    },
    blue: {
      bg: "#eff6ff",
      text: "#101827",
      card: "#ffffff",
      primary: "#2563eb",
      accent: "#38bdf8",
      muted: "#475569",
      line: "#bfdbfe"
    },
    dark: {
      bg: "#111827",
      text: "#f8fafc",
      card: "#1f2937",
      primary: "#f59e0b",
      accent: "#fbbf24",
      muted: "#cbd5e1",
      line: "#374151"
    },
    pink: {
      bg: "#fff1f2",
      text: "#33151c",
      card: "#ffffff",
      primary: "#e11d48",
      accent: "#fb7185",
      muted: "#7f4b58",
      line: "#fecdd3"
    },
    purple: {
      bg: "#faf5ff",
      text: "#251536",
      card: "#ffffff",
      primary: "#7e22ce",
      accent: "#a855f7",
      muted: "#655071",
      line: "#e9d5ff"
    }
  };

  target.colors = themes[name] || themes.saffron;
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

  if (index >= 0) {
    data.sections.splice(index, 1);
  } else {
    data.sections.push(section);
  }

  if (!data.sections.includes("Hero")) {
    data.sections.unshift("Hero");
  }

  renderSectionChips();
  updateAll();
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
  html += "--bg:" + c.bg + ";";
  html += "--text:" + c.text + ";";
  html += "--card:" + c.card + ";";
  html += "--primary:" + c.primary + ";";
  html += "--accent:" + c.accent + ";";
  html += "--muted:" + c.muted + ";";
  html += "--line:" + c.line + ";";
  html += "}";

  html += "*{box-sizing:border-box}";
  html += "html{scroll-behavior:smooth}";
  html += "body{margin:0;font-family:Arial,sans-serif;background:var(--bg);color:var(--text);line-height:1.65}";
  html += "a{text-decoration:none;color:inherit}";
  html += ".wrap{max-width:1120px;margin:auto;padding:0 22px}";
  html += "header{position:sticky;top:0;z-index:50;background:var(--card);border-bottom:1px solid var(--line)}";
  html += ".nav{display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;padding:16px 0}";
  html += ".brand{font-size:22px;font-weight:900;color:var(--primary)}";
  html += "nav{display:flex;gap:14px;flex-wrap:wrap;color:var(--muted);font-weight:800;font-size:14px}";
  html += "nav a:hover{color:var(--primary)}";
  html += "section{padding:70px 0}";
  html += ".hero{display:grid;grid-template-columns:1.15fr .85fr;gap:26px;align-items:center;min-height:72vh}";
  html += "h1{font-size:clamp(34px,6vw,66px);line-height:1.05;margin:0 0 16px}";
  html += "h2{font-size:clamp(26px,4vw,42px);margin:0 0 16px}";
  html += "h3{margin:0 0 8px}";
  html += "p{margin-top:0}";
  html += ".lead{font-size:20px;color:var(--muted);font-weight:700}";
  html += ".panel,.card{background:var(--card);border:1px solid var(--line);border-radius:24px;padding:24px;box-shadow:0 18px 45px rgba(0,0,0,.07)}";
  html += ".hero-card{position:relative;overflow:hidden}";
  html += ".hero-card:before{content:'';position:absolute;inset:-80px;background:radial-gradient(circle,var(--accent),transparent 58%);opacity:.18}";
  html += ".hero-card>*{position:relative}";
  html += ".btn-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:22px}";
  html += ".btn{display:inline-flex;align-items:center;justify-content:center;padding:13px 18px;border-radius:14px;background:var(--primary);color:white;font-weight:900}";
  html += ".btn.alt{background:var(--accent)}";
  html += ".grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}";
  html += ".two{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start}";
  html += ".muted{color:var(--muted)}";
  html += ".pill{display:inline-flex;padding:8px 11px;border-radius:999px;background:var(--card);border:1px solid var(--line);font-weight:900;color:var(--primary);margin:5px}";
  html += ".photo{height:170px;border-radius:22px;border:1px solid var(--line);background:linear-gradient(135deg,var(--card),var(--bg));display:grid;place-items:center;color:var(--muted);font-weight:900}";
  html += ".quote{font-size:18px}";
  html += ".contact-box{display:grid;grid-template-columns:1fr 1fr;gap:16px}";
  html += ".field{padding:13px 14px;border-radius:14px;border:1px solid var(--line);background:var(--bg);margin-bottom:10px}";
  html += "footer{text-align:center;padding:32px 20px;background:var(--card);border-top:1px solid var(--line);color:var(--muted);font-weight:800}";
  html += "@media(max-width:850px){.hero,.grid,.two,.contact-box{grid-template-columns:1fr}.nav{align-items:flex-start}section{padding:48px 0}}";
  html += "</style>";
  html += "</head>";

  html += "<body>";

  html += "<header><div class='wrap nav'>";
  html += "<div class='brand'>" + safe(d.brand) + "</div>";
  html += "<nav>";

  d.sections.forEach(section => {
    if (section !== "Hero") {
      html += "<a href='#" + slug(section) + "'>" + safe(section) + "</a>";
    }
  });

  html += "</nav>";
  html += "</div></header>";

  if (d.sections.includes("Hero")) {
    html += "<main>";
    html += "<section class='wrap hero'>";
    html += "<div>";
    html += "<span class='pill'>" + safe(d.type) + "</span>";
    html += "<h1>" + safe(d.brand) + "</h1>";
    html += "<p class='lead'>" + safe(d.tagline) + "</p>";

    html += "<div>";
    (d.heroBullets || []).forEach(item => {
      html += "<span class='pill'>✓ " + safe(item) + "</span>";
    });
    html += "</div>";

    html += "<div class='btn-row'>";
    html += "<a class='btn' href='#contact'>" + safe(d.ctaPrimary || "Contact Us") + "</a>";
    html += "<a class='btn alt' href='#services'>" + safe(d.ctaSecondary || "Explore") + "</a>";
    html += "</div>";
    html += "</div>";

    html += "<div class='panel hero-card'>";
    html += "<h2>Built for visitors who need clarity</h2>";
    html += "<p class='muted'>This website is generated from your prompt and can be edited, exported and published.</p>";
    html += "<div class='grid' style='grid-template-columns:1fr;gap:10px'>";
    html += "<div class='field'>Fast mobile-friendly layout</div>";
    html += "<div class='field'>SEO-ready title and description</div>";
    html += "<div class='field'>Clear contact and action buttons</div>";
    html += "</div>";
    html += "</div>";
    html += "</section>";
  }

  if (d.sections.includes("About")) {
    html += "<section id='about' class='wrap'>";
    html += "<div class='two'>";
    html += "<div><h2>About</h2><p class='lead'>" + safe(d.about) + "</p></div>";
    html += "<div class='panel'><h3>Why choose us?</h3><p class='muted'>We keep the experience simple, clear and useful for real visitors.</p><span class='pill'>Trusted</span><span class='pill'>Beginner Friendly</span><span class='pill'>Practical</span></div>";
    html += "</div>";
    html += "</section>";
  }

  if (d.sections.includes("Courses")) {
    html += "<section id='courses' class='wrap'>";
    html += "<h2>Courses</h2>";
    html += "<div class='grid'>";
    (d.courses || []).forEach(course => {
      html += "<div class='card'><h3>" + safe(course.title) + "</h3><p class='muted'>" + safe(course.text) + "</p></div>";
    });
    html += "</div>";
    html += "</section>";
  }

  if (d.sections.includes("Services")) {
    html += "<section id='services' class='wrap'>";
    html += "<h2>Services</h2>";
    html += "<div class='grid'>";
    (d.services || []).forEach(service => {
      html += "<div class='card'><h3>" + safe(service.title) + "</h3><p class='muted'>" + safe(service.text) + "</p></div>";
    });
    html += "</div>";
    html += "</section>";
  }

  if (d.sections.includes("Doctors")) {
    html += "<section id='doctors' class='wrap'>";
    html += "<h2>Our Professionals</h2>";
    html += "<div class='grid'>";
    ["Doctor / Therapist 1", "Doctor / Therapist 2", "Doctor / Therapist 3"].forEach(name => {
      html += "<div class='card'><div class='photo'>Photo</div><h3 style='margin-top:14px'>" + name + "</h3><p class='muted'>Professional profile, specialization and booking details can be added here.</p></div>";
    });
    html += "</div>";
    html += "</section>";
  }

  if (d.sections.includes("Gallery")) {
    html += "<section id='gallery' class='wrap'>";
    html += "<h2>Gallery</h2>";
    html += "<div class='grid'>";
    (d.galleryLabels || ["Image 1", "Image 2", "Image 3"]).forEach(label => {
      html += "<div class='photo'>" + safe(label) + "</div>";
    });
    html += "</div>";
    html += "</section>";
  }

  if (d.sections.includes("Testimonials")) {
    html += "<section id='testimonials' class='wrap'>";
    html += "<h2>Testimonials</h2>";
    html += "<div class='grid'>";
    (d.testimonials || []).forEach(quote => {
      html += "<div class='card quote'>“" + safe(quote) + "”</div>";
    });
    html += "</div>";
    html += "</section>";
  }

  if (d.sections.includes("Payment")) {
    html += "<section id='payment' class='wrap'>";
    html += "<div class='panel two'>";
    html += "<div><h2>Payment</h2><p class='muted'>Use this section for course fees, booking amount, products or service payments.</p></div>";
    html += "<div><a class='btn' href='#contact'>" + safe(d.paymentText || "Pay Now") + "</a><p class='muted' style='margin-top:12px'>Replace this with your real payment link or Razorpay button later.</p></div>";
    html += "</div>";
    html += "</section>";
  }

  if (d.sections.includes("FAQ")) {
    html += "<section id='faq' class='wrap'>";
    html += "<h2>FAQ</h2>";
    html += "<div class='grid'>";
    html += "<div class='card'><h3>How do I start?</h3><p class='muted'>Use the contact button and send your requirement.</p></div>";
    html += "<div class='card'><h3>Is this beginner friendly?</h3><p class='muted'>Yes, the content is written clearly for new visitors.</p></div>";
    html += "<div class='card'><h3>Can I customize it?</h3><p class='muted'>Yes, edit the HTML or JSON after export.</p></div>";
    html += "</div>";
    html += "</section>";
  }

  if (d.sections.includes("Contact")) {
    html += "<section id='contact' class='wrap'>";
    html += "<h2>Contact</h2>";
    html += "<div class='contact-box'>";
    html += "<div class='panel'>";
    html += "<h3>Send an enquiry</h3>";
    html += "<div class='field'>Your Name</div>";
    html += "<div class='field'>Your Email / Phone</div>";
    html += "<div class='field'>Your Message</div>";
    html += "<a class='btn' href='mailto:" + safe(d.email || "hello@example.com") + "'>Send Email</a>";

    if (phone) {
      html += "<a class='btn alt' href='https://wa.me/" + safe(phone) + "' target='_blank' rel='noopener'>WhatsApp</a>";
    }

    html += "</div>";

    html += "<div class='panel'>";
    html += "<h3>Contact Details</h3>";
    html += "<p class='muted'>Email: " + safe(d.email || "Add your email") + "</p>";
    html += "<p class='muted'>WhatsApp: " + safe(phone || "Add WhatsApp number") + "</p>";
    html += "<p class='muted'>Website generated with Prompt Website Builder V9.</p>";
    html += "</div>";
    html += "</div>";
    html += "</section>";
  }

  html += "</main>";
  html += "<footer>© " + new Date().getFullYear() + " " + safe(d.brand) + ". All rights reserved.</footer>";
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
    const encoded = encodeBase64Unicode(html)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    document.getElementById("openEditorLink").href =
      "https://editor.learnwithchampak.live/samples/html/preview/#code=" + encoded;
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

  a.href = URL.createObjectURL(blob);
  a.download = filename;

  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(a.href);
}

function downloadHTML() {
  downloadFile("prompt-generated-website.html", buildWebsiteHTML(), "text/html");
  setStatus("HTML downloaded.", "good");
}

function downloadJSON() {
  downloadFile("website-config.json", JSON.stringify(data, null, 2), "application/json");
  setStatus("JSON downloaded.", "good");
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
  localStorage.setItem("promptWebsiteBuilderV9", JSON.stringify(data));
  setStatus("Project saved in this browser.", "good");
}

function loadProject() {
  const saved = localStorage.getItem("promptWebsiteBuilderV9");

  if (!saved) {
    setStatus("No saved project found.", "bad");
    return;
  }

  try {
    data = JSON.parse(saved);
    renderInputs();
    updateAll();
    setStatus("Project loaded.", "good");
  } catch (e) {
    setStatus("Saved project is damaged.", "bad");
  }
}

function resetAll() {
  data = structuredClone(DEFAULT_DATA);
  document.getElementById("promptBox").value = samples.education;
  renderInputs();
  updateAll();
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

renderInputs();
updateAll();