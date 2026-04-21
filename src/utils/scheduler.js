import { scoreSlot } from './scoring'

export function generateSlots(days, startHour = 9, endHour = 18, duration = 60) {
  const slots = []

  for (const day of days) {
    for (let hour = startHour; hour < endHour; hour++) {
      slots.push({
        id: `${day}-${hour}`,
        day,
        start: `${String(hour).padStart(2, '0')}:00`,
        end: `${String(hour + duration / 60).padStart(2, '0')}:00`,
      })
    }
  }

  return slots
}

export function rankCandidates(slots, members, availability) {
  return slots
    .map((slot) => ({
      ...slot,
      ...scoreSlot(slot, members, availability),
    }))
    .filter((slot) => slot.hardConflicts < members.length)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}