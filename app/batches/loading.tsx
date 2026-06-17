export default function BatchesLoading() {
  return (
    <section className="relative min-h-screen bg-gray-50 overflow-hidden font-outfit">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="h-10 w-72 bg-gray-200 rounded-lg animate-pulse mx-auto mb-10" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-md p-6 space-y-4">
              <div className="h-48 bg-gray-200 rounded-xl animate-pulse" />
              <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
              <div className="h-10 bg-gray-200 rounded-lg animate-pulse w-1/3" />
            </div>
          ))}
        </div>

        <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mx-auto mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-5 shadow-sm">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-2/3" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
