import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Question } from './question.model';

@Injectable({ providedIn: 'root' })
export class QuizService {
  constructor(private http: HttpClient) {}

  // Angular loads static JSON files from the assets folder.
  getQuestions(): Observable<Question[]> {
    return this.http.get<Question[]>('assets/questions.json');
  }
}
