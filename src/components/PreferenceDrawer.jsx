export default function PreferenceDrawer({ open, onClose }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      ></div>

      <div className="relative ml-auto h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Preference & Override Editor
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Adjust preferences and recompute recommendations.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Close
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Working Hours
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="time"
                defaultValue="09:00"
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="time"
                defaultValue="18:00"
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              No-Meeting Window
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="time"
                defaultValue="12:00"
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="time"
                defaultValue="13:00"
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Privacy Level
            </label>
            <select className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
              <option>Busy / Free only</option>
              <option>Show preference levels</option>
              <option>Private mode</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Constraint Mode
            </label>
            <select className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm">
              <option>Balanced</option>
              <option>Hard constraints first</option>
              <option>Flexible when needed</option>
            </select>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            Recommendations may change after editing preferences. If fewer valid
            slots remain, confidence may be lower.
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Recompute
            </button>
            <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Reset
            </button>
            <button className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
              Undo
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}