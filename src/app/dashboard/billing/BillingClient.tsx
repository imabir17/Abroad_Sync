'use client'

import { useState } from 'react'
import { submitPayment, validateCoupon } from '@/app/actions/billing'
import {
  CreditCard,
  Zap,
  Users,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  Clock,
  X,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  Ticket,
  Scissors,
} from 'lucide-react'

interface BillingClientProps {
  subscription: any
  plans: any[]
  paymentMethods: any[]
  payments: any[]
  usage: {
    activeSeats: number
    monthlyLeads: number
  }
  userRole: string
}

export default function BillingClient({
  subscription,
  plans,
  paymentMethods,
  payments,
  usage,
  userRole,
}: BillingClientProps) {
  const currentPlan = subscription?.plan || { name: 'Free', priceUsd: 0, userLimit: 2, leadLimitPerMonth: 100 }
  const status = subscription?.status || 'active'

  // Limits (check overrides first, -1 = unlimited)
  const seatLimit =
    subscription?.overrideUserLimit !== null && subscription?.overrideUserLimit !== undefined
      ? subscription.overrideUserLimit
      : currentPlan.userLimit

  const leadLimit =
    subscription?.overrideLeadLimit !== null && subscription?.overrideLeadLimit !== undefined
      ? subscription.overrideLeadLimit
      : currentPlan.leadLimitPerMonth

  // Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false)
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  const [selectedMethod, setSelectedMethod] = useState<string>('')
  const [transactionNumber, setTransactionNumber] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [copiedNumber, setCopiedNumber] = useState(false)

  // Coupon State
  const [couponInput, setCouponInput] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [couponError, setCouponError] = useState('')
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false)

  // Filter plans based on selected cycle
  const availablePlans = plans.filter((p) => p.billingCycle === cycle)
  const selectedPlanObj = plans.find((p) => p.id === selectedPlanId) || availablePlans[0]
  const selectedMethodObj = paymentMethods.find((m) => m.method === selectedMethod) || paymentMethods[0]

  // Setup fee logic:
  // Customers NEVER pay setup fee if they've already paid it OR if they are an existing paid subscriber
  const isExistingPaidCustomer = Boolean(
    subscription?.setupFeePaid || (subscription?.plan && subscription?.plan?.billingCycle !== 'free')
  )
  const isYearly = selectedPlanObj?.billingCycle === 'yearly'
  const isMonthly = selectedPlanObj?.billingCycle === 'monthly'
  const requiresSetupFee = isMonthly && !isExistingPaidCustomer

  const planPrice = Number(selectedPlanObj?.priceUsd || 0)
  const setupFee = requiresSetupFee ? Number(selectedPlanObj?.setupFeeUsd || 0) : 0
  const discountAmount = appliedCoupon ? Number(appliedCoupon.discountAmount || 0) : 0
  const totalPrice = Math.max(0, planPrice + setupFee - discountAmount)

  const handleOpenPayModal = (plan?: any) => {
    setSubmitError('')
    setSubmitSuccess(false)
    setTransactionNumber('')
    setCouponInput('')
    setAppliedCoupon(null)
    setCouponError('')

    if (plan) {
      setCycle(plan.billingCycle === 'yearly' ? 'yearly' : 'monthly')
      setSelectedPlanId(plan.id)
    } else {
      const defaultPlan = plans.find((p) => p.name === 'Basic Monthly') || plans[0]
      if (defaultPlan) {
        setCycle(defaultPlan.billingCycle === 'yearly' ? 'yearly' : 'monthly')
        setSelectedPlanId(defaultPlan.id)
      }
    }

    if (paymentMethods.length > 0) {
      setSelectedMethod(paymentMethods[0].method)
    }
    setIsPayModalOpen(true)
  }

  const handleApplyCoupon = async () => {
    if (!couponInput.trim() || !selectedPlanId) return
    setIsValidatingCoupon(true)
    setCouponError('')

    const res = await validateCoupon(couponInput.trim(), selectedPlanId)
    setIsValidatingCoupon(false)

    if (res.error) {
      setCouponError(res.error)
      setAppliedCoupon(null)
    } else {
      setAppliedCoupon(res.coupon)
      setCouponError('')
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponInput('')
    setCouponError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlanId || !selectedMethod || !transactionNumber.trim()) {
      setSubmitError('Please enter your transaction number.')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')

    const res = await submitPayment(
      selectedPlanId,
      selectedMethod,
      transactionNumber.trim(),
      appliedCoupon?.code
    )
    setIsSubmitting(false)

    if (res.error) {
      setSubmitError(res.error)
    } else {
      setSubmitSuccess(true)
    }
  }

  const handleCopyNumber = (num: string) => {
    navigator.clipboard.writeText(num)
    setCopiedNumber(true)
    setTimeout(() => setCopiedNumber(false), 2000)
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Subscription & Billing</h2>
          <p className="text-xs text-gray-400">Manage your subscription plan, view limits, and review payment history.</p>
        </div>
        {userRole === 'Super Admin' && (
          <button
            onClick={() => handleOpenPayModal()}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-br from-[#6E79F2] to-[#333FC2] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg active:translate-y-0.5 transition-all self-start md:self-auto"
          >
            <Zap className="w-4 h-4" />
            <span>Upgrade / Pay Plan</span>
          </button>
        )}
      </div>

      {/* Grace / Suspended Alert Banner */}
      {status === 'grace' && (
        <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-start gap-4">
          <AlertCircle className="w-6 h-6 flex-shrink-0 text-amber-400" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-amber-200">Subscription Period Lapsed (Grace Period Active)</h4>
            <p>
              Your billing period has ended. You are currently in a 3-day grace period and your access remains fully functional. Please submit your renewal payment to avoid service suspension.
            </p>
            {subscription?.graceEndsAt && (
              <p className="font-mono text-[11px] opacity-90">
                Grace period ends: {new Date(subscription.graceEndsAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
      )}

      {status === 'suspended' && (
        <div className="p-5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium flex items-start gap-4">
          <AlertCircle className="w-6 h-6 flex-shrink-0 text-red-400" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-red-200">Subscription Suspended</h4>
            <p>
              Your workspace subscription is suspended. Read access remains open, but new leads, invitations, and actions are locked. Submit a payment to instantly restore full functionality.
            </p>
          </div>
        </div>
      )}

      {/* Subscription Status & Usage Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Plan Card */}
        <div className="bg-[#252526] border border-[#3C3C3C] rounded-2xl p-6 shadow-md space-y-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Current Plan</span>
            <span
              className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                status === 'active'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : status === 'grace'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}
            >
              {status.toUpperCase()}
            </span>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white font-display">{currentPlan.name}</h3>
            <p className="text-xs text-gray-400 mt-1">
              {currentPlan.billingCycle === 'free'
                ? 'Free Tier (No Renewal Date)'
                : `$${currentPlan.priceUsd} / ${currentPlan.billingCycle}`}
            </p>
          </div>

          <div className="pt-2 border-t border-[#3C3C3C] text-xs text-gray-300">
            {subscription?.currentPeriodEnd ? (
              <p>
                Period End:{' '}
                <span className="font-bold text-white">
                  {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                </span>
              </p>
            ) : (
              <p className="text-gray-400">Unlimited Duration (Free Plan)</p>
            )}
          </div>
        </div>

        {/* Seat Usage Card */}
        <div className="bg-[#252526] border border-[#3C3C3C] rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Team Seat Usage</span>
            <Users className="w-4 h-4 text-[#007ACC]" />
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{usage.activeSeats}</span>
              <span className="text-xs text-gray-400 font-semibold">
                / {seatLimit === null || seatLimit === -1 ? 'Unlimited' : `${seatLimit} Seats`}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Active staff members & pending invites</p>
          </div>

          {seatLimit !== null && seatLimit !== -1 && (
            <div className="w-full bg-[#1E1E1E] h-2 rounded-full overflow-hidden border border-[#3C3C3C]">
              <div
                className="bg-[#007ACC] h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (usage.activeSeats / seatLimit) * 100)}%` }}
              />
            </div>
          )}
        </div>

        {/* Lead Usage Card */}
        <div className="bg-[#252526] border border-[#3C3C3C] rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Monthly Lead Limit</span>
            <BarChart3 className="w-4 h-4 text-[#21C285]" />
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{usage.monthlyLeads}</span>
              <span className="text-xs text-gray-400 font-semibold">
                / {leadLimit === null || leadLimit === -1 ? 'Unlimited' : `${leadLimit} Leads`}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Leads added this calendar month</p>
          </div>

          {leadLimit !== null && leadLimit !== -1 && (
            <div className="w-full bg-[#1E1E1E] h-2 rounded-full overflow-hidden border border-[#3C3C3C]">
              <div
                className="bg-[#21C285] h-full transition-all duration-300"
                style={{ width: `${Math.min(100, (usage.monthlyLeads / leadLimit) * 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Available Plans Section */}
      <div className="bg-[#252526] border border-[#3C3C3C] rounded-2xl p-6 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-white">Subscription Plans</h3>
            <p className="text-xs text-gray-400">Choose the plan that fits your agency size.</p>
          </div>

          {/* Monthly / Yearly Toggle */}
          <div className="bg-[#1E1E1E] p-1 rounded-xl border border-[#3C3C3C] flex items-center self-start sm:self-auto">
            <button
              onClick={() => setCycle('monthly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                cycle === 'monthly' ? 'bg-[#0E639C] text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setCycle('yearly')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                cycle === 'yearly' ? 'bg-[#0E639C] text-white shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>Yearly</span>
              <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 text-[9px] font-extrabold rounded-md">
                Save & Free Setup
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans
            .filter((p) => p.billingCycle === cycle || p.billingCycle === 'free')
            .map((plan) => {
              const isCurrent = currentPlan.id === plan.id || currentPlan.name === plan.name
              const showSetupNotice = plan.billingCycle === 'monthly' && plan.setupFeeUsd > 0 && !isExistingPaidCustomer

              return (
                <div
                  key={plan.id}
                  className={`p-6 rounded-2xl border transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'bg-[#1E1E1E] border-[#007ACC] ring-1 ring-[#007ACC]'
                      : 'bg-[#1E1E1E]/60 border-[#3C3C3C] hover:border-gray-500'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-base font-bold text-white">{plan.name}</h4>
                      {isCurrent && (
                        <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-[#007ACC]/20 text-[#007ACC] border border-[#007ACC]/30">
                          Current
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-white">${plan.priceUsd}</span>
                        <span className="text-xs text-gray-400 font-semibold">
                          / {plan.billingCycle === 'free' ? 'lifetime' : plan.billingCycle}
                        </span>
                      </div>
                      {showSetupNotice && (
                        <p className="text-[10px] text-amber-400 font-semibold mt-1">
                          +${plan.setupFeeUsd} one-time setup fee (new customers only)
                        </p>
                      )}
                    </div>

                    <ul className="space-[#3C3C3C] space-y-2 text-xs text-gray-300 border-t border-[#3C3C3C]/50 pt-4">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>{plan.userLimit === null ? 'Unlimited seats' : `${plan.userLimit} Team Seats`}</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>
                          {plan.leadLimitPerMonth === null
                            ? 'Unlimited Leads / month'
                            : `${plan.leadLimitPerMonth} Leads / month`}
                        </span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Full CRM & Country Matrix</span>
                      </li>
                    </ul>
                  </div>

                  {userRole === 'Super Admin' && !isCurrent && plan.billingCycle !== 'free' && (
                    <button
                      onClick={() => handleOpenPayModal(plan)}
                      className="mt-6 w-full py-2.5 bg-[#333333] hover:bg-[#0E639C] text-white text-xs font-bold rounded-xl transition-all"
                    >
                      Select Plan
                    </button>
                  )}
                </div>
              )
            })}
        </div>
      </div>

      {/* Payment History Table */}
      <div className="bg-[#252526] border border-[#3C3C3C] rounded-2xl shadow-md overflow-hidden">
        <div className="p-4 bg-[#1E1E1E] border-b border-[#3C3C3C] flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Payment Submissions & Invoices</h3>
        </div>
        {payments.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">No payment history recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#3C3C3C]">
              <thead className="bg-[#1E1E1E]">
                <tr className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4 text-left">Date</th>
                  <th className="px-6 py-4 text-left">Plan</th>
                  <th className="px-6 py-4 text-left">Method</th>
                  <th className="px-6 py-4 text-left">Trx ID</th>
                  <th className="px-6 py-4 text-left">Coupon</th>
                  <th className="px-6 py-4 text-left">Amount</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3C3C3C] bg-[#252526]">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-[#333333] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-300">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-white">
                      {p.plan?.name || 'Subscription Plan'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-[#007ACC]">{p.method}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-300">
                      {p.transactionNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-purple-400">
                      {p.couponCode ? `${p.couponCode} (-$${p.discountAmount})` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-white">${p.amountUsd}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-bold">
                      <span
                        className={`px-2.5 py-0.5 inline-flex text-[10px] font-bold rounded-full border ${
                          p.status === 'confirmed'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : p.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}
                      >
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pay / Upgrade Modal */}
      {isPayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#252526] border border-[#3C3C3C] rounded-2xl shadow-2xl max-w-lg w-full p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 border-b border-[#3C3C3C] pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Submit Payment / Upgrade</h3>
                <p className="text-xs text-gray-400">Pay via bKash, Nagad, or Rocket to activate your subscription.</p>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="p-1.5 rounded-xl bg-[#333333] border border-[#3C3C3C] hover:bg-[#2A2D2E] text-gray-400 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {submitError && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 text-red-400 text-xs font-semibold flex items-center gap-2 border border-red-500/30">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {submitSuccess ? (
              <div className="text-center space-y-5 py-4 animate-in fade-in">
                <div className="w-16 h-16 rounded-2xl bg-[#1E1E1E] border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-9 h-9 animate-bounce" />
                </div>
                <h4 className="text-xl font-bold text-white">Payment Submitted!</h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Your transaction number <strong className="text-white font-mono">{transactionNumber}</strong> has been
                  submitted. Our team will verify and activate your subscription shortly.
                </p>
                <button
                  onClick={() => {
                    setIsPayModalOpen(false)
                    window.location.reload()
                  }}
                  className="w-full py-3 bg-[#0E639C] text-white text-xs font-bold rounded-xl hover:bg-[#1177BB] transition-all"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* 1. Plan Selection */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    1. Select Plan
                  </label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => {
                      setSelectedPlanId(e.target.value)
                      setAppliedCoupon(null)
                    }}
                    className="w-full bg-[#1E1E1E] border border-[#3C3C3C] text-xs font-bold text-white rounded-xl py-3 px-3 outline-none focus:border-[#007ACC] transition-all cursor-pointer"
                  >
                    {plans
                      .filter((p) => p.isPublic && p.billingCycle !== 'free')
                      .map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} — ${p.priceUsd} / {p.billingCycle}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Coupon Code Section */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Discount Coupon Code
                  </label>

                  {appliedCoupon ? (
                    <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl flex items-center justify-between text-xs text-purple-300">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-purple-400" />
                        <span>
                          Coupon <strong className="font-mono text-white">{appliedCoupon.code}</strong> Applied (-$
                          {appliedCoupon.discountAmount})
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-gray-400 hover:text-white p-1 rounded"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Ticket className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="Enter coupon code (e.g. SAVE20)"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value)
                            setCouponError('')
                          }}
                          className="w-full bg-[#1E1E1E] border border-[#3C3C3C] rounded-xl py-2.5 pl-9 pr-3 text-xs font-mono font-bold text-white uppercase placeholder-gray-500 outline-none focus:border-[#007ACC]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={isValidatingCoupon || !couponInput.trim()}
                        className="px-4 py-2.5 bg-[#333333] hover:bg-[#0E639C] text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                      >
                        {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                      </button>
                    </div>
                  )}

                  {couponError && <p className="text-[11px] text-red-400 font-semibold">{couponError}</p>}
                </div>

                {/* Pricing Summary */}
                <div className="p-4 rounded-xl bg-[#1E1E1E] border border-[#3C3C3C] space-y-2 text-xs">
                  <div className="flex justify-between text-gray-300">
                    <span>Plan Price:</span>
                    <span className="font-bold text-white">${planPrice}</span>
                  </div>

                  {setupFee > 0 ? (
                    <div className="flex justify-between text-amber-400 font-medium">
                      <span>One-Time Setup Fee (New Customer):</span>
                      <span>+${setupFee}</span>
                    </div>
                  ) : isMonthly && isExistingPaidCustomer ? (
                    <div className="flex justify-between text-emerald-400 font-medium">
                      <span>Setup Fee:</span>
                      <span>$0 (Waived for Existing Customer)</span>
                    </div>
                  ) : null}

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-purple-400 font-medium">
                      <span>Coupon Discount ({appliedCoupon?.code}):</span>
                      <span>-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-white font-bold border-t border-[#3C3C3C] pt-2 text-sm">
                    <span>Total Payable:</span>
                    <span className="text-[#007ACC] font-mono">${totalPrice.toFixed(2)} USD</span>
                  </div>
                </div>

                {/* 2. Payment Method Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    2. Select Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {paymentMethods.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setSelectedMethod(m.method)}
                        className={`py-3 px-2 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                          selectedMethod === m.method
                            ? 'bg-[#0E639C]/20 border-[#007ACC] text-white ring-1 ring-[#007ACC]'
                            : 'bg-[#1E1E1E] border-[#3C3C3C] text-gray-400 hover:text-white'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        <span>{m.method}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Receiving Instructions Card */}
                {selectedMethodObj && (
                  <div className="p-4 rounded-xl bg-[#1E1E1E] border border-[#3C3C3C] space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">
                        Send Money to {selectedMethodObj.method} ({selectedMethodObj.accountType || 'Personal'})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopyNumber(selectedMethodObj.number)}
                        className="px-2.5 py-1 rounded-lg bg-[#333333] hover:bg-[#3E3E3E] text-xs font-semibold text-gray-300 flex items-center gap-1.5"
                      >
                        {copiedNumber ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedNumber ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="text-base font-mono font-bold text-[#007ACC]">{selectedMethodObj.number}</div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">{selectedMethodObj.instructions}</p>
                  </div>
                )}

                {/* 3. Transaction ID Input */}
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    3. Enter Transaction ID / Number
                  </label>
                  <input
                    type="text"
                    required
                    value={transactionNumber}
                    onChange={(e) => setTransactionNumber(e.target.value)}
                    placeholder="e.g. 9B7A2X8Y"
                    className="w-full bg-[#1E1E1E] border border-[#3C3C3C] rounded-xl py-3 px-4 text-xs font-mono font-bold text-white placeholder-gray-500 outline-none focus:border-[#007ACC] transition-all"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsPayModalOpen(false)}
                    className="flex-1 py-3 bg-[#333333] text-gray-300 text-xs font-bold rounded-xl hover:bg-[#3E3E3E] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-gradient-to-br from-[#6E79F2] to-[#333FC2] text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Payment</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
