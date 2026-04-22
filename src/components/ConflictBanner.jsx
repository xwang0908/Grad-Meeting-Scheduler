export default function ConflictBanner() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-amber-900">
            A scheduling conflict was detected
          </h3>
          <p className="mt-1 text-sm text-amber-800">
            One of the current meeting times now has lower overlap. You can keep
            the current time, review better heatmap-based options, or continue
            with one teammate unavailable.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900 transition hover:bg-amber-100">
            Keep current time
          </button>

          <button className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-700">
            Review better options
          </button>

          <button className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900 transition hover:bg-amber-100">
            Continue anyway
          </button>
        </div>
      </div>
    </div>
  )
}