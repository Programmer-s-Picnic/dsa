# Champuter — Learn With Champak Blogger Integration

## Status

Phases **1, 2 and 3** are in this repository. Deployed as GitHub Pages resources under `https://dsa.learnwithchampak.live/tools/champuter-blog/`. Updating those resources **does not directly edit the Blogger theme**.

The existing Phase 1 menu now loads Phases 2–3 from the same installation. Refresh the Blogger theme's two `phase1` asset URLs to use `v=20261111-5`.

## Installation without replacing the working Blogger theme

In **Blogger → Theme → Edit HTML**, change only the existing Phase 1 stylesheet and script version values to:

```html
<link href='https://dsa.learnwithchampak.live/tools/champuter-blog/phase1.css?v=20261111-5' rel='stylesheet' type='text/css'/>
<script defer='defer' src='https://dsa.learnwithchampak.live/tools/champuter-blog/phase1.js?v=20261111-5' type='text/javascript'></script>
```

**Do not add a second copy** of either tag. The Phase 1 controller automatically loads:

- `phase23.css?v=20261111-5`
- `phase23.js?v=20261111-5`

If you instead import the complete updated XML theme, back up the current live theme first; an XML import may discard edits made since your previous export.

## Phase 1 — Site-wide teacher

Full-body Champuter, collapsible menu, Teach This Lesson, Read Aloud, Explain Selection, Previous/Next/Stop, English/Hindi, adjustable speech rate, article element highlighting and walking, responsive mobile dock. The former **Speak Content** uses the same controller to avoid overlapping speech. Hidden quiz content is excluded from article reading.

## Phase 2 — Python lesson code

Python `<pre><code>` examples inside article bodies are detected automatically and receive:

- **Explain**: a deterministic, syntax-aware explanation of imports, assignments, loops, conditions, functions, output, and Pandas, with Champuter highlighting and speaking
- **Run in Editor**: opens a new Super Editor tab with the exact example preloaded
- **Visualize in Editor**: opens the same program in the Super Editor, where the student presses Visualize to execute and explore real runtime data

Code transfer reuses the Super Editor's original base64url JSON share-link format, preserving indentation and Unicode. This phase does not execute Python in Blogger, transmit student data to an AI provider, or claim to calculate results. Very large snippets use clipboard transfer rather than oversized fragment URLs. Other languages and quiz-option code are excluded.

## Phase 3 — Two programming quiz formats

Works with **inline `.lwc-quiz` quizzes** based on the existing `json-images/tests/lwc-quiz-engine.js`:

1. Code-to-Output
2. Output-to-Code

Each active question gets **Read Question** and **Hint · No Answer**. Hints use source code and requested-output structure, **never the hidden correct answer or option key**. Hindi / English language preferences carry over.

After the quiz engine submits the test, Champuter adds **Review test with Champuter** and **Explain this review** to any already visible review. When the quiz engine hides answer reviews, Champuter does not override that setting.

The extension never checks a radio input, submits a form, changes a timer, calculates a score, or edits quiz questions. The original quiz engine remains authoritative. Time continues while hints or audio play.

## Demos

- [Phase 1 — articles](https://dsa.learnwithchampak.live/tools/champuter-blog/demo.html)
- [Phases 2–3 — Python plus live two-format quiz examples](https://dsa.learnwithchampak.live/tools/champuter-blog/demo-phase23.html)

The quiz demo uses published NumPy question JSON and the original quiz engine, rather than a substitute scoring implementation.

## Test matrix

Test on desktop and mobile: (1) regular articles; (2) simple loop and Pandas examples; (3) Unicode and indentation preservation when opening Editor; (4) Code-to-Output and Output-to-Code timed quizzes; (5) hint before submission; (6) correct/incorrect review after submission; (7) retake; (8) hidden review configuration; (9) browser speech blocked; (10) mobile menu collisions and text highlighting.

Script and static DOM contract tests passed in development. Browser-based end-to-end execution and live Blogger theme activation still require checks after Blogger installation.
