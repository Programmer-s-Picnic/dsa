let questions=[];
let current=0;
let score=0;
let selected=null;
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