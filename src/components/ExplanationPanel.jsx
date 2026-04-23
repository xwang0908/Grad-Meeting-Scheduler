export default function ExplanationPanel({
  explanation = 'This option is recommended because it balances attendance coverage, fairness, and scheduling preferences.',
}) {
  return (
    <p className="text-sm leading-6 text-slate-600">
      {explanation}
    </p>
  )
}