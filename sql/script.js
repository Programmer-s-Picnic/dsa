const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  themeToggle.textContent = document.body.classList.contains('dark') ? 'Light mode' : 'Dark mode';
});

document.querySelectorAll('pre').forEach((pre) => {
  const button = document.createElement('button');
  button.className = 'copy-btn';
  button.type = 'button';
  button.textContent = 'Copy';
  button.addEventListener('click', async () => {
    const code = pre.querySelector('code')?.innerText || pre.innerText;
    await navigator.clipboard.writeText(code);
    button.textContent = 'Copied';
    setTimeout(() => button.textContent = 'Copy', 1200);
  });
  pre.appendChild(button);
});

const questions = [
  {
    text: 'Which key is unique and not null?',
    options: ['Primary key', 'Normal column', 'Comment', 'Alias'],
    answer: 0
  },
  {
    text: 'Which clause filters groups after aggregate calculation?',
    options: ['WHERE', 'HAVING', 'ORDER BY', 'CREATE'],
    answer: 1
  },
  {
    text: 'Which join returns only matching rows from both tables?',
    options: ['Left join', 'Right join', 'Inner join', 'Full outer join'],
    answer: 2
  },
  {
    text: 'In Oracle, which set operation means rows in first query but not in second?',
    options: ['UNION', 'UNION ALL', 'INTERSECT', 'MINUS'],
    answer: 3
  }
];

const quiz = document.getElementById('quiz');
quiz.innerHTML = questions.map((q, i) => `
  <div class="quiz-question">
    <strong>${i + 1}. ${q.text}</strong>
    ${q.options.map((option, j) => `
      <label><input type="radio" name="q${i}" value="${j}"> ${option}</label>
    `).join('')}
  </div>
`).join('');

document.getElementById('checkQuiz').addEventListener('click', () => {
  let score = 0;
  questions.forEach((q, i) => {
    const chosen = document.querySelector(`input[name="q${i}"]:checked`);
    if (chosen && Number(chosen.value) === q.answer) score++;
  });
  document.getElementById('quizResult').textContent = `Score: ${score}/${questions.length}. ${score === questions.length ? 'Excellent!' : 'Revise the sections above and try again.'}`;
});
