export default function PublicResultsLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        {/* Org name */}
        <div className="flex justify-center">
          <div className="h-4 w-32 animate-pulse bg-slate-200 dark:bg-slate-700 rounded" />
        </div>

        {/* Assessment title */}
        <div className="flex justify-center">
          <div className="h-6 w-48 animate-pulse bg-slate-200 dark:bg-slate-700 rounded" />
        </div>

        {/* Score card */}
        <div className="rounded-xl p-8 bg-slate-100 dark:bg-slate-800 flex flex-col items-center">
          <div className="h-16 w-16 animate-pulse bg-slate-200 dark:bg-slate-700 rounded-full mb-3" />
          <div className="h-12 w-24 animate-pulse bg-slate-200 dark:bg-slate-700 rounded mb-2" />
          <div className="h-5 w-20 animate-pulse bg-slate-200 dark:bg-slate-700 rounded" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 flex flex-col items-center"
            >
              <div className="h-5 w-5 animate-pulse bg-slate-200 dark:bg-slate-700 rounded mb-1.5" />
              <div className="h-6 w-12 animate-pulse bg-slate-200 dark:bg-slate-700 rounded mb-1" />
              <div className="h-3 w-16 animate-pulse bg-slate-200 dark:bg-slate-700 rounded" />
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-center">
          <div className="h-3 w-48 animate-pulse bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
      </div>
    </div>
  )
}
