import { useQuery } from '@tanstack/react-query'
import { reportSummary } from '../../api'
import type { ApplicationStatus } from '../../types'

const STATUS_ORDER: ApplicationStatus[] = [
  'SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED',
  'OFFER_EXTENDED', 'HIRED', 'REJECTED', 'WITHDRAWN',
]

export default function RecruiterReports() {
  const { data: report, isLoading } = useQuery({
    queryKey: ['report'],
    queryFn: reportSummary,
  })

  if (isLoading) return <div className="text-gray-400 text-sm">Loading…</div>
  if (!report) return null

  const total = report.totalApplications || 1

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reports</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Open Jobs" value={report.openJobs} color="blue" />
        <StatCard label="Total Jobs" value={report.totalJobs} color="gray" />
        <StatCard label="Total Applications" value={report.totalApplications} color="purple" />
        <StatCard label="Offer Conversion" value={`${report.offerConversionRate}%`} color="green" />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Applications by Status</h2>
        <div className="space-y-3">
          {STATUS_ORDER.map(status => {
            const count = report.applicationsByStatus[status] ?? 0
            const pct = Math.round((count / total) * 100)
            return (
              <div key={status} className="flex items-center gap-3">
                <span className="text-xs text-gray-500 w-40 shrink-0">{status.replace(/_/g, ' ')}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2">
                  <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs font-medium text-gray-700 w-8 text-right">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    gray: 'bg-gray-50 border-gray-200',
    purple: 'bg-purple-50 border-purple-200',
    green: 'bg-green-50 border-green-200',
  }
  return (
    <div className={`rounded-xl border p-5 ${colors[color] ?? colors.gray}`}>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  )
}
