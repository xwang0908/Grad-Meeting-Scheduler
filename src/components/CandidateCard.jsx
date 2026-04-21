import { useState } from 'react'
import ExplanationPanel from './ExplanationPanel'

export default function CandidateCard({
  time = 'Tue 3:00 PM - 4:00 PM',
  fairness = 92,
  confidence = 'High',
  recommended = false,
  explanation = '',
}) {
  const [showExplanation, setShowExplanation] = useState(false)

  const confidenceStyle =
    confidence === 'High'
      ? 'bg-green-100 text-green-700'
      : confidence === 'Medium'
      ? 'bg-amber-100 text-amber-700'
      : 'bg-rose-100 text-rose-700'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-slate-900">{time}</h3>

            {recommended && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
                Recommended
              </span>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
              Fairness: {fairness}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${confidenceStyle}`}
            >
              Confidence: {confidence}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowExplanation(!showExplanation)}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            {showExplanation ? 'Hide Explanation' : 'Why this time?'}
          </button>

          <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700">
            Confirm
          </button>
        </div>
      </div>

      {showExplanation && (
        <ExplanationPanel explanation={explanation} />
      )}
    </div>
  )
}