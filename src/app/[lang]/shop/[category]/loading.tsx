export default function CategoryLoading() {
  return (
    <main className="pt-16 pb-28 lg:pb-0 flex flex-col min-h-dvh">
      <section className="flex-1 px-6 py-8 lg:px-16 lg:py-12">
        {/* Breadcrumbs skeleton */}
        <div className="flex items-center gap-2 mb-8">
          <div className="skeleton h-4 w-16"></div>
          <span className="text-base-content/30">/</span>
          <div className="skeleton h-4 w-24"></div>
        </div>

        {/* Title skeleton */}
        <div className="skeleton h-8 w-48 mb-8 lg:mb-12"></div>

        {/* Product grid skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-3">
              <div className="skeleton aspect-square w-full"></div>
              <div className="skeleton h-4 w-3/4"></div>
              <div className="skeleton h-3 w-1/2"></div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
