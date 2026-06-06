interface BadgeProps {
  label: string
  variant?: 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple'
}

const variants: Record<string, string> = {
  blue: 'bg-blue-100 text-blue-800',
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  gray: 'bg-gray-100 text-gray-800',
  purple: 'bg-purple-100 text-purple-800',
}

export default function Badge({ label, variant = 'gray' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]}`}>
      {label}
    </span>
  )
}

export function statusVariant(status: string): BadgeProps['variant'] {
  const map: Record<string, BadgeProps['variant']> = {
    OPEN: 'green', DRAFT: 'gray', CLOSED: 'red', ARCHIVED: 'gray',
    SUBMITTED: 'blue', UNDER_REVIEW: 'yellow', SHORTLISTED: 'purple',
    INTERVIEW_SCHEDULED: 'blue', OFFER_EXTENDED: 'green', HIRED: 'green',
    REJECTED: 'red', WITHDRAWN: 'gray',
    SCHEDULED: 'blue', COMPLETED: 'green', CANCELLED: 'red', RESCHEDULED: 'yellow',
    SENT: 'blue', ACCEPTED: 'green', DECLINED: 'red', EXPIRED: 'gray', REVOKED: 'red',
  }
  return map[status] ?? 'gray'
}
