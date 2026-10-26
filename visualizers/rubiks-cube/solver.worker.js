/* Rubik's Cube solver worker; offline-ready with vendored MIT-licensed cubejs. */
importScripts('./vendor/cube.js', './vendor/solve.js');
let ready = false;
self.onmessage = function (event) {
  const { facelets, requestId } = event.data || {};
  try {
    if (!facelets || typeof facelets !== 'string' || facelets.length !== 54) {
      throw new Error('Expected 54 facelets.');
    }
    if (!ready) {
      self.postMessage({ requestId, type: 'preparing' });
      Cube.initSolver();
      ready = true;
    }
    const source = Cube.fromString(facelets);
    const solution = source.isSolved() ? '' : source.solve();
    if (typeof solution !== 'string') throw new Error('No valid solution found.');
    const verify = source.clone();
    if (solution) verify.move(solution);
    if (!verify.isSolved()) throw new Error('Solution verification failed.');
    self.postMessage({ requestId, type: 'solution', solution: solution.trim() });
  } catch (error) {
    self.postMessage({ requestId, type: 'error', message: (error && error.message) || 'Unable to solve this cube.' });
  }
};