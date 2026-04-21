import { useMemo, useState } from 'react'
import Header from '../components/Header'
import AvailabilityGrid from '../components/AvailabilityGrid'
import CandidateCard from '../components/CandidateCard'
import PreferenceDrawer from '../components/PreferenceDrawer'
import ConflictBanner from '../components/ConflictBanner'

import members from '../data/members.json'
import availability from '../data/availability.json'
import { generateSlots, rankCandidates } from '../utils/scheduler'
import { buildExplanation } from '../utils/explanation'

function formatTime(time24) {
  const [hourString, minute] = time24.split(':')
  const hour = Number(hourString)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12}:${minute} ${suffix}`
}

export default function SchedulerPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showConflictBanner, setShowConflictBanner] = useState(true)

  const candidates = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    const slots = generateSlots(days, 9, 18, 60)
    const ranked = rankCandidates(slots, members, availability)

    return ranked.map((candidate, index) => {
      const recommended = index === 0

      return {
        ...candidate,
        recommended,
        label: `${candidate.day} ${formatTime(candidate.start)} - ${formatTime(candidate.end)}`,
        explanation: buildExplanation({
          ...candidate,
          recommended,
        }),
      }
    })
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <Header
          meetingType="Weekly Project Sync"
          onOpenPreferences={() => setDrawerOpen(true)}
        />

        {showConflictBanner && <ConflictBanner />}

        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <AvailabilityGrid />

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">
                Top Ranked Options
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                These cards are now generated from your fake member availability and scoring logic.
              </p>
            </div>

            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                time={candidate.label}
                fairness={candidate.fairness}
                confidence={candidate.confidenceLabel}
                recommended={candidate.recommended}
                explanation={candidate.explanation}
              />
            ))}

            <button
              onClick={() => setShowConflictBanner(!showConflictBanner)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-white"
            >
              Toggle Conflict Banner
            </button>
          </div>
        </div>
      </div>

      <PreferenceDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  )
}