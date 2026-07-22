'use client'

import { useState } from 'react'
import { createInvite, revokeInvite, deactivateStaff, changeUserRole } from '@/app/actions/invites'
import { Plus, Mail, Copy, Check, Shield, UserX, X, Loader2, AlertCircle, Link2 } from 'lucide-react'

interface StaffClientProps {
  initialUsers: any[]
  initialInvites: any[]
  currentUserRole: string
  currentUserId: string
}

export default function StaffClient({
  initialUsers,
  initialInvites,
  currentUserRole,
  currentUserId,
}: StaffClientProps) {
  const [users, setUsers] = useState(initialUsers)
  const [invites, setInvites] = useState(initialInvites)

  // Invite Modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'Manager' | 'Counselor'>('Counselor')
  const [inviteError, setInviteError] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [createdInviteLink, setCreatedInviteLink] = useState('')
  const [copied, setCopied] = useState(false)

  // Role Edit Modal
  const [editingUser, setEditingUser] = useState<any>(null)
  const [newRole, setNewRole] = useState<'Super Admin' | 'Manager' | 'Counselor'>('Counselor')
  const [roleError, setRoleError] = useState('')
  const [isRoleUpdating, setIsRoleUpdating] = useState(false)

  // Action feedback error
  const [actionError, setActionError] = useState('')

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setInviteError('')
    setIsInviting(true)
    setCreatedInviteLink('')

    const res = await createInvite(inviteEmail, inviteRole)
    setIsInviting(false)

    if (res.error) {
      setInviteError(res.error)
    } else if (res.invite) {
      let siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
      siteUrl = siteUrl.includes('http') ? siteUrl : `https://${siteUrl}`
      siteUrl = siteUrl.replace(/\/$/, '')
      const link = `${siteUrl}/invite/accept?token=${res.invite.token}`

      setCreatedInviteLink(link)
      setInvites([res.invite, ...invites])
    }
  }

  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleRevokeInvite = async (inviteId: string) => {
    if (!confirm('Are you sure you want to revoke this invitation?')) return
    setActionError('')
    const res = await revokeInvite(inviteId)
    if (res.error) {
      setActionError(res.error)
    } else {
      setInvites(invites.filter((inv) => inv.id !== inviteId))
    }
  }

  const handleDeactivate = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this team member? They will immediately lose workspace access.')) return
    setActionError('')
    const res = await deactivateStaff(userId)
    if (res.error) {
      setActionError(res.error)
    } else {
      setUsers(
        users.map((u) => (u.id === userId ? { ...u, status: 'Deactivated' } : u))
      )
    }
  }

  const handleRoleChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setRoleError('')
    setIsRoleUpdating(true)

    const res = await changeUserRole(editingUser.id, newRole)
    setIsRoleUpdating(false)

    if (res.error) {
      setRoleError(res.error)
    } else {
      setUsers(
        users.map((u) => (u.id === editingUser.id ? { ...u, role: newRole } : u))
      )
      setEditingUser(null)
    }
  }

  const inputClass = "w-full bg-[#1E1E1E] border border-[#3C3C3C] rounded-xl py-2.5 px-3 text-xs font-semibold text-white placeholder-gray-500 focus:outline-none focus:border-[#007ACC] transition-all"
  const selectClass = "w-full bg-[#1E1E1E] border border-[#3C3C3C] text-xs font-bold text-white rounded-xl py-2.5 px-3 outline-none focus:border-[#007ACC] transition-all cursor-pointer"

  return (
    <div className="space-y-8 pb-12">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Staff & Team Management</h2>
          <p className="text-xs text-gray-400">Invite team members, assign access roles, and manage workspace staff.</p>
        </div>
        <button
          onClick={() => {
            setInviteEmail('')
            setInviteRole('Counselor')
            setInviteError('')
            setCreatedInviteLink('')
            setIsInviteModalOpen(true)
          }}
          className="flex items-center gap-1.5 px-5 py-3 bg-[#0E639C] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#1177BB] active:translate-y-0.5 transition-all duration-150 self-start md:self-auto"
        >
          <Plus className="h-4 w-4" /> Invite Team Member
        </button>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-[#FFEBEB]/10 text-[#E5484D] text-xs font-semibold flex items-center justify-between border border-[#E5484D]/30">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError('')} className="text-gray-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Pending Invites Section */}
      {invites.length > 0 && (
        <div className="bg-[#252526] border border-[#3C3C3C] rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#007ACC]" />
              <span>Pending Invitations ({invites.length})</span>
            </h3>
          </div>
          <div className="divide-y divide-[#3C3C3C]">
            {invites.map((inv) => {
              let siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
              siteUrl = siteUrl.includes('http') ? siteUrl : `https://${siteUrl}`
              siteUrl = siteUrl.replace(/\/$/, '')
              const inviteLink = `${siteUrl}/invite/accept?token=${inv.token}`

              return (
                <div key={inv.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{inv.email}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#007ACC]/10 text-[#007ACC] border border-[#007ACC]/20">
                        {inv.role}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Pending
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 font-mono">
                      Expires: {new Date(inv.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyLink(inviteLink)}
                      className="px-3 py-1.5 rounded-lg bg-[#333333] border border-[#3C3C3C] text-xs font-semibold text-gray-300 hover:text-white hover:bg-[#3E3E3E] transition-all flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? 'Copied Link!' : 'Copy Link'}</span>
                    </button>
                    <button
                      onClick={() => handleRevokeInvite(inv.id)}
                      className="px-3 py-1.5 rounded-lg bg-[#333333] border border-[#3C3C3C] text-xs font-semibold text-[#E5484D] hover:bg-red-500/20 transition-all"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Active & Deactivated Staff Table */}
      <div className="bg-[#252526] border border-[#3C3C3C] rounded-2xl shadow-md overflow-hidden">
        <div className="p-4 bg-[#1E1E1E] border-b border-[#3C3C3C]">
          <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider">Team Members</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#3C3C3C]">
            <thead className="bg-[#1E1E1E]">
              <tr className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-6 py-4 text-left">Name</th>
                <th className="px-6 py-4 text-left">Email</th>
                <th className="px-6 py-4 text-left">Role</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3C3C3C] bg-[#252526]">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-[#333333] transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-white">
                    {user.fullName}
                    {user.id === currentUserId && (
                      <span className="ml-2 text-[10px] text-gray-400 font-normal">(You)</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-400">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold">
                    <span className={`px-2.5 py-0.5 inline-flex text-[10px] font-bold leading-5 rounded-full border ${
                      user.role === 'Super Admin' 
                        ? 'bg-red-500/10 text-red-500 border-red-500/20' 
                        : user.role === 'Manager' 
                          ? 'bg-[#007ACC]/10 text-[#007ACC] border-[#007ACC]/20' 
                          : 'bg-[#21C285]/10 text-[#21C285] border-[#21C285]/20'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold">
                    <span className={`px-2.5 py-0.5 inline-flex text-[10px] font-bold leading-5 rounded-full border ${
                      user.status === 'Deactivated'
                        ? 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {user.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-bold space-x-2">
                    {currentUserRole === 'Super Admin' && user.id !== currentUserId && (
                      <button
                        onClick={() => {
                          setEditingUser(user)
                          setNewRole(user.role)
                          setRoleError('')
                        }}
                        className="inline-flex p-2 rounded-xl bg-[#333333] border border-[#3C3C3C] text-[#007ACC] hover:bg-[#2A2D2E] transition-all"
                        title="Change User Role"
                      >
                        <Shield className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {user.status !== 'Deactivated' && user.id !== currentUserId && (
                      <button
                        onClick={() => handleDeactivate(user.id)}
                        className="inline-flex p-2 rounded-xl bg-[#333333] border border-[#3C3C3C] text-[#E5484D] hover:bg-[#2A2D2E] transition-all"
                        title="Deactivate Account"
                      >
                        <UserX className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#252526] border border-[#3C3C3C] rounded-2xl shadow-md max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-white">Invite Team Member</h3>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="p-1.5 rounded-xl bg-[#333333] border border-[#3C3C3C] hover:bg-[#2A2D2E] text-gray-400 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {inviteError && (
              <div className="mb-4 p-3 rounded-xl bg-[#FFEBEB]/10 text-[#E5484D] text-xs font-semibold flex items-center gap-2 border border-[#E5484D]/30">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{inviteError}</span>
              </div>
            )}

            {createdInviteLink ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-start gap-3">
                  <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Invitation Created!</p>
                    <p className="text-[11px] opacity-90 mt-0.5">Share this invite link with {inviteEmail}:</p>
                  </div>
                </div>
                <div className="p-3 bg-[#1E1E1E] border border-[#3C3C3C] rounded-xl text-xs font-mono text-gray-300 break-all flex items-center justify-between gap-2">
                  <span className="truncate">{createdInviteLink}</span>
                  <button
                    onClick={() => handleCopyLink(createdInviteLink)}
                    className="p-1.5 rounded-lg bg-[#333333] hover:bg-[#3E3E3E] text-white flex-shrink-0"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={() => setIsInviteModalOpen(false)}
                  className="w-full py-3 bg-[#333333] text-white text-xs font-bold rounded-xl hover:bg-[#3E3E3E] transition-all"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Staff Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                    Assign Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className={selectClass}
                  >
                    <option value="Counselor">Counselor (Standard Access)</option>
                    <option value="Manager">Manager (Elevated Access)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsInviteModalOpen(false)}
                    className="flex-1 py-3 bg-[#333333] text-gray-300 text-xs font-bold rounded-xl hover:bg-[#3E3E3E] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isInviting}
                    className="flex-1 py-3 bg-[#0E639C] text-white text-xs font-bold rounded-xl hover:bg-[#1177BB] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isInviting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Creating Invite...</span>
                      </>
                    ) : (
                      <span>Generate Invite Link</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Role Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#252526] border border-[#3C3C3C] rounded-2xl shadow-md max-w-md w-full p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-white">Change User Role</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 rounded-xl bg-[#333333] border border-[#3C3C3C] hover:bg-[#2A2D2E] text-gray-400 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {roleError && (
              <div className="mb-4 p-3 rounded-xl bg-[#FFEBEB]/10 text-[#E5484D] text-xs font-semibold flex items-center gap-2 border border-[#E5484D]/30">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{roleError}</span>
              </div>
            )}

            <form onSubmit={handleRoleChangeSubmit} className="space-y-4">
              <div>
                <p className="text-xs text-gray-300 font-semibold mb-1">
                  User: <span className="text-white font-bold">{editingUser.fullName}</span> ({editingUser.email})
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  New Access Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className={selectClass}
                >
                  <option value="Counselor">Counselor</option>
                  <option value="Manager">Manager</option>
                  <option value="Super Admin">Super Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 py-3 bg-[#333333] text-gray-300 text-xs font-bold rounded-xl hover:bg-[#3E3E3E] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRoleUpdating}
                  className="flex-1 py-3 bg-[#0E639C] text-white text-xs font-bold rounded-xl hover:bg-[#1177BB] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isRoleUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Save Role</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
