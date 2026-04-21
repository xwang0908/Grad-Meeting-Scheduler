export default function ConflictBanner() {
  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-amber-900">
            This meeting may no longer work
          </h3>
          <p className="mt-1 text-sm text-amber-800">
            A new conflict has been flagged. You can keep the current meeting,
            find a replacement, or proceed without one member.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100">
            Keep Current
          </button>
          <button className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700">
            Find Replacement
          </button>
          <button className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900 hover:bg-amber-100">
            Proceed Without One Member
          </button>
        </div>
      </div>
    </div>
  )
}