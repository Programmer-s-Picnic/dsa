
function markComplete(key){localStorage.setItem(key,'complete');alert('Milestone completed. Good work!')}
function copyText(id){const el=document.getElementById(id);if(el){navigator.clipboard.writeText(el.innerText);alert('Copied')}}
document.addEventListener('DOMContentLoaded',()=>{const s=document.getElementById('lessonSearch');if(s){s.addEventListener('input',()=>{const q=s.value.toLowerCase();document.querySelectorAll('[data-search]').forEach(el=>{el.style.display=el.dataset.search.toLowerCase().includes(q)?'block':''})})}})
