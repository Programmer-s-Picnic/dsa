# Champuter — Learn With Champak Blogger, Phase 1

Phase 1 adds a small, animated, user-controlled Champuter teacher to every page in the Blogger theme.

## Files

- `phase1.js`: animated Champuter (the avatar was derived from the existing Cartoon Speaker Studio), article segment detector, guided tour, browser speech, selected-text teaching, old "Speak Content" integration, and lifecycle cleanup
- `phase1.css`: scoped desktop/mobile teaching controls, animations, active-section highlight, reduced-motion support, print hiding
- `demo.html`: standalone demo with headings, normal paragraphs, code, lists, and a table

## Blogger installation

A full import-ready template has been generated from the uploaded `lwc.xml` without replacing the site's other features. Import the generated XML via **Blogger → Theme → ▼ → Restore → Upload**, after downloading a backup of the live theme.

Alternatively add exactly these two assets to an already-current theme (do not install both approaches):

In `<head>`:
```html
<link rel="stylesheet" href="https://dsa.learnwithchampak.live/tools/champuter-blog/phase1.css?v=20261111-4"/>
```
Before `</body>`:
```html
<script defer src="https://dsa.learnwithchampak.live/tools/champuter-blog/phase1.js?v=20261111-4"></script>
```

## Features

- Visible, collapsible Champuter dock, with full-body rust T-shirt / navy long-short SVG
- Teach This Lesson: moves to and highlights headings, paragraphs, code, lists, tables, images, and their captions; narrates their text
- Read Aloud: reads article sections in sequence
- Explain Selection: deterministic introductory guidance and code-keyword explanation; this phase does **not** call an AI model
- Previous, Next, Stop, English / Hindi voice preference, speech rate
- Existing Blogger **Speak Content** button now launches/stops Champuter via capture-phase handoff; prevents duplicate speech handlers
- Home page: highlights learning cards when an article is not open
- No spontaneous audio, analytics, external LLM calls, or user-text uploads
- Bounded max 180 article segments; autoplay depends on Web Speech support and browser permission

## Test and verification

The imported Blogger XML was validated with an XML parser and checked to preserve Blogger namespaces, the old Speak Content markup, and the rest of the theme. The JavaScript passed syntax validation and a simulated narration flow with heading, paragraph, code, and stop state. Also verify on **actual mobile and desktop browsers** after Blogger import. Check interactions with site clock, install button, slideshow, comments, Card Studio, and mobile navbar.

GitHub Pages demonstration: https://dsa.learnwithchampak.live/tools/champuter-blog/demo.html
