import { useQuery } from '@tanstack/react-query'
import { myInterviews } from '../../api'
import Badge, { statusVariant } from '../../components/Badge'
import { format } from 'date-fns'

export default function CandidateInterviews() {
  const { data } = useQuery({
    queryKey: ['my-interviews'],
    queryFn: () => myInterviews(),
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">My Interviews</h1>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Job', 'Scheduled At', 'Duration', 'Location / Link', 'Status'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.content.map(iv => (
              <tr key={iv.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{iv.application.job.title}</td>
                <td className="px-4 py-3 text-gray-600">{format(new Date(iv.scheduledAt), 'MMM d, yyyy h:mm a')}</td>
                <td className="px-4 py-3 text-gray-500">{iv.durationMins} min</td>
                <td className="px-4 py-3">
                  {iv.meetingUrl
                    ? <a href={iv.meetingUrl} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline text-xs">Join</a>
                    : <span className="text-gray-400">{iv.location ?? '—'}</span>
                  }
                </td>
                <td className="px-4 py-3"><Badge label={iv.status} variant={statusVariant(iv.status)} /></td>
              </tr>
            ))}
          </tbody>
        </table>
        {data?.content.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">No interviews scheduled yet.</p>
        )}
      </div>
    </div>
  )
}
