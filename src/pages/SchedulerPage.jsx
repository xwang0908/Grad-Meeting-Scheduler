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

function getFairnessLabel(availableCount, totalMembers) {
  const ratio = availableCount / totalMembers

  if (ratio >= 1) return 'High'
  if (ratio >= 0.75) return 'Good'
  if (ratio >= 0.5) return 'Medium'
  return 'Low'
}

function getConfidenceLabel(availableCount, totalMembers) {
  const conflicts = totalMembers - availableCount

  if (conflicts === 0) return 'Full overlap'
  if (conflicts === 1) return 'Strong fit'
  if (conflicts === 2) return 'Partial overlap'
  return 'Higher conflict'
}

function buildHeatmapExplanation({
  day,
  start,
  end,
  availableCount,
  totalMembers,
}) {
  const conflictCount = totalMembers - availableCount

  if (availableCount === totalMembers) {
    return `All ${totalMembers} teammates are available during this time, so this is the cleanest scheduling option with no conflict.`
  }

  if (availableCount === 0) {
    return `No teammates are marked available during this slot, so it is not a strong option for scheduling.`
  }

  return `${availableCount} of ${totalMembers} teammates are available on ${day} from ${formatTime(
    start
  )} to ${formatTime(
    end
  )}. This leaves ${conflictCount} teammate${
    conflictCount > 1 ? 's' : ''
  } in conflict, so it works best as a tradeoff option when full overlap is not possible.`
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
        fairness: getFairnessLabel(
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
                Best Time Options
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                These recommendations are now generated from the heatmap,
                ranking the slots with the most teammate availability first.
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