export interface User {
  id: number;
  first_name: string;
  last_name: string;
  id_group: number;
  group_name: string;
  course: number;
  id_level: number; // 1 = Student, 2 = Admin/Teacher
  created_at: string;
}

export type TrackerStatus = 'Успех' | 'Срыв';

export interface TrackerRecord {
  id?: number;
  user_id: number;
  date_number: number;
  status: TrackerStatus;
  marked_at: string;
  client_date?: string;
  trigger_reason?: string;
}

export interface AnketAnswers {
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string;
  q6?: string;
  q7?: string;
  q8?: string;
  q9?: string;
  q10?: string;
  q11?: string;
  q12?: string;
  q13?: string;
  q14?: string;
  q15?: string;
  [key: string]: string | undefined;
}

export interface AnketRecord {
  id: number;
  id_user: number;
  submitted_at: string;
  answers: AnketAnswers;
}

export interface FeedbackRecord {
  id: number;
  user_id: number;
  student_name: string;
  group_name: string;
  course: number;
  message: string;
  created_at: string;
  clean_days: number;
  relapse_days: number;
}

export interface QuestionDefinition {
  id: string;
  type: 'radio' | 'checkbox';
  text: string;
  options: string[];
  helper?: string;
}

export interface AdminStats {
  totalStudents: number;
  completedSurveys: number;
  activeTrackers: number;
  completedTrackers: number;
  totalCheckins: number;
  successRate: number;
  totalRelapses: number;
  totalFeedbacks: number;
  groupsSummary: {
    groupName: string;
    studentsCount: number;
    completedSurvey: number;
    avgDaysCompleted: number;
  }[];
  recentFeedbacks: FeedbackRecord[];
  questionStats: {
    questionId: string;
    questionText: string;
    answersCounts: { [option: string]: number };
  }[];
}
