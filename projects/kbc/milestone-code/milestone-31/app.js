let questions=[];
let current=0;
let score=0;
let selected=null;
let time=30;
let timer=null;
const used={fifty:false,poll:false,skip:false};
fetch('questions.json').then(r=>r.json()).then(data=>{ questions=data; showQuestion(); });
function showQuestion(){
  const q=questions[current];
  document.getElementById('question').textContent=(current+1)+'. '+q.question;
  const options=document.getElementById('options');
  options.innerHTML='';
  q.options.forEach(opt=>{
    const btn=document.createElement('button');
    btn.className='option';
    btn.textContent=opt;
    btn.onclick=()=>selectAnswer(btn,opt);
    options.appendChild(btn);
  });
  document.getElementById('score').textContent='Score: '+score;
  startTimer();
}
function selectAnswer(btn,opt){
  if(selected!==null)return;
  selected=opt;
  checkAnswer(btn);
}
function checkAnswer(btn){
  const correct=questions[current].answer;
  document.querySelectorAll('.option').forEach(b=>{ b.disabled=true; if(b.textContent===correct)b.classList.add('correct'); });
  if(selected===correct){ score++; document.getElementById('message').textContent='Correct!'; }
  else{ if(btn)btn.classList.add('wrong'); document.getElementById('message').textContent='Wrong. Correct: '+correct; }
}
document.getElementById('nextBtn').onclick=()=>{ current++; if(current>=questions.length){ showResult(); return; } selected=null; showQuestion(); };
function startTimer(){ clearInterval(timer); time=30; timer=setInterval(()=>{ time--; document.getElementById('timer').textContent='Time: '+time; if(time<=0){ clearInterval(timer); checkAnswer(null); } },1000); }
function fifty(){ if(used.fifty)return; used.fifty=true; const correct=questions[current].answer; [...document.querySelectorAll('.option')].filter(b=>b.textContent!==correct).slice(0,2).forEach(b=>b.style.display='none'); }
function poll(){ if(used.poll)return; used.poll=true; alert('Audience favours: '+questions[current].answer); }
function skip(){ if(used.skip)return; used.skip=true; current++; showQuestion(); }
document.getElementById('fiftyBtn').onclick=fifty; document.getElementById('pollBtn').onclick=poll; document.getElementById('skipBtn').onclick=skip;