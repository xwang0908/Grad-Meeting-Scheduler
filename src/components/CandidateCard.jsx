import { useState } from 'react'
import ExplanationPanel from './ExplanationPanel'

function getBadgeStyle(value, type) {
  if (type === 'fairness') {
    if (value === 'High') return 'bg-emerald-100 text-emerald-700'
    if (value === 'Good') return 'bg-green-100 text-green-700'
    if (value === 'Medium') return 'bg-amber-100 text-amber-700'
    return 'bg-rose-100 text-rose-700'
  }

  if (type === 'confidence') {
    if (value === 'Full overlap') return 'bg-emerald-100 text-emerald-700'
    if (value === 'Strong fit') return 'bg-green-100 text-green-700'
    if (value === 'Partial overlap') return 'bg-amber-100 text-amber-700'
    return 'bg-rose-100 text-rose-700'
  }

  return 'bg-slate-100 text-slate-700'
}

export default function CandidateCard({
  time = 'Tue 3:00 PM - 4:00 PM',
  fairness = 'High',
  confidence = 'Strong fit',
  recommended = false,
  explanation = '',
}) {
  const [showExplanation, setShowExplanation] = useState(false)

  const fairnessStyle = getBadgeStyle(fairness, 'fairness')
  const confidenceStyle = getBadgeStyle(confidence, 'confidence')

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">{time}</h3>

            {recommended && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Top recommendation
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${fairnessStyle}`}
            >
              Fairness: {fairness}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${confidenceStyle}`}
            >
              Fit: {confidence}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {showExplanation ? 'Hide explanation' : 'Why this time?'}
          </button>

          <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700">
            Confirm
          </button>
        </div>
      </div>

      {showExplanation && <ExplanationPanel explanation={explanation} />}
    </div>
  )
}