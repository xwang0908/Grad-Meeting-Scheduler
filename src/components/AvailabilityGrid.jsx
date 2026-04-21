import { Fragment } from 'react'
import availability from '../data/availability.json'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const times = [
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

function formatDisplayTime(time24) {
  const [hourString, minute] = time24.split(':')
  const hour = Number(hourString)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12}:${minute}`
}

function getNextHour(time24) {
  const [hourString] = time24.split(':')
  const nextHour = Number(hourString) + 1
  return `${String(nextHour).padStart(2, '0')}:00`
}

function getMembersForSlot(day, start, end) {
  return availability.map((memberAvailability) => {
    const matchingBlock = memberAvailability.blocks.find(
      (block) =>
        block.day === day &&
        block.start <= start &&
        block.end >= end
    )

    return matchingBlock || null
  })
}

function getSlotSummary(day, start) {
  const end = getNextHour(start)
  const slotBlocks = getMembersForSlot(day, start, end)

  let freeCount = 0
  let busyCount = 0
  let unknownCount = 0

  slotBlocks.forEach((block) => {
    if (!block) {
      unknownCount += 1
    } else if (block.status === 'free') {
      freeCount += 1
    } else if (block.status === 'busy') {
      busyCount += 1
    }
  })

  let label = ''
  let style = ''

  if (unknownCount > 0) {
    label = `${freeCount} free / ${busyCount} busy`
    style = 'bg-slate-100 text-slate-700 border-slate-200'
  } else if (busyCount === 0) {
    label = 'All free'
    style = 'bg-green-100 text-green-700 border-green-200'
  } else if (freeCount === 0) {
    label = 'All busy'
    style = 'bg-rose-100 text-rose-700 border-rose-200'
  } else if (freeCount > busyCount) {
    label = `${freeCount} free / ${busyCount} busy`
    style = 'bg-amber-100 text-amber-700 border-amber-200'
  } else {
    label = `${freeCount} free / ${busyCount} busy`
    style = 'bg-rose-50 text-rose-700 border-rose-200'
  }

  return { label, style }
}

export default function AvailabilityGrid() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Availability Overview
          </h2>
          <p className="text-sm text-slate-500">
            Team summary generated from availability.json.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 text-xs font-medium">
          <span className="rounded-full bg-green-100 px-3 py-1 text-green-700">
            All free
          </span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-700">
            Mixed
          </span>
          <span className="rounded-full bg-rose-100 px-3 py-1 text-rose-700">
            Mostly / all busy
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[700px] grid-cols-6 gap-2">
          <div></div>

          {days.map((day) => (
            <div
              key={day}
              className="rounded-xl bg-slate-100 p-3 text-center text-sm font-semibold text-slate-700"
            >
              {day}
            </div>
          ))}

          {times.map((time) => (
            <Fragment key={time}>
              <div className="flex items-center justify-center rounded-xl bg-slate-50 p-3 text-sm font-medium text-slate-600">
                {formatDisplayTime(time)}
              </div>

              {days.map((day) => {
                const summary = getSlotSummary(day, time)

                return (
                  <div
                    key={`${day}-${time}`}
                    className={`rounded-xl border p-3 text-center text-xs font-semibold ${summary.style}`}
                  >
                    {summary.label}
                  </div>
                )
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  )
}