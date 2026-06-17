export default function BlogDetailLoading() {
  return (
    <section className="relative min-h-screen bg-gray-50 overflow-hidden font-outfit">
      <div className="pt-24 md:pt-32 pb-12 md:pb-20 px-4 max-w-6xl mx-auto">
        <div className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-8" />

        <div className="flex flex-col lg:flex-row gap-8 mb-12">
          <div className="lg:w-1/2 aspect-[16/10] bg-gray-200 rounded-3xl animate-pulse" />
          <div className="lg:w-1/2 space-y-4">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4" />
            <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2" />
            <div className="h-5 bg-gray-200 rounded animate-pulse w-1/3" />
            <div className="flex gap-2 mt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-7 w-20 bg-gray-200 rounded-full animate-pulse" />
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" style={{ width: `${85 - i * 5}%` }} />
          ))}
        </div>
      </div>
    </section>
  );
}
