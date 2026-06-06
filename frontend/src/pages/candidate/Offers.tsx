import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { myOffers, acceptOffer, declineOffer } from '../../api'
import Badge, { statusVariant } from '../../components/Badge'
import { format } from 'date-fns'

export default function CandidateOffers() {
  const qc = useQueryClient()
  const { data } = useQuery({
    queryKey: ['my-offers'],
    queryFn: () => myOffers(),
  })

  const acceptMutation = useMutation({
    mutationFn: acceptOffer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-offers'] }),
  })

  const declineMutation = useMutation({
    mutationFn: declineOffer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-offers'] }),
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">My Offers</h1>
      <div className="space-y-4">
        {data?.content.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-8">No offers yet.</p>
        )}
        {data?.content.map(offer => (
          <div key={offer.id} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="font-semibold text-gray-800 text-lg">{offer.application.job.title}</h2>
                <p className="text-sm text-gray-500">{offer.application.job.recruiter.fullName}</p>
              </div>
              <Badge label={offer.status} variant={statusVariant(offer.status)} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4 text-sm">
              <div>
                <p className="text-xs text-gray-400">Salary</p>
                <p className="font-semibold text-gray-800">${offer.salary.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Start Date</p>
                <p className="font-medium text-gray-700">{format(new Date(offer.startDate), 'MMM d, yyyy')}</p>
              </div>
              {offer.expiresAt && (
                <div>
                  <p className="text-xs text-gray-400">Offer Expires</p>
                  <p className="font-medium text-gray-700">{format(new Date(offer.expiresAt), 'MMM d, yyyy')}</p>
                </div>
              )}
            </div>
            {offer.notes && (
              <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 mb-4">{offer.notes}</p>
            )}
            {offer.status === 'SENT' && (
              <div className="flex gap-3">
                <button
                  onClick={() => acceptMutation.mutate(offer.id)}
                  disabled={acceptMutation.isPending}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg disabled:opacity-50"
                >
                  Accept Offer
                </button>
                <button
                  onClick={() => { if (confirm('Decline this offer?')) declineMutation.mutate(offer.id) }}
                  disabled={declineMutation.isPending}
                  className="px-5 py-2 border border-red-300 text-red-600 hover:bg-red-50 text-sm font-medium rounded-lg disabled:opacity-50"
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
