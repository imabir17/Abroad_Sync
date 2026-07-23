'use client'

import { useState } from 'react'
import {
  confirmPayment,
  rejectPayment,
  updateSubscriptionOverride,
  updateSubscriptionStatus,
  updatePaymentMethodConfig,
} from '@/app/actions/billing'
import {
  startImpersonation,
  addTenantNote,
  createPlan,
  updatePlan,
  togglePlanActive,
  bulkConfirmPayments,
  createCoupon,
  toggleCouponActive,
  getTenantFullDetails,
} from '@/app/actions/saas-admin'
import {
  CheckCircle2,
  XCircle,
  Shield,
  CreditCard,
  RefreshCw,
  Edit3,
  Search,
  AlertTriangle,
  Loader2,
  Check,
  X,
  UserCheck,
  Building2,
  DollarSign,
  TrendingUp,
  Users,
  Activity,
  PlusCircle,
  FileText,
  Clock,
  CheckSquare,
  Square,
  Ticket,
  Eye,
  Sliders,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

interface SaasAdminClientProps {
  pendingPayments: any[]
  recentPayments: any[]
  subscriptions: any[]
  paymentConfigs: any[]
  companies: any[]
  tenantMetricsMap: Record<string, { activeUsers: number; monthlyLeads: number }>
  plans: any[]
  auditLogs: any[]
  coupons: any[]
  cronLogs: any[]
}

export default function SaasAdminClient({
  pendingPayments: initialPending,
  recentPayments: initialRecent,
  subscriptions: initialSubs,
  paymentConfigs: initialConfigs,
  companies: initialCompanies,
  tenantMetricsMap,
  plans: initialPlans,
  auditLogs: initialAuditLogs,
  coupons: initialCoupons,
  cronLogs: initialCronLogs,
}: SaasAdminClientProps) {
  const [activeTab, setActiveTab] = useState<
    'analytics' | 'tenants' | 'pending' | 'plans' | 'configs' | 'audit' | 'health'
  >('pending')

  const [pendingPayments, setPendingPayments] = useState(initialPending)
  const [recentPayments, setRecentPayments] = useState(initialRecent)
  const [subscriptions, setSubscriptions] = useState(initialSubs)
  const [configs, setConfigs] = useState(initialConfigs)
  const [plans, setPlans] = useState(initialPlans)
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs)
  const [coupons, setCoupons] = useState(initialCoupons)
  const [cronLogs, setCronLogs] = useState(initialCronLogs)
  const [companies, setCompanies] = useState(initialCompanies)

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('')

  // Action Loading & Errors
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  // Bulk Payment Selection
  const [selectedPayments, setSelectedPayments] = useState<string[]>([])

  // Modals & Drawers
  const [rejectingPayment, setRejectingPayment] = useState<any>(null)
  const [rejectReason, setRejectReason] = useState('')

  const [editingSub, setEditingSub] = useState<any>(null)
  const [overrideUserLimit, setOverrideUserLimit] = useState<string>('')
  const [overrideLeadLimit, setOverrideLeadLimit] = useState<string>('')
  const [isCustom, setIsCustom] = useState(false)

  const [editingConfig, setEditingConfig] = useState<any>(null)
  const [configNumber, setConfigNumber] = useState('')
  const [configType, setConfigType] = useState('')
  const [configInstructions, setConfigInstructions] = useState('')
  const [configActive, setConfigActive] = useState(true)

  // Plan Modal
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<any>(null)
  const [planForm, setPlanForm] = useState({
    name: '',
    billingCycle: 'monthly',
    priceUsd: 0,
    setupFeeUsd: 0,
    userLimit: 10,
    leadLimitPerMonth: 500,
    isPublic: true,
    isActive: true,
  })

  // Coupon Modal
  const [showCouponModal, setShowCouponModal] = useState(false)
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percent' as 'percent' | 'fixed',
    discountValue: 10,
    maxUses: '',
    validUntil: '',
  })

  // Tenant Detail Drawer
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null)
  const [tenantDetails, setTenantDetails] = useState<any>(null)
  const [loadingTenantDetails, setLoadingTenantDetails] = useState(false)
  const [newNoteContent, setNewNoteContent] = useState('')
  const [noteIsPinned, setNoteIsPinned] = useState(false)

  // --- CALCULATED METRICS ---

  const calculateMRR = () => {
    return subscriptions.reduce((acc, sub) => {
      if (sub.status !== 'active' && sub.status !== 'grace') return acc
      const price = Number(sub.plan?.priceUsd || 0)
      if (sub.plan?.billingCycle === 'yearly') {
        return acc + price / 12
      }
      return acc + price
    }, 0)
  }

  const mrr = calculateMRR()
  const arr = mrr * 12

  // At-Risk Tenants (grace, expiring <= 7 days, or rejected payments)
  const now = new Date()
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 86400000)

  const atRiskSubs = subscriptions.filter((sub) => {
    if (sub.status === 'grace' || sub.status === 'suspended') return true
    if (sub.currentPeriodEnd) {
      const end = new Date(sub.currentPeriodEnd)
      if (end <= sevenDaysFromNow) return true
    }
    return false
  })

  // --- HANDLERS ---

  const handleConfirmPayment = async (paymentId: string) => {
    if (!confirm('Confirm and activate subscription for this payment?')) return
    setLoadingId(paymentId)
    setActionError('')
    setActionSuccess('')

    const res = await confirmPayment(paymentId)
    setLoadingId(null)

    if (res.error) {
      setActionError(res.error)
    } else {
      setActionSuccess('Payment confirmed successfully.')
      window.location.reload()
    }
  }

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

  const handleBulkConfirm = async () => {
    if (selectedPayments.length === 0) return
    if (!confirm(`Approve ${selectedPayments.length} selected pending payments?`)) return

    setLoadingId('bulk')
    setActionError('')

    const res = await bulkConfirmPayments(selectedPayments)
    setLoadingId(null)

    if (res.error) {
      setActionError(res.error)
    } else {
      setActionSuccess(`Successfully approved ${res.confirmedCount} payments.`)
      setSelectedPayments([])
      window.location.reload()
    }
  }

  const toggleSelectPayment = (id: string) => {
    if (selectedPayments.includes(id)) {
      setSelectedPayments(selectedPayments.filter((p) => p !== id))
    } else {
      setSelectedPayments([...selectedPayments, id])
    }
  }

  const toggleSelectAllPayments = () => {
    if (selectedPayments.length === pendingPayments.length) {
      setSelectedPayments([])
    } else {
      setSelectedPayments(pendingPayments.map((p) => p.id))
    }
  }

  const handleStartImpersonate = async (companyId: string) => {
    setLoadingId(`imp-${companyId}`)
    const res = await startImpersonation(companyId)
    setLoadingId(null)

    if (res.error) {
      setActionError(res.error)
    } else {
      window.location.href = '/dashboard'
    }
  }

  const handleOpenTenantDrawer = async (companyId: string) => {
    setSelectedTenantId(companyId)
    setLoadingTenantDetails(true)
    const details = await getTenantFullDetails(companyId)
    setTenantDetails(details)
    setLoadingTenantDetails(false)
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTenantId || !newNoteContent.trim()) return

    setLoadingId('add-note')
    const res = await addTenantNote(selectedTenantId, newNoteContent, noteIsPinned)
    setLoadingId(null)

    if (res.error) {
      setActionError(res.error)
    } else {
      setNewNoteContent('')
      setNoteIsPinned(false)
      const updated = await getTenantFullDetails(selectedTenantId)
      setTenantDetails(updated)
    }
  }

  const handleSaveOverrides = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSub) return
    setLoadingId(editingSub.id)

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

  const handleChangeStatus = async (subId: string, status: any) => {
    if (!confirm(`Are you sure you want to change status to '${status}'?`)) return
    setLoadingId(subId)

    const res = await updateSubscriptionStatus(subId, status)
    setLoadingId(null)

    if (res.error) {
      setActionError(res.error)
    } else {
      setSubscriptions(subscriptions.map((s) => (s.id === subId ? { ...s, status } : s)))
    }
  }

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingId('plan-save')

    if (editingPlan) {
      const res = await updatePlan(editingPlan.id, planForm)
      setLoadingId(null)
      if (res.error) {
        setActionError(res.error)
      } else {
        setShowPlanModal(false)
        window.location.reload()
      }
    } else {
      const res = await createPlan(planForm)
      setLoadingId(null)
      if (res.error) {
        setActionError(res.error)
      } else {
        setShowPlanModal(false)
        window.location.reload()
      }
    }
  }

  const handleTogglePlanActive = async (planId: string, currentActive: boolean) => {
    setLoadingId(`plan-toggle-${planId}`)
    const res = await togglePlanActive(planId, !currentActive)
    setLoadingId(null)
    if (res.error) {
      setActionError(res.error)
    } else {
      setPlans(plans.map((p) => (p.id === planId ? { ...p, isActive: !currentActive } : p)))
    }
  }

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingId('coupon-save')

    const res = await createCoupon({
      code: couponForm.code,
      discountType: couponForm.discountType,
      discountValue: Number(couponForm.discountValue),
      maxUses: couponForm.maxUses ? parseInt(couponForm.maxUses, 10) : null,
      validUntil: couponForm.validUntil || null,
    })
    setLoadingId(null)

    if (res.error) {
      setActionError(res.error)
    } else {
      setShowCouponModal(false)
      window.location.reload()
    }
  }

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingConfig) return
    setLoadingId(editingConfig.id)

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

  const filteredCompanies = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const inputClass =
    'w-full bg-[#1E1E1E] border border-[#3C3C3C] rounded-xl py-2.5 px-3 text-xs font-semibold text-white placeholder-gray-500 focus:outline-none focus:border-[#007ACC] transition-all'

  return (
    <div className="space-y-8 pb-12">
      {/* Top Console Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-[#202638] font-display">AbroadSync Platform Console</h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Superuser platform owner dashboard for tenant management, billing reconciliation, audit compliance, and system health.
          </p>
        </div>

        {/* Global Key Metrics Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-600">MRR</div>
              <div className="text-sm font-extrabold text-emerald-800">${mrr.toFixed(0)}</div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            <div>
              <div className="text-[10px] uppercase font-bold text-blue-600">Tenants</div>
              <div className="text-sm font-extrabold text-blue-800">{companies.length}</div>
            </div>
          </div>

          {atRiskSubs.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl flex items-center gap-2 animate-pulse">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <div>
                <div className="text-[10px] uppercase font-bold text-amber-600">At Risk</div>
                <div className="text-sm font-extrabold text-amber-800">{atRiskSubs.length}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center bg-gray-100 p-1.5 rounded-2xl gap-1 border border-gray-200">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'pending'
              ? 'bg-white text-[#202638] shadow-sm font-extrabold'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          <CreditCard className="w-4 h-4 text-blue-600" />
          <span>Pending Payments</span>
          {pendingPayments.length > 0 && (
            <span className="px-2 py-0.5 text-[10px] bg-red-500 text-white rounded-full font-extrabold">
              {pendingPayments.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('tenants')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'tenants'
              ? 'bg-white text-[#202638] shadow-sm font-extrabold'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          <Building2 className="w-4 h-4 text-purple-600" />
          <span>Tenant Directory</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'bg-white text-[#202638] shadow-sm font-extrabold'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>Revenue & At-Risk</span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'plans'
              ? 'bg-white text-[#202638] shadow-sm font-extrabold'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          <Sliders className="w-4 h-4 text-indigo-600" />
          <span>Plans & Pricing</span>
        </button>

        <button
          onClick={() => setActiveTab('configs')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'configs'
              ? 'bg-white text-[#202638] shadow-sm font-extrabold'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          <CreditCard className="w-4 h-4 text-amber-600" />
          <span>Payment Methods</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-white text-[#202638] shadow-sm font-extrabold'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          <FileText className="w-4 h-4 text-rose-600" />
          <span>Audit Log</span>
        </button>

        <button
          onClick={() => setActiveTab('health')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'health'
              ? 'bg-white text-[#202638] shadow-sm font-extrabold'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
          }`}
        >
          <Activity className="w-4 h-4 text-teal-600" />
          <span>Cron & Health</span>
        </button>
      </div>

      {actionError && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-xs font-semibold text-red-700">
          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* --- TAB 1: PENDING PAYMENTS & RECONCILIATION --- */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#202638]">Pending Payment Submissions</h3>
              <p className="text-xs text-gray-500">
                Review submitted bKash, Nagad, and Rocket transaction numbers before extending tenant billing periods.
              </p>
            </div>

            {pendingPayments.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSelectAllPayments}
                  className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100 flex items-center gap-1.5"
                >
                  {selectedPayments.length === pendingPayments.length ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                  Select All ({pendingPayments.length})
                </button>

                {selectedPayments.length > 0 && (
                  <button
                    onClick={handleBulkConfirm}
                    disabled={loadingId === 'bulk'}
                    className="px-4 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    {loadingId === 'bulk' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Approve Selected ({selectedPayments.length})
                  </button>
                )}
              </div>
            )}
          </div>

          {pendingPayments.length === 0 ? (
            <div className="p-12 text-center bg-white border border-gray-200 rounded-3xl">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-gray-800">No Pending Payments</h4>
              <p className="text-xs text-gray-500 mt-1">All tenant payment submissions have been processed.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-gray-700">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4 w-10">#</th>
                      <th className="p-4">Tenant / Company</th>
                      <th className="p-4">Requested Plan</th>
                      <th className="p-4">Method & Transaction ID</th>
                      <th className="p-4">Amount (USD)</th>
                      <th className="p-4">Submitted By</th>
                      <th className="p-4">Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pendingPayments.map((p) => {
                      const isSelected = selectedPayments.includes(p.id)
                      return (
                        <tr key={p.id} className={`hover:bg-gray-50/80 transition-all ${isSelected ? 'bg-blue-50/40' : ''}`}>
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectPayment(p.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            />
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-gray-900">{p.company?.name || 'Unknown Tenant'}</div>
                            <div className="text-[10px] text-gray-400 font-mono">{p.companyId}</div>
                          </td>
                          <td className="p-4 font-semibold text-gray-800">
                            {p.plan?.name || 'N/A'}
                            {p.includesSetupFee && (
                              <span className="ml-1.5 px-1.5 py-0.5 text-[9px] bg-indigo-50 text-indigo-600 rounded font-bold">
                                + Setup Fee
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="font-extrabold text-blue-700 font-mono text-sm">{p.transactionNumber}</div>
                            <div className="text-[10px] font-bold text-gray-500 uppercase">{p.method}</div>
                          </td>
                          <td className="p-4 font-bold text-emerald-700 text-sm">${Number(p.amountUsd).toFixed(2)}</td>
                          <td className="p-4 text-gray-600">
                            {p.submitter?.fullName || 'Super Admin'}
                            <div className="text-[10px] text-gray-400">{p.submitter?.email}</div>
                          </td>
                          <td className="p-4 text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleConfirmPayment(p.id)}
                                disabled={loadingId === p.id}
                                className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-xl text-xs hover:bg-emerald-700 flex items-center gap-1 transition-all shadow-sm"
                              >
                                {loadingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                Confirm
                              </button>
                              <button
                                onClick={() => {
                                  setRejectingPayment(p)
                                  setRejectReason('')
                                }}
                                className="px-3 py-1.5 border border-red-200 text-red-600 font-bold rounded-xl text-xs hover:bg-red-50 flex items-center gap-1 transition-all"
                              >
                                <X className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Processed Payments History */}
          <div className="mt-8 space-y-4">
            <h3 className="text-base font-bold text-[#202638]">Recent Payment History</h3>
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Tenant</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Method & Transaction</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Processed Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/80">
                      <td className="p-4 font-bold text-gray-900">{p.company?.name}</td>
                      <td className="p-4">{p.plan?.name}</td>
                      <td className="p-4 font-mono font-semibold text-gray-800">
                        {p.method} — {p.transactionNumber}
                      </td>
                      <td className="p-4 font-bold text-gray-900">${Number(p.amountUsd).toFixed(2)}</td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 text-[10px] rounded-full font-extrabold ${
                            p.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {p.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-gray-500">{new Date(p.reviewedAt || p.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: TENANT DIRECTORY & IMPERSONATION --- */}
      {activeTab === 'tenants' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#202638]">Tenant Directory</h3>
              <p className="text-xs text-gray-500">
                View all agency tenants, inspect seat usage & lead metrics, impersonate for support, or suspend direct access.
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search tenant name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-xl py-2 pl-9 pr-4 text-xs font-semibold text-gray-900 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompanies.map((company) => {
              const sub = subscriptions.find((s) => s.companyId === company.id)
              const metrics = tenantMetricsMap[company.id] || { activeUsers: 0, monthlyLeads: 0 }
              const isSubActive = sub?.status === 'active'

              return (
                <div
                  key={company.id}
                  className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-bold text-gray-900">{company.name}</h4>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {company.id}</p>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          sub?.status === 'active'
                            ? 'bg-emerald-100 text-emerald-700'
                            : sub?.status === 'grace'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {sub?.status || 'No Plan'}
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-gray-50 p-2.5 rounded-xl">
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Plan</div>
                        <div className="font-bold text-gray-800 mt-0.5">{sub?.plan?.name || 'Custom'}</div>
                      </div>

                      <div className="bg-gray-50 p-2.5 rounded-xl">
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Staff Seats</div>
                        <div className="font-bold text-gray-800 mt-0.5">
                          {metrics.activeUsers} / {sub?.overrideUserLimit ?? sub?.plan?.userLimit ?? '∞'}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-2.5 rounded-xl">
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Monthly Leads</div>
                        <div className="font-bold text-gray-800 mt-0.5">{metrics.monthlyLeads}</div>
                      </div>

                      <div className="bg-gray-50 p-2.5 rounded-xl">
                        <div className="text-[10px] text-gray-400 font-bold uppercase">Created</div>
                        <div className="font-bold text-gray-800 mt-0.5">
                          {new Date(company.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                    <button
                      onClick={() => handleStartImpersonate(company.id)}
                      disabled={loadingId === `imp-${company.id}`}
                      className="flex-1 bg-purple-600 text-white font-bold py-2 rounded-xl text-xs hover:bg-purple-700 flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      {loadingId === `imp-${company.id}` ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                      Impersonate
                    </button>

                    <button
                      onClick={() => handleOpenTenantDrawer(company.id)}
                      className="px-3 py-2 border border-gray-300 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-100 flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-gray-500" />
                      Notes
                    </button>

                    {sub && (
                      <button
                        onClick={() =>
                          handleChangeStatus(sub.id, sub.status === 'suspended' ? 'active' : 'suspended')
                        }
                        className={`px-3 py-2 font-bold rounded-xl text-xs flex items-center gap-1 transition-all ${
                          sub.status === 'suspended'
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-red-50 text-red-600 hover:bg-red-100'
                        }`}
                      >
                        {sub.status === 'suspended' ? 'Activate' : 'Suspend'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* --- TAB 3: REVENUE & AT-RISK INSIGHTS --- */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Monthly Recurring Revenue</div>
              <div className="text-3xl font-extrabold text-gray-900 mt-2">${mrr.toFixed(2)}</div>
              <div className="text-[11px] font-semibold text-emerald-600 mt-1">Active subscriptions count: {subscriptions.filter(s=>s.status==='active').length}</div>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Annualized Run Rate</div>
              <div className="text-3xl font-extrabold text-emerald-700 mt-2">${arr.toFixed(2)}</div>
              <div className="text-[11px] font-semibold text-gray-500 mt-1">Projected 12-month revenue</div>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">At-Risk Subscriptions</div>
              <div className="text-3xl font-extrabold text-amber-600 mt-2">{atRiskSubs.length}</div>
              <div className="text-[11px] font-semibold text-amber-700 mt-1">Grace period or expiring &lt;= 7 days</div>
            </div>

            <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-sm">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Tenants</div>
              <div className="text-3xl font-extrabold text-blue-600 mt-2">{companies.length}</div>
              <div className="text-[11px] font-semibold text-blue-700 mt-1">Total registered agencies</div>
            </div>
          </div>

          {/* At-Risk Flagged List */}
          <div className="bg-amber-50/50 border border-amber-200 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-amber-900">At-Risk Tenants Requiring Attention</h3>
            </div>

            {atRiskSubs.length === 0 ? (
              <p className="text-xs text-amber-800">All tenant subscriptions are healthy and up to date.</p>
            ) : (
              <div className="divide-y divide-amber-200/60">
                {atRiskSubs.map((sub) => (
                  <div key={sub.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-900">{sub.company?.name}</span>
                      <span className="ml-2 px-2 py-0.5 bg-amber-200 text-amber-900 rounded font-extrabold text-[10px]">
                        STATUS: {sub.status.toUpperCase()}
                      </span>
                      <div className="text-[10px] text-gray-500 mt-0.5">
                        Period End:{' '}
                        {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartImpersonate(sub.companyId)}
                      className="px-3 py-1.5 bg-amber-600 text-white font-bold rounded-xl text-xs hover:bg-amber-700 transition-all"
                    >
                      Impersonate Support
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TAB 4: PLANS & PRICING (PLAN CRUD + COUPONS) --- */}
      {activeTab === 'plans' && (
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#202638]">Plan & Pricing Tier Management</h3>
              <p className="text-xs text-gray-500">Configure public plan pricing, seat limits, setup fees, and discounts.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingPlan(null)
                  setPlanForm({
                    name: '',
                    billingCycle: 'monthly',
                    priceUsd: 49,
                    setupFeeUsd: 20,
                    userLimit: 10,
                    leadLimitPerMonth: 500,
                    isPublic: true,
                    isActive: true,
                  })
                  setShowPlanModal(true)
                }}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Create New Plan Tier
              </button>

              <button
                onClick={() => {
                  setCouponForm({
                    code: '',
                    discountType: 'percent',
                    discountValue: 15,
                    maxUses: '',
                    validUntil: '',
                  })
                  setShowCouponModal(true)
                }}
                className="px-4 py-2 border border-purple-300 text-purple-700 bg-purple-50 font-bold rounded-xl text-xs hover:bg-purple-100 flex items-center gap-1.5 transition-all"
              >
                <Ticket className="w-4 h-4" />
                Create Discount Coupon
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white border rounded-3xl p-6 shadow-sm flex flex-col justify-between transition-all ${
                  plan.isActive ? 'border-gray-200' : 'border-gray-300 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-extrabold text-gray-900">{plan.name}</h4>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        plan.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {plan.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-3xl font-black text-gray-900">${plan.priceUsd}</span>
                    <span className="text-xs text-gray-500 font-bold">/ {plan.billingCycle}</span>
                  </div>

                  {plan.setupFeeUsd > 0 && (
                    <div className="text-[11px] font-semibold text-gray-500 mt-1">
                      Setup Fee: ${plan.setupFeeUsd}
                    </div>
                  )}

                  <div className="mt-6 pt-4 border-t border-gray-100 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">User Seat Limit:</span>
                      <span className="font-bold text-gray-900">{plan.userLimit ?? 'Unlimited'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Monthly Leads Limit:</span>
                      <span className="font-bold text-gray-900">{plan.leadLimitPerMonth ?? 'Unlimited'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 font-medium">Visibility:</span>
                      <span className="font-bold text-indigo-600">{plan.isPublic ? 'Public' : 'Custom / Private'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingPlan(plan)
                      setPlanForm({
                        name: plan.name,
                        billingCycle: plan.billingCycle,
                        priceUsd: Number(plan.priceUsd),
                        setupFeeUsd: Number(plan.setupFeeUsd),
                        userLimit: plan.userLimit ?? 0,
                        leadLimitPerMonth: plan.leadLimitPerMonth ?? 0,
                        isPublic: plan.isPublic,
                        isActive: plan.isActive,
                      })
                      setShowPlanModal(true)
                    }}
                    className="flex-1 bg-gray-100 text-gray-800 font-bold py-2 rounded-xl text-xs hover:bg-gray-200 transition-all"
                  >
                    Edit Plan
                  </button>

                  <button
                    onClick={() => handleTogglePlanActive(plan.id, plan.isActive)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      plan.isActive ? 'text-red-600 border border-red-200 hover:bg-red-50' : 'text-emerald-600 border border-emerald-200 hover:bg-emerald-50'
                    }`}
                  >
                    {plan.isActive ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Coupons Section */}
          <div className="mt-10 space-y-4">
            <h3 className="text-base font-bold text-[#202638]">Active Promotional Coupons</h3>
            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
              <table className="w-full text-left text-xs text-gray-700">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Code</th>
                    <th className="p-4">Discount</th>
                    <th className="p-4">Usage Count</th>
                    <th className="p-4">Valid Until</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {coupons.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="p-4 font-mono font-extrabold text-purple-700 text-sm">{c.code}</td>
                      <td className="p-4 font-bold text-gray-900">
                        {c.discountType === 'percent' ? `${c.discountValue}% OFF` : `$${c.discountValue} OFF`}
                      </td>
                      <td className="p-4 text-gray-700 font-semibold">
                        {c.usedCount} {c.maxUses ? `/ ${c.maxUses}` : 'uses'}
                      </td>
                      <td className="p-4 text-gray-500">
                        {c.validUntil ? new Date(c.validUntil).toLocaleDateString() : 'Forever'}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                            c.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={async () => {
                            await toggleCouponActive(c.id, !c.isActive)
                            window.location.reload()
                          }}
                          className="text-xs font-bold text-blue-600 hover:underline"
                        >
                          Toggle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 5: PAYMENT METHOD CONFIGS --- */}
      {activeTab === 'configs' && (
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-[#202638]">Payment Receiving Configurations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {configs.map((config) => (
              <div key={config.id} className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-extrabold text-blue-700 font-mono">{config.method}</h4>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      config.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {config.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-gray-400 font-bold uppercase text-[10px]">Number / ID</span>
                    <div className="font-extrabold text-gray-900 font-mono text-base">{config.number}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold uppercase text-[10px]">Account Type</span>
                    <div className="font-bold text-gray-800">{config.accountType}</div>
                  </div>
                  <div>
                    <span className="text-gray-400 font-bold uppercase text-[10px]">Instructions</span>
                    <p className="text-gray-600 text-[11px] mt-0.5">{config.instructions}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setEditingConfig(config)
                    setConfigNumber(config.number)
                    setConfigType(config.accountType || '')
                    setConfigInstructions(config.instructions || '')
                    setConfigActive(config.isActive)
                  }}
                  className="w-full bg-gray-100 text-gray-800 font-bold py-2 rounded-xl text-xs hover:bg-gray-200 transition-all flex items-center justify-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Configuration
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 6: AUDIT LOG --- */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#202638]">Platform Admin Audit Log</h3>
            <p className="text-xs text-gray-500">Traceable historical audit of all platform owner actions.</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Action</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Target Type / ID</th>
                  <th className="p-4">Changes Metadata</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/80">
                    <td className="p-4 font-mono font-extrabold text-blue-700">{log.action}</td>
                    <td className="p-4 font-bold text-gray-900">{log.actorEmail}</td>
                    <td className="p-4 text-gray-800">
                      <span className="font-semibold text-gray-600">{log.targetType}</span>
                      {log.targetId && <span className="ml-1 text-[10px] font-mono text-gray-400">({log.targetId})</span>}
                    </td>
                    <td className="p-4 font-mono text-[11px] text-gray-600 max-w-xs truncate">
                      {log.changes ? JSON.stringify(log.changes) : '-'}
                    </td>
                    <td className="p-4 text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 7: CRON & SYSTEM HEALTH --- */}
      {activeTab === 'health' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-bold text-[#202638]">Background Cron Health & Status</h3>
            <p className="text-xs text-gray-500">Execution tracking for automated subscription renewals and grace periods.</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Job Name</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Processed Subscriptions</th>
                  <th className="p-4">Error / Details</th>
                  <th className="p-4">Executed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {cronLogs.map((cron) => (
                  <tr key={cron.id} className="hover:bg-gray-50/80">
                    <td className="p-4 font-mono font-bold text-gray-900">{cron.jobName}</td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          cron.status === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {cron.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 font-bold text-gray-800">{cron.processedCount}</td>
                    <td className="p-4 text-gray-500 font-mono text-[11px]">
                      {cron.errorMessage || JSON.stringify(cron.details)}
                    </td>
                    <td className="p-4 text-gray-500">{new Date(cron.executedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Reject Payment */}
      {rejectingPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">Reject Payment Submission</h3>
            <p className="text-xs text-gray-500">
              Provide a reason for rejecting the payment submitted by {rejectingPayment.company?.name}.
            </p>
            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <textarea
                required
                rows={3}
                placeholder="Reason for rejection (e.g. Transaction ID not found in bKash statement)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-semibold text-gray-900 focus:outline-none focus:border-blue-500"
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectingPayment(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingId === rejectingPayment.id}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700"
                >
                  Confirm Reject
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Plan CRUD */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">
              {editingPlan ? `Edit ${editingPlan.name} Plan` : 'Create New Plan Tier'}
            </h3>
            <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={planForm.name}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 mt-1 font-semibold text-gray-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700">Billing Cycle</label>
                  <select
                    value={planForm.billingCycle}
                    onChange={(e) => setPlanForm({ ...planForm, billingCycle: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 mt-1 font-semibold text-gray-900"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="free">Free</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700">Price (USD)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={planForm.priceUsd}
                    onChange={(e) => setPlanForm({ ...planForm, priceUsd: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 mt-1 font-semibold text-gray-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700">Setup Fee (USD)</label>
                  <input
                    type="number"
                    min={0}
                    value={planForm.setupFeeUsd}
                    onChange={(e) => setPlanForm({ ...planForm, setupFeeUsd: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 mt-1 font-semibold text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700">User Seat Limit</label>
                  <input
                    type="number"
                    value={planForm.userLimit}
                    onChange={(e) => setPlanForm({ ...planForm, userLimit: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 mt-1 font-semibold text-gray-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700">Monthly Lead Limit</label>
                  <input
                    type="number"
                    value={planForm.leadLimitPerMonth}
                    onChange={(e) => setPlanForm({ ...planForm, leadLimitPerMonth: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 mt-1 font-semibold text-gray-900"
                  />
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planForm.isPublic}
                    onChange={(e) => setPlanForm({ ...planForm, isPublic: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 w-4 h-4"
                  />
                  Public Plan
                </label>
                <label className="flex items-center gap-2 font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planForm.isActive}
                    onChange={(e) => setPlanForm({ ...planForm, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 w-4 h-4"
                  />
                  Active Status
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingId === 'plan-save'}
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Payment Method Config Edit */}
      {editingConfig && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-gray-900">Edit {editingConfig.method} Config</h3>
            <form onSubmit={handleSaveConfig} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700">Receiving Number / ID</label>
                <input
                  type="text"
                  required
                  value={configNumber}
                  onChange={(e) => setConfigNumber(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 mt-1 font-semibold text-gray-900"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">Account Type</label>
                <input
                  type="text"
                  value={configType}
                  onChange={(e) => setConfigType(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 mt-1 font-semibold text-gray-900"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700">Instructions</label>
                <textarea
                  rows={3}
                  value={configInstructions}
                  onChange={(e) => setConfigInstructions(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 mt-1 font-semibold text-gray-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingConfig(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-bold text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700"
                >
                  Save Config
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER: Tenant Notes & Timeline */}
      {selectedTenantId && tenantDetails && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-white border-l border-gray-200 max-w-md w-full h-full p-6 space-y-6 overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-base font-bold text-gray-900">{tenantDetails.company?.name}</h3>
                <p className="text-[11px] text-gray-500 font-mono">ID: {tenantDetails.company?.id}</p>
              </div>
              <button
                onClick={() => setSelectedTenantId(null)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Note Form */}
            <form onSubmit={handleAddNote} className="space-y-3">
              <label className="font-bold text-xs text-gray-800">Add Admin Session Note</label>
              <textarea
                required
                rows={3}
                placeholder="Write support arrangement, complaint note, or custom deal details..."
                value={newNoteContent}
                onChange={(e) => setNewNoteContent(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3 text-xs font-semibold text-gray-900 focus:outline-none focus:border-blue-500"
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={noteIsPinned}
                    onChange={(e) => setNoteIsPinned(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 w-4 h-4"
                  />
                  Pin Note
                </label>
                <button
                  type="submit"
                  disabled={loadingId === 'add-note'}
                  className="px-4 py-1.5 bg-blue-600 text-white font-bold rounded-xl text-xs hover:bg-blue-700"
                >
                  Save Note
                </button>
              </div>
            </form>

            {/* Notes Timeline */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <h4 className="text-xs font-bold text-gray-700 uppercase">Tenant History Notes</h4>
              {tenantDetails.notes?.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No notes created for this tenant yet.</p>
              ) : (
                <div className="space-y-2">
                  {tenantDetails.notes.map((n: any) => (
                    <div
                      key={n.id}
                      className={`p-3 rounded-2xl border text-xs space-y-1 ${
                        n.isPinned ? 'bg-amber-50/70 border-amber-200' : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] text-gray-400">
                        <span className="font-bold text-gray-700">{n.authorEmail}</span>
                        <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-800 font-medium whitespace-pre-wrap">{n.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* MODAL: Create Coupon */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">Create Promotional Coupon</h3>
              <button
                onClick={() => setShowCouponModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveCoupon} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SUMMER20"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 mt-1 font-mono font-bold text-gray-900 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        discountType: e.target.value as 'percent' | 'fixed',
                      })
                    }
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 mt-1 font-semibold text-gray-900"
                  >
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed Amount ($)</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-gray-700">Discount Value</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 mt-1 font-semibold text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700">Max Usage Count (Optional)</label>
                  <input
                    type="number"
                    placeholder="Unlimited"
                    value={couponForm.maxUses}
                    onChange={(e) => setCouponForm({ ...couponForm, maxUses: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 mt-1 font-semibold text-gray-900"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700">Valid Until (Optional)</label>
                  <input
                    type="date"
                    value={couponForm.validUntil}
                    onChange={(e) => setCouponForm({ ...couponForm, validUntil: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 mt-1 font-semibold text-gray-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-bold text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingId === 'coupon-save'}
                  className="px-4 py-2 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 flex items-center gap-1.5"
                >
                  {loadingId === 'coupon-save' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
