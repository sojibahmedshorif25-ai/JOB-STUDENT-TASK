export type Role = 'STUDENT' | 'RECRUITER' | 'ADMIN';

export type JobType = 'Full-time' | 'Part-time' | 'Internship' | 'Contract';
export type RemoteType = 'Remote' | 'Hybrid' | 'On-site';
export type ApplicationStatus = 'Applied' | 'Shortlisted' | 'Interview' | 'Offer' | 'Rejected';
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface AuthUser {
  id: string;
  role: Role;
  email: string;
}
