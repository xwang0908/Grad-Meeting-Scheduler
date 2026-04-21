export default function Header({
  meetingType = 'Weekly Project Sync',
  onOpenPreferences,
}) {
  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">
            Graduate Team Scheduler
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">
            Scheduling & Conflict Negotiator
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Help graduate project teams find fair meeting times when perfect
            overlap does not exist.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
            Meeting Type: {meetingType}
          </div>

          <button
            onClick={onOpenPreferences}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Edit Preferences
          </button>
        </div>
      </div>
    </header>
  )
}