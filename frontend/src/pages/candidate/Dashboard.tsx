import { useQuery } from '@tanstack/react-query'
import { myApplications, myInterviews, myOffers } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Badge, { statusVariant } from '../../components/Badge'
import { format } from 'date-fns'

export default function CandidateDashboard() {
  const { user } = useAuth()
  const { data: applications } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => myApplications(),
  })
  const { data: interviews } = useQuery({
    queryKey: ['my-interviews'],
    queryFn: () => myInterviews(),
  })
  const { data: offers } = useQuery({
    queryKey: ['my-offers'],
    queryFn: () => myOffers(),
  })

  const pendingOffers = offers?.content.filter(o => o.status === 'SENT') ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.fullName}</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Stat label="Applications" value={applications?.totalElements ?? 0} />
        <Stat label="Upcoming Interviews" value={
          interviews?.content.filter(i => i.status === 'SCHEDULED').length ?? 0
        } />
        <Stat label="Pending Offers" value={pendingOffers.length} highlight={pendingOffers.length > 0} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Recent Applications</h2>
          {applications?.content.length === 0 && (
            <p className="text-sm text-gray-400">No applications yet.</p>
          )}
          <ul className="divide-y divide-gray-100">
            {applications?.content.slice(0, 5).map(app => (
              <li key={app.id} className="py-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">{app.job.title}</p>
                  <p className="text-xs text-gray-500">{app.job.recruiter.fullName}</p>
                </div>
                <Badge label={app.status} variant={statusVariant(app.status)} />
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Upcoming Interviews</h2>
          {interviews?.content.filter(i => i.status === 'SCHEDULED').length === 0 && (
            <p className="text-sm text-gray-400">No upcoming interviews.</p>
          )}
          <ul className="divide-y divide-gray-100">
            {interviews?.content.filter(i => i.status === 'SCHEDULED').slice(0, 4).map(iv => (
              <li key={iv.id} className="py-2">
                <p className="text-sm font-medium text-gray-800">{iv.application.job.title}</p>
                <p className="text-xs text-gray-500">{format(new Date(iv.scheduledAt), 'MMM d, h:mm a')}</p>
                {iv.meetingUrl && (
                  <a href={iv.meetingUrl} target="_blank" rel="noreferrer"
                    className="text-xs text-primary-600 hover:underline">Join meeting</a>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>

      {pendingOffers.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-5">
          <h2 className="font-semibold text-green-800 mb-2">You have {pendingOffers.length} pending offer{pendingOffers.length > 1 ? 's' : ''}!</h2>
          <p className="text-sm text-green-700">Visit the Offers tab to review and respond.</p>
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${highlight ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${highlight ? 'text-green-700' : 'text-gray-900'}`}>{value}</p>
    </div>
  )
}
