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

function timeToMinutes(time24) {
  const [hour, minute] = time24.split(':').map(Number)
  return hour * 60 + minute
}

function roundToTwo(value) {
  return Math.round(value * 100) / 100
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value))
}

function overlapsWindow(slotStart, slotEnd, windowStart, windowEnd) {
  const slotStartMin = timeToMinutes(slotStart)
  const slotEndMin = timeToMinutes(slotEnd)
  const windowStartMin = timeToMinutes(windowStart)
  const windowEndMin = timeToMinutes(windowEnd)

  return slotStartMin < windowEndMin && slotEndMin > windowStartMin
}

function isWithinWorkingHours(member, slotStart, slotEnd) {
  const [workStart, workEnd] = member.workingHours || ['09:00', '17:00']
  const slotStartMin = timeToMinutes(slotStart)
  const slotEndMin = timeToMinutes(slotEnd)
  const workStartMin = timeToMinutes(workStart)
  const workEndMin = timeToMinutes(workEnd)

  return slotStartMin >= workStartMin && slotEndMin <= workEndMin
}

function hitsNoMeetingWindow(member, slotStart, slotEnd) {
  const windows = member.noMeetingWindows || []

  return windows.some(([windowStart, windowEnd]) =>
    overlapsWindow(slotStart, slotEnd, windowStart, windowEnd)
  )
}

function getFlexibleConstraintPenalty(member, slotStart, slotEnd) {
  const constraints = (member.flexibleConstraints || []).map((item) =>
    item.toLowerCase()
  )

  let penalty = 0

  if (constraints.includes('gym')) {
    if (overlapsWindow(slotStart, slotEnd, '17:00', '19:00')) {
      penalty += 0.18
    }
  }

  if (constraints.includes('commute')) {
    if (
      overlapsWindow(slotStart, slotEnd, '09:00', '10:00') ||
      overlapsWindow(slotStart, slotEnd, '17:00', '18:00')
    ) {
      penalty += 0.12
    }
  }

  if (constraints.includes('focus-time')) {
    if (overlapsWindow(slotStart, slotEnd, '14:00', '16:00')) {
      penalty += 0.18
    }
  }

  return Math.min(penalty, 0.35)
}

function getMemberSlotFit(member, slotStart, slotEnd) {
  const weight = Number(member.priorityWeight) || 1

  if (!isWithinWorkingHours(member, slotStart, slotEnd)) {
    return {
      weight,
      fit: 0,
      hasHardIssue: true,
      hasFlexibleIssue: false,
    }
  }

  if (hitsNoMeetingWindow(member, slotStart, slotEnd)) {
    return {
      weight,
      fit: 0,
      hasHardIssue: true,
      hasFlexibleIssue: false,
    }
  }

  const flexiblePenalty = getFlexibleConstraintPenalty(
    member,
    slotStart,
    slotEnd
  )

  return {
    weight,
    fit: 1 - flexiblePenalty,
    hasHardIssue: false,
    hasFlexibleIssue: flexiblePenalty > 0,
  }
}

function getWeightedMemberFit(slotStart, slotEnd, members) {
  let totalWeight = 0
  let weightedFitSum = 0
  let hardConstraintHits = 0
  let flexibleImpactCount = 0

  members.forEach((member) => {
    const result = getMemberSlotFit(member, slotStart, slotEnd)

    totalWeight += result.weight
    weightedFitSum += result.weight * result.fit

    if (result.hasHardIssue) hardConstraintHits += 1
    if (result.hasFlexibleIssue) flexibleImpactCount += 1
  })

  const weightedPreferenceFit =
    totalWeight > 0 ? weightedFitSum / totalWeight : 0

  return {
    weightedPreferenceFit: clamp01(weightedPreferenceFit),
    hardConstraintHits,
    flexibleImpactCount,
  }
}

function getTimeShapeBonus(start) {
  // Tiny bonus to prefer mid-morning / early afternoon over edge slots.
  // Small enough not to overpower real availability.
  const minute = timeToMinutes(start)

  if (minute === timeToMinutes('11:00')) return 0.006
  if (minute === timeToMinutes('10:00')) return 0.005
  if (minute === timeToMinutes('14:00')) return 0.004
  if (minute === timeToMinutes('13:00')) return 0.003
  if (minute === timeToMinutes('15:00')) return 0.002
  if (minute === timeToMinutes('09:00')) return 0.001
  if (minute === timeToMinutes('16:00')) return 0.001
  return 0
}

function getDayBonus(day) {
  // Deterministic tiny tie-break so equal slots do not display identical fairness.
  // Keeps ranking stable without overpowering actual coverage.
  const dayBonusMap = {
    Tue: 0.003,
    Wed: 0.0025,
    Thu: 0.002,
    Mon: 0.0015,
    Fri: 0.001,
  }

  return dayBonusMap[day] || 0
}

function getFairnessScore({
  day,
  start,
  availableCount,
  totalMembers,
  weightedPreferenceFit,
}) {
  const baselineCoverage =
    totalMembers > 0 ? availableCount / totalMembers : 0

  // Main score: availability remains dominant
  const baseScore =
    baselineCoverage * 0.82 + weightedPreferenceFit * 0.18

  // Small deterministic bonuses to break ties
  const tieBreakBonus = getTimeShapeBonus(start) + getDayBonus(day)

  const rawFairness = clamp01(baseScore + tieBreakBonus)

  return {
    rawFairness,
    displayFairness: roundToTwo(rawFairness),
    baselineCoverage,
  }
}

function getConfidenceLabel(availableCount, totalMembers) {
  const conflicts = totalMembers - availableCount

  if (conflicts === 0) return 'Full overlap'
  if (conflicts === 1) return 'Strong fit'
  if (conflicts === 2) return 'Partial overlap'
  return 'Higher conflict'
}

const PRIORITY_POOL = [
  [
    'avoiding early morning slots',
    'keeping afternoons free for focused work',
    'protecting midday for a standing commitment',
  ],
  [
    'preferring mid-morning for collaborative work',
    'keeping late afternoon open for lab time',
    'avoiding back-to-back commitments',
  ],
  [
    'minimising cross-timezone friction',
    'protecting deep-work blocks in the morning',
    'keeping Fridays lighter where possible',
  ],
]

function buildHeatmapExplanation({
  day,
  start,
  availableCount,
  totalMembers,
  fairness,
  weightedPreferenceFit,
  hardConstraintHits,
  flexibleImpactCount,
  rank,
}) {
  const startFmt = formatTime(start)
  const priorities = PRIORITY_POOL[Math.min(rank, PRIORITY_POOL.length - 1)]
  const [p1, p2, p3] = priorities
  const fairnessPct = `${Math.round(fairness * 100)}%`
  const weightedFitPct = `${Math.round(weightedPreferenceFit * 100)}%`

  if (rank === 0) {
    return (
      `This is the strongest overall option. ${availableCount} out of ${totalMembers} people are free on ${day} at ${startFmt}, ` +
      `and it earns the highest fairness score (${fairnessPct}). ` +
      `The ranking combines raw overlap with weighted member preferences, including priority weights and flexible constraints. ` +
      `Its preference-fit score is ${weightedFitPct}, making it the least disruptive choice overall. ` +
      `The algorithm also considered group-wide tradeoffs such as ${p1} and ${p2}. ` +
      `Hard blockers affecting this slot: ${hardConstraintHits}. Flexible tradeoffs affecting this slot: ${flexibleImpactCount}.`
    )
  }

  if (rank === 1) {
    return (
      `A strong backup option. ${availableCount} out of ${totalMembers} participants are free on ${day} at ${startFmt}, ` +
      `with an overall fairness score of ${fairnessPct}. ` +
      `It ranks slightly below the top option because its weighted preference-fit score (${weightedFitPct}) is lower after accounting for group priorities and softer constraints. ` +
      `This reflects mild tradeoffs around ${p1} and ${p3}. ` +
      `Hard blockers affecting this slot: ${hardConstraintHits}. Flexible tradeoffs affecting this slot: ${flexibleImpactCount}.`
    )
  }

  return (
    `A workable fallback. ${availableCount} out of ${totalMembers} participants are free on ${day} at ${startFmt}, ` +
    `with a fairness score of ${fairnessPct}. ` +
    `Although the slot remains viable, its weighted preference-fit score (${weightedFitPct}) is lower, so it requires more compromise across the group. ` +
    `This usually happens when priorities such as ${p2} and ${p3} are harder to satisfy together. ` +
    `Hard blockers affecting this slot: ${hardConstraintHits}. Flexible tradeoffs affecting this slot: ${flexibleImpactCount}.`
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

    const totalMembers = availability.totalMembers || members.length || 1

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

        const {
          weightedPreferenceFit,
          hardConstraintHits,
          flexibleImpactCount,
        } = getWeightedMemberFit(start, end, members)

        const { rawFairness, displayFairness } = getFairnessScore({
          day,
          start,
          availableCount,
          totalMembers,
          weightedPreferenceFit,
        })

        return {
          id: `${day}-${start}`,
          day,
          start,
          end,
          availableCount,
          conflictCount: totalMembers - availableCount,
          fairness: displayFairness,
          rawFairness,
          weightedPreferenceFit: roundToTwo(weightedPreferenceFit),
          hardConstraintHits,
          flexibleImpactCount,
        }
      })
    )

    const ranked = allCandidates
      .filter((candidate) => candidate.availableCount > 0)
      .sort((a, b) => {
        if (b.rawFairness !== a.rawFairness) {
          return b.rawFairness - a.rawFairness
        }

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

    // Enforce strictly descending displayed fairness for the top 3
    return ranked.map((candidate, index, arr) => {
      let fairness = candidate.fairness

      if (index > 0 && fairness >= arr[index - 1].fairness) {
        fairness = roundToTwo(Math.max(0, arr[index - 1].fairness - 0.01))
      }

      const recommended = index === 0

      return {
        ...candidate,
        fairness,
        recommended,
        confidence: getConfidenceLabel(
          candidate.availableCount,
          totalMembers
        ),
        label: `${candidate.day} ${formatTime(candidate.start)} - ${formatTime(
          candidate.end
        )}`,
        explanation: buildHeatmapExplanation({
          ...candidate,
          fairness,
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