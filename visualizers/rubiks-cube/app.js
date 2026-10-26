(() => {
  'use strict';

  const FACES = ['U', 'R', 'F', 'D', 'L', 'B'];
  const COLORS = {
    W: { name: 'White', hex: '#fbfdff' },
    R: { name: 'Red', hex: '#e9444f' },
    G: { name: 'Green', hex: '#20ad75' },
    Y: { name: 'Yellow', hex: '#ffdb48' },
    O: { name: 'Orange', hex: '#fb9d31' },
    B: { name: 'Blue', hex: '#3885e9' }
  };
  const DEFAULT_CENTRES = { U: 'W', R: 'R', F: 'G', D: 'Y', L: 'O', B: 'B' };
  const SOLVED = FACES.map(face => face.repeat(9)).join('');
  const $ = id => document.getElementById(id);
  const net = $('net');
  const palette = $('palette');
  const cube3d = $('cube3d');
  const stepInfo = $('stepInfo');
  const status = $('status');
  const countBox = $('counts');
  const movesBox = $('moves');
  const progress = $('progress');
  const solveButton = $('solve');
  const storageKey = 'picnic-rubiks-cube-v1';

  let stickers = solvedStickers();
  let selected = 'W';
  let editHistory = [];
  let solutionMoves = [];
  let snapshots = [];
  let step = 0;
  let playing = null;
  let worker = null;
  let busy = false;
  let requestId = 0;
  let pendingTimeout = null;
  let viewX = -25;
  let viewY = -36;

  function solvedStickers() {
    return FACES.flatMap(face => Array(9).fill(DEFAULT_CENTRES[face]));
  }

  function persist() {
    try { localStorage.setItem(storageKey, stickers.join('')); } catch (error) { /* private browsing */ }
  }

  function restore() {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved && saved.length === 54 && [...saved].every(color => COLORS[color])) {
        stickers = saved.split('');
      }
    } catch (error) { /* storage unavailable */ }
  }

  function show(message, type = '') {
    status.className = 'status' + (type ? ' ' + type : '');
    status.textContent = message;
  }

  function displayStickers() {
    return snapshots.length ? snapshots[step] : stickers;
  }

  function centersOf(arr) {
    return Object.fromEntries(FACES.map((face, i) => [face, arr[i * 9 + 4]]));
  }

  function paintPalette() {
    palette.replaceChildren();
    for (const [letter, color] of Object.entries(COLORS)) {
      const button = document.createElement('button');
      button.className = 'swatch' + (letter === selected ? ' active' : '');
      button.type = 'button';
      button.setAttribute('aria-pressed', String(letter === selected));
      button.setAttribute('aria-label', 'Paint with ' + color.name);
      const dot = document.createElement('span');
      dot.className = 'color';
      dot.style.background = color.hex;
      button.append(dot, document.createTextNode(color.name));
      button.addEventListener('click', () => { selected = letter; paintPalette(); });
      palette.append(button);
    }
  }

  function paintNet() {
    net.replaceChildren();
    const visible = displayStickers();
    for (const face of ['U', 'L', 'F', 'R', 'B', 'D']) {
      const f = FACES.indexOf(face);
      const group = document.createElement('section');
      group.className = 'face-group';
      group.dataset.face = face;
      const title = document.createElement('h3');
      title.textContent = ({ U: 'UP', L: 'LEFT', F: 'FRONT', R: 'RIGHT', B: 'BACK', D: 'DOWN' })[face];
      const grid = document.createElement('div');
      grid.className = 'stickers';
      for (let i = 0; i < 9; i++) {
        const index = f * 9 + i;
        const letter = visible[index];
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'sticker' + (i === 4 ? ' center' : '');
        button.style.background = COLORS[letter].hex;
        button.dataset.index = String(index);
        button.setAttribute('aria-label', face + ' sticker ' + (i + 1) + ': ' + COLORS[letter].name + (i === 4 ? ', centre' : ''));
        button.title = face + (i + 1) + ': ' + COLORS[letter].name;
        grid.append(button);
      }
      group.append(title, grid);
      net.append(group);
    }
  }

  function paint3D() {
    cube3d.replaceChildren();
    const visible = displayStickers();
    const activeFace = step > 0 ? solutionMoves[step - 1]?.[0] : '';
    for (const face of FACES) {
      const f = FACES.indexOf(face);
      const section = document.createElement('div');
      section.className = 'cube-face' + (face === activeFace ? ' highlight' : '');
      section.dataset.face = face;
      section.setAttribute('aria-label', face + ' face');
      for (let i = 0; i < 9; i++) {
        const sticker = document.createElement('span');
        sticker.style.backgroundColor = COLORS[visible[f * 9 + i]].hex;
        section.append(sticker);
      }
      cube3d.append(section);
    }
    updateView();
  }

  function updateView() {
    cube3d.style.transform = 'rotateX(' + viewX + 'deg) rotateY(' + viewY + 'deg)';
  }

  function paintCounts() {
    countBox.replaceChildren();
    const visible = displayStickers();
    for (const [letter, color] of Object.entries(COLORS)) {
      const count = visible.filter(c => c === letter).length;
      const chip = document.createElement('span');
      chip.textContent = color.name + ': ' + count + '/9';
      if (count !== 9) chip.style.color = '#a73920';
      countBox.append(chip);
    }
  }

  function paintSteps() {
    const length = solutionMoves.length;
    const hasSolution = snapshots.length > 0;
    $('previous').disabled = !hasSolution || step === 0;
    $('next').disabled = !hasSolution || step >= length;
    $('play').disabled = !hasSolution || !length || step >= length;
    $('copy').disabled = !hasSolution || !length;
    $('play').textContent = playing ? 'Ⅱ Pause' : '▶ Play';
    progress.max = Math.max(1, length);
    progress.value = step;
    if (!hasSolution) {
      stepInfo.textContent = 'No solution yet';
    } else if (length === 0) {
      stepInfo.textContent = 'Already solved — no moves required';
    } else if (step === 0) {
      stepInfo.textContent = 'Ready: ' + length + ' moves. Press Next to start.';
    } else if (step === length) {
      stepInfo.textContent = 'Solved! Completed all ' + length + ' moves.';
    } else {
      stepInfo.textContent = 'Move ' + step + ' of ' + length + ': ' + solutionMoves[step - 1];
    }
    movesBox.replaceChildren();
    if (!length) return;
    solutionMoves.forEach((move, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'move' + (index === step - 1 ? ' current' : '') + (index < step - 1 ? ' done' : '');
      button.textContent = move;
      button.title = 'Show cube after move ' + (index + 1);
      button.setAttribute('aria-label', 'Go to move ' + (index + 1) + ', ' + move);
      button.addEventListener('click', () => goTo(index + 1));
      movesBox.append(button);
    });
    const active = movesBox.querySelector('.move.current');
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  function render() {
    paintNet();
    paint3D();
    paintCounts();
    paintSteps();
    $('undo').disabled = editHistory.length === 0 || busy;
    solveButton.disabled = busy;
    solveButton.textContent = busy ? 'Solving…' : 'Solve my cube';
  }

  function stopPlay() {
    if (playing) { clearInterval(playing); playing = null; }
  }

  function clearSolution() {
    stopPlay();
    snapshots = [];
    solutionMoves = [];
    step = 0;
  }

  function makeEdit(next) {
    if (busy || next.join('') === displayStickers().join('')) return;
    editHistory.push(stickers.slice());
    if (editHistory.length > 50) editHistory.shift();
    stickers = next;
    clearSolution();
    persist();
    show('Cube updated. Continue entering stickers, then select Solve my cube.');
    render();
  }

  function validCube(arr) {
    if (!Array.isArray(arr) || arr.length !== 54 || arr.some(c => !COLORS[c])) {
      throw new Error('The cube must contain exactly 54 valid stickers.');
    }
    for (const color of Object.keys(COLORS)) {
      const count = arr.filter(c => c === color).length;
      if (count !== 9) throw new Error('Each colour must appear exactly nine times. ' + COLORS[color].name + ' appears ' + count + ' times.');
    }
    const centers = centersOf(arr);
    if (new Set(Object.values(centers)).size !== 6) {
      throw new Error('All six centre stickers must have different colours.');
    }
    const translate = Object.fromEntries(FACES.map(face => [centers[face], face]));
    const facelets = arr.map(color => translate[color]).join('');
    const cube = Cube.fromString(facelets);
    const c = cube.toJSON();
    if (cube.asString() !== facelets) {
      throw new Error('One or more corner or edge colour combinations are impossible. Check sticker orientation and entries.');
    }
    const permutation = (values, length) => values.length === length &&
      new Set(values).size === length && values.every(x => Number.isInteger(x) && x >= 0 && x < length);
    if (!permutation(c.cp, 8) || !permutation(c.ep, 12)) {
      throw new Error('Duplicate or missing cubies. Recheck the colour positions.');
    }
    if (c.co.some(x => !Number.isInteger(x) || x < 0 || x > 2) ||
      c.eo.some(x => !Number.isInteger(x) || x < 0 || x > 1)) {
      throw new Error('Cube orientations are invalid.');
    }
    if (c.co.reduce((a, b) => a + b, 0) % 3 !== 0) {
      throw new Error('Impossible cube: corner twist parity is invalid. Check corner stickers.');
    }
    if (c.eo.reduce((a, b) => a + b, 0) % 2 !== 0) {
      throw new Error('Impossible cube: one or more edges are flipped. Recheck the stickers.');
    }
    const parity = arr => {
      let result = 0;
      for (let i = 0; i < arr.length; i++)
        for (let j = i + 1; j < arr.length; j++)
          if (arr[i] > arr[j]) result ^= 1;
      return result;
    };
    if (parity(c.cp) !== parity(c.ep)) {
      throw new Error('Impossible cube: edge and corner permutation parity do not match.');
    }
    return { facelets, centers };
  }

  function startSolve() {
    if (busy) return;
    clearSolution();
    render();
    let data;
    try { data = validCube(stickers); }
    catch (error) { show(error.message, 'error'); return; }
    if (data.facelets === SOLVED) {
      snapshots = [stickers.slice()];
      show('This cube is already solved! Try Random scramble for a new challenge.', 'success');
      render();
      return;
    }
    if (!window.Worker) {
      show('This browser does not support background workers, which are required for solving.', 'error');
      return;
    }
    const id = ++requestId;
    busy = true;
    render();
    show('Preparing the solver and finding moves. Your cube stays on screen while this runs.');
    try {
      if (!worker) worker = new Worker('./solver.worker.js');
      worker.onmessage = event => {
        if (id !== requestId || !busy || event.data.requestId !== id) return;
        if (event.data.type === 'preparing') {
          show('Building the search tables (first solve only). This may take a few seconds on mobile.');
        } else if (event.data.type === 'solution') {
          finishBusy();
          try { receiveSolution(event.data.solution, data); }
          catch (error) { show('Could not display the solution: ' + error.message, 'error'); }
        } else if (event.data.type === 'error') {
          finishBusy();
          show('Unable to solve: ' + event.data.message, 'error');
        }
      };
      worker.onerror = () => {
        if (id !== requestId) return;
        finishBusy();
        if (worker) worker.terminate();
        worker = null;
        show('Solver could not start. Reload the page and try again.', 'error');
      };
      worker.postMessage({ facelets: data.facelets, requestId: id });
      pendingTimeout = setTimeout(() => {
        if (busy && requestId === id) {
          finishBusy();
          if (worker) worker.terminate();
          worker = null;
          show('Solver timed out on this device. Close other tabs and try again.', 'error');
        }
      }, 90000);
    } catch (error) {
      finishBusy();
      show('Unable to start the solver: ' + error.message, 'error');
    }
  }

  function finishBusy() {
    busy = false;
    if (pendingTimeout) clearTimeout(pendingTimeout);
    pendingTimeout = null;
    render();
  }

  function receiveSolution(text, { facelets, centers }) {
    solutionMoves = text.trim() ? text.trim().split(/\s+/) : [];
    const colorFromFace = centers;
    const cube = Cube.fromString(facelets);
    const asColours = () => [...cube.asString()].map(face => colorFromFace[face]);
    snapshots = [asColours()];
    for (const move of solutionMoves) {
      cube.move(move);
      snapshots.push(asColours());
    }
    if (!cube.isSolved() || snapshots[snapshots.length - 1].some((color, i) => color !== centers[FACES[Math.floor(i / 9)]])) {
      clearSolution();
      throw new Error('The returned sequence did not verify against the supplied cube.');
    }
    step = 0;
    render();
    show('Solution found: ' + solutionMoves.length + ' moves. Follow the steps, or press Play.', 'success');
  }

  function goTo(index) {
    if (!snapshots.length) return;
    if (index < 0 || index > solutionMoves.length) return;
    step = index;
    if (playing && step === solutionMoves.length) stopPlay();
    render();
    if (step === solutionMoves.length && solutionMoves.length) {
      show('Cube solved! All ' + solutionMoves.length + ' moves are complete.', 'success');
    }
  }

  function advance() {
    if (step < solutionMoves.length) goTo(step + 1);
    else { stopPlay(); render(); }
  }

  function makeScramble() {
    const options = ['U', 'R', 'F', 'D', 'L', 'B'];
    const turns = ['', "'", '2'];
    let last = '';
    const list = [];
    for (let i = 0; i < 24; i++) {
      let face;
      do { face = options[Math.floor(Math.random() * options.length)]; } while (face === last);
      list.push(face + turns[Math.floor(Math.random() * turns.length)]);
      last = face;
    }
    const cube = new Cube();
    cube.move(list.join(' '));
    const next = [...cube.asString()].map(face => DEFAULT_CENTRES[face]);
    makeEdit(next);
    show('A legal 24-turn scramble is loaded. Tap Solve my cube to generate the steps.');
  }

  net.addEventListener('click', event => {
    const button = event.target.closest('button[data-index]');
    if (!button || busy) return;
    const next = displayStickers().slice();
    next[Number(button.dataset.index)] = selected;
    makeEdit(next);
  });

  $('reset').addEventListener('click', () => {
    if (busy) return;
    makeEdit(solvedStickers());
    show('Reset to the solved 3×3 cube.');
  });
  $('scramble').addEventListener('click', () => { if (!busy) makeScramble(); });
  $('undo').addEventListener('click', () => {
    if (!editHistory.length || busy) return;
    stickers = editHistory.pop();
    clearSolution();
    persist();
    show('Last edit undone.');
    render();
  });
  $('solve').addEventListener('click', startSolve);
  $('previous').addEventListener('click', () => { stopPlay(); goTo(step - 1); });
  $('next').addEventListener('click', () => { stopPlay(); advance(); });
  $('play').addEventListener('click', () => {
    if (!snapshots.length || !solutionMoves.length) return;
    if (playing) { stopPlay(); render(); return; }
    if (step >= solutionMoves.length) goTo(0);
    playing = setInterval(advance, 900);
    render();
  });
  $('copy').addEventListener('click', async () => {
    if (!solutionMoves.length) return;
    const algorithm = solutionMoves.join(' ');
    try {
      await navigator.clipboard.writeText(algorithm);
      show('Solution copied: ' + algorithm, 'success');
    } catch (error) {
      const field = document.createElement('textarea');
      field.value = algorithm;
      field.style.position = 'fixed';
      field.style.left = '-9999px';
      document.body.append(field);
      field.select();
      const ok = document.execCommand('copy');
      field.remove();
      show(ok ? 'Solution copied.' : 'Copy not available. Select the moves displayed above.', ok ? 'success' : 'error');
    }
  });
  $('reset-view').addEventListener('click', () => {
    viewX = -25; viewY = -36; updateView();
  });
  const preview = $('preview');
  let drag = null;
  preview.addEventListener('pointerdown', event => {
    if (event.button !== 0 && event.pointerType !== 'touch') return;
    drag = { id: event.pointerId, x: event.clientX, y: event.clientY, vx: viewX, vy: viewY };
    preview.setPointerCapture(event.pointerId);
  });
  preview.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    viewY = drag.vy + (event.clientX - drag.x) * .55;
    viewX = Math.max(-86, Math.min(86, drag.vx - (event.clientY - drag.y) * .55));
    updateView();
  });
  const stopDrag = event => { if (drag && drag.id === event.pointerId) drag = null; };
  preview.addEventListener('pointerup', stopDrag);
  preview.addEventListener('pointercancel', stopDrag);
  preview.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') { viewY -= 12; updateView(); event.preventDefault(); }
    if (event.key === 'ArrowRight') { viewY += 12; updateView(); event.preventDefault(); }
    if (event.key === 'ArrowUp') { viewX = Math.min(86, viewX + 12); updateView(); event.preventDefault(); }
    if (event.key === 'ArrowDown') { viewX = Math.max(-86, viewX - 12); updateView(); event.preventDefault(); }
  });
  document.addEventListener('keydown', event => {
    if (event.target.matches('input,textarea,select,[contenteditable="true"]')) return;
    if (!snapshots.length) return;
    if (event.key === 'ArrowRight' && event.target !== preview) { stopPlay(); goTo(step + 1); }
    else if (event.key === 'ArrowLeft' && event.target !== preview) { stopPlay(); goTo(step - 1); }
  });

  restore();
  paintPalette();
  render();
})();
