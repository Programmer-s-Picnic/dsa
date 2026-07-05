import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

function App() {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const [prizeWon, setPrizeWon] = useState(0);
  const [time, setTime] = useState(30);
  const [message, setMessage] = useState('');
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [poll, setPoll] = useState(null);
  const [lifelines, setLifelines] = useState({ fifty: false, skip: false, poll: false });

  // Load JSON once when the application starts.
  useEffect(() => {
    fetch('/questions.json')
      .then(res => res.json())
      .then(data => setQuestions(data))
      .catch(() => setMessage('Could not load questions.json'));
  }, []);

  // Timer effect: React automatically cleans this interval when values change.
  useEffect(() => {
    if (!questions.length || locked) return;
    if (time <= 0) {
      setLocked(true);
      setMessage('Time is up!');
      return;
    }
    const id = setInterval(() => setTime(t => t - 1), 1000);
    return () => clearInterval(id);
  }, [time, locked, questions.length]);

  if (!questions.length) return <main className="page"><h1>Loading KBC Quiz...</h1><p>{message}</p></main>;

  const q = questions[index];

  function resetQuestionState() {
    setSelected(null);
    setLocked(false);
    setTime(30);
    setMessage('');
    setHiddenOptions([]);
    setPoll(null);
  }

  function lockAnswer() {
    if (!selected) {
      setMessage('Please select an answer first.');
      return;
    }
    setLocked(true);
    if (selected === q.answer) {
      setPrizeWon(q.prize);
      setMessage('Correct answer!');
    } else {
      setMessage(`Wrong answer. Correct answer is ${q.answer}.`);
    }
  }

  function nextQuestion() {
    if (index < questions.length - 1) {
      setIndex(index + 1);
      resetQuestionState();
    } else {
      setLocked(true);
      setMessage(`Game over! Final prize: ₹${prizeWon}`);
    }
  }

  function restart() {
    setIndex(0);
    setPrizeWon(0);
    setLifelines({ fifty: false, skip: false, poll: false });
    resetQuestionState();
  }

  function useFifty() {
    if (lifelines.fifty || locked) return;
    const wrong = q.options.filter(opt => opt !== q.answer).slice(0, 2);
    setHiddenOptions(wrong);
    setLifelines({ ...lifelines, fifty: true });
  }

  function skip() {
    if (lifelines.skip || locked) return;
    setLifelines({ ...lifelines, skip: true });
    nextQuestion();
  }

  function audiencePoll() {
    if (lifelines.poll || locked) return;
    const result = q.options.map(opt => ({ option: opt, percent: opt === q.answer ? 60 : Math.floor(Math.random() * 20) + 5 }));
    setPoll(result);
    setLifelines({ ...lifelines, poll: true });
  }

  return (
    <main className="app-shell">
      <section className="quiz-panel">
        <p className="eyebrow">React Project</p>
        <h1>KBC Quiz</h1>
        <div className="status-row"><span>Question {index + 1}</span><span>Time: {time}s</span><span>Prize: ₹{prizeWon}</span></div>
        <div className="lifelines">
          <button disabled={lifelines.fifty} onClick={useFifty}>50:50</button>
          <button disabled={lifelines.skip} onClick={skip}>Skip</button>
          <button disabled={lifelines.poll} onClick={audiencePoll}>Audience Poll</button>
        </div>
        {poll && <div className="poll-box"><strong>Audience Poll</strong>{poll.map(p => <p key={p.option}>{p.option}: {p.percent}%</p>)}</div>}
        <h2 className="question">{q.question}</h2>
        <div className="options-box">
          {q.options.map((opt, i) => {
            const className = ['option', selected === opt ? 'selected' : '', locked && opt === q.answer ? 'correct' : '', locked && selected === opt && opt !== q.answer ? 'wrong' : '', hiddenOptions.includes(opt) ? 'hide' : ''].join(' ');
            return <button key={opt} disabled={locked} className={className} onClick={() => setSelected(opt)}>{String.fromCharCode(65 + i)}. {opt}</button>;
          })}
        </div>
        <div className="controls"><button onClick={lockAnswer} disabled={locked}>Lock Answer</button><button onClick={nextQuestion}>Next</button><button onClick={restart}>Restart</button></div>
        <p className="message">{message}</p>
      </section>
      <aside className="prize-panel"><h2>Prize Ladder</h2><ol>{questions.map((item, i) => <li className={i === index ? 'active' : ''} key={item.id}>Q{i + 1} - ₹{item.prize}</li>)}</ol></aside>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
