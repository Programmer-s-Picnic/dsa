
(function(){
  function formatValue(value){
    if(value === undefined) return 'undefined';
    if(value === null) return 'null';
    if(typeof value === 'object') return JSON.stringify(value, null, 2);
    return String(value);
  }
  function formatTable(value){
    if(!Array.isArray(value)) return formatValue(value);
    return value.map((row, i) => String(i).padStart(2, '0') + '  ' + JSON.stringify(row)).join('\n');
  }
  window.runCode = function(id){
    const textarea = document.getElementById('code-' + id);
    const output = document.getElementById('output-' + id);
    const logs = [];
    const fakeConsole = {
      log: (...args) => logs.push(args.map(formatValue).join(' ')),
      table: (value) => logs.push(formatTable(value))
    };
    output.textContent = '';
    try{
      const fn = new Function('console', 'setTimeout', textarea.value);
      const safeTimeout = (callback, delay) => setTimeout(callback, Math.min(delay || 0, 1000));
      const result = fn(fakeConsole, safeTimeout);
      if(result !== undefined) logs.push(formatValue(result));
      setTimeout(() => {
        output.textContent = logs.join('\n') || 'Code ran successfully. No output was printed.';
      }, 1050);
    }catch(error){
      output.textContent = 'Error: ' + error.message;
    }
  };
  window.resetCode = function(id){
    const ta = document.getElementById('code-' + id);
    ta.value = ta.dataset.original;
    document.getElementById('output-' + id).textContent = 'Output will appear here.';
  };
  window.toggleAnswer = function(id){
    const el = document.getElementById(id);
    if(!el) return;
    el.style.display = el.style.display === 'block' ? 'none' : 'block';
  };
  document.addEventListener('click', function(e){
    const action = e.target.getAttribute('data-action');
    const target = e.target.getAttribute('data-target');
    if(action === 'run') runCode(target);
    if(action === 'reset') resetCode(target);
    if(action === 'toggle') toggleAnswer(target);
  });
})();
