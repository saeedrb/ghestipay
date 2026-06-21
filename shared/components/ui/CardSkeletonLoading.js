export default function CardSkeletonLoading() {
  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-4 shadow-sm animate-pulse">

      {/* Header row (date + status badge) */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-24 rounded-md bg-gray-200" />
        <div className="h-5 w-20 rounded-full bg-gray-200" />
      </div>

      {/* Amount */}
      <div className="mt-4 h-5 w-40 rounded-md bg-gray-200" />

      {/* Info row (items count) */}
      <div className="mt-3 flex items-center justify-between">
        <div className="h-3 w-28 rounded-md bg-gray-200" />
        <div className="h-3 w-16 rounded-md bg-gray-200" />
      </div>

      {/* Divider */}
      <div className="my-4 h-px w-full bg-gray-100" />

      {/* Footer button / action */}
      <div className="flex justify-end">
        <div className="h-9 w-24 rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}