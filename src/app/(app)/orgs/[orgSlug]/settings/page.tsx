'use client'

/**
 * V13: Organization Settings Page
 *
 * Allows admins/owners to configure org name, feature flags, and branding.
 */

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { useOrg } from '@/components/providers/OrgProvider'
import { updateOrgSettings } from '@/actions/org-actions'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import type { OrgFeatures } from '@/types/database'

const FEATURE_LABELS: Record<keyof OrgFeatures, { label: string; description: string }> = {
  study_mode: { label: 'Study Mode', description: 'Spaced repetition and self-paced learning' },
  assessment_mode: { label: 'Assessment Mode', description: 'Timed exams with scoring and certification' },
  proctoring: { label: 'Proctoring', description: 'Anti-cheat monitoring during assessments' },
  certification: { label: 'Certification', description: 'Generate certificates upon completion' },
  ai_generation: { label: 'AI Content Generation', description: 'Auto-generate questions from documents' },
  pdf_extraction: { label: 'PDF Extraction', description: 'Extract questions from uploaded PDFs' },
  flashcards: { label: 'Flashcards', description: 'Traditional flashcard study mode' },
  erp_integration: { label: 'ERP Integration', description: 'Connect with external HR/ERP systems' },
}

export default function OrgSettingsPage() {
  const { org, role } = useOrg()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(org.name)
  const [features, setFeatures] = useState<OrgFeatures>(
    org.settings?.features ?? {
      study_mode: true,
      assessment_mode: false,
      proctoring: false,
      certification: false,
      ai_generation: true,
      pdf_extraction: true,
      flashcards: true,
      erp_integration: false,
    }
  )
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  if (role !== 'owner' && role !== 'admin') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Access Denied</h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400">Only admins and owners can access organization settings.</p>
      </div>
    )
  }

  function toggleFeature(key: keyof OrgFeatures) {
    setFeatures(prev => ({ ...prev, [key]: !prev[key] }))
  }

  function handleSave() {
    setMessage(null)
    startTransition(async () => {
      const result = await updateOrgSettings(org.id, {
        name: name.trim() || org.name,
        settings: { features },
      })
      if (result.ok) {
        setMessage({ type: 'success', text: 'Settings saved successfully' })
      } else {
        setMessage({ type: 'error', text: result.error })
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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Organization Settings</h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">{org.slug}</p>
        </div>
      </div>

      {/* Name */}
      <section className="space-y-3 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">General</h2>
        <div className="space-y-1">
          <Label htmlFor="org-name">Organization name</Label>
          <input
            id="org-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={100}
          />
        </div>
      </section>

      <Separator className="mb-8" />

      {/* Feature Flags */}
      <section className="space-y-4 mb-8">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Features</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Enable or disable platform capabilities for your organization.
        </p>
        <div className="space-y-4">
          {(Object.entries(FEATURE_LABELS) as [keyof OrgFeatures, { label: string; description: string }][]).map(
            ([key, { label, description }]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <Label htmlFor={key} className="text-sm font-medium">{label}</Label>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
                </div>
                <Switch
                  id={key}
                  checked={features[key]}
                  onCheckedChange={() => toggleFeature(key)}
                />
              </div>
            )
          )}
        </div>
      </section>

      {/* Save */}
      {message && (
        <p className={`text-sm mb-4 ${message.type === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {message.text}
        </p>
      )}

      <Button onClick={handleSave} loading={isPending}>
        <Save className="h-4 w-4 mr-2" />
        Save Settings
      </Button>
    </div>
  )
}
