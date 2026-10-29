/* Chapter editor links and direct sharing for Dromey question bank. */
(() => {
  "use strict";

  const root = document.querySelector("#main-content");
  if (!root) return;

  const pageURL = "https://dsa.learnwithchampak.live/questions/how-to-solve-it-by-computer/";
  const editors = [
    { name: "Python Editor", url: "https://editor.learnwithchampak.live/python-starter/editor/super/?tmode=1", description: "Run Python solutions" },
    { name: "SQL Editor", url: "https://editor.learnwithchampak.live/sql/", description: "Practice data queries" },
    { name: "All Editors", url: "https://editor.learnwithchampak.live/", description: "Browse the editor hub" }
  ];

  const shareDialog = document.createElement("dialog");
  shareDialog.className = "dromey-share-dialog";
  shareDialog.setAttribute("aria-labelledby", "dromey-share-heading");
  shareDialog.innerHTML = [
    '<div class="dromey-modal-head"><div><span class="dromey-kicker">Share this resource</span>',
    '<h2 id="dromey-share-heading">Share chapter or question</h2></div>',
    '<button type="button" class="dromey-close" aria-label="Close sharing options">×</button></div>',
    '<p class="dromey-share-description" id="dromey-share-description"></p>',
    '<label class="dromey-share-label" for="dromey-share-url">Direct link</label>',
    '<div class="dromey-copy-row"><input id="dromey-share-url" type="text" readonly aria-label="Direct share link">',
    '<button type="button" id="dromey-copy-link" class="dromey-action">Copy link</button></div>',
    '<div class="dromey-share-grid">',
    '<button type="button" data-native-share class="dromey-share-option" hidden>Share via apps</button>',
    '<a data-share-service="whatsapp" class="dromey-share-option" target="_blank" rel="noopener noreferrer">WhatsApp</a>',
    '<a data-share-service="telegram" class="dromey-share-option" target="_blank" rel="noopener noreferrer">Telegram</a>',
    '<a data-share-service="facebook" class="dromey-share-option" target="_blank" rel="noopener noreferrer">Facebook</a>',
    '<a data-share-service="linkedin" class="dromey-share-option" target="_blank" rel="noopener noreferrer">LinkedIn</a>',
    '<a data-share-service="x" class="dromey-share-option" target="_blank" rel="noopener noreferrer">X / Twitter</a>',
    '<a data-share-service="email" class="dromey-share-option">Email</a>',
    '</div><p class="dromey-copy-feedback" role="status" aria-live="polite"></p>'
  ].join("");
  document.body.appendChild(shareDialog);

  let activeShare = null;
  const urlInput = shareDialog.querySelector("#dromey-share-url");
  const feedback = shareDialog.querySelector(".dromey-copy-feedback");

  function makeShareButton(label, id, title, description, className) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className || "dromey-share-button";
    button.textContent = label;
    button.dataset.shareTarget = id;
    button.dataset.shareTitle = title;
    button.dataset.shareDescription = description;
    button.setAttribute("aria-label", "Share " + title);
    return button;
  }

  function shareURL(id) {
    return pageURL + "#" + encodeURIComponent(id);
  }

  function showShare(button) {
    activeShare = {
      title: button.dataset.shareTitle,
      description: button.dataset.shareDescription,
      url: shareURL(button.dataset.shareTarget)
    };
    const title = activeShare.title;
    const url = activeShare.url;
    const body = title + "\n" + activeShare.description + "\n" + url;
    shareDialog.querySelector("#dromey-share-heading").textContent = title;
    shareDialog.querySelector("#dromey-share-description").textContent = activeShare.description;
    urlInput.value = url;
    feedback.textContent = "";
    const services = {
      whatsapp: "https://wa.me/?text=" + encodeURIComponent(body),
      telegram: "https://t.me/share/url?url=" + encodeURIComponent(url) + "&text=" + encodeURIComponent(title),
      facebook: "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url),
      linkedin: "https://www.linkedin.com/sharing/share-offsite/?url=" + encodeURIComponent(url),
      x: "https://twitter.com/intent/tweet?text=" + encodeURIComponent(title) + "&url=" + encodeURIComponent(url),
      email: "mailto:?subject=" + encodeURIComponent(title) + "&body=" + encodeURIComponent(body)
    };
    for (const [service, link] of Object.entries(services)) {
      shareDialog.querySelector('[data-share-service="' + service + '"]').href = link;
    }
    shareDialog.querySelector("[data-native-share]").hidden = !("share" in navigator);
    if (!shareDialog.open) shareDialog.showModal();
  }

  async function copyURL() {
    if (!activeShare) return;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(activeShare.url);
      } else {
        urlInput.focus();
        urlInput.select();
        if (!document.execCommand("copy")) throw new Error("Copy unavailable");
      }
      feedback.textContent = "Link copied. It opens directly at this item.";
    } catch (_error) {
      urlInput.focus();
      urlInput.select();
      feedback.textContent = "Select and copy the highlighted link.";
    }
  }

  shareDialog.querySelector(".dromey-close").addEventListener("click", () => shareDialog.close());
  shareDialog.addEventListener("click", event => {
    if (event.target === shareDialog) shareDialog.close();
  });
  shareDialog.querySelector("#dromey-copy-link").addEventListener("click", copyURL);
  shareDialog.querySelector("[data-native-share]").addEventListener("click", async () => {
    if (!activeShare || !navigator.share) return;
    try {
      await navigator.share({
        title: activeShare.title,
        text: activeShare.description,
        url: activeShare.url
      });
      shareDialog.close();
    } catch (error) {
      if (error.name !== "AbortError") feedback.textContent = "Use Copy link or another sharing option.";
    }
  });
  document.addEventListener("click", event => {
    const button = event.target.closest("[data-share-target]");
    if (button) showShare(button);
  });

  const sections = Array.from(document.querySelectorAll(".chapter"));
  sections.forEach(section => {
    const chapterNo = section.dataset.chapter;
    const heading = section.querySelector(".chapter-heading h2");
    if (!heading) return;
    const chapterTitle = "Chapter " + chapterNo + ": " + heading.textContent.trim();
    const desc = "Practice " + heading.textContent.trim() + " on Programmer's Picnic.";

    const headerButton = makeShareButton("Share chapter", section.id, chapterTitle, desc, "dromey-share-button dromey-share-chapter");
    section.querySelector(".chapter-heading").appendChild(headerButton);

    section.querySelectorAll(".question[data-question]").forEach(question => {
      const number = question.querySelector(".question-id");
      const paragraph = question.querySelector("p");
      if (!number || !paragraph) return;
      const qNo = number.textContent.trim();
      question.id = "question-" + qNo.replace(/[^0-9a-z]+/gi, "-").replace(/-$/, "");
      const description = paragraph.textContent.trim();
      const text = description.length > 220 ? description.slice(0, 217) + "…" : description;
      const content = document.createElement("div");
      content.className = "dromey-question-content";
      paragraph.parentNode.insertBefore(content, paragraph);
      content.appendChild(paragraph);
      content.appendChild(makeShareButton("Share question", question.id, "Question " + qNo + " · How to Solve It by Computer", text, "dromey-share-button dromey-share-small"));
    });

    section.querySelectorAll(".algorithm-card[id] .worked-example").forEach(example => {
      const card = example.closest(".algorithm-card");
      const label = card.querySelector(".algorithm-label");
      const title = card.querySelector(".algorithm-head h3");
      const paragraph = example.querySelector("p");
      if (!label || !paragraph) return;
      example.id = "example-" + card.id.replace(/^algorithm-/, "");
      const text = paragraph.textContent.trim();
      const action = makeShareButton("Share example", example.id,
        label.textContent.trim() + ": " + (title ? title.textContent.trim() : "Worked example"),
        text.length > 220 ? text.slice(0, 217) + "…" : text, "dromey-share-button dromey-share-small");
      example.appendChild(action);
    });

    const footer = document.createElement("div");
    footer.className = "dromey-chapter-tools";
    const headingElement = document.createElement("h3");
    headingElement.textContent = "Put this chapter into practice";
    const note = document.createElement("p");
    note.textContent = "Choose an editor to write and test your solutions, or share this chapter with your students.";
    const links = document.createElement("div");
    links.className = "dromey-editor-links";
    editors.forEach(editor => {
      const a = document.createElement("a");
      a.href = editor.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.className = "dromey-editor-link";
      a.title = editor.description + " (opens in a new tab)";
      a.textContent = editor.name + " ↗";
      links.appendChild(a);
    });
    links.appendChild(makeShareButton("Share this chapter", section.id, chapterTitle, desc, "dromey-share-button dromey-footer-share"));
    footer.append(headingElement, note, links);
    section.appendChild(footer);
  });

  function revealHashTarget() {
    const id = decodeURIComponent(location.hash.slice(1));
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;
    const search = document.getElementById("question-search");
    const filter = document.getElementById("chapter-filter");
    if (target.closest(".chapter[hidden]") || target.closest("[data-search-block][hidden]") || target.hidden) {
      if (search) {
        search.value = "";
        search.dispatchEvent(new Event("input", { bubbles: true }));
      }
      if (filter) {
        filter.value = "all";
        filter.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
    const details = target.closest("details");
    if (details) details.open = true;
    target.classList.add("dromey-linked-target");
    window.setTimeout(() => {
      target.scrollIntoView({ behavior: "auto", block: "center" });
      target.classList.remove("dromey-linked-target");
    }, 90);
  }

  window.addEventListener("hashchange", revealHashTarget);
  if (location.hash) revealHashTarget();
})();
