(function(){
  'use strict';

  var cards = Array.from(document.querySelectorAll('.course-card[data-lesson]'));
  var search = document.getElementById('course-search');
  var filterButtons = Array.from(document.querySelectorAll('[data-filter]'));
  var progressFill = document.getElementById('progress-fill');
  var progressText = document.getElementById('progress-text');
  var nextTitle = document.getElementById('next-title');
  var nextLink = document.getElementById('next-link');
  var noResults = document.getElementById('no-results');
  var storagePrefix = 'pp_java_course_done::';
  var currentFilter = 'all';

  function isDone(id){
    try { return localStorage.getItem(storagePrefix + id) === '1'; }
    catch(e){ return false; }
  }

  function setDone(id, done){
    try {
      if(done) localStorage.setItem(storagePrefix + id, '1');
      else localStorage.removeItem(storagePrefix + id);
    } catch(e){}
  }

  function updateCard(card){
    var done = isDone(card.dataset.lesson);
    var box = card.querySelector('.done-toggle input');
    card.classList.toggle('done', done);
    if(box) box.checked = done;
  }

  function updateProgress(){
    var available = cards.filter(function(card){ return card.dataset.status === 'available'; });
    var completed = available.filter(function(card){ return isDone(card.dataset.lesson); }).length;
    var pct = available.length ? Math.round(completed * 100 / available.length) : 0;
    if(progressFill) progressFill.style.width = pct + '%';
    if(progressText) progressText.textContent = completed + ' of ' + available.length + ' lessons completed (' + pct + '%)';

    var next = available.find(function(card){ return !isDone(card.dataset.lesson); }) || available[0];
    if(next && nextTitle && nextLink){
      nextTitle.textContent = next.querySelector('h3').textContent;
      nextLink.href = next.dataset.href || '#';
      nextLink.textContent = completed === available.length ? 'Review course' : 'Continue';
    }
  }

  function applyFilter(){
    var q = (search && search.value || '').trim().toLowerCase();
    var visible = 0;
    cards.forEach(function(card){
      var haystack = (card.textContent + ' ' + (card.dataset.tags || '')).toLowerCase();
      var filterOk = currentFilter === 'all' || (card.dataset.track || '').split(' ').includes(currentFilter);
      var searchOk = !q || haystack.includes(q);
      var show = filterOk && searchOk;
      card.style.display = show ? '' : 'none';
      if(show) visible++;
    });
    if(noResults) noResults.style.display = visible ? 'none' : 'block';
  }

  cards.forEach(function(card){
    updateCard(card);
    var box = card.querySelector('.done-toggle input');
    if(box){
      box.addEventListener('change', function(){
        setDone(card.dataset.lesson, box.checked);
        updateCard(card);
        updateProgress();
      });
    }
  });

  if(search) search.addEventListener('input', applyFilter);
  filterButtons.forEach(function(btn){
    btn.addEventListener('click', function(){
      currentFilter = btn.dataset.filter;
      filterButtons.forEach(function(b){ b.classList.toggle('active', b === btn); });
      applyFilter();
    });
  });

  var diagnosticForm = document.getElementById('diagnostic-form');
  var diagnosticResult = document.getElementById('diagnostic-result');
  var diagnosticStatus = document.getElementById('diag-status');
  var checkDiagnostic = document.getElementById('check-diagnostic');
  var resetDiagnostic = document.getElementById('reset-diagnostic');
  var answers = {q1:'b',q2:'a',q3:'c',q4:'a',q5:'a'};

  function diagnosticAnswered(){
    if(!diagnosticForm) return 0;
    return Object.keys(answers).filter(function(name){ return diagnosticForm.querySelector('input[name="'+name+'"]:checked'); }).length;
  }

  function refreshDiagnosticStatus(){
    if(diagnosticStatus) diagnosticStatus.textContent = diagnosticAnswered() + ' / 5 answered';
  }

  if(diagnosticForm){
    diagnosticForm.addEventListener('change', refreshDiagnosticStatus);
  }

  if(checkDiagnostic){
    checkDiagnostic.addEventListener('click', function(){
      var answered = diagnosticAnswered();
      if(answered < 5){
        diagnosticResult.hidden = false;
        diagnosticResult.innerHTML = '<h3>Finish all five first.</h3><p>You have answered '+answered+' of 5. The recommendation is more useful when every question is attempted.</p>';
        return;
      }

      var score = 0;
      Object.keys(answers).forEach(function(name,index){
        var chosen = diagnosticForm.querySelector('input[name="'+name+'"]:checked');
        var field = diagnosticForm.querySelector('[data-q="'+(index+1)+'"]');
        var correct = chosen && chosen.value === answers[name];
        if(correct) score++;
        if(field){ field.classList.toggle('good', correct); field.classList.toggle('bad', !correct); }
      });

      var title, text, href, label;
      if(score <= 2){
        title = score + '/5 — rebuild the foundation';
        text = 'Start with objects, classes and Java basics. Do not rush into arrays or long programs yet. A strong Class 10 recovery begins by making the basic language predictable.';
        href = 'terms/'; label = 'Start Lesson 1';
      } else if(score <= 4){
        title = score + '/5 — foundation is partly there';
        text = 'Use the 7-day plan, but move quickly through topics you already know. Spend most of your time tracing conditions, loops and small programs.';
        href = 'boolean/'; label = 'Strengthen logic next';
      } else {
        title = '5/5 — ready to move faster';
        text = 'The basic vocabulary is in place. Review decisions and loops quickly, then move toward methods, constructors, arrays, strings and mixed Class 10 problems.';
        href = 'if-else-ternary-switch/'; label = 'Begin rapid revision';
      }

      diagnosticResult.hidden = false;
      diagnosticResult.innerHTML = '<h3>'+title+'</h3><p>'+text+'</p><a class="btn btn-dark" href="'+href+'">'+label+'</a>';
      diagnosticResult.scrollIntoView({behavior:'smooth',block:'nearest'});
    });
  }

  if(resetDiagnostic){
    resetDiagnostic.addEventListener('click', function(){
      if(diagnosticForm) diagnosticForm.reset();
      document.querySelectorAll('.question').forEach(function(q){ q.classList.remove('good','bad'); });
      if(diagnosticResult){ diagnosticResult.hidden = true; diagnosticResult.innerHTML = ''; }
      refreshDiagnosticStatus();
    });
  }

  var shareButton = document.getElementById('share-page');
  var shareStatus = document.getElementById('share-status');
  if(shareButton){
    shareButton.addEventListener('click', async function(){
      var data = {
        title: 'Class 10 Java — Start Here',
        text: 'A focused Java starter with a diagnostic and 7-day study plan.',
        url: location.href
      };
      try {
        if(navigator.share){ await navigator.share(data); }
        else if(navigator.clipboard){
          await navigator.clipboard.writeText(location.href);
          if(shareStatus) shareStatus.textContent = 'Link copied.';
        } else {
          if(shareStatus) shareStatus.textContent = 'Copy this page address from your browser.';
        }
      } catch(e){}
    });
  }

  updateProgress();
  applyFilter();
  refreshDiagnosticStatus();
})();
