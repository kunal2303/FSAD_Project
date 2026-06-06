import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { myApplications, withdraw } from '../../api'
import Badge, { statusVariant } from '../../components/Badge'
import { format } from 'date-fns'

export default function CandidateApplications() {
  const qc = useQueryClient()
  const { data } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => myApplications(),
  })

  const withdrawMutation = useMutation({
    mutationFn: withdraw,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-applications'] }),
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Job', 'Company', 'Applied', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.content.map(app => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{app.job.title}</td>
                <td className="px-4 py-3 text-gray-500">{app.job.recruiter.fullName}</td>
                <td className="px-4 py-3 text-gray-500">{format(new Date(app.submittedAt), 'MMM d, yyyy')}</td>
                <td className="px-4 py-3"><Badge label={app.status} variant={statusVariant(app.status)} /></td>
                <td className="px-4 py-3">
                  {!['WITHDRAWN', 'REJECTED', 'HIRED'].includes(app.status) && (
                    <button
                      onClick={() => { if (confirm('Withdraw this application?')) withdrawMutation.mutate(app.id) }}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Withdraw
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.content.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">You haven't applied to any jobs yet.</p>
        )}
      </div>
    </div>
  )
}
