export type Role = "STUDENT" | "RECRUITER" | "ADMIN";

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  headline?: string;
  bio?: string;
  location?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  skills?: string[];
  company?: Company | string | null;
  resume?: Resume | string | null;
  isVerified?: boolean;
  isActive?: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Company {
  _id: string;
  name: string;
  slug?: string;
  logo?: string;
  description?: string;
  website?: string;
  industry?: string;
  size?: string;
  headquarters?: string;
  foundedYear?: number;
  email?: string;
  phone?: string;
  verified?: boolean;
  owner?: string;
  socialLinks?: { linkedin?: string; twitter?: string; github?: string };
  createdAt?: string;
}

export interface Lesson {
  _id: string;
  title: string;
  type: "video" | "reading" | "quiz";
  duration?: number;
  videoUrl?: string;
  content?: string;
  quiz?: {
    title?: string;
    passingScore?: number;
    timeLimitMinutes?: number;
    questions: Array<{
      _id?: string;
      question: string;
      options: Array<{ text: string }>;
      correctAnswer: string;
      explanation?: string;
    }>;
  };
  order?: number;
}

export interface CourseModule {
  _id: string;
  title: string;
  description?: string;
  order?: number;
  lessons: Lesson[];
}

export interface Course {
  _id: string;
  title: string;
  slug: string;
  description: string;
  longDescription?: string;
  thumbnail?: string;
  instructor?: User | string;
  category?: string;
  technology?: string[];
  level?: "Beginner" | "Intermediate" | "Advanced";
  price?: number;
  durationHours?: number;
  whatYouWillLearn?: string[];
  requirements?: string[];
  rating?: number;
  ratingCount?: number;
  studentsEnrolled?: number;
  featured?: boolean;
  published?: boolean;
  modules?: CourseModule[];
  isEnrolled?: boolean;
  createdAt?: string;
}

export interface Enrollment {
  _id: string;
  user: string;
  course: Course | string;
  progress: Array<{
    lessonId: string;
    moduleId: string;
    completed: boolean;
    completedAt?: string;
    quizScore?: number;
    quizPassed?: boolean;
  }>;
  percentComplete: number;
  currentLessonId?: string;
  completed: boolean;
  completedAt?: string;
  lastAccessedAt?: string;
}

export interface Job {
  _id: string;
  company: Company | string;
  recruiter?: string;
  title: string;
  slug?: string;
  description: string;
  responsibilities?: string[];
  requirements?: string[];
  skills: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  location: string;
  jobType: "Full-time" | "Part-time" | "Internship" | "Contract";
  experienceLevel?: string;
  remoteType: "Remote" | "Hybrid" | "On-site";
  benefits?: string[];
  deadline?: string;
  status?: "published" | "draft" | "closed";
  applicationsCount?: number;
  saved?: boolean;
  applied?: boolean;
  similar?: Job[];
  createdAt?: string;
}

export interface Application {
  _id: string;
  job: Job | string;
  student: User | string;
  resume?: string;
  resumeUrl?: string;
  coverLetter?: string;
  expectedSalary?: number;
  availability?: string;
  status: "Applied" | "Shortlisted" | "Interview" | "Offer" | "Rejected";
  statusHistory: Array<{
    status: string;
    note?: string;
    changedAt: string;
  }>;
  interview?: Interview | string;
  createdAt?: string;
}

export interface Interview {
  _id: string;
  application?: string;
  job?: string | Job;
  student: string | User;
  recruiter?: string | User;
  type: "Technical" | "Behavioral" | "HR" | "System Design" | "Mock";
  scheduledAt: string;
  durationMinutes?: number;
  meetingLink?: string;
  notes?: string;
  status: "scheduled" | "completed" | "cancelled";
  feedback?: {
    score?: number;
    strengths?: string[];
    weakAreas?: string[];
    recommendedTopics?: string[];
    comments?: string;
  };
  createdAt?: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  features?: string[];
  techStack: string[];
  thumbnail?: string;
  screenshots?: string[];
  githubUrl?: string;
  liveUrl?: string;
  author: User | string;
  course?: string;
  likes?: number;
  views?: number;
  published?: boolean;
  createdAt?: string;
}

export interface ResumeSectionItem {
  id?: string;
  title?: string;
  subtitle?: string;
  date?: string;
  location?: string;
  description?: string;
  bullets?: string[];
  name?: string;
  level?: string;
  items?: string[];
}

export interface ResumeSection {
  _id?: string;
  id?: string;
  type: string;
  title?: string;
  order?: number;
  items: ResumeSectionItem[];
}

export interface Resume {
  _id: string;
  user: string;
  personal?: {
    fullName?: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
    github?: string;
    title?: string;
    summary?: string;
  };
  sections?: ResumeSection[];
  template?: string;
  primaryColor?: string;
  fontSize?: "small" | "medium" | "large";
  isComplete?: boolean;
  updatedAt?: string;
}

export interface InterviewQuestion {
  _id: string;
  question: string;
  answer?: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  topic?: string;
  hints?: string[];
}

export interface InterviewProgress {
  _id: string;
  user?: string;
  category: string;
  questionId?: InterviewQuestion | string;
  answer?: string;
  rating?: number;
  feedback?: string;
  timeTakenSeconds?: number;
  createdAt?: string;
}

export interface Certificate {
  _id: string;
  user: string | User;
  course: Course | string;
  certificateId: string;
  issueDate: string;
  score?: number;
}

export interface NotificationItem {
  _id: string;
  type: "Course" | "Job" | "Application" | "Interview" | "Certificate" | "System";
  title: string;
  message?: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface Review {
  _id: string;
  user: User | string;
  targetType: string;
  targetId: string;
  rating: number;
  title?: string;
  comment?: string;
  createdAt?: string;
}

export interface PaginatedMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  unreadCount?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: PaginatedMeta;
  errors?: string[];
}
