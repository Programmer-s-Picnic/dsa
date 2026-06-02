(function(){
  const $ = (q,root=document)=>root.querySelector(q);
  const $$ = (q,root=document)=>Array.from(root.querySelectorAll(q));

  $$('.code-block').forEach((pre,idx)=>{
    const row=document.createElement('div');
    row.className='copy-row';
    const btn=document.createElement('button');
    btn.className='copy-btn';
    btn.type='button';
    btn.textContent='Copy code';
    btn.addEventListener('click',async()=>{
      try{
        await navigator.clipboard.writeText(pre.innerText);
        btn.textContent='Copied';
        setTimeout(()=>btn.textContent='Copy code',1200);
      }catch(e){btn.textContent='Select and copy';}
    });
    row.appendChild(btn);
    pre.parentNode.insertBefore(row,pre);
  });

  const search=$('#lessonSearch');
  const content=$('#lessonContent');
  if(search && content){
    const original=content.innerHTML;
    search.addEventListener('input',()=>{
      const q=search.value.trim();
      content.innerHTML=original;
      if(q.length<2) return;
      const walker=document.createTreeWalker(content,NodeFilter.SHOW_TEXT,null);
      const nodes=[];
      while(walker.nextNode()) nodes.push(walker.currentNode);
      const rx=new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'gi');
      nodes.forEach(node=>{
        if(rx.test(node.nodeValue)){
          const span=document.createElement('span');
          span.innerHTML=node.nodeValue.replace(rx,m=>`<mark class="highlight">${m}</mark>`);
          node.parentNode.replaceChild(span,node);
        }
      });
    });
  }

  $$('.quiz').forEach(quiz=>{
    const answer=quiz.dataset.answer;
    $$('button',quiz).forEach(btn=>{
      btn.addEventListener('click',()=>{
        $$('button',quiz).forEach(b=>b.classList.remove('correct','wrong'));
        btn.classList.add(btn.dataset.option===answer?'correct':'wrong');
      });
    });
  });

  const year=$('#year');
  if(year) year.textContent=new Date().getFullYear();
})();
