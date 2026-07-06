let questions=[];
let current=0;
let score=0;
let selected=null;
fetch('questions.json').then(r=>r.json()).then(data=>{ questions=data; showQuestion(); });
function showQuestion(){
  const q=questions[current];
  document.getElementById('question').textContent=(current+1)+'. '+q.question;
}