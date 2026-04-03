export default function Loading() {
  return (
    <div className="px-4 pt-4 pb-4 max-w-2xl mx-auto">
      {/* Skeleton Refresh-Button */}
      <div className="w-full h-9 mb-3 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />

      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className="mb-4 rounded-[24px] border border-slate-100/60 dark:border-slate-700/40 bg-white dark:bg-slate-800 overflow-hidden animate-pulse"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          {/* Hero header */}
          <div className="px-4 pt-4 pb-3 bg-slate-50 dark:bg-slate-700/30">
            <div className="absolute top-0 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-600 rounded" />
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-600" />
              <div className="h-3 w-20 rounded bg-slate-200 dark:bg-slate-600" />
              <div className="h-4 w-14 rounded-full bg-slate-200 dark:bg-slate-600 ml-1" />
              <div className="ml-auto h-3 w-12 rounded bg-slate-200 dark:bg-slate-600" />
            </div>
            <div className="h-5 w-24 rounded-full bg-slate-200 dark:bg-slate-600" />
          </div>

          {/* Headline */}
          <div className="px-4 pt-3 pb-2 space-y-2">
            <div className="h-4 rounded bg-slate-200 dark:bg-slate-700 w-full" />
            <div className="h-4 rounded bg-slate-200 dark:bg-slate-700 w-5/6" />
            <div className="h-4 rounded bg-slate-200 dark:bg-slate-700 w-3/4" />
          </div>

          {/* Therapist box */}
          <div className="mx-4 mb-3 rounded-2xl bg-slate-100 dark:bg-slate-700/40 px-4 py-3 space-y-1.5">
            <div className="h-2.5 w-24 rounded bg-slate-200 dark:bg-slate-600" />
            <div className="h-3.5 rounded bg-slate-200 dark:bg-slate-600 w-full" />
            <div className="h-3.5 rounded bg-slate-200 dark:bg-slate-600 w-4/5" />
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-t border-slate-100/80 dark:border-slate-700/60">
            <div className="h-7 w-10 rounded-lg bg-slate-100 dark:bg-slate-700" />
            <div className="h-7 w-8 rounded-lg bg-slate-100 dark:bg-slate-700" />
            <div className="h-7 w-8 rounded-lg bg-slate-100 dark:bg-slate-700" />
            <div className="ml-auto h-7 w-8 rounded-lg bg-slate-100 dark:bg-slate-700" />
          </div>
        </div>
      ))}
    </div>
  );
}
