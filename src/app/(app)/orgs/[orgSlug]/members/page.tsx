'use client'

/**
 * V13: Organization Member Management Page
 *
 * Lists members, allows role changes and removal.
 * Admin+ only.
 */

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Shield, UserMinus, Crown } from 'lucide-react'
import { useOrg } from '@/components/providers/OrgProvider'
import { getOrgMembers, updateMemberRole, removeMember } from '@/actions/org-actions'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { OrganizationMember, OrgRole } from '@/types/database'

const ROLE_LABELS: Record<OrgRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  creator: 'Creator',
  candidate: 'Candidate',
}

const ROLE_COLORS: Record<OrgRole, string> = {
  owner: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
  admin: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  creator: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  candidate: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
}

export default function OrgMembersPage() {
  const { org, role } = useOrg()
  const router = useRouter()
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [loading, setLoading] = useState(true)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [confirmRemove, setConfirmRemove] = useState<OrganizationMember | null>(null)

  useEffect(() => {
    loadMembers()
  }, [])

  async function loadMembers() {
    setLoading(true)
    const result = await getOrgMembers()
    if (result.ok) {
      setMembers(result.data ?? [])
    }
    setLoading(false)
  }

  if (role !== 'owner' && role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Access Denied</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Only admins and owners can manage members.</p>
      </div>
    )
  }

  function handleRoleChange(memberId: string, newRole: OrgRole) {
    setError(null)
    startTransition(async () => {
      const result = await updateMemberRole(memberId, newRole)
      if (result.ok) {
        await loadMembers()
      } else {
        setError(result.error)
      }
    })
  }

  function handleRemove(member: OrganizationMember) {
    setConfirmRemove(member)
  }

  function confirmRemoveMember() {
    if (!confirmRemove) return
    setError(null)
    startTransition(async () => {
      const result = await removeMember(confirmRemove.id)
      if (result.ok) {
        setConfirmRemove(null)
        await loadMembers()
      } else {
        setError(result.error)
        setConfirmRemove(null)
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => router.back()}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Members</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">{org.name}</p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 mb-4" role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">Loading members...</div>
      ) : (
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                  {member.role === 'owner' ? (
                    <Crown className="h-4 w-4 text-amber-600" />
                  ) : (
                    <Shield className="h-4 w-4 text-slate-500" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {member.user_id.slice(0, 8)}...
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {role === 'owner' ? (
                  <Select
                    value={member.role}
                    onValueChange={(value) => handleRoleChange(member.id, value as OrgRole)}
                    disabled={isPending}
                  >
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="creator">Creator</SelectItem>
                      <SelectItem value="candidate">Candidate</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={ROLE_COLORS[member.role as OrgRole]}>
                    {ROLE_LABELS[member.role as OrgRole]}
                  </Badge>
                )}

                <button
                  onClick={() => handleRemove(member)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                  title="Remove member"
                  disabled={isPending}
                >
                  <UserMinus className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Separator className="my-8" />

      <p className="text-sm text-slate-500 dark:text-slate-400">
        {members.length} member{members.length !== 1 ? 's' : ''} in this organization.
      </p>

      {/* Confirm Remove Dialog */}
      <Dialog open={!!confirmRemove} onOpenChange={() => setConfirmRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this member from {org.name}? They will lose access to all organization content.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="ghost" onClick={() => setConfirmRemove(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmRemoveMember} loading={isPending}>
              Remove
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
