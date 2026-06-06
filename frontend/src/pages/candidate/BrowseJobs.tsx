import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { listJobs, applyToJob } from '../../api'
import { useForm } from 'react-hook-form'
import type { Job } from '../../types'
import Badge, { statusVariant } from '../../components/Badge'

type ApplyForm = { coverLetter: string; resumeUrl: string }

export default function BrowseJobs() {
  const qc = useQueryClient()
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [applyingTo, setApplyingTo] = useState<Job | null>(null)
  const { register, handleSubmit, reset } = useForm<ApplyForm>()

  const { data } = useQuery({
    queryKey: ['jobs', q],
    queryFn: () => listJobs({ q: q || undefined }),
  })

  const applyMutation = useMutation({
    mutationFn: (data: ApplyForm) => applyToJob(applyingTo!.id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-applications'] })
      setApplyingTo(null)
      reset()
    },
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Browse Jobs</h1>

      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Search jobs…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && setQ(search)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
        />
        <button onClick={() => setQ(search)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm rounded-lg">
          Search
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data?.content.map(job => (
          <div key={job.id} className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h2 className="font-semibold text-gray-800">{job.title}</h2>
              <Badge label={job.status} variant={statusVariant(job.status)} />
            </div>
            <p className="text-sm text-gray-500 mb-1">{job.recruiter?.fullName ?? ''}</p>
            {job.location && <p className="text-xs text-gray-400 mb-1">📍 {job.location}</p>}
            {job.jobType && <p className="text-xs text-gray-400 mb-1">💼 {job.jobType}</p>}
            {(job.salaryMin || job.salaryMax) && (
              <p className="text-xs text-gray-400 mb-3">
                💰 {job.salaryMin ? `$${job.salaryMin.toLocaleString()}` : ''}
                {job.salaryMin && job.salaryMax ? ' – ' : ''}
                {job.salaryMax ? `$${job.salaryMax.toLocaleString()}` : ''}
              </p>
            )}
            <p className="text-xs text-gray-600 line-clamp-3 flex-1">{job.description}</p>
            <button
              onClick={() => setApplyingTo(job)}
              className="mt-4 w-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 rounded-lg"
            >
              Apply
            </button>
          </div>
        ))}
      </div>
      {data?.content.length === 0 && (
        <p className="text-center text-gray-400 py-10 text-sm">No open jobs found.</p>
      )}

      {applyingTo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="font-semibold text-gray-800 mb-1">Apply to {applyingTo.title}</h2>
            <p className="text-xs text-gray-500 mb-4">{applyingTo.recruiter.fullName}</p>
            {applyMutation.isError && (
              <p className="text-sm text-red-600 mb-3">
                {(applyMutation.error as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Application failed.'}
              </p>
            )}
            <form onSubmit={handleSubmit(d => applyMutation.mutate(d))} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter</label>
                <textarea {...register('coverLetter')} rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resume URL</label>
                <input {...register('resumeUrl')} type="url"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setApplyingTo(null)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300">Cancel</button>
                <button type="submit" disabled={applyMutation.isPending}
                  className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white disabled:opacity-50">
                  {applyMutation.isPending ? 'Submitting…' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
