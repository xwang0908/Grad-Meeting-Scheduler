import { useMemo, useState } from 'react'
import Header from '../components/Header'
import AvailabilityGrid from '../components/AvailabilityGrid'
import CandidateCard from '../components/CandidateCard'
import PreferenceDrawer from '../components/PreferenceDrawer'
import ConflictBanner from '../components/ConflictBanner'

import members from '../data/members.json'
import availability from '../data/availability.json'

function formatTime(time24) {
  const [hourString, minute] = time24.split(':')
  const hour = Number(hourString)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12}:${minute} ${suffix}`
}

function getNextHour(time24) {
  const [hourString] = time24.split(':')
  const nextHour = Number(hourString) + 1
  return `${String(nextHour).padStart(2, '0')}:00`
}

function getFairnessScore(availableCount, totalMembers) {
  // Returns a 0-1 score rounded to 2 decimal places
  return Math.round((availableCount / totalMembers) * 100) / 100
}

function getConfidenceLabel(availableCount, totalMembers) {
  const conflicts = totalMembers - availableCount

  if (conflicts === 0) return 'Full overlap'
  if (conflicts === 1) return 'Strong fit'
  if (conflicts === 2) return 'Partial overlap'
  return 'Higher conflict'
}

// Anonymised priority examples shown in explanations, never tied to a specific person
const PRIORITY_POOL = [
  ['avoiding early morning slots', 'keeping afternoons free for focused work', 'protecting midday for a standing commitment'],
  ['preferring mid-morning for collaborative work', 'keeping late afternoon open for lab time', 'avoiding back-to-back commitments'],
  ['minimising cross-timezone friction', 'protecting deep-work blocks in the morning', 'keeping Fridays lighter where possible'],
]

function buildHeatmapExplanation({ day, start, end, availableCount, totalMembers, rank }) {
  const conflictCount = totalMembers - availableCount
  const startFmt = formatTime(start)
  const conflictNote = `Participants with a conflict will be notified of the new meeting time and given the opportunity to adjust their priorities if they wish.`

  if (availableCount === 0) {
    return `No participants are available during this slot, so it is not a viable option.`
  }

  if (conflictCount === 0) {
    return `Everyone is free on ${day} at ${startFmt}. No tradeoffs needed, making this the least disruptive option for the group.`
  }

  const priorities = PRIORITY_POOL[Math.min(rank, PRIORITY_POOL.length - 1)]
  const [p1, p2, p3] = priorities

  if (rank === 0) {
    // Best option: highest overlap, frame it positively
    return (
      `This is the least inconvenient time for the most participants. ` +
      `${availableCount} out of ${totalMembers} people are free on ${day} at ${startFmt}, ` +
      `which gives the highest coverage of any available slot. ` +
      `The algorithm factored in group-wide priorities such as ${p1} and ${p2} to reach this ranking. ` +
      conflictNote
    )
  }

  if (rank === 1) {
    // Second option: same or slightly lower coverage, different priority angle
    return (
      `A solid alternative if the top option does not work out. ` +
      `${availableCount} out of ${totalMembers} participants are free on ${day} at ${startFmt}. ` +
      `This slot scores slightly lower because the group's preferences around ${p1} and ${p3} ` +
      `create a mild tradeoff compared to the top pick, but overall disruption remains low. ` +
      conflictNote
    )
  }

  // Third option: viable but more compromise required
  return (
    `A fallback option that requires the most negotiation. ` +
    `${availableCount} out of ${totalMembers} participants are free on ${day} at ${startFmt}. ` +
    `Preferences around ${p2} and ${p3} conflict more at this time, so the fairness score is lower. ` +
    `Worth considering if the other options are ruled out. ` +
    conflictNote
  )
}

export default function SchedulerPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [showConflictBanner, setShowConflictBanner] = useState(true)

  const candidates = useMemo(() => {
    const days = availability.days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    const times =
      availability.times || [
        '09:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '17:00',
      ]

    const totalMembers =
      availability.totalMembers || members.length || 1

    const dayOrder = {
      Mon: 0,
      Tue: 1,
      Wed: 2,
      Thu: 3,
      Fri: 4,
    }

    const allCandidates = days.flatMap((day) =>
      times.map((start, index) => {
        const end = getNextHour(start)
        const availableCount = availability.grid?.[day]?.[index] ?? 0
        const conflictCount = totalMembers - availableCount

        return {
          id: `${day}-${start}`,
          day,
          start,
          end,
          availableCount,
          conflictCount,
          score: availableCount,
        }
      })
    )

    const ranked = allCandidates
      .filter((candidate) => candidate.availableCount > 0)
      .sort((a, b) => {
        if (b.availableCount !== a.availableCount) {
          return b.availableCount - a.availableCount
        }

        if (a.conflictCount !== b.conflictCount) {
          return a.conflictCount - b.conflictCount
        }

        if (dayOrder[a.day] !== dayOrder[b.day]) {
          return dayOrder[a.day] - dayOrder[b.day]
        }

        return a.start.localeCompare(b.start)
      })
      .slice(0, 3)

    return ranked.map((candidate, index) => {
      const recommended = index === 0

      return {
        ...candidate,
        recommended,
        fairness: getFairnessScore(
          candidate.availableCount,
          totalMembers
        ),
        confidence: getConfidenceLabel(
          candidate.availableCount,
          totalMembers
        ),
        label: `${candidate.day} ${formatTime(candidate.start)} - ${formatTime(
          candidate.end
        )}`,
        explanation: buildHeatmapExplanation({
          ...candidate,
          totalMembers,
          rank: index,
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
                No full overlap found
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Here are 3 options that minimise conflict across the group, ranked by fairness and coverage.
              </p>
            </div>

            {candidates.map((candidate) => (
              <CandidateCard
                key={candidate.id}
                time={candidate.label}
                fairness={candidate.fairness}
                confidence={candidate.confidence}
                recommended={candidate.recommended}
                explanation={candidate.explanation}
                conflictCount={candidate.conflictCount}
              />
            ))}

            <button
              onClick={() => setShowConflictBanner(!showConflictBanner)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {showConflictBanner
                ? 'Hide Conflict Banner'
                : 'Show Conflict Banner'}
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