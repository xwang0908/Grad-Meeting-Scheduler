export function buildExplanation(candidate) {
  const parts = []

  parts.push(`Coverage: ${candidate.coverage} member(s) can attend.`)

  if (candidate.hardConflicts === 0) {
    parts.push('No hard constraints are violated.')
  } else {
    parts.push(`${candidate.hardConflicts} hard conflict(s) remain.`)
  }

  parts.push(`Fairness score: ${candidate.fairness}.`)
  parts.push(`Confidence: ${candidate.confidenceLabel}.`)

  if (candidate.recommended) {
    parts.push('This option best balances overlap, fairness, and preferences.')
  } else {
    parts.push('This option is still viable, but not the top-ranked recommendation.')
  }

  return parts.join(' ')
}