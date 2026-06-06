export type UserRole = 'RECRUITER' | 'CANDIDATE'

export interface AuthUser {
  id: number
  email: string
  fullName: string
  role: UserRole
  avatarUrl: string | null
}

export type JobStatus = 'DRAFT' | 'OPEN' | 'CLOSED' | 'ARCHIVED'
export type ApplicationStatus =
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'SHORTLISTED'
  | 'INTERVIEW_SCHEDULED'
  | 'OFFER_EXTENDED'
  | 'HIRED'
  | 'REJECTED'
  | 'WITHDRAWN'
export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'RESCHEDULED'
export type OfferStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED' | 'REVOKED'

export interface Job {
  id: number
  recruiter: AuthUser
  title: string
  description: string
  department: string | null
  location: string | null
  jobType: string | null
  salaryMin: number | null
  salaryMax: number | null
  status: JobStatus
  closesAt: string | null
  createdAt: string
}

export interface Application {
  id: number
  job: Job
  candidate: AuthUser
  status: ApplicationStatus
  coverLetter: string | null
  resumeUrl: string | null
  recruiterNotes: string | null
  submittedAt: string
}

export interface Interview {
  id: number
  application: Application
  scheduledAt: string
  durationMins: number
  location: string | null
  meetingUrl: string | null
  status: InterviewStatus
  feedback: string | null
  rating: number | null
}

export interface Offer {
  id: number
  application: Application
  salary: number
  startDate: string
  expiresAt: string | null
  status: OfferStatus
  notes: string | null
  createdAt: string
}

export interface Notification {
  id: number
  type: string
  title: string
  body: string | null
  read: boolean
  createdAt: string
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface ReportSummary {
  openJobs: number
  totalJobs: number
  totalApplications: number
  applicationsByStatus: Record<ApplicationStatus, number>
  offerConversionRate: number
}
