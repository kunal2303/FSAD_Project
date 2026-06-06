import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recruiterApplications, updateApplicationStatus, addNotes } from '../../api'
import type { ApplicationStatus } from '../../types'
import Badge, { statusVariant } from '../../components/Badge'
import { format } from 'date-fns'

const STATUSES: ApplicationStatus[] = [
  'SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED',
  'OFFER_EXTENDED', 'HIRED', 'REJECTED', 'WITHDRAWN',
]

export default function RecruiterApplications() {
  const qc = useQueryClient()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const { data } = useQuery({
    queryKey: ['rec-applications-all'],
    queryFn: () => recruiterApplications(),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: ApplicationStatus }) =>
      updateApplicationStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rec-applications-all'] }),
  })

  const notesMutation = useMutation({
    mutationFn: ({ id, text }: { id: number; text: string }) => addNotes(id, text),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rec-applications-all'] }),
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Candidate', 'Job', 'Applied', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.content.map(app => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{app.candidate.fullName}</p>
                  <p className="text-xs text-gray-500">{app.candidate.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-700">{app.job.title}</td>
                <td className="px-4 py-3 text-gray-500">{format(new Date(app.submittedAt), 'MMM d, yyyy')}</td>
                <td className="px-4 py-3"><Badge label={app.status} variant={statusVariant(app.status)} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 items-center">
                    <select
                      defaultValue={app.status}
                      onChange={e => statusMutation.mutate({ id: app.id, status: e.target.value as ApplicationStatus })}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button onClick={() => { setSelectedId(app.id); setNotes(app.recruiterNotes ?? '') }}
                      className="text-xs text-primary-600 hover:underline">Notes</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.content.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">No applications yet.</p>
        )}
      </div>

      {selectedId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="font-semibold text-gray-800 mb-3">Recruiter Notes</h2>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={5}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setSelectedId(null)}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300">Cancel</button>
              <button onClick={() => {
                notesMutation.mutate({ id: selectedId, text: notes })
                setSelectedId(null)
              }} className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
