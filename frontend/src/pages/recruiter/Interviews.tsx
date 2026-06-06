import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  recruiterApplications, recruiterInterviews,
  scheduleInterview, cancelInterview, submitFeedback,
} from '../../api'
import { useForm } from 'react-hook-form'
import type { Interview } from '../../types'
import Badge, { statusVariant } from '../../components/Badge'
import { format } from 'date-fns'

type ScheduleForm = { scheduledAt: string; durationMins: number; location: string; meetingUrl: string }
type FeedbackForm = { feedback: string; rating: number }

export default function RecruiterInterviews() {
  const qc = useQueryClient()
  const [scheduleFor, setScheduleFor] = useState<number | null>(null)
  const [feedbackFor, setFeedbackFor] = useState<Interview | null>(null)
  const [scheduleError, setScheduleError] = useState('')
  const [feedbackError, setFeedbackError] = useState('')

  const { data: applications } = useQuery({
    queryKey: ['rec-apps-for-schedule'],
    queryFn: () => recruiterApplications(),
  })
  const { data: interviews } = useQuery({
    queryKey: ['rec-interviews'],
    queryFn: () => recruiterInterviews(),
  })
  const scheduleForm = useForm<ScheduleForm>({ defaultValues: { durationMins: 60 } })
  const feedbackForm = useForm<FeedbackForm>()

  const scheduleMutation = useMutation({
    mutationFn: (data: ScheduleForm) =>
      scheduleInterview(scheduleFor!, {
        ...data,
        scheduledAt: new Date(data.scheduledAt).toISOString(),
        durationMins: Number(data.durationMins),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rec-interviews'] })
      qc.invalidateQueries({ queryKey: ['rec-apps-for-schedule'] })
      setScheduleFor(null)
      setScheduleError('')
      scheduleForm.reset()
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error
      setScheduleError(msg ?? 'Failed to schedule interview. Please try again.')
    },
  })

  const cancelMutation = useMutation({
    mutationFn: cancelInterview,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rec-interviews'] }),
  })

  const feedbackMutation = useMutation({
    mutationFn: (data: FeedbackForm) =>
      submitFeedback(feedbackFor!.id, { ...data, rating: Number(data.rating) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rec-interviews'] })
      setFeedbackFor(null)
      setFeedbackError('')
      feedbackForm.reset()
    },
    onError: (e: unknown) => {
      const msg = (e as { response?: { data?: { error?: string } } }).response?.data?.error
      setFeedbackError(msg ?? 'Failed to submit feedback.')
    },
  })

  // All applications that haven't been rejected/hired/withdrawn are schedulable
  const schedulable = applications?.content.filter(a =>
    !['REJECTED', 'HIRED', 'WITHDRAWN'].includes(a.status)
  ) ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Interviews</h1>
        <button
          onClick={() => { setScheduleFor(schedulable[0]?.id ?? null); setScheduleError('') }}
          disabled={schedulable.length === 0}
          className="bg-primary-600 hover:bg-primary-700 disabled:opacity-40 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          Schedule Interview
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Candidate', 'Job', 'Scheduled At', 'Duration', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {interviews?.content.map(iv => (
              <tr key={iv.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{iv.application.candidate.fullName}</td>
                <td className="px-4 py-3 text-gray-700">{iv.application.job.title}</td>
                <td className="px-4 py-3 text-gray-600">{format(new Date(iv.scheduledAt), 'MMM d, h:mm a')}</td>
                <td className="px-4 py-3 text-gray-500">{iv.durationMins}m</td>
                <td className="px-4 py-3"><Badge label={iv.status} variant={statusVariant(iv.status)} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {iv.status === 'SCHEDULED' || iv.status === 'RESCHEDULED' ? (
                      <>
                        <button onClick={() => { setFeedbackFor(iv); setFeedbackError('') }}
                          className="text-xs text-primary-600 hover:underline">Feedback</button>
                        <button onClick={() => cancelMutation.mutate(iv.id)}
                          className="text-xs text-red-500 hover:underline">Cancel</button>
                      </>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {interviews?.content.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">No interviews yet.</p>
        )}
      </div>

      {scheduleFor !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="font-semibold text-gray-800 mb-4">Schedule Interview</h2>

            {schedulable.length === 0 ? (
              <p className="text-sm text-gray-500 mb-4">No eligible applications found.</p>
            ) : (
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Application</label>
                <select
                  value={scheduleFor}
                  onChange={e => setScheduleFor(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  {schedulable.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.candidate.fullName} — {a.job.title} ({a.status})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {scheduleError && <p className="text-sm text-red-600 mb-3">{scheduleError}</p>}

            <form onSubmit={scheduleForm.handleSubmit(d => scheduleMutation.mutate(d))} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time *</label>
                <input type="datetime-local" {...scheduleForm.register('scheduledAt', { required: true })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input type="number" {...scheduleForm.register('durationMins')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input {...scheduleForm.register('location')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting URL</label>
                <input {...scheduleForm.register('meetingUrl')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setScheduleFor(null)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300">Cancel</button>
                <button type="submit" disabled={scheduleMutation.isPending}
                  className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white disabled:opacity-50">
                  {scheduleMutation.isPending ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {feedbackFor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="font-semibold text-gray-800 mb-4">Submit Feedback</h2>
            {feedbackError && <p className="text-sm text-red-600 mb-3">{feedbackError}</p>}
            <form onSubmit={feedbackForm.handleSubmit(d => feedbackMutation.mutate(d))} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Feedback *</label>
                <textarea {...feedbackForm.register('feedback', { required: true })} rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1–5) *</label>
                <input type="number" min={1} max={5}
                  {...feedbackForm.register('rating', { required: true, valueAsNumber: true })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setFeedbackFor(null)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300">Cancel</button>
                <button type="submit" disabled={feedbackMutation.isPending}
                  className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white disabled:opacity-50">
                  {feedbackMutation.isPending ? 'Saving…' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
