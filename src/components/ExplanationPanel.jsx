export default function ExplanationPanel({
  explanation = 'This option is recommended because it balances attendance coverage, fairness, and scheduling preferences.',
}) {
  return (
    <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h4 className="text-sm font-semibold text-slate-900">Why this time?</h4>

      <p className="mt-3 text-sm leading-6 text-slate-700">
        {explanation}
      </p>
    </div>
  )
}