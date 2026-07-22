'use client'

import { useState } from 'react'
import {
  confirmPayment,
  rejectPayment,
  updateSubscriptionOverride,
  updateSubscriptionStatus,
  updatePaymentMethodConfig,
} from '@/app/actions/billing'
import { CheckCircle2, XCircle, Shield, CreditCard, RefreshCw, Edit3, Search, AlertCircle, Loader2, Check, X, Phone, ShieldAlert } from 'lucide-react'

interface SaasAdminClientProps {
  pendingPayments: any[]
  recentPayments: any[]
  subscriptions: any[]
  paymentConfigs: any[]
}

export default function SaasAdminClient({
  pendingPayments: initialPending,
  recentPayments: initialRecent,
  subscriptions: initialSubs,
  paymentConfigs: initialConfigs,
}: SaasAdminClientProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'subscriptions' | 'configs' | 'history'>('pending')
  const [pendingPayments, setPendingPayments] = useState(initialPending)
  const [recentPayments, setRecentPayments] = useState(initialRecent)
  const [subscriptions, setSubscriptions] = useState(initialSubs)
  const [configs, setConfigs] = useState(initialConfigs)

  // Search query
  const [searchTerm, setSearchTerm] = useState('')

  // Action states
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')

  // Reject Modal
  const [rejectingPayment, setRejectingPayment] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState('')

  // Override Modal
  const [editingSub, setEditingSub] = useState<any>(null)
  const [overrideUserLimit, setOverrideUserLimit] = useState<string>('')
  const [overrideLeadLimit, setOverrideLeadLimit] = useState<string>('')
  const [isCustom, setIsCustom] = useState(false)

  // Config Edit Modal
  const [editingConfig, setEditingConfig] = useState<any>(null)
  const [configNumber, setConfigNumber] = useState('')
  const [configType, setConfigType] = useState('')
  const [configInstructions, setConfigInstructions] = useState('')
  const [configActive, setConfigActive] = useState(true)

  // Handle Confirm Payment
  const handleConfirmPayment = async (paymentId: string) => {
    if (!confirm('Confirm and activate subscription for this payment?')) return
    setLoadingId(paymentId)
    setActionError('')

    const res = await confirmPayment(paymentId)
    setLoadingId(null)

    if (res.error) {
      setActionError(res.error)
    } else {
      window.location.reload()
    }
  }

  // Handle Reject Payment Submit
  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!rejectingPayment) return
    setLoadingId(rejectingPayment.id)
    setActionError('')

    const res = await rejectPayment(rejectingPayment.id, rejectReason)
    setLoadingId(null)

    if (res.error) {
      setActionError(res.error)
    } else {
      setRejectingPayment(null)
      window.location.reload()
    }
  }

  // Handle Save Overrides
  const handleSaveOverrides = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSub) return
    setLoadingId(editingSub.id)
    setActionError('')

    const uLimit = overrideUserLimit === '' ? null : parseInt(overrideUserLimit, 10)
    const lLimit = overrideLeadLimit === '' ? null : parseInt(overrideLeadLimit, 10)

    const res = await updateSubscriptionOverride(editingSub.id, uLimit, lLimit, isCustom)
    setLoadingId(null)

    if (res.error) {
      setActionError(res.error)
    } else {
      setSubscriptions(
        subscriptions.map((s) =>
          s.id === editingSub.id
            ? { ...s, overrideUserLimit: uLimit, overrideLeadLimit: lLimit, isCustom }
            : s
        )
      )
      setEditingSub(null)
    }
  }

  // Handle Change Status (Resume/Suspend)
  const handleChangeStatus = async (subId: string, status: any) => {
    if (!confirm(`Are you sure you want to change status to '${status}'?`)) return
    setLoadingId(subId)
    setActionError('')

    const res = await updateSubscriptionStatus(subId, status)
    setLoadingId(null)

    if (res.error) {
      setActionError(res.error)
    } else {
      setSubscriptions(
        subscriptions.map((s) => (s.id === subId ? { ...s, status } : s))
      )
    }
  }

  // Handle Save Config
  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingConfig) return
    setLoadingId(editingConfig.id)
    setActionError('')

    const res = await updatePaymentMethodConfig(
      editingConfig.id,
      configNumber,
      configType,
      configInstructions,
      configActive
    )
    setLoadingId(null)

    if (res.error) {
      setActionError(res.error)
    } else {
      setConfigs(
        configs.map((c) =>
          c.id === editingConfig.id
            ? { ...c, number: configNumber, accountType: configType, instructions: configInstructions, isActive: configActive }
            : c
        )
      )
      setEditingConfig(null)
    }
  }

  const filteredSubs = subscriptions.filter(
    (s) =>
      s.company?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.plan?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const inputClass = "w-full bg-[#1E1E1E] border border-[#3C3C3C] rounded-xl py-2.5 px-3 text-xs font-semibold text-white placeholder-gray-500 focus:outline-none focus:border-[#007ACC] transition-all"

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#202638] font-display">SaaS Administration & Reconciliation</h2>
          <p className="text-xs text-gray-500">Manage tenant subscriptions, confirm bKash/Nagad/Rocket payments, and configure custom overrides.</p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-gray-200 p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all relative ${
              activeTab === 'pending' ? 'bg-white text-[#202638] shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>Pending Payments</span>
            {pendingPayments.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-[10px] bg-red-500 text-white rounded-full font-extrabold">
                {pendingPayments.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('subscriptions')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'subscriptions' ? 'bg-white text-[#202638] shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Tenant Subscriptions
          </button>
          <button
            onClick={() => setActiveTab('configs')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'configs' ? 'bg-white text-[#202638] shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Receiving Numbers
          </button>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-red-50 text-red-600 text-xs font-semibold flex items-center justify-between border border-red-200">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: PENDING PAYMENTS QUEUE */}
      {activeTab === 'pending' && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Pending Manual Payment Verification ({pendingPayments.length})
            </h3>
          </div>
          {pendingPayments.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500">
              No pending payments awaiting verification right now.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-4 text-left">Company</th>
                    <th className="px-6 py-4 text-left">Plan Requested</th>
                    <th className="px-6 py-4 text-left">Method</th>
                    <th className="px-6 py-4 text-left">Transaction ID</th>
                    <th className="px-6 py-4 text-left">Amount Due</th>
                    <th className="px-6 py-4 text-left">Submitted</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {pendingPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-900">
                        {p.company?.name || 'Company'}
                        <div className="text-[10px] text-gray-500 font-normal">{p.submitter?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-800">
                        {p.plan?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-[#4855E4]">
                        {p.method}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-mono font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-md inline-block my-3">
                        {p.transactionNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-900">
                        ${p.amountUsd}
                        {p.includesSetupFee && <span className="ml-1 text-[10px] text-amber-600 font-normal">(inc. setup)</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-bold space-x-2">
                        <button
                          disabled={loadingId === p.id}
                          onClick={() => handleConfirmPayment(p.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-sm flex-inline items-center gap-1"
                        >
                          {loadingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirm'}
                        </button>
                        <button
                          disabled={loadingId === p.id}
                          onClick={() => {
                            setRejectingPayment(p)
                            setRejectReason('')
                          }}
                          className="px-3 py-1.5 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TENANT SUBSCRIPTIONS & OVERRIDES */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search company or plan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-[#4855E4]"
              />
            </div>
            <span className="text-xs text-gray-500 font-semibold">{filteredSubs.length} Tenants</span>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-4 text-left">Company</th>
                    <th className="px-6 py-4 text-left">Current Plan</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-left">Limits (Seat / Lead)</th>
                    <th className="px-6 py-4 text-left">Period End</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {filteredSubs.map((s) => {
                    const uLimit = s.overrideUserLimit !== null ? s.overrideUserLimit : s.plan?.userLimit
                    const lLimit = s.overrideLeadLimit !== null ? s.overrideLeadLimit : s.plan?.leadLimitPerMonth

                    return (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-gray-900">
                          {s.company?.name || 'Company'}
                          {s.isCustom && <span className="ml-2 text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-extrabold">Custom</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-700">
                          {s.plan?.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-bold">
                          <span className={`px-2.5 py-0.5 inline-flex text-[10px] font-bold rounded-full ${
                            s.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700'
                              : s.status === 'grace'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                          }`}>
                            {s.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600 font-mono">
                          Seats: {uLimit === -1 || uLimit === null ? '∞' : uLimit} | Leads: {lLimit === -1 || lLimit === null ? '∞' : lLimit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-bold space-x-2">
                          <button
                            onClick={() => {
                              setEditingSub(s)
                              setOverrideUserLimit(s.overrideUserLimit !== null ? String(s.overrideUserLimit) : '')
                              setOverrideLeadLimit(s.overrideLeadLimit !== null ? String(s.overrideLeadLimit) : '')
                              setIsCustom(s.isCustom || false)
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                            title="Edit Overrides & Limits"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {s.status === 'suspended' ? (
                            <button
                              onClick={() => handleChangeStatus(s.id, 'active')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all text-xs font-bold"
                            >
                              Resume
                            </button>
                          ) : (
                            <button
                              onClick={() => handleChangeStatus(s.id, 'suspended')}
                              className="px-3 py-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all text-xs font-bold"
                            >
                              Suspend
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RECEIVING NUMBERS CONFIG */}
      {activeTab === 'configs' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {configs.map((cfg) => (
            <div key={cfg.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-[#4855E4]" />
                  <span>{cfg.method}</span>
                </h4>
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${cfg.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {cfg.isActive ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div>
                <p className="text-xs text-gray-500">Receiving Number:</p>
                <p className="text-lg font-mono font-bold text-gray-900">{cfg.number}</p>
                <p className="text-xs text-gray-500 mt-1">Type: <span className="font-semibold text-gray-800">{cfg.accountType}</span></p>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <p className="text-[11px] text-gray-500 leading-relaxed">{cfg.instructions}</p>
              </div>

              <button
                onClick={() => {
                  setEditingConfig(cfg)
                  setConfigNumber(cfg.number)
                  setConfigType(cfg.accountType || '')
                  setConfigInstructions(cfg.instructions || '')
                  setConfigActive(cfg.isActive)
                }}
                className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition-all"
              >
                Edit Config
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Reject Payment Modal */}
      {rejectingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-gray-900">Reject Payment Submission</h3>
            <p className="text-xs text-gray-500">
              Provide a reason for rejecting transaction <strong className="font-mono">{rejectingPayment.transactionNumber}</strong>.
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Transaction ID not found or incorrect amount sent."
                className="w-full p-3 border border-gray-300 rounded-xl text-xs font-medium outline-none focus:border-red-500"
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setRejectingPayment(null)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700"
                >
                  Reject Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Override Limits Modal */}
      {editingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#252526] border border-[#3C3C3C] text-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold">Custom Overrides — {editingSub.company?.name}</h3>
            <form onSubmit={handleSaveOverrides} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">User Seat Limit (-1 = Unlimited, leave blank = Plan Default)</label>
                <input
                  type="number"
                  value={overrideUserLimit}
                  onChange={(e) => setOverrideUserLimit(e.target.value)}
                  placeholder="e.g. 50 or -1"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Monthly Lead Limit (-1 = Unlimited, leave blank = Plan Default)</label>
                <input
                  type="number"
                  value={overrideLeadLimit}
                  onChange={(e) => setOverrideLeadLimit(e.target.value)}
                  placeholder="e.g. 5000 or -1"
                  className={inputClass}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isCustom"
                  checked={isCustom}
                  onChange={(e) => setIsCustom(e.target.checked)}
                  className="rounded bg-[#1E1E1E] border-[#3C3C3C]"
                />
                <label htmlFor="isCustom" className="text-xs font-bold text-gray-300 cursor-pointer">
                  Mark as Custom Tier (Hides standard upgrade prompts)
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSub(null)}
                  className="flex-1 py-2.5 bg-[#333333] text-gray-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#0E639C] text-white text-xs font-bold rounded-xl hover:bg-[#1177BB]"
                >
                  Save Overrides
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Config Edit Modal */}
      {editingConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-gray-900">
            <h3 className="text-base font-bold">Edit {editingConfig.method} Config</h3>
            <form onSubmit={handleSaveConfig} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Receiving Number</label>
                <input
                  type="text"
                  required
                  value={configNumber}
                  onChange={(e) => setConfigNumber(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl text-xs font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Account Type</label>
                <input
                  type="text"
                  required
                  value={configType}
                  onChange={(e) => setConfigType(e.target.value)}
                  placeholder="Personal or Merchant"
                  className="w-full p-3 border border-gray-300 rounded-xl text-xs font-medium outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Payment Instructions</label>
                <textarea
                  rows={3}
                  value={configInstructions}
                  onChange={(e) => setConfigInstructions(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl text-xs font-medium outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="configActive"
                  checked={configActive}
                  onChange={(e) => setConfigActive(e.target.checked)}
                />
                <label htmlFor="configActive" className="text-xs font-bold text-gray-700">Active (Visible on payment page)</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingConfig(null)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#4855E4] text-white text-xs font-bold rounded-xl hover:bg-[#333FC2]"
                >
                  Save Config
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
