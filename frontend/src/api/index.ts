import api from './client'
import type {
  AuthUser, Job, Application, Interview, Offer,
  Notification, Page, ReportSummary, ApplicationStatus, JobStatus
} from '../types'

// Auth
export const getMe = () => api.get<AuthUser>('/auth/me').then(r => r.data)
export const register = (body: {
  email: string; fullName: string; role: string;
  provider: string; providerId: string; avatarUrl?: string
}) => api.post<{ token: string; user: AuthUser }>('/auth/register', body).then(r => r.data)

// Jobs
export const listJobs = (params?: { q?: string; page?: number; size?: number }) =>
  api.get<Page<Job>>('/jobs', { params }).then(r => r.data)
export const getJob = (id: number) => api.get<Job>(`/jobs/${id}`).then(r => r.data)
export const myJobs = (params?: { page?: number }) =>
  api.get<Page<Job>>('/jobs/my', { params }).then(r => r.data)
export const createJob = (body: Partial<Job>) => api.post<Job>('/jobs', body).then(r => r.data)
export const updateJob = (id: number, body: Partial<Job>) =>
  api.put<Job>(`/jobs/${id}`, body).then(r => r.data)
export const changeJobStatus = (id: number, status: JobStatus) =>
  api.patch<Job>(`/jobs/${id}/status`, null, { params: { status } }).then(r => r.data)
export const deleteJob = (id: number) => api.delete(`/jobs/${id}`)

// Applications
export const applyToJob = (jobId: number, body: { coverLetter?: string; resumeUrl?: string }) =>
  api.post<Application>(`/applications/jobs/${jobId}`, body).then(r => r.data)
export const myApplications = (params?: { page?: number }) =>
  api.get<Page<Application>>('/applications/my', { params }).then(r => r.data)
export const withdraw = (id: number) =>
  api.patch<Application>(`/applications/${id}/withdraw`).then(r => r.data)
export const applicationsForJob = (jobId: number, params?: { page?: number }) =>
  api.get<Page<Application>>(`/applications/jobs/${jobId}`, { params }).then(r => r.data)
export const recruiterApplications = (params?: { page?: number }) =>
  api.get<Page<Application>>('/applications/recruiter', { params }).then(r => r.data)
export const updateApplicationStatus = (id: number, status: ApplicationStatus) =>
  api.patch<Application>(`/applications/${id}/status`, null, { params: { status } }).then(r => r.data)
export const addNotes = (id: number, notes: string) =>
  api.patch<Application>(`/applications/${id}/notes`, { notes }).then(r => r.data)

// Interviews
export const scheduleInterview = (appId: number, body: object) =>
  api.post<Interview>(`/interviews/applications/${appId}`, body).then(r => r.data)
export const rescheduleInterview = (id: number, body: object) =>
  api.put<Interview>(`/interviews/${id}/reschedule`, body).then(r => r.data)
export const cancelInterview = (id: number) =>
  api.patch<Interview>(`/interviews/${id}/cancel`).then(r => r.data)
export const submitFeedback = (id: number, body: { feedback: string; rating: number }) =>
  api.patch<Interview>(`/interviews/${id}/feedback`, body).then(r => r.data)
export const recruiterInterviews = (params?: { page?: number }) =>
  api.get<Page<Interview>>('/interviews/recruiter', { params }).then(r => r.data)
export const myInterviews = (params?: { page?: number }) =>
  api.get<Page<Interview>>('/interviews/my', { params }).then(r => r.data)

// Offers
export const createOffer = (appId: number, body: object) =>
  api.post<Offer>(`/offers/applications/${appId}`, body).then(r => r.data)
export const sendOffer = (id: number) => api.patch<Offer>(`/offers/${id}/send`).then(r => r.data)
export const revokeOffer = (id: number) => api.patch<Offer>(`/offers/${id}/revoke`).then(r => r.data)
export const recruiterOffers = (params?: { page?: number }) =>
  api.get<Page<Offer>>('/offers/recruiter', { params }).then(r => r.data)
export const acceptOffer = (id: number) => api.patch<Offer>(`/offers/${id}/accept`).then(r => r.data)
export const declineOffer = (id: number) => api.patch<Offer>(`/offers/${id}/decline`).then(r => r.data)
export const myOffers = (params?: { page?: number }) =>
  api.get<Page<Offer>>('/offers/my', { params }).then(r => r.data)

// Notifications
export const listNotifications = () =>
  api.get<Page<Notification>>('/notifications').then(r => r.data)
export const unreadCount = () =>
  api.get<{ count: number }>('/notifications/unread-count').then(r => r.data)
export const markAllRead = () => api.patch('/notifications/mark-all-read')

// Reports
export const reportSummary = () =>
  api.get<ReportSummary>('/reports/summary').then(r => r.data)
