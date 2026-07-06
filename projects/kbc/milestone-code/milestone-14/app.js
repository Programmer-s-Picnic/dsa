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
    options.appendChild(btn);
  });
}