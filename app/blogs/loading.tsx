export default function BlogsLoading() {
  return (
    <section className="relative min-h-screen bg-gray-50 overflow-hidden font-outfit">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse mx-auto mb-10" />

        <div className="flex gap-3 mb-8 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-8 w-24 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md">
              <div className="aspect-[4/5] bg-gray-200 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
