import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { myJobs, createJob, updateJob, changeJobStatus, deleteJob } from '../../api'
import { useForm } from 'react-hook-form'
import type { Job, JobStatus } from '../../types'
import Badge, { statusVariant } from '../../components/Badge'

type JobForm = {
  title: string; description: string; department: string
  location: string; jobType: string; salaryMin: string; salaryMax: string; closesAt: string
}

export default function RecruiterJobs() {
  const qc = useQueryClient()
  const [editing, setEditing] = useState<Job | null>(null)
  const [showForm, setShowForm] = useState(false)
  const { data } = useQuery({ queryKey: ['my-jobs'], queryFn: () => myJobs() })
  const { register, handleSubmit, reset, setValue } = useForm<JobForm>()

  const saveMutation = useMutation({
    mutationFn: (data: JobForm) => {
      const body = {
        ...data,
        salaryMin: data.salaryMin ? parseFloat(data.salaryMin) : null,
        salaryMax: data.salaryMax ? parseFloat(data.salaryMax) : null,
        closesAt: data.closesAt || null,
      }
      return editing ? updateJob(editing.id, body) : createJob(body)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['my-jobs'] }); closeForm() },
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: JobStatus }) => changeJobStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-jobs'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-jobs'] }),
  })

  const openEdit = (job: Job) => {
    setEditing(job)
    setValue('title', job.title)
    setValue('description', job.description)
    setValue('department', job.department ?? '')
    setValue('location', job.location ?? '')
    setValue('jobType', job.jobType ?? '')
    setValue('salaryMin', job.salaryMin?.toString() ?? '')
    setValue('salaryMax', job.salaryMax?.toString() ?? '')
    setValue('closesAt', job.closesAt ?? '')
    setShowForm(true)
  }

  const closeForm = () => { setShowForm(false); setEditing(null); reset() }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Jobs</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          + New Job
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-800 mb-4">{editing ? 'Edit Job' : 'Create Job'}</h2>
          <form onSubmit={handleSubmit(d => saveMutation.mutate(d))} className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input {...register('title', { required: true })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea {...register('description', { required: true })} rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
            </div>
            {[
              { name: 'department', label: 'Department' },
              { name: 'location', label: 'Location' },
              { name: 'jobType', label: 'Job Type' },
              { name: 'closesAt', label: 'Closes At', type: 'date' },
              { name: 'salaryMin', label: 'Salary Min', type: 'number' },
              { name: 'salaryMax', label: 'Salary Max', type: 'number' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input {...register(f.name as keyof JobForm)} type={f.type ?? 'text'}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
            ))}
            <div className="col-span-2 flex gap-2 justify-end">
              <button type="button" onClick={closeForm}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-50">
                Cancel
              </button>
              <button type="submit" disabled={saveMutation.isPending}
                className="px-4 py-2 text-sm rounded-lg bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50">
                {saveMutation.isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Title', 'Department', 'Location', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.content.map(job => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{job.title}</td>
                <td className="px-4 py-3 text-gray-500">{job.department ?? '—'}</td>
                <td className="px-4 py-3 text-gray-500">{job.location ?? '—'}</td>
                <td className="px-4 py-3"><Badge label={job.status} variant={statusVariant(job.status)} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(job)}
                      className="text-xs text-primary-600 hover:underline">Edit</button>
                    {job.status === 'DRAFT' && (
                      <button onClick={() => statusMutation.mutate({ id: job.id, status: 'OPEN' })}
                        className="text-xs text-green-600 hover:underline">Publish</button>
                    )}
                    {job.status === 'OPEN' && (
                      <button onClick={() => statusMutation.mutate({ id: job.id, status: 'CLOSED' })}
                        className="text-xs text-red-600 hover:underline">Close</button>
                    )}
                    <button onClick={() => { if (confirm('Delete this job?')) deleteMutation.mutate(job.id) }}
                      className="text-xs text-gray-400 hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.content.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">No jobs yet. Create your first job posting.</p>
        )}
      </div>
    </div>
  )
}
