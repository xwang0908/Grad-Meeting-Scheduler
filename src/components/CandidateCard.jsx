import { useState } from 'react'
import ExplanationPanel from './ExplanationPanel'

function getFairnessTextStyle(score) {
  if (score >= 0.75) return 'text-sky-600'
  if (score >= 0.5) return 'text-amber-500'
  return 'text-rose-500'
}

function getFitTextStyle(value) {
  if (value === 'Full overlap') return 'text-sky-600'
  if (value === 'Strong fit') return 'text-sky-500'
  if (value === 'Partial overlap') return 'text-amber-500'
  return 'text-rose-500'
}

// Simple chevron SVG — flips when open
function Chevron({ open }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export default function CandidateCard({
  time = 'Tue 3:00 PM - 4:00 PM',
  fairness = 0.6,
  confidence = 'Partial overlap',
  recommended = false,
  explanation = '',
  conflictCount = 0,
}) {
  const [showExplanation, setShowExplanation] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const fairnessTextStyle = getFairnessTextStyle(fairness)
  const fitTextStyle = getFitTextStyle(confidence)
  // Display as percentage-style: 0.60 -> "0.60"
  const fairnessDisplay = fairness.toFixed(2)

  function handleConfirm() {
    setShowSuccessModal(true)
  }

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Top section: time + badges + confirm */}
        <div className="flex flex-col gap-3 p-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-900">{time}</h3>

              {recommended && (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Top recommendation
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
              <span className="text-slate-400">Fairness:</span>
              <span className={`font-semibold ${fairnessTextStyle}`}>{fairnessDisplay}</span>
              <span className="text-slate-200">·</span>
              <span className="text-slate-400">Fit:</span>
              <span className={`font-medium ${fitTextStyle}`}>{confidence}</span>
            </div>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={handleConfirm}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Confirm
            </button>
          </div>
        </div>

        {/* Accordion: Why this time? — sits at the bottom of the card */}
        {showExplanation && (
          <div className="border-t border-slate-100 bg-slate-50 px-5 py-4">
            <ExplanationPanel explanation={explanation} />
          </div>
        )}

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="flex w-full items-center justify-between border-t border-slate-100 px-5 py-3 text-sm font-medium text-slate-500 transition hover:bg-slate-50"
        >
          <span>{showExplanation ? 'Hide explanation' : 'Why this time?'}</span>
          <Chevron open={showExplanation} />
        </button>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                <span className="text-xl text-blue-600">✓</span>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Meeting scheduled
                </h2>
                <p className="text-sm text-slate-500">
                  All participants have been notified.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-medium text-slate-700">Scheduled time</p>
                <p className="mt-1 text-base font-semibold text-slate-900">{time}</p>
              </div>

              <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
                <p className="font-medium">📅 Calendar invites sent</p>
                <p className="mt-1 text-blue-700">
                  All participants have received a notification with the confirmed meeting time.
                </p>
              </div>

              {conflictCount > 0 && (
                <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
                  <p className="font-medium">⚠️ Conflict notice sent</p>
                  <p className="mt-1 text-amber-700">
                    Participants with a conflict will be notified of the new meeting time and given the opportunity to adjust their priorities if they wish.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowSuccessModal(false)}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}