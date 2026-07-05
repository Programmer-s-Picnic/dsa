// Model means the fixed shape of one question object.
export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
  level: number;
  prize: number;
}
