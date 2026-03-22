export enum InterviewStatus {
  IDLE = 'IDLE',
  SETUP = 'SETUP',
  INTERVIEWING = 'INTERVIEWING',
  FEEDBACK = 'FEEDBACK',
}

export interface InterviewConfig {
  role: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  questionCount: number;
}

export interface InterviewMessage {
  role: 'user' | 'ai';
  text: string;
  timestamp: number;
}

export interface InterviewFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
  technicalUnderstanding: string;
  communicationSkills: string;
  detailedAnalysis: {
    question: string;
    userAnswer: string;
    whatWasWrong: string;
    correctAnswer: string;
  }[];
  summary: string;
}
