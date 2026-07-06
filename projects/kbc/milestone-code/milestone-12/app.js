let questions=[];
let current=0;
let score=0;
let selected=null;
fetch('questions.json').then(r=>r.json()).then(data=>{ questions=data; showQuestion(); });