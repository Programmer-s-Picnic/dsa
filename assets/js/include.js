
(function(){
  const mount=document.getElementById('site-header')||document.querySelector('[data-pp-header]');
  const root=(mount&&mount.dataset.root)||document.body.dataset.root||'';
  const footerMount=document.getElementById('site-footer')||document.querySelector('[data-pp-footer]');
  const norm=p=>String(p||'').replace(/^\.\//,'');
  function applyRoot(el){
    el.querySelectorAll('[data-pp-link]').forEach(a=>{a.setAttribute('href', root + a.getAttribute('data-pp-link'));});
  }
  function currentPath(){
    let path=location.pathname.replace(/^\//,'');
    const parts=path.split('/');
    const idx=parts.findIndex(x=>x.toLowerCase().includes('data-structures-and-algorithms-dsa-clean'));
    if(idx>=0) path=parts.slice(idx+1).join('/');
    if(!path || path.endsWith('/')) path += 'index.html';
    return decodeURIComponent(path);
  }
  async function loadFragment(id, file){
    const el=document.getElementById(id); if(!el) return;
    try{const r=await fetch(root+file,{cache:'no-cache'}); el.innerHTML=await r.text(); applyRoot(el); initNav(); initSearch(); breadcrumbs(); const y=document.getElementById('pp-year'); if(y) y.textContent=new Date().getFullYear();}
    catch(e){console.warn('Could not load', file, e);}
  }
  function initNav(){
    const btn=document.querySelector('.pp-nav-toggle'), nav=document.querySelector('.pp-main-nav');
    if(btn&&nav&&!btn.dataset.ready){btn.dataset.ready='1';btn.addEventListener('click',()=>{const open=nav.classList.toggle('pp-open');btn.setAttribute('aria-expanded',String(open));});}
    const cur=currentPath();
    document.querySelectorAll('.pp-main-nav a').forEach(a=>{const href=norm(a.getAttribute('data-pp-link')||a.getAttribute('href'));if(href===cur||('/'+href)===location.pathname)a.setAttribute('aria-current','page');});
  }
  function breadcrumbs(){
    const bc=document.getElementById('site-breadcrumbs'); if(!bc) return;
    const cur=currentPath(); const parts=cur.split('/');
    const items=['<a href="'+root+'index.html">Home</a>'];
    let acc='';
    parts.forEach((part,i)=>{ if(part==='index.html') return; acc += (acc?'/':'')+part; const label=part.replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase()); const url=root+acc+'/index.html'; items.push('<span>›</span><a href="'+url+'">'+label+'</a>'); });
    bc.innerHTML=items.join('');
  }
  async function initSearch(){
    const input=document.getElementById('pp-site-search'), box=document.getElementById('pp-search-results');
    if(!input||!box||input.dataset.ready) return; input.dataset.ready='1';
    let data=[]; try{data=await (await fetch(root+'assets/data/site-map.json')).json();}catch(e){}
    input.addEventListener('input',()=>{const q=input.value.trim().toLowerCase(); if(!q){box.hidden=true;box.innerHTML='';return;} const hits=data.filter(x=>(x.title+' '+x.group+' '+x.path).toLowerCase().includes(q)).slice(0,8); box.innerHTML=hits.length?hits.map(x=>'<a href="'+root+x.url+'"><strong>'+escapeHtml(x.title)+'</strong><small>'+escapeHtml(x.group)+' · '+escapeHtml(x.path)+'</small></a>').join(''):'<a>No matching lesson found</a>'; box.hidden=false;});
    document.addEventListener('click',e=>{if(!e.target.closest('.pp-search')) box.hidden=true;});
  }
  function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
  loadFragment('site-header','header.html'); loadFragment('site-footer','footer.html');
  const y=document.getElementById('pp-year'); if(y) y.textContent=new Date().getFullYear();
  document.addEventListener('DOMContentLoaded',()=>{const y=document.getElementById('pp-year'); if(y) y.textContent=new Date().getFullYear();});
})();
