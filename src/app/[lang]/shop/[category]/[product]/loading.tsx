export default function ProductLoading() {
  return (
    <main className="pt-16 pb-28 lg:pb-0 flex flex-col min-h-dvh">
      <section className="flex-1 px-6 py-8 lg:px-16 lg:py-12">
        {/* Breadcrumbs skeleton */}
        <div className="flex items-center gap-2 mb-8">
          <div className="skeleton h-4 w-16"></div>
          <span className="text-base-content/30">/</span>
          <div className="skeleton h-4 w-24"></div>
          <span className="text-base-content/30">/</span>
          <div className="skeleton h-4 w-32"></div>
        </div>

        {/* Product layout skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Gallery skeleton */}
          <div className="flex flex-col gap-3">
            <div className="skeleton aspect-[3/4] w-full"></div>
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton w-16 h-20 md:w-20 md:h-26 shrink-0"></div>
              ))}
            </div>
          </div>

          {/* Right: Details skeleton */}
          <div className="flex flex-col gap-6">
            {/* Title */}
            <div className="skeleton h-8 w-3/4"></div>

            {/* Description */}
            <div className="flex flex-col gap-3">
              <div className="skeleton h-4 w-24"></div>
              <div className="skeleton h-4 w-full"></div>
              <div className="skeleton h-4 w-full"></div>
              <div className="skeleton h-4 w-2/3"></div>
            </div>

            {/* Variant picker */}
            <div className="flex flex-col gap-4">
              <div className="skeleton h-4 w-40"></div>
              <div className="skeleton h-3 w-12"></div>
              <div className="flex gap-2">
                <div className="skeleton h-8 w-28"></div>
                <div className="skeleton h-8 w-28"></div>
                <div className="skeleton h-8 w-28"></div>
              </div>
            </div>

            {/* Add to cart button */}
            <div className="skeleton h-12 w-full"></div>

            {/* Back link */}
            <div className="skeleton h-4 w-36 mt-4"></div>
          </div>
        </div>
      </section>
    </main>
  );
}
