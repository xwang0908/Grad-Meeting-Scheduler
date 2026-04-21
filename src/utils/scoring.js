export function countHardConflicts(slot, members, availability) {
  let hardConflicts = 0

  for (const member of members) {
    const memberBlocks =
      availability.find((a) => a.memberId === member.id)?.blocks || []

    const conflict = memberBlocks.some(
      (block) =>
        block.day === slot.day &&
        block.status === 'busy' &&
        block.start <= slot.start &&
        block.end >= slot.end
    )

    if (conflict) hardConflicts += 1
  }

  return hardConflicts
}

export function scoreSlot(slot, members, availability) {
  let coverage = 0
  let softPenalty = 0
  let fairnessPenalty = 0
  let missingDataCount = 0

  for (const member of members) {
    const memberSchedule = availability.find((a) => a.memberId === member.id)

    if (!memberSchedule) {
      missingDataCount += 1
      continue
    }

    const matchingBlock = memberSchedule.blocks.find(
      (block) =>
        block.day === slot.day &&
        block.start <= slot.start &&
        block.end >= slot.end
    )

    if (!matchingBlock) {
      missingDataCount += 1
      continue
    }

    if (matchingBlock.status === 'free') coverage += 1
    if (matchingBlock.status === 'busy') softPenalty += 40
    if (matchingBlock.preference === 1) softPenalty += 15
    if (matchingBlock.preference === 2) softPenalty += 5

    fairnessPenalty +=
      (3 - (matchingBlock.preference || 0)) * (member.priorityWeight || 1)
  }

  const hardConflicts = countHardConflicts(slot, members, availability)

  const confidence =
    members.length === 0 ? 0 : 1 - missingDataCount / members.length

  const score =
    coverage * 30 -
    hardConflicts * 100 -
    softPenalty -
    fairnessPenalty +
    confidence * 20

  return {
    score,
    coverage,
    hardConflicts,
    fairness: Math.max(0, Math.round(100 - fairnessPenalty * 5)),
    confidenceLabel:
      confidence > 0.8 ? 'High' : confidence > 0.5 ? 'Medium' : 'Low',
  }
}