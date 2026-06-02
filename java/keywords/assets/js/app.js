
(function(){
  const searchBox=document.getElementById('searchBox');
  const kindFilter=document.getElementById('kindFilter');
  const cards=[...document.querySelectorAll('.keyword-card')];
  function filter(){
    const q=(searchBox.value||'').toLowerCase().trim();
    const kind=kindFilter.value;
    cards.forEach(card=>{
      const matchesText=!q || card.innerText.toLowerCase().includes(q);
      const matchesKind=kind==='all' || card.dataset.kind===kind;
      card.classList.toggle('hidden', !(matchesText && matchesKind));
    });
  }
  searchBox.addEventListener('input',filter);
  kindFilter.addEventListener('change',filter);
  document.querySelectorAll('.copy-btn').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const code=btn.parentElement.querySelector('code').innerText;
      try{ await navigator.clipboard.writeText(code); btn.textContent='Copied'; setTimeout(()=>btn.textContent='Copy',1200); }
      catch(e){ btn.textContent='Select code'; }
    });
  });
  document.getElementById('printBtn')?.addEventListener('click',()=>window.print());
})();
