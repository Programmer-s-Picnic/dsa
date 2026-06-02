document.addEventListener('click', e => {
  if (e.target.matches('[data-print]')) window.print();
});
