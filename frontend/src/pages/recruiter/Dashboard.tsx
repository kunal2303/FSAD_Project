import { useQuery } from '@tanstack/react-query'
import { reportSummary, recruiterApplications, recruiterInterviews } from '../../api'
import { useAuth } from '../../context/AuthContext'
import Badge, { statusVariant } from '../../components/Badge'
import { format } from 'date-fns'

export default function RecruiterDashboard() {
  const { user } = useAuth()
  const { data: report } = useQuery({ queryKey: ['report'], queryFn: reportSummary })
  const { data: applications } = useQuery({
    queryKey: ['rec-applications', 0],
    queryFn: () => recruiterApplications({ page: 0 }),
  })
  const { data: interviews } = useQuery({
    queryKey: ['rec-interviews', 0],
    queryFn: () => recruiterInterviews({ page: 0 }),
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.fullName}</h1>

      {report && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat label="Open Jobs" value={report.openJobs} />
          <Stat label="Total Applications" value={report.totalApplications} />
          <Stat label="Offer Conversion" value={`${report.offerConversionRate}%`} />
          <Stat label="Total Jobs" value={report.totalJobs} />
        </div>
      )}

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
                  <p className="text-sm font-medium text-gray-800">{app.candidate.fullName}</p>
                  <p className="text-xs text-gray-500">{app.job.title}</p>
                </div>
                <Badge label={app.status} variant={statusVariant(app.status)} />
              </li>
            ))}
          </ul>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Upcoming Interviews</h2>
          {interviews?.content.length === 0 && (
            <p className="text-sm text-gray-400">No interviews scheduled.</p>
          )}
          <ul className="divide-y divide-gray-100">
            {interviews?.content.slice(0, 5).map(iv => (
              <li key={iv.id} className="py-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {iv.application.candidate.fullName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(iv.scheduledAt), 'MMM d, h:mm a')}
                  </p>
                </div>
                <Badge label={iv.status} variant={statusVariant(iv.status)} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}
