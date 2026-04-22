import { Fragment } from 'react'
import availability from '../data/availability.json'

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

const totalMembers = availability.totalMembers || 0
const maxAvailable = availability.maxAvailable || totalMembers || 1

function formatDisplayTime(time24) {
  const [hourString, minute] = time24.split(':')
  const hour = Number(hourString)
  const suffix = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12}:${minute} ${suffix}`
}

function getAvailabilityCount(day, timeIndex) {
  return availability.grid?.[day]?.[timeIndex] ?? 0
}

function getHeatmapStyle(count) {
  const ratio = count / maxAvailable

  if (count === 0) {
    return 'bg-slate-50 border-slate-200 hover:bg-slate-100'
  }
  if (ratio <= 0.25) {
    return 'bg-emerald-100 border-emerald-200 hover:bg-emerald-200'
  }
  if (ratio <= 0.5) {
    return 'bg-emerald-200 border-emerald-300 hover:bg-emerald-300'
  }
  if (ratio <= 0.75) {
    return 'bg-emerald-300 border-emerald-400 hover:bg-emerald-400'
  }

  return 'bg-emerald-500 border-emerald-600 hover:bg-emerald-600'
}

export default function AvailabilityGrid() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Availability Heatmap
          </h2>
          <p className="text-sm text-slate-500">
            Darker cells mean more teammates are available at that time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
          <span>0/5 available</span>
          <span className="h-4 w-4 rounded border border-slate-200 bg-slate-50" />
          <span className="h-4 w-4 rounded border border-emerald-200 bg-emerald-100" />
          <span className="h-4 w-4 rounded border border-emerald-300 bg-emerald-200" />
          <span className="h-4 w-4 rounded border border-emerald-400 bg-emerald-300" />
          <span className="h-4 w-4 rounded border border-emerald-600 bg-emerald-500" />
          <span>5/5 available</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[720px] grid-cols-6 gap-2">
          <div></div>

          {days.map((day) => (
            <div
              key={day}
              className="rounded-xl bg-slate-100 p-3 text-center text-sm font-semibold text-slate-700"
            >
              {day}
            </div>
          ))}

          {times.map((time, timeIndex) => (
            <Fragment key={time}>
              <div className="flex items-center justify-center rounded-xl bg-slate-50 p-3 text-sm font-medium text-slate-600">
                {formatDisplayTime(time)}
              </div>

              {days.map((day) => {
                const count = getAvailabilityCount(day, timeIndex)

                return (
                  <div
                    key={`${day}-${time}`}
                    title={`${day} ${formatDisplayTime(time)} — ${count} of ${totalMembers} available`}
                    className={`h-14 rounded-xl border transition-colors ${getHeatmapStyle(count)}`}
                  >
                    <span className="sr-only">
                      {count} of {totalMembers} available
                    </span>
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