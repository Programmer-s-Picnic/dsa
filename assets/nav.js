(function () {
  "use strict";

  const BASE = "https://dsa.learnwithchampak.live";

  /* -------- PATH FIX -------- */
  function getBase() {
    const depth = location.pathname.split("/").length - 2;
    return depth <= 0 ? "." : "../".repeat(depth);
  }
  const ROOT = getBase();

  /* -------- NAV HTML -------- */
  const html = `
<style>
:root{
  --bg:#fffaf0;
  --accent:#f59e0b;
  --accent2:#d97706;
  --text:#2b2112;
}

#pp-nav{
  position:sticky;
  top:0;
  z-index:9999;
  background:linear-gradient(90deg,var(--accent),var(--accent2));
  color:#fff;
}

.pp-wrap{
  max-width:1200px;
  margin:auto;
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:10px;
}

.pp-logo{
  font-weight:bold;
}

.pp-menu{
  display:flex;
  gap:14px;
  align-items:center;
}

.pp-menu a{
  color:#fff;
  text-decoration:none;
}

.pp-ham{
  display:none;
  font-size:22px;
  cursor:pointer;
}

/* dropdown */
.pp-dropdown{
  position:relative;
}

.pp-btn{
  background:none;
  border:0;
  color:#fff;
  cursor:pointer;
}

.pp-panel{
  position:absolute;
  top:35px;
  left:0;
  background:#fff;
  color:#333;
  display:none;
  padding:12px;
  border-radius:10px;
  width:260px;
}

.pp-panel.open{
  display:block;
}

.pp-panel a{
  display:block;
  color:#333;
  padding:6px 0;
}

/* search */
.pp-search{
  padding:6px;
  border-radius:6px;
  border:none;
}

/* mobile */
@media(max-width:768px){
  .pp-menu{
    position:absolute;
    top:55px;
    left:0;
    right:0;
    background:#fff;
    flex-direction:column;
    display:none;
    padding:16px;
  }

  .pp-menu a,.pp-btn{
    color:#333;
  }

  .pp-menu.active{
    display:flex;
  }

  .pp-ham{
    display:block;
  }

  .pp-panel{
    position:static;
    width:100%;
    box-shadow:none;
  }
}
</style>

<div id="pp-nav">
  <div class="pp-wrap">
    <div class="pp-logo">📚 DSA</div>

    <div class="pp-ham" onclick="ppToggle()">☰</div>

    <div class="pp-menu" id="ppMenu">

      <a href="${ROOT}/index.html">Home</a>

      <div class="pp-dropdown">
        <button class="pp-btn" onclick="ppDrop(event,'java')">Java ▾</button>
        <div class="pp-panel" id="java">
          <a href="${ROOT}/java/arithmetic/index.html">Arithmetic</a>
          <a href="${ROOT}/java/boolean/index.html">Boolean</a>
          <a href="${ROOT}/java/io/index.html">IO</a>
          <a href="${ROOT}/java/if-else-ternary-switch/index.html">If Else</a>
          <a href="${ROOT}/java/loops/for/index.html">For Loop</a>
          <a href="${ROOT}/java/loops/while/index.html">While Loop</a>
          <a href="${ROOT}/java/loops/nested/index.html">Nested</a>
        </div>
      </div>

      <div class="pp-dropdown">
        <button class="pp-btn" onclick="ppDrop(event,'python')">Python ▾</button>
        <div class="pp-panel" id="python">
          <a href="${ROOT}/python/sorting/index.html">Sorting</a>
          <a href="${ROOT}/python/sorting/bubble-sort/index.html">Bubble</a>
          <a href="${ROOT}/python/sorting/selection-sort/index.html">Selection</a>
          <a href="${ROOT}/python/sorting/insertion-sort/index.html">Insertion</a>
          <a href="${ROOT}/python/sorting/merge-sort/index.html">Merge</a>
          <a href="${ROOT}/python/sorting/quick-sort/index.html">Quick</a>
          <a href="${ROOT}/python/sorting/heap-sort/index.html">Heap</a>
          <a href="${ROOT}/python/sorting/counting-sort/index.html">Counting</a>
          <a href="${ROOT}/python/sorting/radix-sort/index.html">Radix</a>
        </div>
      </div>

      <div class="pp-dropdown">
        <button class="pp-btn" onclick="ppDrop(event,'viz')">Visualizers ▾</button>
        <div class="pp-panel" id="viz">
          <a href="${ROOT}/visualizers/searching/index.html">Searching</a>
          <a href="${ROOT}/visualizers/recursion/index.html">Recursion</a>
          <a href="${ROOT}/visualizers/shortest-path/index.html">Shortest Path</a>
          <a href="${ROOT}/visualizers/minimum-spanning-tree/index.html">MST</a>
          <a href="${ROOT}/visualizers/maths/index.html">Maths</a>
          <a href="${ROOT}/visualizers/maths/probability/index.html">Probability</a>
        </div>
      </div>

      <a href="${ROOT}/sorting/identifier/index.html">Identifier</a>
      <a href="${ROOT}/sorting/detector/index.html">Detector</a>
      <a href="${ROOT}/videos/index.html">Videos</a>

      <input id="ppSearch" class="pp-search" placeholder="Search..." />

    </div>
  </div>
</div>
`;

  document.body.insertAdjacentHTML("afterbegin", html);

  /* -------- MOBILE -------- */
  window.ppToggle = function () {
    document.getElementById("ppMenu").classList.toggle("active");
  };

  /* -------- DROPDOWN FIX -------- */
  window.ppDrop = function (e, id) {
    e.stopPropagation();
    document.querySelectorAll(".pp-panel").forEach(p => {
      if (p.id !== id) p.classList.remove("open");
    });
    document.getElementById(id).classList.toggle("open");
  };

  document.addEventListener("click", () => {
    document.querySelectorAll(".pp-panel").forEach(p => p.classList.remove("open"));
  });

  /* -------- SEARCH -------- */
  const pages = [
    "java/arithmetic",
    "java/boolean",
    "java/io",
    "java/if-else-ternary-switch",
    "python/sorting",
    "python/sorting/bubble-sort",
    "python/sorting/quick-sort",
    "visualizers/searching",
    "visualizers/recursion",
    "visualizers/shortest-path",
    "sorting/identifier",
    "sorting/detector",
    "videos"
  ];

  document.getElementById("ppSearch").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      const q = this.value.toLowerCase();
      const found = pages.find(p => p.includes(q));
      if (found) {
        location.href = BASE + "/" + found + "/index.html";
      } else {
        alert("No results found");
      }
    }
  });

})();