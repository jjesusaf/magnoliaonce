export default function ProductLoading() {
  return (
    <main className="pt-16 pb-28 lg:pb-0 flex flex-col min-h-dvh">
      <section className="flex-1 px-4 py-8 md:px-8 lg:px-12 lg:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 max-w-7xl mx-auto">
          {/* Left: Gallery skeleton */}
          <div className="md:sticky md:top-24 md:self-start">
            <div className="skeleton aspect-square w-full" />
            <div className="flex gap-px mt-px">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton w-18 aspect-square shrink-0" />
              ))}
            </div>
          </div>

          {/* Right: Details skeleton */}
          <div className="flex flex-col gap-5 md:pt-2">
            {/* Breadcrumbs */}
            <div className="breadcrumbs text-sm">
              <ul>
                <li><div className="skeleton h-3.5 w-14" /></li>
                <li><div className="skeleton h-3.5 w-20" /></li>
              </ul>
            </div>

            {/* Title + actions */}
            <div className="flex items-start justify-between gap-3">
              <div className="skeleton h-8 lg:h-9 w-3/4" />
              <div className="flex gap-1 shrink-0">
                <div className="skeleton size-9 rounded-full" />
                <div className="skeleton size-9 rounded-full" />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-full" />
              <div className="skeleton h-4 w-2/3" />
            </div>

            {/* Price */}
            <div className="skeleton h-5 w-24" />

            {/* Variant selector label */}
            <div className="skeleton h-4 w-44" />

            {/* Variant buttons */}
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton h-10 w-28" />
              ))}
            </div>

            {/* Add to cart button */}
            <div className="skeleton h-12 w-full" />

            {/* Back link */}
            <div className="skeleton h-4 w-36 mt-2" />
          </div>
        </div>
      </section>
    </main>
  );
}
