import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { recruiterApplications, recruiterOffers, createOffer, sendOffer, revokeOffer } from '../../api'
import { useForm } from 'react-hook-form'
import Badge, { statusVariant } from '../../components/Badge'
import { format } from 'date-fns'

type OfferForm = { salary: string; startDate: string; expiresAt: string; notes: string }

export default function RecruiterOffers() {
  const qc = useQueryClient()
  const [createFor, setCreateFor] = useState<number | null>(null)
  const { data: offers } = useQuery({ queryKey: ['rec-offers'], queryFn: () => recruiterOffers() })
  const { data: applications } = useQuery({
    queryKey: ['rec-apps-offer'],
    queryFn: () => recruiterApplications(),
  })
  const { register, handleSubmit, reset } = useForm<OfferForm>()

  const createMutation = useMutation({
    mutationFn: (data: OfferForm) =>
      createOffer(createFor!, { ...data, salary: parseFloat(data.salary) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['rec-offers'] }); setCreateFor(null); reset() },
  })

  const sendMutation = useMutation({
    mutationFn: sendOffer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rec-offers'] }),
  })

  const revokeMutation = useMutation({
    mutationFn: revokeOffer,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rec-offers'] }),
  })

  const eligibleApps = applications?.content.filter(a =>
    ['SHORTLISTED', 'INTERVIEW_SCHEDULED', 'UNDER_REVIEW'].includes(a.status)
  ) ?? []

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Offers</h1>
        {eligibleApps.length > 0 && (
          <button onClick={() => setCreateFor(eligibleApps[0].id)}
            className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
            Create Offer
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Candidate', 'Job', 'Salary', 'Start Date', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {offers?.content.map(offer => (
              <tr key={offer.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{offer.application.candidate.fullName}</td>
                <td className="px-4 py-3 text-gray-700">{offer.application.job.title}</td>
                <td className="px-4 py-3 text-gray-700">${offer.salary.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-500">{format(new Date(offer.startDate), 'MMM d, yyyy')}</td>
                <td className="px-4 py-3"><Badge label={offer.status} variant={statusVariant(offer.status)} /></td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {offer.status === 'DRAFT' && (
                      <button onClick={() => sendMutation.mutate(offer.id)}
                        className="text-xs text-green-600 hover:underline">Send</button>
                    )}
                    {offer.status === 'SENT' && (
                      <button onClick={() => revokeMutation.mutate(offer.id)}
                        className="text-xs text-red-500 hover:underline">Revoke</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {offers?.content.length === 0 && (
          <p className="text-center text-gray-400 py-8 text-sm">No offers yet.</p>
        )}
      </div>

      {createFor !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="font-semibold text-gray-800 mb-4">Create Offer</h2>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Application</label>
              <select value={createFor} onChange={e => setCreateFor(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                {eligibleApps.map(a => (
                  <option key={a.id} value={a.id}>{a.candidate.fullName} — {a.job.title}</option>
                ))}
              </select>
            </div>
            <form onSubmit={handleSubmit(d => createMutation.mutate(d))} className="space-y-3">
              {[
                { name: 'salary', label: 'Salary ($)', type: 'number', required: true },
                { name: 'startDate', label: 'Start Date', type: 'date', required: true },
                { name: 'expiresAt', label: 'Offer Expires', type: 'date' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                  <input {...register(f.name as keyof OfferForm, { required: f.required })} type={f.type}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea {...register('notes')} rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setCreateFor(null)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-300">Cancel</button>
                <button type="submit" disabled={createMutation.isPending}
                  className="px-4 py-2 text-sm rounded-lg bg-primary-600 text-white disabled:opacity-50">
                  {createMutation.isPending ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
