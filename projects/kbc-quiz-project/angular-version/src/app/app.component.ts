import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizService } from './quiz.service';
import { Question } from './question.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  questions: Question[] = [];
  index = 0;
  selected = '';
  locked = false;
  prizeWon = 0;
  time = 30;
  message = '';
  hiddenOptions: string[] = [];
  poll: { option: string; percent: number }[] = [];
  lifelines = { fifty: false, skip: false, poll: false };
  timerId: any;

  constructor(private quizService: QuizService) {}

  ngOnInit() {
    this.quizService.getQuestions().subscribe(data => {
      this.questions = data;
      this.startTimer();
    });
  }

  ngOnDestroy() { this.stopTimer(); }

  get currentQuestion(): Question { return this.questions[this.index]; }

  startTimer() {
    this.stopTimer();
    this.time = 30;
    this.timerId = setInterval(() => {
      this.time--;
      if (this.time <= 0) {
        this.locked = true;
        this.message = 'Time is up!';
        this.stopTimer();
      }
    }, 1000);
  }

  stopTimer() { if (this.timerId) clearInterval(this.timerId); }

  selectAnswer(option: string) {
    if (!this.locked) this.selected = option;
  }

  lockAnswer() {
    if (!this.selected) { this.message = 'Please select an answer first.'; return; }
    this.locked = true;
    this.stopTimer();
    if (this.selected === this.currentQuestion.answer) {
      this.prizeWon = this.currentQuestion.prize;
      this.message = 'Correct answer!';
    } else {
      this.message = 'Wrong answer.';
    }
  }

  nextQuestion() {
    if (this.index < this.questions.length - 1) {
      this.index++;
      this.selected = '';
      this.locked = false;
      this.message = '';
      this.hiddenOptions = [];
      this.poll = [];
      this.startTimer();
    } else {
      this.message = `Game over! Final prize: ₹${this.prizeWon}`;
      this.locked = true;
      this.stopTimer();
    }
  }

  restart() {
    this.index = 0;
    this.prizeWon = 0;
    this.lifelines = { fifty: false, skip: false, poll: false };
    this.selected = '';
    this.locked = false;
    this.message = '';
    this.startTimer();
  }

  useFifty() {
    if (this.lifelines.fifty || this.locked) return;
    this.hiddenOptions = this.currentQuestion.options.filter(o => o !== this.currentQuestion.answer).slice(0, 2);
    this.lifelines.fifty = true;
  }

  skip() {
    if (this.lifelines.skip || this.locked) return;
    this.lifelines.skip = true;
    this.nextQuestion();
  }

  audiencePoll() {
    if (this.lifelines.poll || this.locked) return;
    this.poll = this.currentQuestion.options.map(o => ({ option: o, percent: o === this.currentQuestion.answer ? 60 : Math.floor(Math.random() * 20) + 5 }));
    this.lifelines.poll = true;
  }
}
