export default function PublicTestLoading() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      {/* Org name */}
      <div className="flex justify-center mb-2">
        <div className="h-4 w-32 animate-pulse bg-slate-200 dark:bg-slate-700 rounded" />
      </div>

      {/* Assessment title */}
      <div className="flex justify-center mb-6">
        <div className="h-7 w-64 animate-pulse bg-slate-200 dark:bg-slate-700 rounded" />
      </div>

      {/* Metadata cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 dark:border-gray-800 p-4"
          >
            <div className="mx-auto mb-1.5 h-5 w-5 animate-pulse bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="mx-auto h-6 w-10 animate-pulse bg-slate-200 dark:bg-slate-700 rounded mb-1" />
            <div className="mx-auto h-3 w-12 animate-pulse bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      {/* Description */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 mb-6 space-y-2">
        <div className="h-4 w-full animate-pulse bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="h-4 w-3/4 animate-pulse bg-slate-200 dark:bg-slate-700 rounded" />
      </div>

      {/* Form fields */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i}>
            <div className="h-4 w-24 animate-pulse bg-slate-200 dark:bg-slate-700 rounded mb-1.5" />
            <div className="h-10 w-full animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg" />
          </div>
        ))}

        {/* Submit button */}
        <div className="h-12 w-full animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg" />
      </div>
    </div>
  )
}
